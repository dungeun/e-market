import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - 매칭 후보 찾기
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params

    // 입금 정보 조회
    const payment = await query({
      where: { id: paymentId }
    })

    if (!payment) {
      return NextResponse.json(
        { error: '입금 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 매칭 후보 검색
    const candidates = await findMatchingCandidates({
      depositorName: payment.depositorName,
      amount: Number(payment.amount),
      transactionDate: payment.transactionDate.toISOString()
    })

    return NextResponse.json(candidates)
  } catch (error) {

    return NextResponse.json(
      { error: '매칭 후보 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 매칭 후보 검색 함수
async function findMatchingCandidates(paymentData: {
  depositorName: string
  amount: number
  transactionDate: string
}) {
  const { depositorName, amount, transactionDate } = paymentData

  // 1. 정확한 금액 매칭 (임시로 빈 배열 반환)
  const exactAmountMatches: any[] = []
  
  // TODO: Prisma schema에 맞게 수정 필요
  // const exactAmountMatches = await query({
  //   where: {
  //     status: 'PENDING',
  //     totalAmount: amount
  //   },
  //   orderBy: { createdAt: 'desc' },
  //   take: 10
  // })

  // 2. 유사한 금액 매칭 (±5% 범위) (임시로 빈 배열 반환)
  const similarAmountMatches: any[] = []
  
  // TODO: Prisma schema에 맞게 수정 필요
  // const amountRange = amount * 0.05
  // const similarAmountMatches = await query({
  //   where: {
  //     status: 'PENDING',
  //     totalAmount: {
  //       gte: amount - amountRange,
  //       lte: amount + amountRange
  //     },
  //     NOT: {
  //       totalAmount: amount // 정확한 매칭은 제외
  //     }
  //   },
  //   orderBy: { createdAt: 'desc' },
  //   take: 5
  // })

  // 3. 이름 유사도 기반 매칭 (임시로 빈 배열 반환)
  const nameMatches: any[] = []
  
  // TODO: Prisma schema에 맞게 수정 필요
  // const nameMatches = await query({
  //   where: {
  //     status: 'PENDING'
  //   },
  //   orderBy: { createdAt: 'desc' },
  //   take: 20
  // })

  const allCandidates = [
    ...exactAmountMatches,
    ...similarAmountMatches,
    ...nameMatches
  ]

  // 중복 제거
  const uniqueCandidates = Array.from(
    new Map(allCandidates.map(order => [order.id, order])).values()
  )

  // 매칭 점수 계산 및 정렬
  const scoredCandidates = uniqueCandidates.map(candidate => {
    const score = calculateMatchingScore(paymentData, candidate)
    const reasons = getMatchingReasons(paymentData, candidate, score)

    return {
      orderId: candidate.id,
      orderNumber: candidate.orderNumber,
      customerName: candidate.customerName,
      totalAmount: candidate.totalAmount,
      score,
      reasons
    }
  })

  // 점수순으로 정렬하고 상위 5개만 반환
  return scoredCandidates
    .filter(candidate => candidate.score >= 0.3) // 최소 점수 필터
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

// 매칭 점수 계산
function calculateMatchingScore(
  paymentData: { depositorName: string; amount: number; transactionDate: string },
  order: any
): number {
  let score = 0

  // 1. 금액 매칭 (50% 가중치)
  if (order.totalAmount === paymentData.amount) {
    score += 0.5
  } else {
    const amountDiff = Math.abs(order.totalAmount - paymentData.amount) / paymentData.amount
    if (amountDiff <= 0.05) { // 5% 이내
      score += 0.4
    } else if (amountDiff <= 0.1) { // 10% 이내
      score += 0.3
    } else if (amountDiff <= 0.2) { // 20% 이내
      score += 0.2
    }
  }

  // 2. 이름 유사도 (30% 가중치)
  const nameSimilarity = calculateNameSimilarity(paymentData.depositorName, order.customerName)
  score += nameSimilarity * 0.3

  // 3. 시간 근접성 (20% 가중치)
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

  return Math.min(score, 1.0) // 최대 1.0
}

// 매칭 이유 생성
function getMatchingReasons(
  paymentData: { depositorName: string; amount: number; transactionDate: string },
  order: any,
  score: number
): string[] {
  const reasons: string[] = []

  // 금액 매칭
  if (order.totalAmount === paymentData.amount) {
    reasons.push('금액 정확히 일치')
  } else {
    const amountDiff = Math.abs(order.totalAmount - paymentData.amount) / paymentData.amount
    if (amountDiff <= 0.05) {
      reasons.push('금액 유사 (5% 이내)')
    } else if (amountDiff <= 0.1) {
      reasons.push('금액 유사 (10% 이내)')
    }
  }

  // 이름 유사도
  const nameSimilarity = calculateNameSimilarity(paymentData.depositorName, order.customerName)
  if (nameSimilarity >= 0.8) {
    reasons.push('이름 매우 유사')
  } else if (nameSimilarity >= 0.6) {
    reasons.push('이름 유사')
  } else if (nameSimilarity >= 0.4) {
    reasons.push('이름 부분 일치')
  }

  // 시간 근접성
  const timeDiff = Math.abs(
    new Date(paymentData.transactionDate).getTime() - new Date(order.createdAt).getTime()
  )
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
  
  if (daysDiff <= 1) {
    reasons.push('주문일 1일 이내')
  } else if (daysDiff <= 3) {
    reasons.push('주문일 3일 이내')
  } else if (daysDiff <= 7) {
    reasons.push('주문일 1주일 이내')
  }

  if (reasons.length === 0) {
    reasons.push('기본 매칭')
  }

  return reasons
}

// 이름 유사도 계산 함수
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