/**
 * 이카운트 ERP API 통합 서비스
 * @see https://sboapi.ecount.com/ECERP/OAPI/OAPIView?lan_type=ko-KR
 */

export interface EcountConfig {
  serverUrl: string
  loginId: string
  password: string
  companyId: string
  apiKey?: string
}

export interface EcountApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  message?: string
}

export interface EcountCustomer {
  customerCode: string
  customerName: string
  businessNumber?: string
  representative?: string
  address?: string
  phone?: string
  email?: string
  customerType: 'COMPANY' | 'INDIVIDUAL'
  isActive: boolean
  memo?: string
}

export interface EcountItem {
  itemCode: string
  itemName: string
  itemType: string
  unit: string
  salePrice: number
  purchasePrice: number
  stockQuantity: number
  barcode?: string
  specification?: string
  isActive: boolean
  category?: string
}

export interface EcountSalesOrder {
  orderNumber: string
  customerCode: string
  orderDate: string
  deliveryDate?: string
  items: EcountSalesOrderItem[]
  totalAmount: number
  taxAmount: number
  memo?: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
}

export interface EcountSalesOrderItem {
  itemCode: string
  quantity: number
  unitPrice: number
  amount: number
  memo?: string
}

export interface EcountInventory {
  itemCode: string
  warehouseCode?: string
  currentStock: number
  inStock: number
  outStock: number
  safetyStock?: number
  lastUpdated: string
}

export interface EcountAccount {
  accountCode: string
  accountName: string
  accountType: string
  level: number
  parentCode?: string
  isActive: boolean
}

export interface EcountJournalEntry {
  entryNumber?: string
  entryDate: string
  description: string
  items: EcountJournalItem[]
  totalDebit: number
  totalCredit: number
}

export interface EcountJournalItem {
  accountCode: string
  debitAmount?: number
  creditAmount?: number
  description?: string
  customerCode?: string
  itemCode?: string
}

export class EcountApiService {
  private config: EcountConfig
  private baseUrl: string

  constructor(config: EcountConfig) {
    this.config = config
    this.baseUrl = config.serverUrl || 'https://sboapi.ecount.com'
  }

  /**
   * API 호출을 위한 기본 요청 메서드
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
    data?: any
  ): Promise<EcountApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }

      const requestData = {
        login_id: this.config.loginId,
        login_pw: this.config.password,
        company_id: this.config.companyId,
        ...data
      }

      const response = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' ? JSON.stringify(requestData) : undefined
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      // 이카운트 API 응답 형태에 따라 조정 필요
      if (result.error || result.Error) {
        return {
          success: false,
          error: result.error || result.Error,
          code: result.code || result.Code,
          message: result.message || result.Message
        }
      }

      return {
        success: true,
        data: result.data || result
      }
    } catch (error) {

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ===== 고객 관리 =====

  /**
   * 고객 목록 조회
   */
  async getCustomers(params?: {
    customerCode?: string
    customerName?: string
    isActive?: boolean
  }): Promise<EcountApiResponse<EcountCustomer[]>> {
    return this.makeRequest('/api/customers', 'GET', params)
  }

  /**
   * 고객 등록
   */
  async createCustomer(customer: Omit<EcountCustomer, 'customerCode'>): Promise<EcountApiResponse<EcountCustomer>> {
    return this.makeRequest('/api/customers', 'POST', {
      customer_name: customer.customerName,
      business_number: customer.businessNumber,
      representative: customer.representative,
      address: customer.address,
      phone: customer.phone,
      email: customer.email,
      customer_type: customer.customerType,
      is_active: customer.isActive,
      memo: customer.memo
    })
  }

  /**
   * 고객 정보 수정
   */
  async updateCustomer(customerCode: string, customer: Partial<EcountCustomer>): Promise<EcountApiResponse<EcountCustomer>> {
    return this.makeRequest(`/api/customers/${customerCode}`, 'PUT', {
      customer_code: customerCode,
      ...customer
    })
  }

  // ===== 상품 관리 =====

  /**
   * 상품 목록 조회
   */
  async getItems(params?: {
    itemCode?: string
    itemName?: string
    category?: string
    isActive?: boolean
  }): Promise<EcountApiResponse<EcountItem[]>> {
    return this.makeRequest('/api/items', 'GET', params)
  }

  /**
   * 상품 등록
   */
  async createItem(item: Omit<EcountItem, 'itemCode'>): Promise<EcountApiResponse<EcountItem>> {
    return this.makeRequest('/api/items', 'POST', {
      item_name: item.itemName,
      item_type: item.itemType,
      unit: item.unit,
      sale_price: item.salePrice,
      purchase_price: item.purchasePrice,
      stock_quantity: item.stockQuantity,
      barcode: item.barcode,
      specification: item.specification,
      is_active: item.isActive,
      category: item.category
    })
  }

  /**
   * 상품 정보 수정
   */
  async updateItem(itemCode: string, item: Partial<EcountItem>): Promise<EcountApiResponse<EcountItem>> {
    return this.makeRequest(`/api/items/${itemCode}`, 'PUT', {
      item_code: itemCode,
      ...item
    })
  }

  // ===== 판매 주문 관리 =====

  /**
   * 판매 주문 등록
   */
  async createSalesOrder(order: Omit<EcountSalesOrder, 'orderNumber'>): Promise<EcountApiResponse<EcountSalesOrder>> {
    return this.makeRequest('/api/sales/orders', 'POST', {
      customer_code: order.customerCode,
      order_date: order.orderDate,
      delivery_date: order.deliveryDate,
      items: order.items.map(item => ({
        item_code: item.itemCode,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        amount: item.amount,
        memo: item.memo
      })),
      total_amount: order.totalAmount,
      tax_amount: order.taxAmount,
      memo: order.memo,
      status: order.status
    })
  }

  /**
   * 판매 주문 목록 조회
   */
  async getSalesOrders(params?: {
    customerCode?: string
    startDate?: string
    endDate?: string
    status?: string
  }): Promise<EcountApiResponse<EcountSalesOrder[]>> {
    return this.makeRequest('/api/sales/orders', 'GET', params)
  }

  /**
   * 판매 주문 상태 업데이트
   */
  async updateSalesOrderStatus(
    orderNumber: string, 
    status: EcountSalesOrder['status']
  ): Promise<EcountApiResponse<EcountSalesOrder>> {
    return this.makeRequest(`/api/sales/orders/${orderNumber}/status`, 'PUT', {
      order_number: orderNumber,
      status
    })
  }

  // ===== 재고 관리 =====

  /**
   * 재고 현황 조회
   */
  async getInventory(params?: {
    itemCode?: string
    warehouseCode?: string
  }): Promise<EcountApiResponse<EcountInventory[]>> {
    return this.makeRequest('/api/inventory', 'GET', params)
  }

  /**
   * 재고 입고
   */
  async stockIn(data: {
    itemCode: string
    warehouseCode?: string
    quantity: number
    unitPrice?: number
    memo?: string
  }): Promise<EcountApiResponse<any>> {
    return this.makeRequest('/api/inventory/in', 'POST', {
      item_code: data.itemCode,
      warehouse_code: data.warehouseCode,
      quantity: data.quantity,
      unit_price: data.unitPrice,
      memo: data.memo
    })
  }

  /**
   * 재고 출고
   */
  async stockOut(data: {
    itemCode: string
    warehouseCode?: string
    quantity: number
    memo?: string
  }): Promise<EcountApiResponse<any>> {
    return this.makeRequest('/api/inventory/out', 'POST', {
      item_code: data.itemCode,
      warehouse_code: data.warehouseCode,
      quantity: data.quantity,
      memo: data.memo
    })
  }

  // ===== 회계 관리 =====

  /**
   * 계정과목 조회
   */
  async getAccounts(params?: {
    accountType?: string
    isActive?: boolean
  }): Promise<EcountApiResponse<EcountAccount[]>> {
    return this.makeRequest('/api/accounts', 'GET', params)
  }

  /**
   * 분개 입력
   */
  async createJournalEntry(entry: Omit<EcountJournalEntry, 'entryNumber'>): Promise<EcountApiResponse<EcountJournalEntry>> {
    return this.makeRequest('/api/journal/entries', 'POST', {
      entry_date: entry.entryDate,
      description: entry.description,
      items: entry.items.map(item => ({
        account_code: item.accountCode,
        debit_amount: item.debitAmount,
        credit_amount: item.creditAmount,
        description: item.description,
        customer_code: item.customerCode,
        item_code: item.itemCode
      })),
      total_debit: entry.totalDebit,
      total_credit: entry.totalCredit
    })
  }

  // ===== 통합 동기화 메서드 =====

  /**
   * 주문 데이터를 이카운트로 동기화
   */
  async syncOrderToEcount(orderData: {
    orderNumber: string
    customerName: string
    customerEmail?: string
    customerPhone?: string
    items: Array<{
      name: string
      quantity: number
      price: number
      sku?: string
    }>
    totalAmount: number
    orderDate: Date
  }): Promise<EcountApiResponse<any>> {
    try {
      // 1. 고객 등록/확인
      let customerCode = `CUST_${orderData.orderNumber}`
      const customerResult = await this.createCustomer({
        customerName: orderData.customerName,
        email: orderData.customerEmail,
        phone: orderData.customerPhone,
        customerType: 'INDIVIDUAL',
        isActive: true
      })

      if (customerResult.success && customerResult.data) {
        customerCode = customerResult.data.customerCode
      }

      // 2. 상품 등록/확인
      const orderItems: EcountSalesOrderItem[] = []
      for (const item of orderData.items) {
        const itemCode = item.sku || `ITEM_${item.name.replace(/\s+/g, '_')}`
        
        // 상품이 없으면 등록
        await this.createItem({
          itemName: item.name,
          itemType: 'PRODUCT',
          unit: 'EA',
          salePrice: item.price,
          purchasePrice: item.price * 0.8, // 임시 원가
          stockQuantity: 1000, // 임시 재고
          isActive: true
        })

        orderItems.push({
          itemCode,
          quantity: item.quantity,
          unitPrice: item.price,
          amount: item.quantity * item.price
        })
      }

      // 3. 판매 주문 생성
      const salesOrderResult = await this.createSalesOrder({
        customerCode,
        orderDate: orderData.orderDate.toISOString().split('T')[0],
        items: orderItems,
        totalAmount: orderData.totalAmount,
        taxAmount: Math.round(orderData.totalAmount * 0.1), // 부가세 10%
        memo: `주문번호: ${orderData.orderNumber}`,
        status: 'CONFIRMED'
      })

      return salesOrderResult
    } catch (error) {

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 재고를 이카운트에서 조회하여 로컬과 동기화
   */
  async syncInventoryFromEcount(): Promise<EcountApiResponse<EcountInventory[]>> {
    return this.getInventory()
  }

  /**
   * API 연결 테스트
   */
  async testConnection(): Promise<EcountApiResponse<any>> {
    try {
      const result = await this.getAccounts()
      return {
        success: result.success,
        data: { message: '이카운트 API 연결 성공', accountCount: result.data?.length || 0 },
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        error: '이카운트 API 연결 실패'
      }
    }
  }
}

// 기본 설정 팩토리 함수
export function createEcountService(config: EcountConfig): EcountApiService {
  return new EcountApiService(config)
}

// 환경 변수에서 설정을 로드하는 헬퍼 함수
export function createEcountServiceFromEnv(): EcountApiService {
  const config: EcountConfig = {
    serverUrl: process.env.ECOUNT_SERVER_URL || 'https://sboapi.ecount.com',
    loginId: process.env.ECOUNT_LOGIN_ID || '',
    password: process.env.ECOUNT_PASSWORD || '',
    companyId: process.env.ECOUNT_COMPANY_ID || '',
    apiKey: process.env.ECOUNT_API_KEY
  }

  if (!config.loginId || !config.password || !config.companyId) {
    throw new Error('이카운트 API 설정이 누락되었습니다. 환경 변수를 확인해주세요.')
  }

  return new EcountApiService(config)
}