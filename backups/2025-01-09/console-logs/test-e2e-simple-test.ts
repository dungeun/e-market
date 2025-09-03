import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

// API 기본 URL - 서버가 3003 포트에서 실행 중
const API_URL = 'http://localhost:3003'

// 테스트용 사용자 정보
const testUser = {
  id: 'test-user-' + uuidv4(),
  email: 'test@example.com',
  name: '테스트 사용자'
}

// 헤더 설정
const headers = {
  'Content-Type': 'application/json',
  'x-session-id': 'test-session-' + uuidv4()
}

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

// 로그 헬퍼
function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

// REST API 호출
async function restAPI(method: string, endpoint: string, data?: any) {
  try {
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers
    })
    return response.data
  } catch (error: any) {
    console.error(`REST API 에러 (${endpoint}):`, error.response?.data || error.message)
    throw error
  }
}

// 간단한 E2E 테스트
async function runSimpleE2ETest() {
  log('\n🚀 간단한 E2E 헤드리스 커머스 테스트 시작\n', colors.cyan)
  
  let testResults = {
    passed: 0,
    failed: 0
  }
  
  try {
    // 1. 헬스 체크
    log('1️⃣  헬스 체크 테스트', colors.blue)
    try {
      const health = await restAPI('GET', '/api/health')
      if (health) {
        log(`  ✅ 서버 상태: 정상`, colors.green)
        testResults.passed++
      }
    } catch (error) {
      log(`  ❌ 헬스 체크 실패`, colors.red)
      testResults.failed++
    }
    
    // 2. 장바구니 테스트 (세션 기반)
    log('\n2️⃣  장바구니 관리 테스트', colors.blue)
    try {
      // 테스트용 제품 ID (실제 DB에 있어야 함)
      const testProductId = 'test-product-1'
      
      const cartResponse = await restAPI('POST', '/api/cart', {
        sessionId: headers['x-session-id'],
        productId: testProductId,
        quantity: 2
      })
      
      if (cartResponse.success) {
        log(`  ✅ 장바구니 생성/추가 성공`, colors.green)
        if (cartResponse.cart?.id) {
          log(`  🛒 장바구니 ID: ${cartResponse.cart.id}`, colors.reset)
        }
        testResults.passed++
      } else {
        log(`  ⚠️  장바구니 응답: ${JSON.stringify(cartResponse)}`, colors.yellow)
        testResults.failed++
      }
    } catch (error: any) {
      // 제품이 없거나 DB 문제일 수 있음
      log(`  ⚠️  장바구니 테스트 실패 (DB 데이터 필요할 수 있음)`, colors.yellow)
      testResults.failed++
    }
    
    // 3. 재고 확인 테스트
    log('\n3️⃣  재고 관리 테스트', colors.blue)
    try {
      const testProductId = 'test-product-1'
      const inventoryCheck = await restAPI('GET', `/api/inventory/${testProductId}`)
      
      if (inventoryCheck.success) {
        log(`  ✅ 재고 확인 성공`, colors.green)
        testResults.passed++
      } else {
        log(`  ⚠️  재고 확인 실패`, colors.yellow)
        testResults.failed++
      }
    } catch (error) {
      log(`  ⚠️  재고 테스트 실패 (DB 데이터 필요할 수 있음)`, colors.yellow)
      testResults.failed++
    }
    
    // 4. API 엔드포인트 존재 확인
    log('\n4️⃣  API 엔드포인트 확인', colors.blue)
    const endpoints = [
      { method: 'GET', path: '/api/products', name: '제품 목록' },
      { method: 'GET', path: '/api/cart', name: '장바구니 조회' },
      { method: 'GET', path: '/api/orders', name: '주문 목록' }
    ]
    
    for (const endpoint of endpoints) {
      try {
        await restAPI(endpoint.method, endpoint.path)
        log(`  ✅ ${endpoint.name} API 존재`, colors.green)
        testResults.passed++
      } catch (error: any) {
        if (error.response?.status === 404) {
          log(`  ❌ ${endpoint.name} API 없음`, colors.red)
        } else {
          log(`  ⚠️  ${endpoint.name} API 에러 (${error.response?.status || 'unknown'})`, colors.yellow)
        }
        testResults.failed++
      }
    }
    
  } catch (error: any) {
    log(`\n❌ 테스트 중 오류 발생: ${error.message}`, colors.red)
    testResults.failed++
  }
  
  // 테스트 결과 요약
  log('\n' + '='.repeat(50), colors.cyan)
  log('📊 테스트 결과 요약', colors.cyan)
  log('='.repeat(50), colors.cyan)
  
  const totalTests = testResults.passed + testResults.failed
  const successRate = totalTests > 0 ? (testResults.passed / totalTests * 100).toFixed(1) : 0
  
  log(`\n✅ 성공: ${testResults.passed}개`, colors.green)
  log(`❌ 실패: ${testResults.failed}개`, colors.red)
  log(`📈 성공률: ${successRate}%`, colors.blue)
  
  if (testResults.failed === 0) {
    log('\n🎉 모든 E2E 테스트가 성공적으로 완료되었습니다!', colors.green)
  } else {
    log('\n⚠️  일부 테스트가 실패했습니다.', colors.yellow)
    log('💡 DB에 테스트 데이터가 필요할 수 있습니다.', colors.yellow)
  }
}

// 테스트 실행
log('🔧 간단한 테스트 실행 중...', colors.yellow)
runSimpleE2ETest().catch(error => {
  log(`\n치명적 오류: ${error.message}`, colors.red)
  process.exit(1)
})