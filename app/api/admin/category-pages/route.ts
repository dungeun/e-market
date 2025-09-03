// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/category-pages - 모든 카테고리 페이지 목록
export async function GET() {
  try {
    // Mock 카테고리 페이지 목록 (categoryPage 테이블이 없음)
    const categoryPages = [
      {
        id: 'mock-page-1',
        categoryId: 'mock-category-1',
        title: 'Mock Category Page 1',
        slug: 'mock-page-1',
        isActive: true,
        category: {
          id: 'mock-category-1',
          name: 'Mock Category 1',
          slug: 'mock-category-1'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    return NextResponse.json({
      success: true,
      categoryPages
    })
  } catch (error) {

    return NextResponse.json(
      { success: false, error: 'Failed to fetch category pages' },
      { status: 500 }
    )
  }
}

// POST /api/admin/category-pages - 새 카테고리 페이지 생성
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Mock 카테고리 확인
    const category = {
      id: data.categoryId || 'mock-category-1',
      name: 'Mock Category',
      slug: 'mock-category'
    }

    // Mock 카테고리 페이지 생성
    const categoryPage = {
      id: 'mock-page-' + Date.now(),
      ...data,
      category: category,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      categoryPage
    })
  } catch (error) {

    return NextResponse.json(
      { success: false, error: 'Failed to create category page' },
      { status: 500 }
    )
  }
}