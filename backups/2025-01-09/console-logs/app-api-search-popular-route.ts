// TODO: Refactor to use createApiHandler from @/lib/api/handler
/**
 * 인기 검색어 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchEngineService } from '@/lib/services/search/search-engine'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    const popularSearches = await searchEngineService.getPopularSearches(limit)

    return NextResponse.json({
      success: true,
      data: popularSearches
    })
  } catch (error: any) {
    console.error('Popular searches error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch popular searches' },
      { status: 500 }
    )
  }
}