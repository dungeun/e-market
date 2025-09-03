import { NextRequest, NextResponse } from 'next/server'
import { SectionService } from '@/lib/services/sections/section-service'

// PUT: 섹션 순서 업데이트
export async function PUT(request: NextRequest) {
  try {
    const { sectionIds } = await request.json()
    
    if (!Array.isArray(sectionIds)) {
      return NextResponse.json(
        { error: 'Invalid section IDs' },
        { status: 400 }
      )
    }

    // TODO: Implement updateSectionOrder method in SectionService
    // await SectionService.updateSectionOrder(sectionIds)
    
    // For now, just return success

    return NextResponse.json({ success: true })
  } catch (error) {

    return NextResponse.json(
      { error: 'Failed to update section order' },
      { status: 500 }
    )
  }
}