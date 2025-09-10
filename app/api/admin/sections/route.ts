// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { SectionService } from '@/lib/services/sections/section-service'

// GET: 모든 섹션 조회
export async function GET() {
  try {
    // 실제 ui_sections 테이블에서 조회 (ui-sections API와 동일한 데이터 사용)
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/ui-sections`)
    const data = await response.json()
    
    // Admin UI 형태로 변환
    const adminSections = data.sections.map((section: any) => ({
      id: section.key,
      type: section.type,
      name: section.title,
      description: `${section.type} section`,
      enabled: section.isActive,
      order: section.order,
      config: section.data || {}
    }))
    
    return NextResponse.json(adminSections)
  } catch (error) {
    console.error('Failed to get sections:', error)
    return NextResponse.json(
      { error: 'Failed to get sections' },
      { status: 500 }
    )
  }
}

// POST: 새 섹션 생성
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    // TODO: Implement createSection method in SectionService
    // const section = await SectionService.createSection(data)

    return NextResponse.json({ success: true, section: data })
  } catch (error) {

    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    )
  }
}