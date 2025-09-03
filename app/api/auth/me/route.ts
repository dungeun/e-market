import type { AppError } from '@/lib/types/common';
// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth/services'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Check both cookie names for compatibility
    let accessToken = request.cookies.get('auth-token')?.value || request.cookies.get('accessToken')?.value
    
    // Also check Authorization header
    if (!accessToken) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7)
      }
    }

    if (!accessToken) {

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate token

    const tokenData = await authService.validateToken(accessToken)

    if (!tokenData) {

      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user - handle both userId and id fields for compatibility
    const userId = tokenData.userId || tokenData.id

    if (!userId) {

      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 401 }
      )
    }
    
    const user = await authService.getUserById(userId)
    console.log('Auth Me - User found:', user ? `${user.name} (${user.type})` : 'not found')
    
    if (!user) {

      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error: Error | unknown) {

    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    )
  }
}