// TODO: Refactor to use createApiHandler from @/lib/api/handler
/**
 * AI 추천 시스템 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { recommendationEngineService } from '@/lib/services/recommendation/recommendation-engine'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 사용자 맞춤 추천
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    
    const userId = session?.user?.id || searchParams.get('userId')
    const type = (searchParams.get('type') as any) || 'hybrid'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10
    const includeViewed = searchParams.get('includeViewed') === 'true'
    const categoryFilter = searchParams.get('categories')?.split(',')

    if (!userId) {
      // 비로그인 사용자용 트렌딩 상품
      const result = await recommendationEngineService.getPersonalizedRecommendations('', {
        limit,
        type: 'trending',
        categoryFilter
      })

      return NextResponse.json({
        success: true,
        data: result
      })
    }

    const recommendations = await recommendationEngineService.getPersonalizedRecommendations(
      userId,
      {
        limit,
        type,
        includeViewed,
        categoryFilter
      }
    )

    return NextResponse.json({
      success: true,
      data: recommendations
    })
  } catch (error: any) {
    console.error('Recommendations error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}

// 추천 클릭 추적
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    const { action, productId, algorithm, userId } = body
    const targetUserId = session?.user?.id || userId

    if (!targetUserId || !productId || !algorithm) {
      return NextResponse.json(
        { error: 'User ID, product ID, and algorithm are required' },
        { status: 400 }
      )
    }

    if (action === 'click') {
      await recommendationEngineService.trackRecommendationClick(
        targetUserId,
        productId,
        algorithm
      )
    } else if (action === 'purchase') {
      await recommendationEngineService.trackRecommendationPurchase(
        targetUserId,
        productId,
        algorithm
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully'
    })
  } catch (error: any) {
    console.error('Recommendation tracking error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to track recommendation' },
      { status: 500 }
    )
  }
}