import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'


// POST - 입금과 주문 매칭
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params
    const body = await request.json()
    const { orderId, isManual = false } = body

    // 입금 정보 조회
    const payment = await prisma.corporatePayment.findUnique({
      where: { id: paymentId }
    })

    if (!payment) {
      return NextResponse.json(
        { error: '입금 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 주문 정보 조회
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 다른 입금과 매칭된 주문인지 확인
    const existingMatch = await prisma.corporatePayment.findFirst({
      where: {
        matchedOrderId: orderId,
        matchingStatus: {
          in: ['AUTO_MATCHED', 'MANUAL_MATCHED']
        },
        id: { not: paymentId }
      }
    })

    if (existingMatch) {
      return NextResponse.json(
        { error: '이미 다른 입금과 매칭된 주문입니다.' },
        { status: 400 }
      )
    }

    // 매칭 점수 계산 (수동 매칭의 경우 기본 점수)
    let matchingScore = 0.5 // 수동 매칭 기본 점수

    if (!isManual) {
      matchingScore = calculateMatchingScore({
        depositorName: payment.depositorName,
        amount: Number(payment.amount),
        transactionDate: payment.transactionDate.toISOString()
      }, order)
    }

    // 트랜잭션으로 입금과 주문 상태 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 입금 상태 업데이트
      const updatedPayment = await tx.corporatePayment.update({
        where: { id: paymentId },
        data: {
          matchedOrderId: orderId,
          matchingStatus: isManual ? 'MANUAL_MATCHED' : 'AUTO_MATCHED',
          matchingScore,
          processedAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          matchedOrder: true
        }
      })

      // 주문 결제 상태 업데이트 (임시로 주석처리)
      const updatedOrder = null
      
      // TODO: Prisma schema에 맞게 수정 필요
      // const updatedOrder = await tx.order.update({
      //   where: { id: orderId },
      //   data: {
      //     status: 'PAID', // 또는 적절한 OrderStatus enum 값
      //     updatedAt: new Date()
      //   }
      // })

      return { updatedPayment, updatedOrder }
    })

    // 매칭 로그 생성
    await createMatchingLog({
      paymentId,
      orderId,
      matchingType: isManual ? 'MANUAL' : 'AUTO',
      matchingScore,
      userId: 'system' // 실제 구현에서는 현재 사용자 ID
    })

    return NextResponse.json({
      message: '입금과 주문이 성공적으로 매칭되었습니다.',
      payment: {
        ...result.updatedPayment,
        orderInfo: result.updatedPayment.matchedOrder ? {
          id: result.updatedPayment.matchedOrder.id,
          // TODO: Add these fields when Order schema is updated
          // orderNumber: result.updatedPayment.matchedOrder.orderNumber,
          // customerName: result.updatedPayment.matchedOrder.customerName,
          // totalAmount: result.updatedPayment.matchedOrder.totalAmount
        } : null
      },
      order: result.updatedOrder
    })
  } catch (error) {
    console.error('Payment matching error:', error)
    return NextResponse.json(
      { error: '매칭 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 매칭 점수 계산 (find-matches와 동일한 로직)
function calculateMatchingScore(
  paymentData: { depositorName: string; amount: number; transactionDate: string },
  order: any
): number {
  let score = 0

  // TODO: Implement matching logic when Order schema is updated with required fields
  // Currently returning basic score for compatibility
  
  // 금액 매칭 (50% 가중치) - temporarily disabled
  // if (order.totalAmount === paymentData.amount) {
  //   score += 0.5
  // } else {
  //   const amountDiff = Math.abs(order.totalAmount - paymentData.amount) / paymentData.amount
  //   if (amountDiff <= 0.05) {
  //     score += 0.4
  //   } else if (amountDiff <= 0.1) {
  //     score += 0.3
  //   } else if (amountDiff <= 0.2) {
  //     score += 0.2
  //   }
  // }

  // 이름 유사도 (30% 가중치) - temporarily disabled
  // const nameSimilarity = calculateNameSimilarity(paymentData.depositorName, order.customerName)
  // score += nameSimilarity * 0.3

  // 시간 근접성 (20% 가중치)
  if (order.createdAt) {
    const timeDiff = Math.abs(
      new Date(paymentData.transactionDate).getTime() - new Date(order.createdAt).getTime()
    )
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
    
    if (daysDiff <= 1) {
      score += 0.2
    } else if (daysDiff <= 3) {
      score += 0.15
    } else if (daysDiff <= 7) {
      score += 0.1
    } else if (daysDiff <= 30) {
      score += 0.05
    }
  }

  return Math.min(score, 1.0)
}

// 이름 유사도 계산
function calculateNameSimilarity(name1: string, name2: string): number {
  if (!name1 || !name2) return 0

  const cleanName1 = name1.replace(/\s+/g, '').toLowerCase()
  const cleanName2 = name2.replace(/\s+/g, '').toLowerCase()

  if (cleanName1 === cleanName2) return 1.0
  if (cleanName1.includes(cleanName2) || cleanName2.includes(cleanName1)) return 0.8

  const distance = levenshteinDistance(cleanName1, cleanName2)
  const maxLength = Math.max(cleanName1.length, cleanName2.length)
  
  return Math.max(0, 1 - distance / maxLength)
}

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

// 매칭 로그 생성
async function createMatchingLog(logData: {
  paymentId: string
  orderId: string
  matchingType: string
  matchingScore: number
  userId: string
}) {
  try {
    await prisma.paymentMatchingLog.create({
      data: {
        paymentId: logData.paymentId,
        orderId: logData.orderId,
        matchingType: logData.matchingType,
        matchingScore: logData.matchingScore,
        userId: logData.userId,
        createdAt: new Date()
      }
    })
  } catch (error) {
    console.error('Matching log creation error:', error)
    // 로그 생성 실패는 전체 프로세스를 중단하지 않음
  }
}