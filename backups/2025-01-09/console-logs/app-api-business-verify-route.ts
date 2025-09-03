// TODO: Refactor to use createApiHandler from @/lib/api/handler
/**
 * 사업자등록번호 확인 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { b2bService } from '@/lib/services/business/b2b-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 사업자등록번호 확인
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { businessNumber, representative, openDate } = body

    if (!businessNumber || !representative) {
      return NextResponse.json(
        { error: 'Business number and representative name are required' },
        { status: 400 }
      )
    }

    const result = await b2bService.verifyBusinessRegistration({
      businessNumber,
      representative,
      openDate
    })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('Business verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify business registration' },
      { status: 500 }
    )
  }
}