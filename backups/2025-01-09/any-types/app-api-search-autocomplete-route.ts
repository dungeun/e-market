// TODO: Refactor to use createApiHandler from @/lib/api/handler
/**
 * 검색 자동완성 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchEngineService } from '@/lib/services/search/search-engine'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    const suggestions = await searchEngineService.autocomplete(query, limit)

    return NextResponse.json({
      success: true,
      data: suggestions
    })
  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || 'Autocomplete failed' },
      { status: 500 }
    )
  }
}