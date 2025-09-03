/**
 * 고급 검색 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchEngineService } from '@/lib/services/search/search-engine'

// 상품 검색
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const searchQuery = {
      query: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      brand: searchParams.get('brand') || undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      inStock: searchParams.get('inStock') === 'true',
      ratings: searchParams.get('ratings') ? parseInt(searchParams.get('ratings')!) : undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'relevance',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    }

    const results = await searchEngineService.search(searchQuery)

    return NextResponse.json({
      success: true,
      data: results
    })
  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    )
  }
}

// 검색 인덱스 재구성 (관리자용)
export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인 (실제 구현에서는 인증 미들웨어 사용)
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'rebuild-index') {
      await searchEngineService.rebuildSearchIndex()
      
      return NextResponse.json({
        success: true,
        message: '검색 인덱스가 재구성되었습니다.'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || 'Index rebuild failed' },
      { status: 500 }
    )
  }
}