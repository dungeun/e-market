import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    const section = await prisma.uISection.findUnique({
      where: { id },
      include: {
        texts: {
          orderBy: { key: 'asc' }
        }
      }
    })

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      section: {
        ...section,
        content: section.data,
        isActive: section.isActive
      }
    })
  } catch (error) {
    console.error('Failed to fetch UI section:', error)
    return NextResponse.json(
      { error: 'Failed to fetch UI section' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    
    const {
      key,
      title,
      type,
      isActive,
      order,
      data,
      props,
      style
    } = body

    const updatedSection = await prisma.uISection.update({
      where: { id },
      data: {
        ...(key !== undefined && { key }),
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
        ...(data !== undefined && { data }),
        ...(props !== undefined && { props }),
        ...(style !== undefined && { style })
      }
    })

    return NextResponse.json({
      section: {
        ...updatedSection,
        content: updatedSection.data,
        isActive: updatedSection.isActive
      }
    })
  } catch (error) {
    console.error('Failed to update UI section:', error)
    return NextResponse.json(
      { error: 'Failed to update UI section' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Delete related texts first
    await prisma.uIText.deleteMany({
      where: { sectionId: id }
    })

    // Then delete the section
    await prisma.uISection.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete UI section:', error)
    return NextResponse.json(
      { error: 'Failed to delete UI section' },
      { status: 500 }
    )
  }
}