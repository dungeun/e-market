// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/category-pages/[id] - 특정 카테고리 페이지 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Mock 카테고리 페이지 (categoryPage 테이블이 없음)
    const categoryPage = {
      id: id,
      categoryId: 'mock-category-1',
      title: 'Mock Category Page',
      description: 'Mock description',
      metaTitle: 'Mock Meta Title',
      metaDescription: 'Mock Meta Description',
      bannerImage: '/images/mock-banner.jpg',
      content: '{}',
      isActive: true,
      category: {
        id: 'mock-category-1',
        name: 'Mock Category',
        slug: 'mock-category',
        parent: null,
        children: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      categoryPage
    })
  } catch (error) {
    console.error('Error fetching category page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category page' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/category-pages/[id] - 카테고리 페이지 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const data = await request.json()

    // Mock 업데이트 (실제로는 아무것도 업데이트하지 않음)
    const updatedCategoryPage = {
      id: id,
      ...data,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      categoryPage: updatedCategoryPage
    })
  } catch (error) {
    console.error('Error updating category page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update category page' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/category-pages/[id] - 카테고리 페이지 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Mock 삭제 (실제로는 아무것도 삭제하지 않음)
    console.log('Mock: Category page deleted:', id)

    return NextResponse.json({
      success: true,
      message: 'Category page deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting category page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete category page' },
      { status: 500 }
    )
  }
}