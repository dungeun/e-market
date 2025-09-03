import type { AppError } from '@/lib/types/common';
// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// PUT /api/admin/translations/[id] - 개별 번역 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const { id } = params
    const body = await request.json()
    const { type, en, ja } = body

    if (!type || !['campaign', 'post', 'menu', 'main-sections'].includes(type)) {
      return NextResponse.json(
        { error: '유효한 타입을 선택해주세요.' },
        { status: 400 }
      )
    }

    if (type === 'campaign') {
      // 캠페인 번역 업데이트
      const campaign = await query({
        where: { id }
      })

      if (!campaign) {
        return NextResponse.json(
          { error: '캠페인을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 영어 번역 업데이트
      if (en !== undefined) {
        await query({
          where: {
            campaignId_language: {
              campaignId: id,
              language: 'en'
            }
          },
          update: {
            title: en,
            isAutoTranslated: false,
            lastEditedBy: authResult.user.id,
            editedAt: new Date()
          },
          create: {
            campaignId: id,
            language: 'en',
            title: en,
            description: '',
            isAutoTranslated: false,
            lastEditedBy: authResult.user.id,
            editedAt: new Date()
          }
        })
      }

      // 일본어 번역 업데이트
      if (ja !== undefined) {
        await query({
          where: {
            campaignId_language: {
              campaignId: id,
              language: 'ja'
            }
          },
          update: {
            title: ja,
            isAutoTranslated: false,
            lastEditedBy: authResult.user.id,
            editedAt: new Date()
          },
          create: {
            campaignId: id,
            language: 'ja',
            title: ja,
            description: '',
            isAutoTranslated: false,
            lastEditedBy: authResult.user.id,
            editedAt: new Date()
          }
        })
      }
    } else if (type === 'post') {
      // 게시물 번역 업데이트
      const post = await query({
        where: { id }
      })

      if (!post) {
        return NextResponse.json(
          { error: '게시물을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 영어 번역 업데이트
      if (en !== undefined) {
        await query({
          where: {
            postId_language: {
              postId: id,
              language: 'en'
            }
          },
          update: {
            title: en,
            isAutoTranslated: false,
            lastEditedBy: authResult.user.id,
            editedAt: new Date()
          },
          create: {
            postId: id,
            language: 'en',
            title: en,
            content: '',
            isAutoTranslated: false,
            lastEditedBy: authResult.user.id,
            editedAt: new Date()
          }
        })
      }

      // 일본어 번역 업데이트
      if (ja !== undefined) {
        await query({
          where: {
            postId_language: {
              postId: id,
              language: 'ja'
            }
          },
          update: {
            title: ja,
            isAutoTranslated: false,
            lastEditedBy: authResult.user.id,
            editedAt: new Date()
          },
          create: {
            postId: id,
            language: 'ja',
            title: ja,
            content: '',
            isAutoTranslated: false,
            lastEditedBy: authResult.user.id,
            editedAt: new Date()
          }
        })
      }
    } else if (type === 'menu' || type === 'main-sections') {
      // LanguagePack 번역 업데이트
      const pack = await query({
        where: { id }
      })

      if (!pack) {
        return NextResponse.json(
          { error: '언어팩 항목을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      const updateData: unknown = {}
      if (en !== undefined) updateData.en = en
      if (ja !== undefined) updateData.ja = ja

      if (Object.keys(updateData).length > 0) {
        await query({
          where: { id },
          data: updateData
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: '번역이 성공적으로 업데이트되었습니다.'
    })

  } catch (error) {

    return NextResponse.json(
      { error: '번역 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  }
}