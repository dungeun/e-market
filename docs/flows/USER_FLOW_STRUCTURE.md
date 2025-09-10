# 👤 사용자 플로우 구조 문서
*E-Market Korea - 중고 상품 커머스 플랫폼*

## 📊 사용자 플로우 개요
```yaml
대상 사용자: 해외 노동자
특화 기능: 중고 상품 거래
언어 지원: 한국어, 영어, 일본어
거래 방식: 직거래 중심, 현금 결제
플랫폼: Web 기반 (반응형 디자인)
```

## 🔄 주요 사용자 여정

### 1. 신규 사용자 온보딩

#### 1-1. 첫 방문 및 회원가입
```mermaid
graph TD
    A[홈페이지 방문] → B[언어 선택]
    B → C[회원가입 클릭]
    C → D[회원가입 폼 작성]
    D → E[약관 동의]
    E → F[이메일 인증]
    F → G[가입 완료]
    G → H[로그인 페이지]
```

**페이지 경로**: `/` → `/auth/register` → `/auth/login`

**핵심 데이터 수집**:
- 이름, 이메일, 전화번호
- 거주 지역 (한국 내)
- 선호 언어 설정

**검증 단계**:
1. 이메일 중복 확인
2. 필수 약관 동의 (이용약관, 개인정보보호)
3. 선택 약관 (마케팅 수신 동의)

#### 1-2. 언어 및 지역 설정
```typescript
// lib/utils/language.ts
function detectLanguage(request: NextRequest): SupportedLanguage {
  // 1. URL 파라미터 (?lang=ko)
  // 2. Accept-Language 헤더
  // 3. Cookie (language=ko)
  // 4. 기본값: 'ko'
}
```

**언어 매핑**:
- `ko`: 한국어 (기본)
- `en`: 영어 (해외 노동자)
- `jp`: 일본어 (일본인 노동자)

### 2. 상품 탐색 및 검색

#### 2-1. 메인 페이지 탐색
```mermaid
graph TD
    A[홈페이지] → B[카테고리 탐색]
    A → C[추천 상품 확인]
    A → D[신상품 확인]
    A → E[검색 기능 사용]
    
    B → F[카테고리별 상품 목록]
    C → G[상품 상세페이지]
    D → G
    E → H[검색 결과 페이지]
```

**메인 페이지 섹션**:
1. **Hero Section**: 메인 배너
2. **Featured Products**: 추천 상품 (8개)
3. **New Arrivals**: 신상품 (8개)
4. **Categories**: 카테고리 그리드

**상품 필터링 옵션**:
- 가격 범위
- 상품 상태 (S/A/B/C 등급)
- 거래 방식 (직거래/배송)
- 지역별 필터링

#### 2-2. 상품 검색 플로우
```typescript
// 검색 파라미터 구조
interface SearchParams {
  q?: string;        // 검색어
  category?: string; // 카테고리
  condition?: 'S'|'A'|'B'|'C'; // 상품 상태
  minPrice?: number;
  maxPrice?: number;
  location?: string; // 판매자 지역
  direct?: boolean;  // 직거래 가능
  delivery?: boolean; // 배송 가능
}
```

### 3. 상품 상세 및 구매

#### 3-1. 상품 상세페이지 플로우
```mermaid
graph TD
    A[상품 목록] → B[상품 클릭]
    B → C[상품 상세페이지]
    C → D[이미지 갤러리 확인]
    C → E[상품 정보 확인]
    C → F[판매자 정보 확인]
    C → G[리뷰 확인]
    
    E → H[장바구니 담기]
    E → I[바로 구매]
    F → J[판매자 연락]
    
    H → K[장바구니 페이지]
    I → L[결제 페이지]
```

**상품 정보 구조**:
```typescript
interface ProductDetail {
  // 기본 정보
  name: string;
  description: string;
  price: number;
  images: string[];
  
  // 중고 상품 특화
  condition: 'S'|'A'|'B'|'C';
  usagePeriod: string;
  purchaseDate: string;
  defects: string;
  
  // 판매자 정보
  sellerName: string;
  sellerPhone: string;
  sellerLocation: string;
  verifiedSeller: boolean;
  
  // 거래 옵션
  negotiable: boolean;
  directTrade: boolean;
  deliveryAvailable: boolean;
  warrantyInfo: string;
}
```

#### 3-2. 구매 결정 지원 정보
- **상태 등급 가이드**:
  - `S`: 미사용 신품급
  - `A`: 사용감 거의 없음  
  - `B`: 일반 사용감
  - `C`: 사용감 많음

- **판매자 신뢰도**:
  - 인증 판매자 배지
  - 거래 후기 점수
  - 응답률 및 응답 시간

### 4. 장바구니 및 결제

#### 4-1. 장바구니 관리
```mermaid
graph TD
    A[상품 상세] → B[장바구니 담기]
    B → C[장바구니 페이지]
    C → D[수량 조정]
    C → E[상품 삭제]
    C → F[계속 쇼핑]
    C → G[결제하기]
    
    F → H[상품 목록]
    G → I[결제 페이지]
```

**장바구니 기능**:
- 수량 변경 (직거래 상품은 수량 제한)
- 선택 삭제 / 전체 삭제
- 상품별 배송비 계산
- 총 주문 금액 실시간 계산

#### 4-2. 결제 프로세스
```mermaid
graph TD
    A[결제 페이지] → B[배송지 입력]
    B → C[결제 방법 선택]
    C → D[주문 확인]
    D → E[결제 실행]
    E → F[주문 완료]
    F → G[판매자 연락]
```

**결제 시스템 특징**:
- **현금 결제 중심**: 직거래 시 현금 거래
- **주소 입력**: Daum 우편번호 API 사용
- **연락처 정보**: 구매자-판매자 직접 연락
- **주문 추적**: 간단한 주문 상태 관리

### 5. 사용자 계정 관리

#### 5-1. 마이페이지 기능
```mermaid
graph TD
    A[마이페이지] → B[주문 내역]
    A → C[찜한 상품]
    A → D[판매 상품 관리]
    A → E[리뷰 관리]
    A → F[계정 설정]
    
    B → G[주문 상세]
    C → H[재주문/삭제]
    D → I[상품 등록/수정]
    E → J[리뷰 작성/수정]
    F → K[프로필 수정]
```

#### 5-2. 인증 시스템
```typescript
// hooks/useAuth.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  verified: boolean;
  createdAt: string;
}
```

**권한 관리**:
- `USER`: 일반 사용자 (구매/판매)
- `ADMIN`: 관리자 (상품/사용자 관리)
- `SUPER_ADMIN`: 최고 관리자 (시스템 설정)

### 6. 판매자 플로우

#### 6-1. 상품 등록 과정
```mermaid
graph TD
    A[판매하기 클릭] → B[로그인 확인]
    B → C[상품 정보 입력]
    C → D[이미지 업로드]
    D → E[가격 설정]
    E → F[상태/조건 입력]
    F → G[거래 옵션 설정]
    G → H[등록 완료]
    H → I[승인 대기]
    I → J[판매 시작]
```

**상품 등록 필수 정보**:
1. **기본 정보**: 제목, 설명, 카테고리
2. **가격 정보**: 판매가, 협상 가능 여부
3. **상태 정보**: 등급, 사용 기간, 구매일, 하자 사항
4. **이미지**: 최소 1장, 최대 10장
5. **거래 조건**: 직거래/배송, 지역, 연락처

#### 6-2. 판매 관리
```typescript
interface SellerDashboard {
  activeListings: Product[];
  soldItems: Product[];
  inquiries: Message[];
  revenue: {
    thisMonth: number;
    lastMonth: number;
    total: number;
  };
  stats: {
    totalViews: number;
    inquiryRate: number;
    responseRate: number;
  };
}
```

### 7. 고객 서비스 플로우

#### 7-1. 문의 및 지원
```mermaid
graph TD
    A[문의 필요] → B[FAQ 확인]
    B → C[문제 해결됨?]
    C →|Yes| D[종료]
    C →|No| E[1:1 문의]
    E → F[문의 유형 선택]
    F → G[문의 내용 작성]
    G → H[문의 접수]
    H → I[답변 대기]
    I → J[답변 확인]
```

**문의 카테고리**:
- 계정 관련
- 주문/결제 문의
- 상품 관련 문의
- 기술적 문제
- 신고 및 분쟁

#### 7-2. 리뷰 시스템
```typescript
interface ReviewSystem {
  productReview: {
    rating: 1 | 2 | 3 | 4 | 5;
    title: string;
    comment: string;
    images?: string[];
    verified: boolean; // 구매 확인된 리뷰
  };
  sellerReview: {
    communication: number;
    itemCondition: number;
    shippingSpeed: number;
    overall: number;
  };
}
```

## 📱 반응형 사용자 경험

### 모바일 최적화 플로우
```yaml
모바일_우선_설계:
  - 터치 친화적 UI
  - 간소화된 네비게이션
  - 스와이프 제스처 지원
  - 모바일 결제 최적화

주요_모바일_기능:
  - 원터치 전화 연결
  - GPS 기반 지역 설정
  - 카메라 연동 상품 촬영
  - 푸시 알림 (브라우저)
```

### 접근성 및 다국어
- **접근성**: WCAG 2.1 AA 준수
- **언어 전환**: 실시간 언어 변경
- **문화적 적응**: 지역별 UI 패턴

## 🔄 상태 관리 및 세션

### 사용자 세션 관리
```typescript
// 로컬 스토리지 구조
interface SessionData {
  user: UserProfile;
  cart: CartItem[];
  language: 'ko' | 'en' | 'jp';
  location: string;
  preferences: {
    currency: 'KRW';
    notifications: boolean;
    darkMode: boolean;
  };
}
```

### 상태 지속성
- **로그인 상태**: JWT 토큰 + 리프레시
- **장바구니**: 로컬 스토리지 + 서버 동기화
- **언어 설정**: 쿠키 + URL 파라미터
- **검색 히스토리**: 세션 스토리지

## 📊 사용자 행동 추적

### 핵심 이벤트
```typescript
interface UserEvents {
  // 전환 이벤트
  signup_completed: UserSignupEvent;
  product_purchased: PurchaseEvent;
  product_listed: ListingEvent;
  
  // 참여 이벤트
  product_viewed: ProductViewEvent;
  search_performed: SearchEvent;
  category_browsed: CategoryEvent;
  
  // 상호작용 이벤트
  cart_added: CartEvent;
  seller_contacted: ContactEvent;
  review_written: ReviewEvent;
}
```

### 개인화 알고리즘
- **추천 상품**: 카테고리 선호도 + 가격대
- **지역 우선**: 사용자 위치 기반 상품 노출
- **언어 최적화**: 다국어 콘텐츠 개인화

## 🚨 예외 처리 및 에러 플로우

### 일반적인 에러 시나리오
1. **네트워크 오류**: 재시도 + 오프라인 모드
2. **인증 만료**: 자동 로그아웃 + 재로그인 유도
3. **권한 부족**: 적절한 안내 메시지
4. **결제 실패**: 대안 결제 수단 제시
5. **재고 없음**: 알림 신청 옵션

### 사용자 지원 플로우
```mermaid
graph TD
    A[오류 발생] → B[에러 타입 분류]
    B → C[자동 복구 가능?]
    C →|Yes| D[자동 복구 시도]
    C →|No| E[사용자 안내]
    E → F[대안 제시]
    F → G[고객센터 연결]
    
    D → H[복구 성공?]
    H →|Yes| I[정상 진행]
    H →|No| E
```

## 📈 성능 최적화 전략

### 사용자 경험 최적화
- **첫 페이지 로딩**: < 3초 (3G 네트워크)
- **페이지 전환**: < 1초 (SPA 라우팅)
- **이미지 최적화**: WebP + 지연 로딩
- **캐시 전략**: 5분 메모리 + 30분 Redis

### 프리로딩 전략
```typescript
// lib/cache/preload-service.ts
interface PreloadStrategy {
  homepage: {
    products: 'featured' | 'new' | 'recommended';
    categories: 'top_level';
    language_packs: 'essential';
    ui_texts: 'static';
  };
  category_pages: {
    products: 'paginated';
    filters: 'dynamic';
  };
}
```

---

*이 문서는 E-Market Korea 프로젝트의 완전한 사용자 플로우 시스템 매뉴얼입니다.*