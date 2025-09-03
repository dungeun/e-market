import { NextRequest, NextResponse } from 'next/server'
import { SectionService } from '@/lib/services/sections/section-service'

// GET: 모든 섹션 조회
export async function GET() {
  try {
    // Use getActiveSections for now
    const sections = await SectionService.getActiveSections()
    return NextResponse.json(sections)
  } catch (error) {

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