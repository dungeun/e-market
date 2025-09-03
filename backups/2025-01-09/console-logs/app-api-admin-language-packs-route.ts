// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { invalidateLanguagePacksCache } from '@/lib/cache/language-packs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/language-packs - 언어팩 목록 조회
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const namespace = searchParams.get('namespace');

    // 모든 언어팩을 가져와서 키별로 그룹화
    const where: any = {
      isActive: true
    };
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (namespace) {
      where.namespace = namespace;
    }
    
    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { value: { contains: search, mode: 'insensitive' } }
      ];
    }

    const languagePacks = await query({
      where,
      orderBy: [
        { namespace: 'asc' },
        { key: 'asc' },
        { languageCode: 'asc' }
      ]
    });

    // 키별로 그룹화하여 ko, en, ja 형식으로 변환
    const groupedPacks: Record<string, any> = {};
    
    languagePacks.forEach((pack: any) => {
      const uniqueKey = `${pack.namespace}:${pack.key}`;
      
      if (!groupedPacks[uniqueKey]) {
        groupedPacks[uniqueKey] = {
          id: uniqueKey,
          namespace: pack.namespace,
          key: pack.key,
          category: pack.category || 'common',
          description: pack.description,
          ko: '',
          en: '',
          ja: ''
        };
      }
      
      // 언어별로 값 설정
      if (pack.languageCode === 'ko') {
        groupedPacks[uniqueKey].ko = pack.value;
        groupedPacks[uniqueKey].koId = pack.id;
      } else if (pack.languageCode === 'en') {
        groupedPacks[uniqueKey].en = pack.value;
        groupedPacks[uniqueKey].enId = pack.id;
      } else if (pack.languageCode === 'ja') {
        groupedPacks[uniqueKey].ja = pack.value;
        groupedPacks[uniqueKey].jaId = pack.id;
      }
    });

    // 배열로 변환
    const result = Object.values(groupedPacks);

    return NextResponse.json(result);
  } catch (error) {
    console.error('언어팩 조회 오류:', error);
    return NextResponse.json(
      { error: '언어팩을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/admin/language-packs - 언어팩 생성
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const body = await request.json();
    const { key, ko, en, ja, category = 'common', namespace = 'common', description } = body;

    // 필수 필드 검증
    if (!key || !ko) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 중복 키 검사
    const existing = await query({
      where: { 
        namespace,
        key,
        languageCode: 'ko'
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: '이미 존재하는 키입니다.' },
        { status: 409 }
      );
    }

    // 각 언어별로 레코드 생성
    const creates = [];
    
    // 한국어 레코드
    creates.push(
      query({
        data: {
          languageCode: 'ko',
          namespace,
          key,
          value: ko,
          category,
          description,
          isActive: true
        }
      })
    );

    // 영어 레코드
    if (en) {
      creates.push(
        query({
          data: {
            languageCode: 'en',
            namespace,
            key,
            value: en,
            category,
            description,
            isActive: true
          }
        })
      );
    }

    // 일본어 레코드
    if (ja) {
      creates.push(
        query({
          data: {
            languageCode: 'ja',
            namespace,
            key,
            value: ja,
            category,
            description,
            isActive: true
          }
        })
      );
    }

    await Promise.all(creates);

    // 캐시 무효화
    invalidateLanguagePacksCache();

    return NextResponse.json({ 
      success: true,
      message: '언어팩이 생성되었습니다.'
    });
  } catch (error) {
    console.error('언어팩 생성 오류:', error);
    return NextResponse.json(
      { error: '언어팩 생성에 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/admin/language-packs/[key] - 언어팩 수정
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const body = await request.json();
    const { namespace, key, ko, en, ja, description } = body;

    if (!namespace || !key) {
      return NextResponse.json(
        { error: '네임스페이스와 키가 필요합니다.' },
        { status: 400 }
      );
    }

    const updates = [];

    // 한국어 업데이트
    if (ko !== undefined) {
      const koRecord = await query({
        where: { namespace, key, languageCode: 'ko' }
      });

      if (koRecord) {
        updates.push(
          query({
            where: { id: koRecord.id },
            data: { value: ko, description }
          })
        );
      } else {
        // 없으면 생성
        updates.push(
          query({
            data: {
              languageCode: 'ko',
              namespace,
              key,
              value: ko,
              category: body.category || 'common',
              description,
              isActive: true
            }
          })
        );
      }
    }

    // 영어 업데이트
    if (en !== undefined) {
      const enRecord = await query({
        where: { namespace, key, languageCode: 'en' }
      });

      if (enRecord) {
        updates.push(
          query({
            where: { id: enRecord.id },
            data: { value: en }
          })
        );
      } else {
        // 없으면 생성
        updates.push(
          query({
            data: {
              languageCode: 'en',
              namespace,
              key,
              value: en,
              category: body.category || 'common',
              description,
              isActive: true
            }
          })
        );
      }
    }

    // 일본어 업데이트
    if (ja !== undefined) {
      const jaRecord = await query({
        where: { namespace, key, languageCode: 'ja' }
      });

      if (jaRecord) {
        updates.push(
          query({
            where: { id: jaRecord.id },
            data: { value: ja }
          })
        );
      } else {
        // 없으면 생성
        updates.push(
          query({
            data: {
              languageCode: 'ja',
              namespace,
              key,
              value: ja,
              category: body.category || 'common',
              description,
              isActive: true
            }
          })
        );
      }
    }

    await Promise.all(updates);

    // 캐시 무효화
    invalidateLanguagePacksCache();

    return NextResponse.json({ 
      success: true,
      message: '언어팩이 수정되었습니다.'
    });
  } catch (error) {
    console.error('언어팩 수정 오류:', error);
    return NextResponse.json(
      { error: '언어팩 수정에 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/admin/language-packs/[key] - 언어팩 삭제
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const searchParams = request.nextUrl.searchParams;
    const namespace = searchParams.get('namespace') || 'common';
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: '키가 필요합니다.' },
        { status: 400 }
      );
    }

    // 해당 키의 모든 언어 레코드 삭제
    await queryMany({
      where: {
        namespace,
        key
      }
    });

    // 캐시 무효화
    invalidateLanguagePacksCache();

    return NextResponse.json({ 
      success: true,
      message: '언어팩이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('언어팩 삭제 오류:', error);
    return NextResponse.json(
      { error: '언어팩 삭제에 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}