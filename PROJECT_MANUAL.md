# 📚 Commerce-NextJS 프로젝트 역설계 매뉴얼
*Reverse Engineering Documentation Manual*

## 🎯 목적과 범위

이 매뉴얼은 이미 개발된 Commerce-NextJS 프로젝트를 역으로 분석하여 다음을 달성합니다:
1. **백과사전식 페이지별 문서화**: 각 페이지와 컴포넌트를 개별적으로 완전히 문서화
2. **완전한 재구성 가능성**: 문서만으로 전체 로직을 재구성할 수 있는 수준의 상세도
3. **자동화된 추출**: AST 파싱과 정적 분석을 통한 자동 문서 생성
4. **E2E 테스트 통합**: 각 기능에 대한 테스트 케이스 자동 생성

## 🏗️ 프로젝트 아키텍처

### 기술 스택
```yaml
Framework: Next.js 14 (App Router)
Language: TypeScript
Database: PostgreSQL (Local)
UI Library: shadcn/ui
Styling: Tailwind CSS
Auth: NextAuth
State: React Context
Cache: Redis
ORM: Raw SQL with pg
```

### 데이터베이스 연결 정보
```yaml
Host: localhost
Port: 5432
Database: commerce_nextjs
User: commerce
Password: password
Connection String: postgresql://commerce:password@localhost:5432/commerce_nextjs
```

## 📁 프로젝트 구조

### 주요 디렉토리
```
/app
  /admin         # 관리자 패널 (52개 페이지)
  /api           # API 라우트 (100+ 엔드포인트)
  /auth          # 인증 관련 페이지
  /products      # 상품 관련 페이지
  /categories    # 카테고리 페이지
  /(기타)        # 일반 사용자 페이지

/components      # 재사용 가능한 컴포넌트
/lib            # 유틸리티 및 헬퍼 함수
/types          # TypeScript 타입 정의
/public         # 정적 자산
```

## 📄 페이지 인벤토리

### 관리자 페이지 (Admin)
총 52개 페이지 발견

#### UI 관리 섹션
| 경로 | 파일 | 주요 기능 | 데이터베이스 테이블 |
|------|------|----------|-------------------|
| `/admin` | `page.tsx` | 대시보드 | orders, products, users |
| `/admin/ui-config` | `page.tsx` | UI 섹션 설정 | ui_sections |
| `/admin/popup-alerts` | `page.tsx` | 팝업 알림 관리 | popup_alerts |
| `/admin/language-packs` | `page.tsx` | 언어팩 관리 | language_pack_keys, language_pack_values |

#### 상품 관리 섹션
| 경로 | 파일 | 주요 기능 | 데이터베이스 테이블 |
|------|------|----------|-------------------|
| `/admin/products` | `page.tsx` | 상품 목록 | products |
| `/admin/products/create` | `page.tsx` | 상품 등록 | products, categories |
| `/admin/products/edit/[id]` | `page.tsx` | 상품 수정 | products |
| `/admin/categories` | `page.tsx` | 카테고리 관리 | categories |
| `/admin/inventory` | `page.tsx` | 재고 관리 | inventory |

#### 주문/결제 섹션
| 경로 | 파일 | 주요 기능 | 데이터베이스 테이블 |
|------|------|----------|-------------------|
| `/admin/orders` | `page.tsx` | 주문 관리 | orders, order_items |
| `/admin/payments` | `page.tsx` | 결제 내역 | payments |
| `/admin/settlements` | API only | 정산 관리 | settlements |

#### 고객 관리 섹션
| 경로 | 파일 | 주요 기능 | 데이터베이스 테이블 |
|------|------|----------|-------------------|
| `/admin/customers` | `page.tsx` | 고객 목록 | users |
| `/admin/reviews` | `page.tsx` | 리뷰 관리 | reviews |

#### 마케팅 섹션
| 경로 | 파일 | 주요 기능 | 데이터베이스 테이블 |
|------|------|----------|-------------------|
| `/admin/campaigns` | API only | 캠페인 관리 | campaigns |
| `/admin/coupons` | `page.tsx` | 쿠폰 관리 | coupons |

#### 통합 섹션
| 경로 | 파일 | 주요 기능 | 외부 시스템 |
|------|------|----------|------------|
| `/admin/ecount` | `page.tsx` | ECount ERP 연동 | ECount API |
| `/admin/open-banking` | `page.tsx` | 오픈뱅킹 연동 | 오픈뱅킹 API |
| `/admin/corporate-payments` | `page.tsx` | 법인 결제 | 결제 게이트웨이 |
| `/admin/tax-invoices` | `page.tsx` | 세금계산서 | 국세청 API |

### 사용자 페이지 (Public)
| 경로 | 파일 | 주요 기능 | 주요 변수/상수 |
|------|------|----------|---------------|
| `/` | `page.tsx` | 홈페이지 | HERO_SECTIONS, FEATURED_PRODUCTS |
| `/products` | `page.tsx` | 상품 목록 | ITEMS_PER_PAGE = 20 |
| `/products/[slug]` | `page.tsx` | 상품 상세 | product, relatedProducts |
| `/categories` | `page.tsx` | 카테고리 목록 | categories[] |
| `/categories/[slug]` | `page.tsx` | 카테고리별 상품 | categoryProducts[] |
| `/cart` | `page.tsx` | 장바구니 | cartItems[], totalPrice |
| `/checkout` | `page.tsx` | 결제 | paymentMethods[], shippingInfo |
| `/search` | `page.tsx` | 검색 | searchQuery, filters[] |

### 인증 페이지
| 경로 | 파일 | 주요 기능 | 세션 데이터 |
|------|------|----------|------------|
| `/auth/login` | `page.tsx` | 로그인 | email, password |
| `/auth/register` | `page.tsx` | 회원가입 | userData{} |
| `/auth/forgot-password` | `page.tsx` | 비밀번호 찾기 | resetToken |

## 🔌 API 엔드포인트 매핑

### 인증 API
```typescript
POST   /api/auth/login       // 로그인
POST   /api/auth/register    // 회원가입
POST   /api/auth/logout      // 로그아웃
POST   /api/auth/refresh     // 토큰 갱신
GET    /api/auth/me         // 현재 사용자 정보
```

### 상품 API
```typescript
GET    /api/products         // 상품 목록
GET    /api/products/[id]    // 상품 상세
POST   /api/admin/products   // 상품 생성 (관리자)
PUT    /api/admin/products/[id]  // 상품 수정 (관리자)
DELETE /api/admin/products/[id]  // 상품 삭제 (관리자)
```

### UI 섹션 API
```typescript
GET    /api/ui-sections      // UI 섹션 목록
PUT    /api/ui-sections/reorder  // 섹션 순서 변경
POST   /api/admin/ui-sections/hero  // 히어로 섹션 설정
POST   /api/admin/ui-sections/category  // 카테고리 섹션 설정
```

### 언어 및 번역 API
```typescript
GET    /api/languages/available  // 사용 가능한 언어
POST   /api/admin/languages     // 언어 추가
POST   /api/admin/translations  // 번역 추가/수정
POST   /api/admin/translate/google  // Google 번역 API 호출
```

## 💾 데이터베이스 스키마

### 핵심 테이블 구조

#### users 테이블
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### products 테이블
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category_id INTEGER REFERENCES categories(id),
  stock_quantity INTEGER DEFAULT 0,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### categories 테이블
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  parent_id INTEGER REFERENCES categories(id),
  icon VARCHAR(50),  -- 주의: image_url이 아닌 icon
  level INTEGER,     -- 주의: menu_order가 아닌 level
  deleted_at TIMESTAMP  -- 소프트 삭제용
);
```

#### orders 테이블
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 주요 하드코딩된 값들

### 환경 변수 (`.env.local`)
```bash
DATABASE_URL="postgresql://commerce:password@localhost:5432/commerce_nextjs"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret"
```

### 상수 및 설정값
```typescript
// 페이지네이션
export const ITEMS_PER_PAGE = 20;
export const MAX_PAGE_BUTTONS = 5;

// 이미지 업로드
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// 세션 설정
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7일

// API 레이트 리미트
export const API_RATE_LIMIT = 100; // 요청/분
export const API_BURST_LIMIT = 20; // 순간 최대 요청
```

### 하드코딩된 UI 텍스트
```typescript
// 관리자 사이드바 메뉴
const sidebarItems = [
  { title: '메인', items: [...] },
  { title: 'UI 관리', items: [...] },
  { title: '상품 관리', items: [...] },
  { title: '주문 관리', items: [...] },
  { title: '고객 관리', items: [...] },
  { title: '마케팅', items: [...] },
  { title: '설정', items: [...] }
];

// 에러 메시지
const ERROR_MESSAGES = {
  AUTH_FAILED: '인증에 실패했습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  VALIDATION_ERROR: '입력값을 확인해주세요.'
};
```

## 🧩 컴포넌트 의존성 맵

### 레이아웃 계층 구조
```
RootLayout (app/layout.tsx)
  ├── Providers (여러 Context Providers)
  │   ├── SessionProvider (NextAuth)
  │   ├── ThemeProvider (next-themes)
  │   └── SidebarProvider (shadcn/ui)
  ├── AdminLayout (app/admin/layout.tsx)
  │   ├── Sidebar (navigation)
  │   ├── SidebarInset (main content)
  │   └── Toaster (notifications)
  └── PublicLayout (implicit)
      ├── Header
      ├── Main Content
      └── Footer
```

## 🔄 자동화 계획

### 1단계: AST 파싱 시스템
```typescript
// 파일별 자동 분석 대상
- imports/exports 추출
- 함수 시그니처 분석
- 상태 변수 추출
- API 호출 패턴 감지
- 데이터베이스 쿼리 추출
```

### 2단계: 의존성 그래프 생성
```typescript
// 자동으로 생성할 관계도
- 컴포넌트 → 컴포넌트
- 페이지 → API
- API → 데이터베이스
- 컴포넌트 → 유틸리티
```

### 3단계: E2E 테스트 생성
```typescript
// 각 페이지별 자동 생성 테스트
- 페이지 로드 테스트
- 사용자 인터랙션 시뮬레이션
- API 응답 검증
- 에러 케이스 처리
```

## 📊 추출 메트릭스

### 현재 프로젝트 규모
- **총 페이지 수**: 52개 (관리자) + 15개 (공개)
- **API 엔드포인트**: 100+ 개
- **데이터베이스 테이블**: 15+ 개
- **컴포넌트 수**: 추정 200+ 개
- **유틸리티 함수**: 추정 50+ 개

## 🎯 다음 단계

1. **자동 추출 스크립트 개발**
   - TypeScript AST 파서 구현
   - 정규식 기반 패턴 매칭
   - GraphQL 스키마 추출

2. **문서 템플릿 생성**
   - 페이지별 문서 템플릿
   - API 엔드포인트 문서 템플릿
   - 컴포넌트 문서 템플릿

3. **E2E 테스트 프레임워크 설정**
   - Playwright 설정
   - 테스트 시나리오 자동 생성
   - CI/CD 통합

4. **지속적 업데이트 시스템**
   - 파일 변경 감지
   - 문서 자동 업데이트
   - 버전 관리 통합

---

*이 문서는 Commerce-NextJS 프로젝트의 역설계 매뉴얼 초안입니다.*
*자동화 시스템 구축 후 지속적으로 업데이트될 예정입니다.*