import { NextRequest, NextResponse } from 'next/server'


// GET - 계좌 거래내역 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await params
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const transactionType = searchParams.get('transactionType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

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

    // 오픈뱅킹 API 거래내역 조회
    const transactionsResult = await getTransactionsFromOpenBanking(account, {
      startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      transactionType,
      page,
      limit
    })

    if (!transactionsResult.success) {
      return NextResponse.json(
        { error: transactionsResult.message },
        { status: 400 }
      )
    }

    // 거래내역을 DB에 저장 (동기화)
    if (transactionsResult.transactions) {
      await syncTransactionsToDatabase(accountId, transactionsResult.transactions)
    }

    // DB에서 조회 (필터링 적용)
    const where: any = {
      accountId
    }

    if (startDate && endDate) {
      where.transactionDate = {
        gte: new Date(startDate + 'T00:00:00Z'),
        lte: new Date(endDate + 'T23:59:59Z')
      }
    }

    if (transactionType && transactionType !== 'ALL') {
      where.transactionType = transactionType
    }

    const [transactions, total] = await Promise.all([
      query({
        where,
        orderBy: [
          { transactionDate: 'desc' },
          { transactionTime: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      query({ where })
    ])

    return NextResponse.json({
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      account: {
        id: account.id,
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountHolderName: account.accountHolderName
      }
    })
  } catch (error) {
    console.error('Transactions inquiry error:', error)
    return NextResponse.json(
      { error: '거래내역 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 오픈뱅킹 API 거래내역 조회
async function getTransactionsFromOpenBanking(
  account: any,
  params: {
    startDate: string
    endDate: string
    transactionType?: string | null
    page: number
    limit: number
  }
) {
  try {
    // TODO: 실제 오픈뱅킹 API 호출
    // const response = await openBankingAPI.getTransactionList({
    //   bank_tran_id: generateTransactionId(),
    //   fintech_use_num: account.fintechUseNum,
    //   inquiry_type: 'A', // All
    //   inquiry_base: 'D', // Date
    //   from_date: params.startDate.replace(/-/g, ''),
    //   to_date: params.endDate.replace(/-/g, ''),
    //   sort_order: 'D', // Descending
    //   tran_dtime: getCurrentDateTime()
    // })

    // 임시 거래내역 생성 (개발용)
    const mockTransactions = generateMockTransactions(params.startDate, params.endDate)

    return {
      success: true,
      transactions: mockTransactions,
      totalCount: mockTransactions.length
    }
  } catch (error) {
    console.error('Open Banking Transactions API Error:', error)
    return {
      success: false,
      message: '오픈뱅킹 거래내역 조회에 실패했습니다.'
    }
  }
}

// 임시 거래내역 생성 (개발용)
function generateMockTransactions(startDate: string, endDate: string) {
  const transactions: any[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  const transactionTypes = ['DEPOSIT', 'WITHDRAWAL']
  const counterparties = ['(주)테스트회사', '김철수', '이영희', '박민수', '정은정', '최대현']
  
  let balance = 5000000 // 초기 잔액 500만원
  
  for (let i = 0; i < Math.min(daysDiff * 2, 100); i++) {
    const transactionDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
    const amount = Math.floor(Math.random() * 1000000) + 10000 // 1만원~100만원
    
    if (transactionType === 'DEPOSIT') {
      balance += amount
    } else {
      balance = Math.max(0, balance - amount)
    }
    
    transactions.push({
      transactionDate: transactionDate.toISOString().split('T')[0],
      transactionTime: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      transactionType,
      transactionAmount: amount,
      balanceAfter: balance,
      counterpartyName: counterparties[Math.floor(Math.random() * counterparties.length)],
      counterpartyAccount: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900000) + 100000}-${Math.floor(Math.random() * 900) + 100}`,
      counterpartyBankCode: ['001', '004', '020', '081'][Math.floor(Math.random() * 4)],
      transactionMemo: ['월급', '용돈', '생활비', '사업비', '투자금', ''][Math.floor(Math.random() * 6)],
      bankTransactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 8)}`
    })
  }
  
  return transactions.sort((a, b) => 
    new Date(b.transactionDate + 'T' + b.transactionTime).getTime() - 
    new Date(a.transactionDate + 'T' + a.transactionTime).getTime()
  )
}

// 거래내역 DB 동기화
async function syncTransactionsToDatabase(accountId: string, transactions: any[]) {
  try {
    for (const transaction of transactions) {
      // 중복 거래 체크
      const existingTransaction = await query({
        where: {
          accountId,
          bankTransactionId: transaction.bankTransactionId
        }
      })

      if (!existingTransaction) {
        await query({
          data: {
            accountId,
            transactionDate: new Date(transaction.transactionDate + 'T00:00:00Z'),
            transactionTime: transaction.transactionTime,
            transactionType: transaction.transactionType,
            transactionAmount: transaction.transactionAmount,
            balanceAfter: transaction.balanceAfter,
            counterpartyName: transaction.counterpartyName,
            counterpartyAccount: transaction.counterpartyAccount,
            counterpartyBankCode: transaction.counterpartyBankCode,
            transactionMemo: transaction.transactionMemo,
            bankTransactionId: transaction.bankTransactionId,
            apiTransactionId: transaction.apiTransactionId || null
          }
        })
      }
    }
  } catch (error) {
    console.error('Transaction sync error:', error)
    // 동기화 실패는 전체 프로세스를 중단하지 않음
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