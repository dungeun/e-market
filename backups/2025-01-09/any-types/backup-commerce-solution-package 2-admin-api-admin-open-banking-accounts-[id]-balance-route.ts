import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - 계좌 잔액 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await params

    // 계좌 정보 조회
    const account = await query({
      where: { id: accountId }
    })

    if (!account) {
      return NextResponse.json(
        { error: '계좌를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (!account.isActive) {
      return NextResponse.json(
        { error: '비활성화된 계좌입니다.' },
        { status: 400 }
      )
    }

    if (!account.inquiryAgreeYn) {
      return NextResponse.json(
        { error: '계좌 조회 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 오픈뱅킹 API 잔액 조회
    const balanceResult = await getBalanceFromOpenBanking(account)

    if (!balanceResult.success) {
      return NextResponse.json(
        { error: balanceResult.message },
        { status: 400 }
      )
    }

    // 계좌 정보 업데이트 (옵션)
    if (balanceResult.balance !== undefined) {
      await query({
        where: { id: accountId },
        data: {
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      accountId,
      bankCode: account.bankCode,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountHolderName: account.accountHolderName,
      balance: balanceResult.balance,
      balanceAmt: balanceResult.balance,
      availableAmt: balanceResult.availableBalance || balanceResult.balance,
      accountType: account.accountType,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {

    return NextResponse.json(
      { error: '잔액 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 오픈뱅킹 API 잔액 조회
async function getBalanceFromOpenBanking(account: any) {
  try {
    // TODO: 실제 오픈뱅킹 API 호출
    // const response = await openBankingAPI.getBalance({
    //   bank_tran_id: generateTransactionId(),
    //   fintech_use_num: account.fintechUseNum,
    //   tran_dtime: getCurrentDateTime()
    // })

    // 임시 응답 (개발용)
    const mockBalance = Math.floor(Math.random() * 10000000) + 1000000 // 100만원~1000만원

    return {
      success: true,
      balance: mockBalance,
      availableBalance: mockBalance,
      balanceAmt: mockBalance.toString(),
      availableAmt: mockBalance.toString(),
      accountType: account.accountType,
      printContent: '잔액조회'
    }
  } catch (error) {

    return {
      success: false,
      message: '오픈뱅킹 잔액 조회에 실패했습니다.'
    }
  }
}

// 현재 일시 생성 (YYYYMMDDHHMISS)
function getCurrentDateTime(): string {
  const now = new Date()
  return now.getFullYear().toString() +
         (now.getMonth() + 1).toString().padStart(2, '0') +
         now.getDate().toString().padStart(2, '0') +
         now.getHours().toString().padStart(2, '0') +
         now.getMinutes().toString().padStart(2, '0') +
         now.getSeconds().toString().padStart(2, '0')
}

// 거래고유번호 생성
function generateTransactionId(): string {
  return `M${Date.now()}${Math.random().toString(36).substr(2, 5)}`
}