// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { uiConfigSyncService } from '@/lib/services/ui-config-sync.service'
import { verifyAdminAuth } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sections, sectionOrder } = await request.json()

    // 두 가지 형식 지원: 기존 sections 배열 또는 새로운 sectionOrder 배열
    let finalSectionOrder: string[]

    if (sectionOrder && Array.isArray(sectionOrder)) {
      // 새로운 형식: 직접 섹션 순서 배열
      finalSectionOrder = sectionOrder
    } else if (sections && Array.isArray(sections)) {
      // 기존 형식: sections 배열에서 순서 추출
      finalSectionOrder = sections
        .sort((a, b) => a.order - b.order)
        .map(section => section.id || section.sectionId)
    } else {
      return NextResponse.json(
        { error: 'Invalid request format. Provide either sections array or sectionOrder array.' },
        { status: 400 }
      )
    }

    if (finalSectionOrder.length === 0) {
      return NextResponse.json(
        { error: 'Empty section order provided' },
        { status: 400 }
      )
    }

    // 유효한 섹션 ID들인지 검증
    const validSectionIds = [
      'hero', 'category', 'quicklinks', 'promo', 
      'active-campaigns', 'products', 'ranking', 'recommended'
    ]
    
    const invalidSections = finalSectionOrder.filter(id => !validSectionIds.includes(id))
    if (invalidSections.length > 0) {
      return NextResponse.json({
        error: '유효하지 않은 섹션 ID가 포함되어 있습니다.',
        invalidSections,
        validSections: validSectionIds
      }, { status: 400 })
    }

    // UI 설정 동기화 서비스를 통해 모든 언어 파일 업데이트
    const syncResult = await uiConfigSyncService.syncSectionOrder(
      finalSectionOrder,
      authResult.userId
    )

    if (!syncResult.success) {
      return NextResponse.json({
        error: '섹션 순서 동기화에 실패했습니다.',
        details: syncResult.errors.map(e => `${e.language}: ${e.error}`)
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '모든 언어의 섹션 순서가 업데이트되었습니다.',
      sectionOrder: finalSectionOrder,
      updatedLanguages: syncResult.updatedLanguages,
      timestamp: syncResult.timestamp
    })

  } catch (error) {
    console.error('Failed to reorder sections:', error)
    return NextResponse.json({
      error: '섹션 순서 업데이트에 실패했습니다.',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}