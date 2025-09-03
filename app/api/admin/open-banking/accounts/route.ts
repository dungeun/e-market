// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - 연결된 계좌 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') // 실제 구현에서는 인증에서 가져오기

    const accounts = await query({
      where: userId ? { userId } : {},
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(accounts)
  } catch (error) {

    return NextResponse.json(
      { error: '계좌 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST - 새 계좌 연결
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      userId = 'system', // 실제 구현에서는 인증에서 가져오기
      bankCode,
      accountNumber,
      accountHolderName,
      accountType,
      inquiryAgreeYn,
      transferAgreeYn
    } = body

    // 중복 계좌 체크
    const existingAccount = await query({
      where: {
        bankCode,
        accountNumber,
        userId
      }
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: '이미 연결된 계좌입니다.' },
        { status: 400 }
      )
    }

    // 오픈뱅킹 API 인증 및 계좌 정보 확인
    const openBankingResult = await registerWithOpenBanking({
      bankCode,
      accountNumber,
      accountHolderName,
      inquiryAgreeYn,
      transferAgreeYn
    })

    if (!openBankingResult.success) {
      return NextResponse.json(
        { error: openBankingResult.message },
        { status: 400 }
      )
    }

    // 첫 번째 계좌인 경우 기본 계좌로 설정
    const accountCount = await query({
      where: { userId }
    })

    const account = await query({
      data: {
        userId,
        bankCode,
        bankName: getBankName(bankCode),
        accountNumber,
        accountHolderName,
        accountType,
        fintechUseNum: openBankingResult.fintechUseNum || '',
        inquiryAgreeYn,
        inquiryAgreeDtime: inquiryAgreeYn ? new Date() : null,
        transferAgreeYn,
        transferAgreeDtime: transferAgreeYn ? new Date() : null,
        isPrimary: accountCount === 0,
        isActive: true
      }
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {

    return NextResponse.json(
      { error: '계좌 연결 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 오픈뱅킹 API 계좌 등록
async function registerWithOpenBanking(accountData: {
  bankCode: string
  accountNumber: string
  accountHolderName: string
  inquiryAgreeYn: boolean
  transferAgreeYn: boolean
}) {
  try {
    // TODO: 실제 오픈뱅킹 API 호출
    // const authResult = await openBankingAPI.registerAccount({
    //   bank_tran_id: generateTransactionId(),
    //   bank_code_std: accountData.bankCode,
    //   account_num: accountData.accountNumber,
    //   account_holder_name: accountData.accountHolderName,
    //   print_content: "계좌등록",
    //   scope: buildScope(accountData.inquiryAgreeYn, accountData.transferAgreeYn)
    // })

    // 임시 성공 응답 (개발용)
    return {
      success: true,
      fintechUseNum: `${accountData.bankCode}${accountData.accountNumber}${Date.now()}`,
      message: '계좌 연결 성공'
    }
  } catch (error) {

    return {
      success: false,
      message: '오픈뱅킹 계좌 연결에 실패했습니다.'
    }
  }
}

// 권한 범위 생성
function buildScope(inquiryAgree: boolean, transferAgree: boolean): string {
  const scopes: string[] = []
  
  if (inquiryAgree) {
    scopes.push('inquiry')
  }
  
  if (transferAgree) {
    scopes.push('transfer')
  }
  
  return scopes.join(' ')
}

// 은행명 매핑
function getBankName(bankCode: string): string {
  const bankNames: { [key: string]: string } = {
    '001': 'KB국민은행',
    '003': '기업은행',
    '004': '신한은행',
    '011': '농협은행',
    '020': '우리은행',
    '023': 'SC제일은행',
    '081': '하나은행',
    '088': '신한은행',
    '090': '카카오뱅크',
    '089': '케이뱅크'
  }
  return bankNames[bankCode] || `은행코드: ${bankCode}`
}

// 거래고유번호 생성
function generateTransactionId(): string {
  return `M${Date.now()}${Math.random().toString(36).substr(2, 5)}`
}