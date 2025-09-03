# 세금계산서 발행 및 법인 입금확인 시스템 개발 명세서

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [세금계산서 발행 시스템](#세금계산서-발행-시스템)
3. [법인 입금확인 시스템](#법인-입금확인-시스템)
4. [오픈뱅킹 API 통합](#오픈뱅킹-api-통합)
5. [기술 스택](#기술-스택)
6. [보안 요구사항](#보안-요구사항)
7. [개발 로드맵](#개발-로드맵)

---

## 시스템 개요

### 목적
- 전자세금계산서 자동 발행 및 관리
- 법인 거래 입금 실시간 확인
- 오픈뱅킹 API를 통한 금융 거래 자동화

### 주요 기능
- B2B 전자세금계산서 발행/수정/취소
- 법인 계좌 입금 실시간 모니터링
- 거래 내역 자동 매칭 및 검증
- 세무 신고용 데이터 자동 생성

---

## 세금계산서 발행 시스템

### 1. 전자세금계산서 발행 프로세스

#### 1.1 발행 요청 단계
```
주문 완료 → 결제 확인 → 세금계산서 정보 수집 → 발행 요청 → 국세청 전송
```

#### 1.2 필수 정보
- **공급자 정보**
  - 사업자등록번호
  - 상호명
  - 대표자명
  - 사업장 주소
  - 업태/종목
  - 담당자 정보

- **공급받는자 정보**
  - 사업자등록번호
  - 상호명
  - 대표자명
  - 사업장 주소
  - 업태/종목
  - 담당자 이메일

- **거래 정보**
  - 작성일자
  - 공급가액
  - 세액
  - 품목명
  - 규격/수량/단가

### 2. API 연동 사양

#### 2.1 국세청 전자세금계산서 API
```typescript
interface TaxInvoiceAPI {
  // 발행
  issueTaxInvoice(data: TaxInvoiceData): Promise<TaxInvoiceResponse>
  
  // 수정
  modifyTaxInvoice(invoiceId: string, data: ModificationData): Promise<Response>
  
  // 취소
  cancelTaxInvoice(invoiceId: string, reason: string): Promise<Response>
  
  // 조회
  getTaxInvoice(invoiceId: string): Promise<TaxInvoiceDetail>
  
  // 상태 확인
  checkStatus(invoiceId: string): Promise<InvoiceStatus>
}
```

#### 2.2 세금계산서 발행 서비스 제공업체
- **Popbill (팝빌)**
  - REST API 제공
  - 실시간 발행 상태 확인
  - 대량 발행 지원

- **Bill36524**
  - SOAP/REST API 지원
  - 세무 대리 서비스 연계

- **더존 SmartBill**
  - ERP 연동 특화
  - 자동 장부 기장

### 3. 데이터베이스 스키마

#### 3.1 tax_invoices 테이블
```sql
CREATE TABLE tax_invoices (
  id UUID PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  
  -- 공급자 정보
  supplier_business_no VARCHAR(20) NOT NULL,
  supplier_company_name VARCHAR(100) NOT NULL,
  supplier_ceo_name VARCHAR(50) NOT NULL,
  supplier_address TEXT NOT NULL,
  
  -- 공급받는자 정보
  buyer_business_no VARCHAR(20) NOT NULL,
  buyer_company_name VARCHAR(100) NOT NULL,
  buyer_ceo_name VARCHAR(50) NOT NULL,
  buyer_address TEXT NOT NULL,
  buyer_email VARCHAR(100),
  
  -- 금액 정보
  supply_amount DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  
  -- 상태 관리
  status VARCHAR(20) NOT NULL, -- DRAFT, ISSUED, MODIFIED, CANCELLED
  issue_date TIMESTAMP NOT NULL,
  nts_send_date TIMESTAMP, -- 국세청 전송일
  nts_result_code VARCHAR(10),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.2 tax_invoice_items 테이블
```sql
CREATE TABLE tax_invoice_items (
  id UUID PRIMARY KEY,
  tax_invoice_id UUID REFERENCES tax_invoices(id),
  item_date DATE NOT NULL,
  item_name VARCHAR(200) NOT NULL,
  specification VARCHAR(100),
  quantity DECIMAL(10,2),
  unit_price DECIMAL(15,2),
  supply_amount DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2),
  remark TEXT
);
```

---

## 법인 입금확인 시스템

### 1. 입금 확인 프로세스

#### 1.1 자동 매칭 플로우
```
입금 발생 → 계좌 조회 → 입금자명 분석 → 주문 매칭 → 입금 확인 처리
```

#### 1.2 매칭 알고리즘
- **1차 매칭**: 입금액 + 입금자명
- **2차 매칭**: 입금액 + 사업자번호
- **3차 매칭**: 가상계좌번호
- **수동 매칭**: 미매칭 건 관리자 확인

### 2. 입금 데이터 구조

#### 2.1 corporate_payments 테이블
```sql
CREATE TABLE corporate_payments (
  id UUID PRIMARY KEY,
  bank_code VARCHAR(10) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  transaction_date TIMESTAMP NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- DEPOSIT, WITHDRAWAL
  
  -- 입금 정보
  depositor_name VARCHAR(100),
  depositor_account VARCHAR(50),
  amount DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2),
  
  -- 매칭 정보
  matched_order_id UUID REFERENCES orders(id),
  matching_status VARCHAR(20), -- AUTO_MATCHED, MANUAL_MATCHED, UNMATCHED
  matching_score DECIMAL(3,2), -- 매칭 신뢰도 (0-1)
  
  -- 메타 정보
  transaction_memo TEXT,
  bank_transaction_id VARCHAR(100) UNIQUE,
  raw_data JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);
```

### 3. 입금 확인 서비스

#### 3.1 실시간 입금 알림
```typescript
interface PaymentNotificationService {
  // 웹훅 수신
  handleWebhook(data: BankWebhookData): Promise<void>
  
  // 입금 확인
  confirmPayment(paymentId: string): Promise<ConfirmationResult>
  
  // 자동 매칭
  autoMatch(payment: Payment): Promise<MatchResult>
  
  // 수동 매칭
  manualMatch(paymentId: string, orderId: string): Promise<void>
}
```

---

## 오픈뱅킹 API 통합

### 1. 금융결제원 오픈뱅킹 API

#### 1.1 인증 프로세스
```
사용자 인증 요청 → OAuth 2.0 인증 → Access Token 발급 → API 호출
```

#### 1.2 주요 API 엔드포인트
- **계좌 조회**
  - `/account/list` - 등록계좌 조회
  - `/account/balance` - 잔액조회
  - `/account/transaction_list` - 거래내역조회

- **이체 서비스**
  - `/transfer/withdraw` - 출금이체
  - `/transfer/deposit` - 입금이체
  - `/transfer/result` - 이체결과조회

### 2. 오픈뱅킹 서비스 구현

#### 2.1 OpenBankingService
```typescript
interface OpenBankingService {
  // 인증
  authenticate(userId: string): Promise<AuthToken>
  refreshToken(refreshToken: string): Promise<AuthToken>
  
  // 계좌 관리
  getAccountList(userId: string): Promise<Account[]>
  getAccountBalance(accountId: string): Promise<Balance>
  getTransactionHistory(
    accountId: string, 
    fromDate: Date, 
    toDate: Date
  ): Promise<Transaction[]>
  
  // 이체
  transfer(transferData: TransferRequest): Promise<TransferResult>
  
  // 입금 확인
  checkDeposit(accountId: string, amount: number): Promise<Deposit[]>
}
```

#### 2.2 보안 토큰 관리
```typescript
interface TokenManager {
  store(userId: string, token: AuthToken): Promise<void>
  retrieve(userId: string): Promise<AuthToken>
  refresh(userId: string): Promise<AuthToken>
  revoke(userId: string): Promise<void>
}
```

### 3. 데이터베이스 스키마

#### 3.1 bank_accounts 테이블
```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  -- 계좌 정보
  bank_code VARCHAR(10) NOT NULL,
  bank_name VARCHAR(50) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_holder_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(20), -- CORPORATE, INDIVIDUAL
  
  -- 오픈뱅킹 정보
  fintech_use_num VARCHAR(50) UNIQUE,
  inquiry_agree_yn CHAR(1),
  inquiry_agree_dtime TIMESTAMP,
  transfer_agree_yn CHAR(1),
  transfer_agree_dtime TIMESTAMP,
  
  -- 상태
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.2 bank_transactions 테이블
```sql
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES bank_accounts(id),
  
  -- 거래 정보
  transaction_date TIMESTAMP NOT NULL,
  transaction_time TIME NOT NULL,
  transaction_type VARCHAR(20), -- DEPOSIT, WITHDRAWAL
  transaction_amount DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2),
  
  -- 거래 상세
  counterparty_name VARCHAR(100),
  counterparty_account VARCHAR(50),
  counterparty_bank_code VARCHAR(10),
  
  -- 메타 정보
  transaction_memo TEXT,
  bank_transaction_id VARCHAR(100) UNIQUE,
  api_transaction_id VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 기술 스택

### Backend
- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5+
- **Queue**: Bull/BullMQ (Redis)
- **Cache**: Redis

### 외부 API
- **세금계산서**: Popbill API
- **오픈뱅킹**: 금융결제원 오픈뱅킹 API
- **인증**: OAuth 2.0

### 모니터링
- **APM**: Sentry
- **Logging**: Winston + ELK Stack
- **Metrics**: Prometheus + Grafana

---

## 보안 요구사항

### 1. 데이터 보안
- **암호화**
  - 사업자번호, 계좌번호: AES-256 암호화
  - API 토큰: 별도 보안 저장소
  - 통신: TLS 1.3

### 2. 접근 제어
- **권한 관리**
  - Role-based Access Control (RBAC)
  - 세금계산서 발행: 승인자 2단계 인증
  - 입금 확인: 재무팀 전용 권한

### 3. 감사 로그
- 모든 금융 거래 로깅
- 세금계산서 발행/수정/취소 이력
- 접근 로그 90일 보관

### 4. 컴플라이언스
- 전자금융거래법 준수
- 개인정보보호법 준수
- 전자세금계산서 관련 법규 준수

---

## 개발 로드맵

### Phase 1: 기초 설정 (2주)
- [ ] 데이터베이스 스키마 설계
- [ ] API 인증 설정
- [ ] 기본 CRUD 구현

### Phase 2: 세금계산서 시스템 (3주)
- [ ] Popbill API 연동
- [ ] 세금계산서 발행 로직
- [ ] 발행 이력 관리
- [ ] 관리자 UI

### Phase 3: 오픈뱅킹 통합 (3주)
- [ ] 오픈뱅킹 API 연동
- [ ] OAuth 2.0 인증 구현
- [ ] 계좌 조회/거래내역 조회
- [ ] 토큰 관리 시스템

### Phase 4: 입금 확인 시스템 (2주)
- [ ] 실시간 입금 알림 (Webhook)
- [ ] 자동 매칭 알고리즘
- [ ] 수동 매칭 UI
- [ ] 입금 확인 프로세스

### Phase 5: 통합 및 테스트 (2주)
- [ ] 시스템 통합 테스트
- [ ] 보안 취약점 점검
- [ ] 성능 최적화
- [ ] 운영 문서화

### Phase 6: 배포 및 모니터링 (1주)
- [ ] 프로덕션 환경 설정
- [ ] 모니터링 시스템 구축
- [ ] 백업/복구 전략
- [ ] 운영 교육

---

## 주의사항

### 법적 요구사항
- 세금계산서 발행 시 공인인증서 필수
- 국세청 전송 의무 (발행일로부터 익일까지)
- 5년간 보관 의무

### 운영 고려사항
- 월말/분기말 대량 발행 대비
- 장애 시 수동 발행 프로세스
- 세무 조정 시 일괄 수정 기능

### 성능 요구사항
- 세금계산서 발행: < 3초
- 입금 확인: 실시간 (< 1초)
- 계좌 조회: < 2초
- 동시 처리: 100건/분

---

## 참고 자료

### API 문서
- [Popbill API 문서](https://docs.popbill.com)
- [금융결제원 오픈뱅킹 API](https://www.open-platform.or.kr)
- [국세청 전자세금계산서 가이드](https://www.nts.go.kr)

### 관련 법규
- 부가가치세법
- 전자금융거래법
- 전자문서 및 전자거래 기본법