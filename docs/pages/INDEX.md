# 📚 Commerce-NextJS 페이지 백과사전 인덱스
*모든 페이지의 완전한 역설계 문서 목록*

## 📊 프로젝트 현황
- **총 페이지 수**: 67개 (파일 발견)
- **문서화 완료**: 8개
- **진행 중**: 59개
- **문서 생성일**: 2025-09-04
- **최종 업데이트**: 2025-09-04

## 🗂️ 페이지 문서 구조

각 페이지 문서는 다음 섹션을 포함합니다:
1. **페이지 메타데이터**: 경로, 크기, 렌더링 모드
2. **Import 의존성**: 모든 import 문 분석
3. **State 변수**: useState, useEffect 등 모든 상태
4. **하드코딩된 값**: 문자열, 숫자, URL 등
5. **CSS 클래스**: Tailwind 클래스 목록
6. **함수 목록**: 모든 함수 시그니처와 로직
7. **JSX 구조**: 컴포넌트 트리
8. **데이터 흐름**: 시퀀스 다이어그램
9. **API 호출**: 엔드포인트와 페이로드
10. **특이사항**: 주의점과 개선 가능 항목

## 📖 완료된 페이지 문서

### 🏠 공개 페이지 (Public Pages)

| 번호 | 페이지 | 파일 경로 | 문서 링크 | 주요 기능 |
|------|--------|----------|-----------|----------|
| 01 | 홈페이지 | `/app/page.tsx` | [01-home-page.md](./01-home-page.md) | ISR, 캐시 프리페치, 다국어 |
| 05 | 상품 목록 | `/app/products/page.tsx` | [05-products-listing.md](./05-products-listing.md) | 필터링, 정렬, 페이지네이션 |
| 06 | 장바구니 | `/app/cart/page.tsx` | [06-cart.md](./06-cart.md) | 수량 조절, 삭제, 결제 이동 |
| 07 | 결제 | `/app/checkout/page.tsx` | [07-checkout.md](./07-checkout.md) | 배송 정보, 현금 결제, Daum 우편번호 |
| 08 | 상품 상세 | `/app/products/[slug]/page.tsx` | [08-product-detail.md](./08-product-detail.md) | RSC, 관련 상품, SSG 지원 |

### 🔐 인증 페이지 (Auth Pages)

| 번호 | 페이지 | 파일 경로 | 문서 링크 | 주요 기능 |
|------|--------|----------|-----------|----------|
| 03 | 로그인 | `/app/auth/login/page.tsx` | [03-auth-login.md](./03-auth-login.md) | 인증, 소셜 로그인, 역할별 리다이렉트 |
| 04 | 회원가입 | `/app/auth/register/page.tsx` | [04-auth-register.md](./04-auth-register.md) | 약관 동의, 입력 검증, 소셜 가입 |

### 🔧 관리자 페이지 (Admin Pages)

| 번호 | 페이지 | 파일 경로 | 문서 링크 | 주요 기능 |
|------|--------|----------|-----------|----------|
| 02 | 대시보드 | `/app/admin/page.tsx` | [02-admin-dashboard.md](./02-admin-dashboard.md) | 통계, 최근 주문, 인기 상품 |

### 📝 샘플 상세 문서

| 페이지 | 파일 경로 | 문서 링크 | 특징 |
|--------|----------|-----------|------|
| 상품 관리 | `/app/admin/products/page.tsx` | [admin-products-encyclopedia.md](./admin-products-encyclopedia.md) | 가장 상세한 백과사전식 문서 예제 |

## 🗂️ 미문서화 페이지 목록 (작업 예정)

### 인증 관련 (Auth)
- [x] `/app/auth/register/page.tsx` - 회원가입 ✅
- [ ] `/app/auth/forgot-password/page.tsx` - 비밀번호 찾기

### 상품 관련 (Products)
- [x] `/app/products/page.tsx` - 상품 목록 ✅
- [x] `/app/products/[slug]/page.tsx` - 상품 상세 ✅
- [ ] `/app/admin/products/create/page.tsx` - 상품 등록
- [ ] `/app/admin/products/edit/[id]/page.tsx` - 상품 수정

### 카테고리 (Categories)
- [ ] `/app/categories/page.tsx` - 카테고리 목록
- [ ] `/app/categories/[slug]/page.tsx` - 카테고리별 상품
- [ ] `/app/admin/categories/page.tsx` - 카테고리 관리

### 주문/결제 (Orders & Checkout)
- [x] `/app/cart/page.tsx` - 장바구니 ✅
- [x] `/app/checkout/page.tsx` - 결제 ✅
- [ ] `/app/admin/orders/page.tsx` - 주문 관리
- [ ] `/app/admin/payments/page.tsx` - 결제 관리

### UI 구성 관리 (UI Config)
- [ ] `/app/admin/ui-config/page.tsx` - UI 섹션 설정
- [ ] `/app/admin/ui-config/sections/[id]/page.tsx` - 섹션 상세
- [ ] `/app/admin/ui-config/sections/hero/page.tsx` - 히어로 섹션
- [ ] `/app/admin/ui-config/sections/category/page.tsx` - 카테고리 섹션
- [ ] `/app/admin/ui-config/sections/new/page.tsx` - 신상품 섹션
- [ ] `/app/admin/ui-config/sections/recommended/page.tsx` - 추천 상품
- [ ] `/app/admin/ui-config/sections/ranking/page.tsx` - 랭킹
- [ ] `/app/admin/ui-config/sections/promo/page.tsx` - 프로모션
- [ ] `/app/admin/ui-config/sections/quicklinks/page.tsx` - 퀵링크
- [ ] `/app/admin/ui-config/sections/product-grid/page.tsx` - 상품 그리드

### 고객 관리 (Customers)
- [ ] `/app/admin/customers/page.tsx` - 고객 목록
- [ ] `/app/admin/reviews/page.tsx` - 리뷰 관리
- [ ] `/app/reviews/page.tsx` - 리뷰 목록

### 마케팅 (Marketing)
- [ ] `/app/admin/coupons/page.tsx` - 쿠폰 관리
- [ ] `/app/admin/popup-alerts/page.tsx` - 팝업 알림

### 언어 관리 (Language)
- [ ] `/app/admin/language-packs/page.tsx` - 언어팩 관리

### 통합 (Integrations)
- [ ] `/app/admin/ecount/page.tsx` - ECount ERP 연동
- [ ] `/app/admin/open-banking/page.tsx` - 오픈뱅킹
- [ ] `/app/admin/corporate-payments/page.tsx` - 법인 결제
- [ ] `/app/admin/tax-invoices/page.tsx` - 세금계산서

### 설정 (Settings)
- [ ] `/app/admin/settings/page.tsx` - 일반 설정
- [ ] `/app/admin/notifications/page.tsx` - 알림 설정
- [ ] `/app/admin/inventory/page.tsx` - 재고 관리

### 기타 페이지 (Others)
- [ ] `/app/search/page.tsx` - 검색
- [ ] `/app/mypage/page.tsx` - 마이페이지
- [ ] `/app/support/page.tsx` - 고객지원
- [ ] `/app/faq/page.tsx` - FAQ
- [ ] `/app/inquiry/page.tsx` - 문의
- [ ] `/app/community/page.tsx` - 커뮤니티
- [ ] `/app/events/page.tsx` - 이벤트
- [ ] `/app/plugstory/page.tsx` - 플러그스토리

### 실험/테스트 (Experimental)
- [ ] `/app/home-v2/page.tsx` - 홈페이지 v2
- [ ] `/app/page-improved.tsx` - 개선된 페이지

## 📈 문서화 진행 통계

```
총 페이지: 67개
├── 완료: 8개 (11.9%)
├── 진행중: 0개 (0%)
└── 대기: 59개 (88.1%)

카테고리별 현황:
├── Public Pages: 5/15 완료
├── Admin Pages: 1/37 완료
├── Auth Pages: 2/3 완료
├── UI Config: 0/10 완료
└── API Routes: 0/100+ (별도 문서화 필요)

최근 완료:
├── 05-products-listing.md - 상품 목록 페이지
├── 06-cart.md - 장바구니 페이지
├── 07-checkout.md - 결제 페이지
└── 08-product-detail.md - 상품 상세 페이지
```

## 🔄 중복 패턴 발견 (전체 프로젝트)

### 공통 Import 패턴
```typescript
// 대부분의 페이지에서 사용
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

### 공통 State 패턴
```typescript
const [loading, setLoading] = useState(true)
const [searchQuery, setSearchQuery] = useState('')
const [data, setData] = useState([])
```

### 공통 함수 패턴
```typescript
// 가격 포맷팅 (여러 페이지에서 중복)
const formatPrice = (price) => `₩${price.toLocaleString()}`

// 상태 색상 (여러 페이지에서 중복)
const getStatusColor = (status) => { /* ... */ }
```

### 공통 CSS 클래스
```css
space-y-6
grid gap-4 md:grid-cols-2 lg:grid-cols-4
text-sm font-medium
bg-white dark:bg-gray-900
```

## 🎯 다음 단계

1. **남은 페이지 문서화 완료** (64개)
2. **API 엔드포인트 문서 생성** (100+ 개)
3. **컴포넌트 라이브러리 문서화**
4. **중복 코드 제거 및 최적화 제안서 작성**
5. **E2E 테스트 시나리오 자동 생성**

## 📝 문서 작성 가이드

각 페이지 문서는 최소 다음 정보를 포함해야 합니다:

1. **모든 import 문** (사용/미사용 구분)
2. **모든 변수명과 타입**
3. **모든 함수 시그니처**
4. **모든 하드코딩된 값**
5. **모든 CSS 클래스**
6. **완전한 JSX 구조**
7. **API 호출 상세**
8. **조건부 렌더링 로직**

이 정보들을 통해 코드 없이도 전체 애플리케이션을 재구성할 수 있어야 합니다.

---

*이 인덱스는 Commerce-NextJS 프로젝트의 모든 페이지 문서를 관리합니다.*
*각 문서는 해당 페이지의 완전한 역설계 정보를 담고 있습니다.*