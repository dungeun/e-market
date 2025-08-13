import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { sections } = await request.json()

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Invalid sections data' },
        { status: 400 }
      )
    }

    // Update order for each section
    await Promise.all(
      sections.map(({ id, order }) =>
        prisma.uISection.update({
          where: { id },
          data: { order }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to reorder sections:', error)
    return NextResponse.json(
      { error: 'Failed to reorder sections' },
      { status: 500 }
    )
  }
}