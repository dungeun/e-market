// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    // 언어 파라미터 가져오기 (헤더 또는 쿼리 파라미터에서)
    const lang = request.headers.get('accept-language') || 
                 request.nextUrl.searchParams.get('lang') || 
                 'ko'
    
    const section = await query({
      where: { id }
    })

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    // 번역 데이터가 있으면 현재 언어에 맞는 데이터 사용
    let content = section.data
    if (section.translations && typeof section.translations === 'object') {
      const translations = section.translations as any
      if (translations[lang]) {
        // 번역된 컨텐츠가 있으면 기본 데이터와 병합
        content = {
          ...content,
          ...(typeof translations[lang] === 'object' ? translations[lang] : {})
        }
      }
    }

    return NextResponse.json({
      section: {
        ...section,
        content,
        isActive: section.isActive,
        currentLanguage: lang
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

    const updatedSection = await query({
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
    await queryMany({
      where: { sectionId: id }
    })

    // Then delete the section
    await query({
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