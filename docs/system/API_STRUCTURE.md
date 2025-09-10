# 🔌 API 구조 문서
*E-Market Korea - 중고 상품 커머스 플랫폼*

## 📊 API 개요
```yaml
API 엔드포인트: 80+ 라우트
인증 방식: NextAuth.js + JWT
데이터베이스: PostgreSQL with Prisma ORM
캐싱: Redis + 메모리 캐시
API 버전: RESTful + GraphQL 하이브리드
```

## 🏗️ API 계층 구조

### 인증 API (`/api/auth/`)
```typescript
interface AuthAPI {
  // NextAuth.js 통합
  '[...nextauth]': {
    path: '/api/auth/[...nextauth]';
    methods: ['GET', 'POST'];
    providers: ['credentials', 'google', 'naver', 'kakao'];
    features: ['세션 관리', 'JWT 토큰', '리프레시 토큰'];
  };
  
  // 커스텀 인증 엔드포인트
  login: {
    path: '/api/auth/login';
    method: 'POST';
    body: { email: string; password: string; };
    response: { user: User; accessToken: string; };
  };
  
  register: {
    path: '/api/auth/register';
    method: 'POST';
    body: { name: string; email: string; password: string; };
    validation: ['이메일 중복', '비밀번호 강도'];
  };
  
  refresh: {
    path: '/api/auth/refresh';
    method: 'POST';
    features: ['토큰 갱신', '세션 연장'];
  };
  
  logout: {
    path: '/api/auth/logout';
    method: 'POST';
    features: ['세션 종료', '토큰 무효화'];
  };
  
  me: {
    path: '/api/auth/me';
    method: 'GET';
    response: { user: User; permissions: Permission[]; };
  };
}
```

### 상품 관리 API (`/api/products/`)
```typescript
interface ProductAPI {
  // 공개 상품 API
  list: {
    path: '/api/products';
    method: 'GET';
    query: {
      page?: number;
      limit?: number;
      category?: string;
      condition?: 'S'|'A'|'B'|'C';
      minPrice?: number;
      maxPrice?: number;
      location?: string;
      sort?: 'price'|'date'|'popular';
    };
    response: {
      products: Product[];
      pagination: PaginationInfo;
      filters: FilterOptions;
    };
    caching: 'Redis 5분';
  };
  
  detail: {
    path: '/api/products/[id]';
    method: 'GET';
    response: {
      product: ProductDetail;
      relatedProducts: Product[];
      seller: SellerInfo;
      reviews: Review[];
    };
    caching: 'Redis 10분';
  };
  
  // 관리자 상품 API
  adminList: {
    path: '/api/admin/products';
    method: 'GET';
    auth: 'admin';
    features: ['일괄 관리', '상태 필터', '검색'];
  };
  
  adminDetail: {
    path: '/api/admin/products/[id]';
    methods: ['GET', 'PUT', 'DELETE'];
    auth: 'admin';
    features: ['상세 정보', '수정', '삭제', '번역 관리'];
  };
  
  adminCreate: {
    path: '/api/admin/products';
    method: 'POST';
    auth: 'admin';
    body: ProductCreateInput;
    features: ['이미지 업로드', '옵션 관리', '다국어 지원'];
  };
  
  adminTranslations: {
    path: '/api/admin/products/[id]/translations';
    method: 'PUT';
    auth: 'admin';
    features: ['자동 번역', '수동 번역', '번역 상태 관리'];
  };
  
  adminTrash: {
    path: '/api/admin/products/trash';
    method: 'GET';
    auth: 'admin';
    features: ['삭제된 상품', '복원', '영구 삭제'];
  };
}
```

### 주문 관리 API (`/api/orders/`)
```typescript
interface OrderAPI {
  list: {
    path: '/api/orders';
    method: 'GET';
    auth: 'required';
    response: {
      orders: Order[];
      pagination: PaginationInfo;
    };
  };
  
  detail: {
    path: '/api/orders/[id]';
    method: 'GET';
    auth: 'required';
    response: OrderDetail;
  };
  
  complete: {
    path: '/api/orders/[id]/complete';
    method: 'POST';
    auth: 'required';
    features: ['주문 완료', '재고 차감', '알림 발송'];
  };
  
  adminList: {
    path: '/api/admin/orders';
    method: 'GET';
    auth: 'admin';
    features: ['전체 주문', '상태별 필터', '검색'];
  };
}
```

### 결제 관리 API (`/api/checkout/`)
```typescript
interface CheckoutAPI {
  process: {
    path: '/api/checkout';
    method: 'POST';
    body: {
      items: CartItem[];
      shippingAddress: Address;
      paymentMethod: string;
      couponCode?: string;
    };
    response: {
      orderId: string;
      paymentUrl?: string;
      totalAmount: number;
    };
    features: ['결제 처리', '재고 확인', '쿠폰 적용'];
  };
  
  // 관리자 결제 API
  adminPayments: {
    path: '/api/admin/payments';
    method: 'GET';
    auth: 'admin';
    features: ['결제 내역', '환불 처리', '통계'];
  };
  
  corporatePayments: {
    path: '/api/admin/corporate-payments';
    method: 'GET';
    auth: 'admin';
    features: ['법인 결제', '세금계산서', '대량 주문'];
  };
  
  openBanking: {
    path: '/api/admin/open-banking';
    method: 'GET';
    auth: 'admin';
    features: ['계좌 연동', '자동 정산', '입금 확인'];
  };
}
```

### 검색 API (`/api/search/`)
```typescript
interface SearchAPI {
  search: {
    path: '/api/search';
    method: 'GET';
    query: {
      q: string;
      category?: string;
      filters?: SearchFilters;
      page?: number;
      sort?: string;
    };
    response: {
      products: Product[];
      suggestions: string[];
      filters: SearchFilters;
      totalCount: number;
    };
    features: ['전문 검색', '자동완성', '연관 검색어'];
  };
  
  autocomplete: {
    path: '/api/search/autocomplete';
    method: 'GET';
    query: { q: string; };
    response: { suggestions: string[]; };
    caching: 'Redis 1시간';
  };
  
  popular: {
    path: '/api/search/popular';
    method: 'GET';
    response: { keywords: string[]; };
    features: ['인기 검색어', '실시간 순위'];
  };
  
  analytics: {
    path: '/api/search/analytics';
    method: 'POST';
    body: { query: string; resultCount: number; };
    features: ['검색 로그', '성과 분석'];
  };
}
```

### 추천 시스템 API (`/api/recommendations/`)
```typescript
interface RecommendationAPI {
  general: {
    path: '/api/recommendations';
    method: 'GET';
    query: { userId?: string; category?: string; };
    response: { products: Product[]; algorithm: string; };
    algorithms: ['협업 필터링', '콘텐츠 기반', '하이브리드'];
  };
  
  itemBased: {
    path: '/api/recommendations/item-based';
    method: 'GET';
    query: { productId: string; };
    response: { relatedProducts: Product[]; };
    features: ['상품 기반 추천', '유사도 계산'];
  };
}
```

### UI 관리 API (`/api/ui-sections/`)
```typescript
interface UIManagementAPI {
  sections: {
    path: '/api/ui-sections';
    method: 'GET';
    response: { sections: UISection[]; };
    caching: 'Redis 10분';
  };
  
  sectionDetail: {
    path: '/api/ui-sections/[id]';
    methods: ['GET', 'PUT'];
    response: UISection;
  };
  
  reorder: {
    path: '/api/ui-sections/reorder';
    method: 'POST';
    body: { sectionIds: string[]; };
    features: ['순서 변경', '실시간 업데이트'];
  };
  
  // 관리자 UI 섹션 API
  adminSections: {
    path: '/api/admin/ui-sections';
    methods: ['GET', 'POST', 'PUT', 'DELETE'];
    auth: 'admin';
    features: ['섹션 CRUD', '번역 관리', '미리보기'];
  };
  
  adminSectionDetail: {
    path: '/api/admin/ui-sections/[sectionId]';
    methods: ['GET', 'PUT', 'DELETE'];
    auth: 'admin';
  };
  
  // 섹션별 세부 API
  hero: {
    path: '/api/admin/ui-sections/hero';
    method: 'PUT';
    auth: 'admin';
    features: ['배너 관리', '슬라이드 설정'];
  };
  
  featuredProducts: {
    path: '/api/admin/ui-sections/featured-products';
    method: 'PUT';
    auth: 'admin';
    features: ['추천 상품 설정', '자동 갱신'];
  };
  
  categories: {
    path: '/api/admin/ui-sections/category';
    method: 'PUT';
    auth: 'admin';
    features: ['카테고리 섹션', '표시 옵션'];
  };
  
  syncVisibility: {
    path: '/api/admin/ui-sections/sync-visibility';
    method: 'POST';
    auth: 'admin';
    features: ['가시성 동기화', '일괄 적용'];
  };
  
  syncOrder: {
    path: '/api/admin/ui-sections/sync-order';
    method: 'POST';
    auth: 'admin';
    features: ['순서 동기화', '드래그앤드롭'];
  };
}
```

### 다국어 관리 API (`/api/admin/languages/`)
```typescript
interface LanguageAPI {
  languages: {
    path: '/api/admin/languages';
    methods: ['GET', 'POST'];
    auth: 'admin';
    features: ['언어 설정', '활성화/비활성화'];
  };
  
  settings: {
    path: '/api/admin/languages/settings';
    method: 'PUT';
    auth: 'admin';
    body: LanguageSettings;
  };
  
  switch: {
    path: '/api/admin/languages/switch';
    method: 'POST';
    auth: 'admin';
    features: ['언어 전환', '세션 업데이트'];
  };
  
  replace: {
    path: '/api/admin/languages/replace';
    method: 'POST';
    auth: 'admin';
    features: ['일괄 번역 교체', '텍스트 마이그레이션'];
  };
  
  // 번역 관리
  translations: {
    path: '/api/admin/translations';
    methods: ['GET', 'POST', 'PUT'];
    auth: 'admin';
    features: ['번역 CRUD', '승인 워크플로우'];
  };
  
  translationSettings: {
    path: '/api/admin/translations/settings';
    method: 'PUT';
    auth: 'admin';
    features: ['번역 설정', 'API 키 관리'];
  };
  
  autoTranslate: {
    path: '/api/admin/translations/auto';
    method: 'POST';
    auth: 'admin';
    features: ['자동 번역', 'Google Translate API'];
  };
  
  googleTranslate: {
    path: '/api/admin/translate/google';
    method: 'POST';
    auth: 'admin';
    body: { text: string; targetLang: string; };
    features: ['구글 번역', '품질 평가'];
  };
  
  // 언어팩 관리
  languagePacks: {
    path: '/api/admin/language-packs';
    methods: ['GET', 'POST', 'PUT'];
    auth: 'admin';
    features: ['언어팩 관리', '버전 관리', '배포'];
  };
  
  // 국제화 관리
  i18nContent: {
    path: '/api/admin/i18n/content';
    method: 'GET';
    auth: 'admin';
    features: ['콘텐츠 번역', '번역 상태'];
  };
  
  i18nTranslate: {
    path: '/api/admin/i18n/translate';
    method: 'POST';
    auth: 'admin';
    features: ['실시간 번역', '번역 큐'];
  };
  
  i18nSettings: {
    path: '/api/admin/i18n/settings';
    method: 'PUT';
    auth: 'admin';
    features: ['국제화 설정', '폴백 언어'];
  };
}
```

### 재고 관리 API (`/api/inventory/`)
```typescript
interface InventoryAPI {
  detail: {
    path: '/api/inventory/[id]';
    method: 'GET';
    auth: 'admin';
    response: InventoryInfo;
  };
  
  reserve: {
    path: '/api/inventory/reserve';
    method: 'POST';
    auth: 'required';
    body: { productId: string; quantity: number; };
    features: ['재고 예약', '임시 차감'];
  };
  
  realtime: {
    path: '/api/inventory/realtime';
    method: 'GET';
    auth: 'admin';
    features: ['실시간 재고', '웹소켓 연동'];
  };
}
```

### 외부 시스템 연동 API

#### 이카운트 연동 (`/api/admin/ecount/`)
```typescript
interface EcountAPI {
  connectionTest: {
    path: '/api/admin/ecount/connection-test';
    method: 'POST';
    auth: 'admin';
    features: ['연결 테스트', 'API 키 검증'];
  };
  
  customers: {
    path: '/api/admin/ecount/customers';
    method: 'GET';
    auth: 'admin';
    features: ['고객 동기화', '데이터 매핑'];
  };
  
  items: {
    path: '/api/admin/ecount/items';
    method: 'GET';
    auth: 'admin';
    features: ['상품 동기화', '가격 업데이트'];
  };
  
  orders: {
    path: '/api/admin/ecount/orders';
    method: 'GET';
    auth: 'admin';
    features: ['주문 동기화', '상태 업데이트'];
  };
  
  inventory: {
    path: '/api/admin/ecount/inventory';
    method: 'GET';
    auth: 'admin';
    features: ['재고 동기화', '실시간 업데이트'];
  };
  
  sync: {
    path: '/api/admin/ecount/sync/[type]';
    method: 'POST';
    auth: 'admin';
    features: ['선택적 동기화', '배치 처리'];
  };
}
```

### 캠페인 및 프로모션 API (`/api/campaigns/`)
```typescript
interface CampaignAPI {
  public: {
    path: '/api/campaigns';
    method: 'GET';
    response: { campaigns: Campaign[]; };
    caching: 'Redis 5분';
  };
  
  simple: {
    path: '/api/campaigns/simple';
    method: 'GET';
    response: { activeCampaigns: SimpleCampaign[]; };
    features: ['간소화된 정보', '빠른 로딩'];
  };
  
  // 관리자 캠페인 API
  adminList: {
    path: '/api/admin/campaigns';
    methods: ['GET', 'POST'];
    auth: 'admin';
    features: ['캠페인 CRUD', '상태 관리'];
  };
  
  adminDetail: {
    path: '/api/admin/campaigns/[id]';
    methods: ['GET', 'PUT', 'DELETE'];
    auth: 'admin';
  };
  
  approve: {
    path: '/api/admin/campaigns/[id]/approve';
    method: 'POST';
    auth: 'admin';
    features: ['캠페인 승인', '자동 활성화'];
  };
  
  reject: {
    path: '/api/admin/campaigns/[id]/reject';
    method: 'POST';
    auth: 'admin';
    features: ['캠페인 거부', '사유 입력'];
  };
}
```

### 홈페이지 데이터 API (`/api/home/`)
```typescript
interface HomeAPI {
  sections: {
    path: '/api/home/sections';
    method: 'GET';
    response: { sections: HomeSection[]; };
    caching: 'Redis 5분';
    features: ['섹션 데이터', '순서 관리', '가시성 제어'];
  };
  
  products: {
    path: '/api/home/products';
    method: 'GET';
    query: {
      section?: 'featured'|'new'|'recommended';
      limit?: number;
    };
    response: { products: Product[]; };
    caching: 'Redis 10분';
  };
  
  campaigns: {
    path: '/api/home/campaigns';
    method: 'GET';
    response: { campaigns: Campaign[]; };
    caching: 'Redis 15분';
  };
}
```

### 시스템 관리 API

#### 캐시 관리
```typescript
interface CacheAPI {
  invalidate: {
    path: '/api/cache/invalidate';
    method: 'POST';
    auth: 'admin';
    body: { keys?: string[]; pattern?: string; };
    features: ['선택적 캐시 무효화', '패턴 매칭'];
  };
  
  adminInvalidate: {
    path: '/api/admin/invalidate-cache';
    method: 'POST';
    auth: 'admin';
    features: ['관리자 캐시 관리', '전체 무효화'];
  };
  
  adminRegenerate: {
    path: '/api/admin/regenerate-cache';
    method: 'POST';
    auth: 'admin';
    features: ['캐시 재생성', '워밍업'];
  };
}
```

#### 설정 관리
```typescript
interface SettingsAPI {
  public: {
    path: '/api/public/settings';
    method: 'GET';
    response: { settings: PublicSettings; };
    caching: 'Redis 1시간';
  };
  
  private: {
    path: '/api/settings';
    method: 'GET';
    auth: 'required';
    response: { settings: UserSettings; };
  };
  
  uiConfig: {
    path: '/api/ui-config';
    method: 'GET';
    response: { config: UIConfig; };
    caching: 'Redis 30분';
  };
}
```

#### 디버깅 및 모니터링
```typescript
interface DebugAPI {
  env: {
    path: '/api/debug/env';
    method: 'GET';
    auth: 'admin';
    features: ['환경변수 확인', '설정 검증'];
  };
  
  gateway: {
    path: '/api/gateway';
    method: 'GET';
    features: ['API 게이트웨이', '라우팅 테스트'];
  };
  
  adminMonitoring: {
    path: '/api/admin/monitoring';
    method: 'GET';
    auth: 'admin';
    features: ['시스템 상태', '성능 메트릭'];
  };
}
```

### GraphQL API (`/api/graphql`)
```typescript
interface GraphQLAPI {
  endpoint: {
    path: '/api/graphql';
    methods: ['GET', 'POST'];
    features: ['스키마 인트로스펙션', '쿼리 최적화'];
    schema: {
      types: ['Product', 'User', 'Order', 'Category'];
      queries: ['products', 'categories', 'orders'];
      mutations: ['createProduct', 'updateProduct', 'deleteProduct'];
      subscriptions: ['productUpdated', 'orderStatusChanged'];
    };
  };
}
```

## 🛡️ API 보안 및 인증

### 인증 방식
```typescript
interface APIAuthentication {
  publicEndpoints: string[];
  
  userAuthRequired: {
    method: 'JWT Bearer Token';
    endpoints: string[];
    validation: 'middleware';
  };
  
  adminAuthRequired: {
    method: 'JWT + Role Check';
    endpoints: string[];
    roles: ['ADMIN', 'SUPER_ADMIN'];
  };
  
  rateLimit: {
    anonymous: '100/hour';
    authenticated: '1000/hour';
    admin: 'unlimited';
  };
}
```

### CORS 설정
```typescript
interface CORSConfig {
  allowedOrigins: [
    'http://localhost:3000',
    'https://e-market-korea.com'
  ];
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  allowedHeaders: ['Content-Type', 'Authorization'];
  credentials: true;
}
```

## ⚡ API 성능 최적화

### 캐싱 전략
```typescript
interface CachingStrategy {
  redis: {
    // 상품 데이터
    products: '10분';
    categories: '1시간';
    
    // UI 데이터
    homeSections: '5분';
    translations: '30분';
    
    // 사용자 세션
    sessions: '24시간';
  };
  
  memory: {
    // 자주 사용되는 설정
    appSettings: '5분';
    userPermissions: '10분';
  };
  
  edge: {
    // CDN 캐싱
    staticContent: '24시간';
    images: '7일';
  };
}
```

### 응답 최적화
- JSON 압축 (gzip)
- 필드 선택 쿼리 지원
- 페이지네이션 최적화
- 이미지 자동 최적화

### 에러 처리
```typescript
interface APIErrorHandling {
  errorFormat: {
    success: boolean;
    data?: any;
    error?: {
      code: string;
      message: string;
      details?: any;
    };
  };
  
  statusCodes: {
    200: 'Success';
    400: 'Bad Request';
    401: 'Unauthorized';
    403: 'Forbidden';
    404: 'Not Found';
    429: 'Rate Limited';
    500: 'Internal Server Error';
  };
  
  logging: {
    level: 'error' | 'warn' | 'info';
    destination: 'console' | 'file' | 'database';
  };
}
```

---

*이 문서는 E-Market Korea 프로젝트의 완전한 API 구조 매뉴얼입니다.*