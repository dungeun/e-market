import type { AppError } from '@/lib/types/common';
// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/db'

// GET - 법인 입금 내역 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const bankCode = searchParams.get('bankCode')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    const where: unknown = {}

    if (status && status !== 'ALL') {
      where.matchingStatus = status
    }

    if (bankCode && bankCode !== 'ALL') {
      where.bankCode = bankCode
    }

    if (search) {
      where.OR = [
        { depositorName: { contains: search, mode: 'insensitive' } },
        { bankTransactionId: { contains: search, mode: 'insensitive' } }
        // TODO: Add order search when Order schema is updated
        // { 
        //   matchedOrder: {
        //     OR: [
        //       { orderNumber: { contains: search, mode: 'insensitive' } },
        //       { customerName: { contains: search, mode: 'insensitive' } }
        //     ]
        //   }
        // }
      ]
    }

    const [payments, total] = await Promise.all([
      query({
        where,
        include: {
          matchedOrder: true
        },
        orderBy: { transactionDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      query({ where })
    ])

    // 응답 형태 변환
    const formattedPayments = payments.map(payment => ({
      ...payment,
      orderInfo: payment.matchedOrder ? {
        id: payment.matchedOrder.id
        // TODO: Add these fields when Order schema is updated
        // orderNumber: payment.matchedOrder.orderNumber,
        // customerName: payment.matchedOrder.customerName,
        // totalAmount: payment.matchedOrder.totalAmount
      } : null
    }))

    return NextResponse.json({
      data: formattedPayments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {

    return NextResponse.json(
      { error: '입금 내역 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST - 새 입금 내역 등록 (웹훅용)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      bankCode,
      accountNumber,
      transactionDate,
      depositorName,
      depositorAccount,
      amount,
      balanceAfter,
      transactionMemo,
      bankTransactionId,
      rawData
    } = body

    // 중복 체크
    const existingPayment = await query({
      where: { bankTransactionId }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: '이미 등록된 거래입니다.' },
        { status: 400 }
      )
    }

    // 자동 매칭 시도
    const matchResult = await attemptAutoMatch({
      depositorName,
      amount,
      transactionDate
    })

    const payment = await query({
      data: {
        bankCode,
        accountNumber,
        transactionDate: new Date(transactionDate),
        transactionType: 'DEPOSIT',
        depositorName,
        depositorAccount,
        amount,
        balanceAfter,
        transactionMemo,
        bankTransactionId,
        rawData: rawData ? JSON.stringify(rawData) : null,
        matchedOrderId: matchResult.orderId,
        matchingStatus: matchResult.orderId ? 'AUTO_MATCHED' : 'UNMATCHED',
        matchingScore: matchResult.score,
        processedAt: matchResult.orderId ? new Date() : null
      },
      include: {
        matchedOrder: true
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {

    return NextResponse.json(
      { error: '입금 내역 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 자동 매칭 함수
async function attemptAutoMatch(paymentData: {
  depositorName: string
  amount: number
  transactionDate: string
}) {
  try {
    const { depositorName, amount, transactionDate } = paymentData

    // TODO: Implement auto-matching when Order schema is updated
    // 매칭 후보 조회 (최근 30일 내 미결제 주문)
    // const thirtyDaysAgo = new Date()
    // thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // const candidates = await query({
    //   where: {
    //     paymentStatus: 'PENDING',
    //     totalAmount: amount,
    //     createdAt: {
    //       gte: thirtyDaysAgo
    //     }
    //   },
    //   orderBy: { createdAt: 'desc' },
    //   take: 10
    // })

    const candidates: unknown[] = []

    if (candidates.length === 0) {
      return { orderId: null, score: 0 }
    }

    // TODO: Implement matching logic when Order schema is updated
    // Currently returning no match until Order schema is fixed
    return { orderId: null, score: 0 }
  } catch (error) {

    return { orderId: null, score: 0 }
  }
}

// 이름 유사도 계산 함수 (간단한 구현)
function calculateNameSimilarity(name1: string, name2: string): number {
  if (!name1 || !name2) return 0

  // 공백 제거하고 소문자로 변환
  const cleanName1 = name1.replace(/\s+/g, '').toLowerCase()
  const cleanName2 = name2.replace(/\s+/g, '').toLowerCase()

  if (cleanName1 === cleanName2) return 1.0
  if (cleanName1.includes(cleanName2) || cleanName2.includes(cleanName1)) return 0.8

  // Levenshtein distance 계산
  const distance = levenshteinDistance(cleanName1, cleanName2)
  const maxLength = Math.max(cleanName1.length, cleanName2.length)
  
  return Math.max(0, 1 - distance / maxLength)
}

// Levenshtein distance 계산
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}