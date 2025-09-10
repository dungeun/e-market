# 📖 페이지 백과사전: /cart (장바구니 페이지)
*파일: /app/cart/page.tsx*

## 🎯 페이지 메타데이터
```yaml
파일경로: /app/cart/page.tsx
페이지경로: /cart
파일크기: 270줄
컴포넌트명: CartPage
렌더링모드: 'use client' (CSR)
최종수정: 현재 버전
```

## 📦 Import 의존성

### React/Next.js
```typescript
import { useState, useEffect } from 'react'  // React 훅
import { useRouter } from 'next/navigation'   // Next.js 라우팅
import Image from 'next/image'                // Next.js 이미지 최적화
```

### 컴포넌트
```typescript
import Header from '@/components/Header'      // 헤더 컴포넌트
import Footer from '@/components/Footer'      // 푸터 컴포넌트
```

### 아이콘 (lucide-react)
```typescript
import { Trash2, Plus, Minus } from 'lucide-react'
// Trash2: 삭제 아이콘
// Plus: 수량 증가 아이콘
// Minus: 수량 감소 아이콘
```

## 🔄 TypeScript 인터페이스

### CartItem 인터페이스
```typescript
interface CartItem {
  id: string                // 장바구니 항목 ID
  product_id: string        // 상품 ID
  quantity: number          // 수량
  product: {               // 상품 정보
    id: string
    name: string           // 상품명
    price: number          // 가격
    slug: string           // URL 슬러그
    stock: number          // 재고
    images: {              // 이미지 배열
      url: string
      alt?: string
    }[]
  }
}
```

## 🔧 State 변수

```typescript
const [cartItems, setCartItems] = useState<CartItem[]>([])     // 장바구니 항목 목록
const [loading, setLoading] = useState(true)                   // 로딩 상태
const [updating, setUpdating] = useState<string | null>(null)  // 업데이트 중인 항목 ID
```

## 📌 하드코딩된 상수값

### 숫자 상수
```typescript
0       // 라인 98, 102, 143, 228: 초기값/비교값
1       // 라인 47, 188: 최소 수량
96      // 라인 166-167: 이미지 크기 (width, height)
24      // 라인 161: 이미지 컨테이너 크기 (w-24 h-24)
64      // 라인 128: 로딩 컨테이너 높이 (h-64)
12      // 라인 129, 193: 스피너 크기, 수량 표시 너비
4       // 라인 159, 185, 191, 199, 213, 222: 간격/패딩/아이콘 크기
5       // 라인 213: 아이콘 크기 (w-5 h-5)
3       // 라인 141, 251, 258: 패딩 (py-3)
8       // 라인 127, 140, 141, 144, 145, 154, 158, 228: 패딩/마진
6       // 라인 158, 222, 247: 패딩/마진
```

### 문자열 상수
```typescript
'장바구니'                    // 라인 141: 페이지 타이틀
'장바구니가 비어있습니다.'     // 라인 103, 145: 빈 장바구니 메시지
'쇼핑 계속하기'               // 라인 150, 260: 쇼핑 계속 버튼
'No Image'                   // 라인 172: 이미지 없음 텍스트
'재고: '                     // 라인 202: 재고 표시 접두사
'개'                        // 라인 202, 228: 수량 단위
'주문 요약'                  // 라인 223: 섹션 타이틀
'상품 수'                    // 라인 227: 라벨
'상품 금액'                  // 라인 231: 라벨
'배송비'                     // 라인 235: 라벨
'무료'                      // 라인 236: 무료 배송
'총 결제금액'                // 라인 242: 총액 라벨
'주문하기'                   // 라인 253: 결제 버튼
'checkout-data'             // 라인 119: 세션 스토리지 키
'/placeholder.svg'          // 라인 114: 기본 이미지
```

### API 엔드포인트
```typescript
'/api/cart'     // 라인 36, 51, 77: 장바구니 API
'/checkout'     // 라인 120: 결제 페이지 경로
'/products'     // 라인 147, 257: 상품 페이지 경로
```

### HTTP 헤더
```typescript
'Content-Type': 'application/json'  // 라인 53, 79: API 요청 헤더
```

## 🎨 CSS 클래스 (Tailwind)

### 레이아웃 클래스
```css
min-h-screen                          /* 전체 화면 높이 */
max-w-7xl mx-auto                    /* 최대 너비 7xl 중앙 정렬 */
px-4 sm:px-6 lg:px-8                /* 반응형 패딩 */
py-8                                 /* Y축 패딩 */
grid grid-cols-1 lg:grid-cols-3     /* 반응형 그리드 */
lg:col-span-2, lg:col-span-1        /* 그리드 컬럼 스팬 */
flex gap-4                           /* Flexbox 4 간격 */
flex-1, flex-shrink-0                /* Flex 아이템 속성 */
sticky top-4                         /* 고정 위치 */
```

### 색상 클래스 (다크모드 포함)
```css
bg-gray-50 dark:bg-gray-900         /* 배경색 */
bg-white dark:bg-gray-800           /* 카드 배경 */
text-gray-900 dark:text-white       /* 타이틀 텍스트 */
text-gray-500 dark:text-gray-400    /* 보조 텍스트 */
text-indigo-600 dark:text-red-400   /* 강조 텍스트 */
hover:text-indigo-500 dark:hover:text-red-300  /* 호버 텍스트 */
bg-gray-200                         /* 플레이스홀더 배경 */
text-gray-400, text-gray-600, text-gray-700  /* 텍스트 색상 */
border-gray-300                      /* 테두리 색상 */
hover:bg-gray-100, hover:bg-gray-50  /* 호버 배경 */
text-red-500 hover:text-red-700     /* 삭제 버튼 */
bg-indigo-600 hover:bg-indigo-700   /* 주문 버튼 */
```

### 컴포넌트 스타일
```css
rounded-lg                           /* 둥근 모서리 (큰) */
rounded-md                           /* 둥근 모서리 (중간) */
rounded                              /* 둥근 모서리 (기본) */
shadow-sm                            /* 작은 그림자 */
space-y-4, space-y-2                 /* 수직 간격 */
transition-colors                    /* 색상 전환 애니메이션 */
disabled:opacity-50 disabled:cursor-not-allowed  /* 비활성화 스타일 */
```

### 애니메이션 클래스
```css
animate-spin                         /* 회전 애니메이션 */
```

### 크기 클래스
```css
w-24 h-24                           /* 이미지 컨테이너 */
w-4 h-4, w-5 h-5                   /* 아이콘 크기 */
w-12                                /* 수량 표시 너비 */
w-full                              /* 전체 너비 */
```

## 🎯 함수 목록

### fetchCart (장바구니 조회)
```typescript
const fetchCart = async () => {}
// 위치: 라인 34-44
// 역할: API에서 장바구니 데이터 조회
// API: GET /api/cart
// 응답 처리:
//   - data.items를 cartItems 상태에 저장
//   - 빈 응답시 빈 배열 설정
```

### updateQuantity (수량 변경)
```typescript
const updateQuantity = async (item: CartItem, newQuantity: number) => {}
// 위치: 라인 46-72
// 매개변수: item (수정할 항목), newQuantity (새 수량)
// 검증:
//   - 최소 수량: 1
//   - 최대 수량: item.product.stock
// API: PATCH /api/cart
// 요청 본문: { productId, quantity }
// 성공시: 로컬 상태 업데이트
```

### removeItem (항목 삭제)
```typescript
const removeItem = async (item: CartItem) => {}
// 위치: 라인 74-93
// 매개변수: item (삭제할 항목)
// API: DELETE /api/cart
// 요청 본문: { productId }
// 성공시: 해당 항목을 목록에서 제거
```

### calculateTotal (총액 계산)
```typescript
const calculateTotal = () => {}
// 위치: 라인 95-99
// 역할: 장바구니 총액 계산
// 계산식: sum(product.price * quantity)
// 반환값: 총액 (number)
```

### handleCheckout (결제 처리)
```typescript
const handleCheckout = () => {}
// 위치: 라인 101-121
// 프로세스:
//   1. 빈 장바구니 검증
//   2. 결제 데이터 구성
//   3. sessionStorage에 저장
//   4. /checkout 페이지로 이동
// 저장 데이터:
//   - items: 상품 정보 배열
//   - total: 총액
```

## 🏗️ JSX 구조

### 전체 레이아웃
```jsx
<div className="min-h-screen bg-gray-50">
  <Header />
  <div className="max-w-7xl mx-auto">
    <h1>장바구니</h1>
    {cartItems.length === 0 ? (
      {/* 빈 장바구니 메시지 */}
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* 장바구니 아이템 목록 */}
        {/* 주문 요약 사이드바 */}
      </div>
    )}
  </div>
  <Footer />
</div>
```

### 장바구니 아이템 구조 (라인 157-217)
```jsx
{cartItems.map((item) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex gap-4">
      {/* 이미지 */}
      <div className="w-24 h-24">
        <Image src={...} alt={...} />
      </div>
      
      {/* 상품 정보 */}
      <div className="flex-1">
        <h3>{item.product.name}</h3>
        <p>₩{price}</p>
        
        {/* 수량 조절 */}
        <div className="flex items-center gap-2">
          <button onClick={() => updateQuantity(item, item.quantity - 1)}>
            <Minus />
          </button>
          <span>{item.quantity}</span>
          <button onClick={() => updateQuantity(item, item.quantity + 1)}>
            <Plus />
          </button>
          <span>(재고: {item.product.stock}개)</span>
        </div>
      </div>
      
      {/* 삭제 버튼 */}
      <button onClick={() => removeItem(item)}>
        <Trash2 />
      </button>
    </div>
  </div>
))}
```

### 주문 요약 구조 (라인 221-263)
```jsx
<div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
  <h2>주문 요약</h2>
  
  {/* 금액 내역 */}
  <div className="space-y-2">
    <div>상품 수: {totalQuantity}개</div>
    <div>상품 금액: ₩{total}</div>
    <div>배송비: 무료</div>
  </div>
  
  {/* 총액 */}
  <div className="border-t">
    <div>총 결제금액: ₩{total}</div>
  </div>
  
  {/* 액션 버튼 */}
  <button onClick={handleCheckout}>주문하기</button>
  <button onClick={() => router.push('/products')}>쇼핑 계속하기</button>
</div>
```

## 🔄 데이터 흐름

```
1. 페이지 로드
   ↓
2. useEffect → fetchCart 호출
   ↓
3. GET /api/cart API 요청
   ↓
4. 장바구니 데이터 수신
   ↓
5. cartItems 상태 업데이트
   ↓
6. UI 렌더링
   ↓
7. 사용자 액션
   ├─ 수량 변경 → updateQuantity → PATCH /api/cart
   ├─ 항목 삭제 → removeItem → DELETE /api/cart
   └─ 결제하기 → handleCheckout → sessionStorage → /checkout
```

## 📊 조건부 렌더링

### 로딩 상태
```typescript
if (loading) {
  return <로딩 스피너 페이지>
}
```

### 빈 장바구니
```typescript
{cartItems.length === 0 ? (
  <빈 장바구니 메시지>
) : (
  <장바구니 아이템 목록>
)}
```

### 이미지 존재 여부
```typescript
{item.product.images && item.product.images[0] ? (
  <Image />
) : (
  <div>No Image</div>
)}
```

### 버튼 비활성화
```typescript
// 수량 감소 버튼
disabled={updating === item.id || item.quantity <= 1}

// 수량 증가 버튼
disabled={updating === item.id || item.quantity >= item.product.stock}

// 삭제 버튼
disabled={updating === item.id}
```

## 🔌 API 통신

### 장바구니 조회
```typescript
// GET /api/cart
// Response:
{
  items: CartItem[]
}
```

### 수량 변경
```typescript
// PATCH /api/cart
// Request Body:
{
  productId: string
  quantity: number
}
```

### 항목 삭제
```typescript
// DELETE /api/cart
// Request Body:
{
  productId: string
}
```

## 💾 클라이언트 스토리지

### SessionStorage 사용
```typescript
// 키: 'checkout-data'
// 저장 데이터:
{
  items: [{
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }],
  total: number
}
```

## 🔍 특이사항

1. **window.location.href 사용**: router.push 대신 window.location.href로 페이지 이동 (라인 120)
2. **세션 스토리지 사용**: 결제 데이터를 세션 스토리지에 저장
3. **무료 배송 하드코딩**: 배송비가 '무료'로 고정
4. **에러 처리 미완성**: catch 블록들이 비어있음
5. **다크모드 지원**: Tailwind dark: 클래스 사용
6. **sticky 사이드바**: 주문 요약이 sticky top-4로 고정
7. **이미지 폴백**: 이미지 없을 때 '/placeholder.svg' 사용
8. **수량 로컬 업데이트**: API 성공시 로컬 상태만 업데이트

## 🔄 중복 제거 가능 항목

### API 호출 패턴
```typescript
// 반복되는 헤더 설정
headers: { 'Content-Type': 'application/json' }

// 반복되는 updating 상태 관리
setUpdating(item.id)
// ... API 호출 ...
setUpdating(null)
```

### 버튼 스타일
```css
disabled:opacity-50 disabled:cursor-not-allowed
/* 여러 버튼에 반복 적용 */

hover:bg-gray-100
/* 수량 조절 버튼에 반복 */
```

### 라우터 네비게이션
```typescript
router.push('/products')  // 라인 147, 257에서 반복
```

---

*이 문서는 /app/cart/page.tsx의 완전한 역설계 매뉴얼입니다.*