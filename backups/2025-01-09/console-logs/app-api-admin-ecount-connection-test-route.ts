// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { createEcountServiceFromEnv } from '@/lib/services/ecount/ecount-api'

// POST - 이카운트 연결 테스트
export async function POST(request: NextRequest) {
  try {
    // 환경변수에서 이카운트 서비스 생성
    const ecountService = createEcountServiceFromEnv()
    
    // 연결 테스트 수행
    const result = await ecountService.testConnection()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '이카운트 API 연결 성공',
        data: result.data
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || '이카운트 API 연결 실패'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Ecount connection test error:', error)
    
    // 환경변수 누락 에러 처리
    if (error instanceof Error && error.message.includes('환경 변수')) {
      return NextResponse.json({
        success: false,
        message: '이카운트 API 설정이 누락되었습니다. 환경 변수를 확인해주세요.',
        details: error.message
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: '이카운트 연결 테스트 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET - 연결 상태 조회
export async function GET(request: NextRequest) {
  try {
    // 간단한 환경변수 체크
    const requiredEnvVars = [
      'ECOUNT_LOGIN_ID',
      'ECOUNT_PASSWORD', 
      'ECOUNT_COMPANY_ID'
    ]
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: `필수 환경변수가 누락되었습니다: ${missingVars.join(', ')}`,
        missingVariables: missingVars
      })
    }
    
    return NextResponse.json({
      success: true,
      configured: true,
      message: '이카운트 API 설정이 완료되었습니다.',
      config: {
        serverUrl: process.env.ECOUNT_SERVER_URL || 'https://sboapi.ecount.com',
        loginId: process.env.ECOUNT_LOGIN_ID ? '설정됨' : '미설정',
        companyId: process.env.ECOUNT_COMPANY_ID || '미설정',
        apiKey: process.env.ECOUNT_API_KEY ? '설정됨' : '미설정'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      configured: false,
      message: '설정 확인 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}