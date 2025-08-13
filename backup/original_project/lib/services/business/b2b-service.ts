/**
 * B2B/B2C 비즈니스 모드 관리 서비스
 * 사업자 인증, 세금계산서, 가격 그룹 관리
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

export interface BusinessRegistrationCheck {
  businessNumber: string  // 사업자등록번호
  representative: string  // 대표자명
  openDate?: string      // 개업일자
}

export interface TaxInvoiceRequest {
  businessAccountId: string
  orderId: string
  type: 'TAX_INVOICE' | 'CASH_RECEIPT'
  email?: string
}

export interface PriceGroupAssignment {
  businessAccountId: string
  priceGroupId: string
}

/**
 * B2B 비즈니스 서비스
 */
export class B2BService {
  private static instance: B2BService

  static getInstance(): B2BService {
    if (!B2BService.instance) {
      B2BService.instance = new B2BService()
    }
    return B2BService.instance
  }

  /**
   * 사업자등록번호 확인 (국세청 API)
   */
  async verifyBusinessRegistration(data: BusinessRegistrationCheck): Promise<{
    valid: boolean
    status: string
    message: string
    details?: any
  }> {
    try {
      // 국세청 진위확인 API 호출
      // 실제 구현 시 공공데이터포털 API 키 필요
      const response = await axios.post(
        'https://api.odcloud.kr/api/nts-businessman/v1/validate',
        {
          businesses: [{
            b_no: data.businessNumber.replace(/-/g, ''),
            start_dt: data.openDate?.replace(/-/g, ''),
            p_nm: data.representative
          }]
        },
        {
          headers: {
            Authorization: `Infuser ${process.env.BUSINESS_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const result = response.data.data[0]
      
      if (result.valid === '01') {
        return {
          valid: true,
          status: 'ACTIVE',
          message: '정상 사업자입니다.',
          details: {
            businessNumber: result.b_no,
            status: result.b_stt_nm,
            taxType: result.tax_type_nm
          }
        }
      } else {
        return {
          valid: false,
          status: result.valid,
          message: this.getBusinessStatusMessage(result.valid),
          details: result
        }
      }
    } catch (error) {
      console.error('Business verification error:', error)
      
      // 개발 환경에서는 테스트용 로직
      if (process.env.NODE_ENV === 'development') {
        // 테스트용 사업자번호
        const testNumbers = ['1234567890', '0987654321']
        if (testNumbers.includes(data.businessNumber.replace(/-/g, ''))) {
          return {
            valid: true,
            status: 'ACTIVE',
            message: '(개발) 테스트 사업자번호입니다.',
            details: { test: true }
          }
        }
      }

      throw new Error('사업자등록번호 확인 중 오류가 발생했습니다.')
    }
  }

  /**
   * 사업자 계정 생성
   */
  async createBusinessAccount(userId: string, data: {
    businessNumber: string
    companyName: string
    representative: string
    businessType: string
    businessCategory: string
    businessAddress: string
    taxInvoiceEmail: string
  }): Promise<any> {
    // 사업자번호 중복 확인
    const existing = await prisma.businessAccount.findUnique({
      where: { businessNumber: data.businessNumber }
    })

    if (existing) {
      throw new Error('이미 등록된 사업자번호입니다.')
    }

    // 사업자등록번호 확인
    const verification = await this.verifyBusinessRegistration({
      businessNumber: data.businessNumber,
      representative: data.representative
    })

    if (!verification.valid) {
      throw new Error(`사업자등록번호 확인 실패: ${verification.message}`)
    }

    // 사업자 계정 생성
    const businessAccount = await prisma.businessAccount.create({
      data: {
        userId,
        ...data,
        verified: true,
        verifiedAt: new Date(),
        tier: 'BRONZE',
        status: 'APPROVED',
        creditLimit: 0,
        paymentTerms: 30,
        discountRate: 0
      }
    })

    // 기본 가격 그룹 할당 (B2B 기본 그룹)
    const defaultB2BGroup = await prisma.priceGroup.findFirst({
      where: { name: 'B2B_DEFAULT' }
    })

    if (defaultB2BGroup) {
      await prisma.priceGroupMember.create({
        data: {
          businessAccountId: businessAccount.id,
          priceGroupId: defaultB2BGroup.id
        }
      })
    }

    return businessAccount
  }

  /**
   * 세금계산서 발행
   */
  async issueTaxInvoice(request: TaxInvoiceRequest): Promise<any> {
    const order = await prisma.order.findUnique({
      where: { id: request.orderId },
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    if (!order) {
      throw new Error('주문을 찾을 수 없습니다.')
    }

    // 세금계산서 번호 생성 (YYYYMMDD-XXXXX 형식)
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const count = await prisma.taxInvoice.count({
      where: {
        invoiceNumber: { startsWith: dateStr }
      }
    })
    const invoiceNumber = `${dateStr}-${String(count + 1).padStart(5, '0')}`

    // 세금 계산 (VAT 10%)
    const amount = order.total
    const tax = amount * 0.1
    const totalAmount = amount + tax

    // 세금계산서 생성
    const taxInvoice = await prisma.taxInvoice.create({
      data: {
        invoiceNumber,
        orderId: request.orderId,
        supplierBusinessNo: '123-45-67890', // 임시 값
        supplierCompanyName: '(주)한국쇼핑몰',
        supplierCeoName: '홍길동',
        supplierAddress: '서울특별시 강남구',
        buyerBusinessNo: '000-00-00000',
        buyerCompanyName: '구매처',
        buyerCeoName: '대표자',
        buyerAddress: '주소',
        status: 'DRAFT',
        supplyAmount: amount,
        taxAmount: tax,
        totalAmount: totalAmount,
        issueDate: new Date()
      }
    })

    // 전자세금계산서 발행 (실제 구현 시 전자세금계산서 ASP 연동)
    if (request.type === 'TAX_INVOICE') {
      await this.sendElectronicTaxInvoice(taxInvoice, null, request.email)
    }

    // 발행 완료 처리
    await prisma.taxInvoice.update({
      where: { id: taxInvoice.id },
      data: {
        status: 'ISSUED',
        issueDate: new Date()
      }
    })

    return taxInvoice
  }

  /**
   * 전자세금계산서 발행 (외부 서비스 연동)
   */
  private async sendElectronicTaxInvoice(
    invoice: any,
    businessAccount: any,
    email?: string
  ): Promise<void> {
    // 실제 구현 시 더존, 이지페이, 빌36524 등 전자세금계산서 ASP 연동
    // 여기서는 이메일 발송으로 대체
    
    const recipientEmail = email || businessAccount.taxInvoiceEmail
    
    // 이메일 발송 로직
    console.log(`Sending tax invoice ${invoice.invoiceNumber} to ${recipientEmail}`)
    
    // TODO: 실제 이메일 발송 구현
  }

  /**
   * B2B 가격 조회 (가격 그룹 적용)
   */
  async getB2BPrice(productId: string, businessAccountId: string): Promise<{
    originalPrice: number
    b2bPrice: number
    discount: number
    discountType: string
  }> {
    // 상품 원가 조회
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      throw new Error('상품을 찾을 수 없습니다.')
    }

    // 사업자 계정의 가격 그룹 조회
    const priceGroups = await prisma.priceGroupMember.findMany({
      where: { businessAccountId },
      include: {
        priceGroup: {
          include: {
            rules: {
              where: {
                AND: [
                  {
                    OR: [
                      { productId },
                      { productId: null },
                      { categoryId: product.categoryId }
                    ]
                  },
                  { isActive: true },
                  { startDate: { lte: new Date() } },
                  {
                    OR: [
                      { endDate: null },
                      { endDate: { gte: new Date() } }
                    ]
                  }
                ]
              },
              orderBy: { priority: 'desc' }
            }
          }
        }
      }
    })

    let finalPrice = product.price
    let appliedDiscount = 0
    let discountType = 'NONE'

    // 가장 높은 우선순위의 가격 규칙 적용
    for (const membership of priceGroups) {
      const rules = membership.priceGroup.rules
      if (rules.length > 0) {
        const rule = rules[0] // 가장 높은 우선순위

        switch (rule.type) {
          case 'PERCENTAGE_DISCOUNT':
            appliedDiscount = product.price * (Number(rule.value) / 100)
            finalPrice = product.price - appliedDiscount
            discountType = `${Number(rule.value)}% 할인`
            break
          
          case 'FIXED_DISCOUNT':
            appliedDiscount = Number(rule.value)
            finalPrice = product.price - Number(rule.value)
            discountType = `${Number(rule.value)}원 할인`
            break
          
          case 'FIXED_PRICE':
            appliedDiscount = product.price - Number(rule.value)
            finalPrice = Number(rule.value)
            discountType = '고정가'
            break
        }
        break // 첫 번째 규칙만 적용
      }
    }

    // 사업자 계정 기본 할인율 적용 (추가 할인)
    const businessAccount = await prisma.businessAccount.findUnique({
      where: { id: businessAccountId }
    })

    if (businessAccount && Number(businessAccount.discountRate) > 0) {
      const additionalDiscount = finalPrice * (Number(businessAccount.discountRate) / 100)
      finalPrice -= additionalDiscount
      appliedDiscount += additionalDiscount
      discountType += ` + ${Number(businessAccount.discountRate)}% 추가 할인`
    }

    return {
      originalPrice: product.price,
      b2bPrice: Math.round(finalPrice),
      discount: Math.round(appliedDiscount),
      discountType
    }
  }

  /**
   * 대량 구매 견적 요청
   */
  async createBulkOrderRequest(
    businessAccountId: string,
    items: Array<{ productId: string; quantity: number }>
  ): Promise<any> {
    const bulkOrder = await prisma.bulkOrder.create({
      data: {
        businessAccountId,
        status: 'DRAFT',
        requestedDate: new Date(),
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    // 예상 금액 계산
    let estimatedAmount = 0
    for (const item of bulkOrder.items) {
      const b2bPrice = await this.getB2BPrice(item.productId, businessAccountId)
      estimatedAmount += b2bPrice.b2bPrice * item.quantity
    }

    // 예상 금액 업데이트
    await prisma.bulkOrder.update({
      where: { id: bulkOrder.id },
      data: { estimatedAmount }
    })

    return { ...bulkOrder, estimatedAmount }
  }

  /**
   * 비즈니스 모드 전환 (시스템 전체)
   */
  async switchBusinessMode(mode: 'B2C' | 'B2B' | 'HYBRID'): Promise<void> {
    await prisma.systemConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        businessMode: mode,
        features: {
          b2bEnabled: mode === 'B2B' || mode === 'HYBRID',
          b2cEnabled: mode === 'B2C' || mode === 'HYBRID',
          taxInvoice: mode === 'B2B' || mode === 'HYBRID',
          bulkOrder: mode === 'B2B' || mode === 'HYBRID',
          creditPayment: mode === 'B2B'
        }
      },
      update: {
        businessMode: mode,
        features: {
          b2bEnabled: mode === 'B2B' || mode === 'HYBRID',
          b2cEnabled: mode === 'B2C' || mode === 'HYBRID',
          taxInvoice: mode === 'B2B' || mode === 'HYBRID',
          bulkOrder: mode === 'B2B' || mode === 'HYBRID',
          creditPayment: mode === 'B2B'
        }
      }
    })
  }

  /**
   * 현재 비즈니스 모드 조회
   */
  async getCurrentBusinessMode(): Promise<{
    mode: string
    features: any
  }> {
    const config = await prisma.systemConfig.findUnique({
      where: { id: 'default' }
    })

    return {
      mode: config?.businessMode || 'B2C',
      features: config?.features || {
        b2bEnabled: false,
        b2cEnabled: true,
        taxInvoice: false,
        bulkOrder: false,
        creditPayment: false
      }
    }
  }

  /**
   * 사업자 상태 메시지 변환
   */
  private getBusinessStatusMessage(code: string): string {
    const messages: Record<string, string> = {
      '01': '정상 사업자',
      '02': '휴업 사업자',
      '03': '폐업 사업자',
      '04': '사업자등록번호 오류',
      '05': '조회 실패'
    }
    return messages[code] || '알 수 없는 상태'
  }
}

// 싱글톤 인스턴스 export
export const b2bService = B2BService.getInstance()