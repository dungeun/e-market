// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// TODO: 섹션 개별 관리는 UI Config 페이지에서 처리하므로 현재는 사용하지 않음
// 필요시 SectionService에 updateSection, deleteSection 메서드 구현 필요

// PATCH: 섹션 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // TODO: 개별 섹션 업데이트 로직 구현
    return NextResponse.json({ 
      message: 'Use /api/admin/ui-config instead',
      redirect: '/api/admin/ui-config'
    }, { status: 501 })
  } catch (error) {

    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    )
  }
}

// DELETE: 섹션 삭제
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    // TODO: 개별 섹션 삭제 로직 구현
    return NextResponse.json({ 
      message: 'Use /api/admin/ui-config instead',
      redirect: '/api/admin/ui-config'
    }, { status: 501 })
  } catch (error) {

    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    )
  }
}