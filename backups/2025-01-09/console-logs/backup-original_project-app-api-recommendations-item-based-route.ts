/**
 * 상품 기반 추천 API (연관 상품)
 */

import { NextRequest, NextResponse } from 'next/server'
import { recommendationEngineService } from '@/lib/services/recommendation/recommendation-engine'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    
    const productId = searchParams.get('productId')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10
    const userId = session?.user?.id

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const recommendations = await recommendationEngineService.getItemBasedRecommendations(
      productId,
      {
        limit,
        userId
      }
    )

    return NextResponse.json({
      success: true,
      data: recommendations
    })
  } catch (error: any) {
    console.error('Item-based recommendations error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get item-based recommendations' },
      { status: 500 }
    )
  }
}