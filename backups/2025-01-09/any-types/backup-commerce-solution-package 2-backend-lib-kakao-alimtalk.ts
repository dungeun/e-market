import axios from 'axios'

const ALIMTALK_API_URL = 'https://alimtalk-api.bizmsg.kr/v2/sender'

interface AlimtalkMessage {
  to: string // 수신자 전화번호
  templateCode: string // 템플릿 코드
  variables?: Record<string, string> // 템플릿 변수
}

interface AlimtalkResponse {
  success: boolean
  messageId?: string
  error?: string
}

export class KakaoAlimtalkService {
  private apiKey: string
  private senderKey: string
  private plusFriendId: string

  constructor() {
    this.apiKey = process.env.KAKAO_ALIMTALK_API_KEY!
    this.senderKey = process.env.KAKAO_ALIMTALK_SENDER_KEY!
    this.plusFriendId = process.env.KAKAO_ALIMTALK_PLUS_FRIEND_ID!
  }

  // 알림톡 발송
  async send(message: AlimtalkMessage): Promise<AlimtalkResponse> {
    try {
      const payload = {
        apiKey: this.apiKey,
        senderKey: this.senderKey,
        plusFriendId: this.plusFriendId,
        templateCode: message.templateCode,
        to: message.to.replace(/-/g, ''), // 하이픈 제거
        variables: message.variables || {},
      }

      const response = await axios.post(`${ALIMTALK_API_URL}/send`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return {
        success: response.data.success,
        messageId: response.data.messageId,
      }
    } catch (error: any) {

      return {
        success: false,
        error: error.response?.data?.message || '알림톡 발송 중 오류가 발생했습니다.',
      }
    }
  }

  // 주문 확인 알림톡
  async sendOrderConfirmation(
    phoneNumber: string,
    orderNumber: string,
    productName: string,
    totalAmount: number
  ) {
    return this.send({
      to: phoneNumber,
      templateCode: 'ORDER_CONFIRM_001', // 사전 등록된 템플릿 코드
      variables: {
        orderNumber,
        productName,
        totalAmount: totalAmount.toLocaleString() + '원',
        orderDate: new Date().toLocaleDateString('ko-KR'),
      },
    })
  }

  // 배송 시작 알림톡
  async sendShippingNotification(
    phoneNumber: string,
    orderNumber: string,
    trackingNumber: string,
    carrier: string
  ) {
    return this.send({
      to: phoneNumber,
      templateCode: 'SHIPPING_START_001',
      variables: {
        orderNumber,
        trackingNumber,
        carrier,
        estimatedDelivery: this.getEstimatedDeliveryDate(),
      },
    })
  }

  // 결제 완료 알림톡
  async sendPaymentComplete(
    phoneNumber: string,
    orderNumber: string,
    paymentAmount: number,
    paymentMethod: string
  ) {
    return this.send({
      to: phoneNumber,
      templateCode: 'PAYMENT_COMPLETE_001',
      variables: {
        orderNumber,
        paymentAmount: paymentAmount.toLocaleString() + '원',
        paymentMethod,
        paymentDate: new Date().toLocaleDateString('ko-KR'),
      },
    })
  }

  // 회원가입 환영 알림톡
  async sendWelcome(phoneNumber: string, userName: string) {
    return this.send({
      to: phoneNumber,
      templateCode: 'WELCOME_001',
      variables: {
        userName,
        welcomeCoupon: '10% 할인쿠폰',
        validUntil: this.getValidUntilDate(30), // 30일 후
      },
    })
  }

  // 장바구니 알림톡
  async sendCartReminder(
    phoneNumber: string,
    userName: string,
    productName: string,
    cartUrl: string
  ) {
    return this.send({
      to: phoneNumber,
      templateCode: 'CART_REMINDER_001',
      variables: {
        userName,
        productName,
        cartUrl,
      },
    })
  }

  // 비밀번호 재설정 알림톡
  async sendPasswordReset(
    phoneNumber: string,
    resetCode: string,
    expiryMinutes: number = 10
  ) {
    return this.send({
      to: phoneNumber,
      templateCode: 'PASSWORD_RESET_001',
      variables: {
        resetCode,
        expiryMinutes: expiryMinutes.toString(),
      },
    })
  }

  // 헬퍼 함수: 예상 배송일 계산
  private getEstimatedDeliveryDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 3) // 3일 후
    return date.toLocaleDateString('ko-KR')
  }

  // 헬퍼 함수: 유효기간 계산
  private getValidUntilDate(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toLocaleDateString('ko-KR')
  }

  // 대량 발송 (최대 1000건)
  async sendBulk(messages: AlimtalkMessage[]): Promise<AlimtalkResponse[]> {
    const results: AlimtalkResponse[] = []
    
    // 배치 처리 (100건씩)
    const batchSize = 100
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(message => this.send(message))
      )
      results.push(...batchResults)
    }
    
    return results
  }
}

export const kakaoAlimtalk = new KakaoAlimtalkService()

// 템플릿 코드 상수 (관리 편의성)
export const ALIMTALK_TEMPLATES = {
  ORDER_CONFIRM: 'ORDER_CONFIRM_001',
  SHIPPING_START: 'SHIPPING_START_001',
  PAYMENT_COMPLETE: 'PAYMENT_COMPLETE_001',
  WELCOME: 'WELCOME_001',
  CART_REMINDER: 'CART_REMINDER_001',
  PASSWORD_RESET: 'PASSWORD_RESET_001',
  DELIVERY_COMPLETE: 'DELIVERY_COMPLETE_001',
  REVIEW_REQUEST: 'REVIEW_REQUEST_001',
  COUPON_EXPIRE: 'COUPON_EXPIRE_001',
  POINT_EXPIRE: 'POINT_EXPIRE_001',
} as const