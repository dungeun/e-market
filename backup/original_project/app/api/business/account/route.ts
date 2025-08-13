/**
 * B2B 사업자 계정 관리 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { b2bService } from '@/lib/services/business/b2b-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 사업자 계정 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const businessAccount = await prisma.businessAccount.findUnique({
      where: { userId: session.user.email || '' },
      include: {
        priceGroups: {
          include: {
            priceGroup: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: businessAccount
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get business account' },
      { status: 500 }
    )
  }
}

// 사업자 계정 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      businessNumber,
      companyName,
      representative,
      businessType,
      businessCategory,
      businessAddress,
      taxInvoiceEmail
    } = body

    // 필수 필드 확인
    if (!businessNumber || !companyName || !representative || !businessType || 
        !businessCategory || !businessAddress || !taxInvoiceEmail) {
      return NextResponse.json(
        { error: 'All business information fields are required' },
        { status: 400 }
      )
    }

    // 이미 사업자 계정이 있는지 확인
    const existing = await prisma.businessAccount.findUnique({
      where: { userId: session.user.email }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Business account already exists for this user' },
        { status: 409 }
      )
    }

    // 사업자 계정 생성
    const businessAccount = await b2bService.createBusinessAccount(
      session.user.email,
      {
        businessNumber,
        companyName,
        representative,
        businessType,
        businessCategory,
        businessAddress,
        taxInvoiceEmail
      }
    )

    return NextResponse.json({
      success: true,
      data: businessAccount,
      message: '사업자 계정이 성공적으로 생성되었습니다.'
    })
  } catch (error: any) {
    console.error('Business account creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create business account' },
      { status: 500 }
    )
  }
}

// 사업자 계정 수정
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      taxInvoiceEmail,
      businessAddress,
      businessType,
      businessCategory
    } = body

    const businessAccount = await prisma.businessAccount.update({
      where: { userId: session.user.email },
      data: {
        ...(taxInvoiceEmail && { taxInvoiceEmail }),
        ...(businessAddress && { businessAddress }),
        ...(businessType && { businessType }),
        ...(businessCategory && { businessCategory })
      }
    })

    return NextResponse.json({
      success: true,
      data: businessAccount,
      message: '사업자 정보가 수정되었습니다.'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update business account' },
      { status: 500 }
    )
  }
}