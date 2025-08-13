import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'ko';

    console.log('Loading sections for language:', lang);

    // 데이터베이스에서 UI 섹션 가져오기
    const dbSections = await prisma.uISection.findMany({
      where: { 
        isActive: true,
        type: { in: ['hero', 'category', 'quicklinks', 'promo'] }
      },
      orderBy: { order: 'asc' }
    });

    console.log('Found sections:', dbSections.length);

    // 섹션 데이터를 클라이언트 형식으로 변환
    const sections = dbSections.map(section => ({
      id: section.id,
      type: section.type,
      key: section.key,
      title: section.title,
      data: section.data,
      order: section.order
    }));

    return NextResponse.json({
      success: true,
      sections,
      language: lang
    });

  } catch (error) {
    console.error('Failed to load sections:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load sections',
        sections: []
      },
      { status: 500 }
    );
  }
}