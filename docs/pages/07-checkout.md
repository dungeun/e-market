# 📖 페이지 백과사전: /checkout (결제 페이지)
*파일: /app/checkout/page.tsx*

## 🎯 페이지 메타데이터
```yaml
파일경로: /app/checkout/page.tsx
페이지경로: /checkout
파일크기: 388줄
컴포넌트명: CheckoutPage (메인), CheckoutContent (내부)
렌더링모드: 'use client' (CSR)
최종수정: 현재 버전
```

## 📦 Import 의존성

### React/Next.js
```typescript
import { useState, useEffect, Suspense } from 'react'  // React 훅과 Suspense
import { useRouter, useSearchParams } from 'next/navigation'  // 라우팅
import Image from 'next/image'                                // 이미지 최적화
```

### 유틸리티
```typescript
import { formatPrice } from '@/lib/utils'  // 가격 포매팅 유틸리티
```

### 컴포넌트
```typescript
import Header from '@/components/Header'  // 헤더 컴포넌트
import Footer from '@/components/Footer'  // 푸터 컴포넌트
```

### 아이콘 (lucide-react)
```typescript
import { CreditCard, Banknote, Receipt } from 'lucide-react'
// CreditCard: 카드 결제 아이콘
// Banknote: 현금 결제 아이콘
// Receipt: 영수증 아이콘
```

## 🔄 TypeScript 인터페이스

### CartItem 인터페이스
```typescript
interface CartItem {
  id: string                    // 장바구니 항목 ID
  productId: string             // 상품 ID
  quantity: number              // 수량
  product: {                   // 상품 정보
    id: string
    name: string               // 상품명
    slug: string               // URL 슬러그
    price: number              // 현재 가격
    original_price?: number    // 원래 가격 (선택)
    stock: number              // 재고
    images: {                  // 이미지 배열
      url: string
      alt?: string
    }[]
  }
}
```

## 🔧 State 변수

### 데이터 상태
```typescript
const [cartItems, setCartItems] = useState<CartItem[]>([])  // 장바구니 항목
const [loading, setLoading] = useState(true)                // 초기 로딩
const [isLoading, setIsLoading] = useState(false)          // 결제 진행 중
```

### 배송 정보
```typescript
const [shippingInfo, setShippingInfo] = useState({
  name: '',          // 받는 분
  phone: '',         // 연락처
  email: '',         // 이메일
  postcode: '',      // 우편번호
  address: '',       // 기본 주소
  addressDetail: '', // 상세 주소
  message: '',       // 배송 메시지
})
```

### 결제 방법
```typescript
const [paymentMethod, setPaymentMethod] = useState('cash')  // 결제 방법 (현금만)
```

## 📌 하드코딩된 상수값

### 숫자 상수
```typescript
50000   // 라인 140, 341, 343: 무료 배송 기준 금액
3000    // 라인 140: 배송비
0       // 라인 136, 140, 334, 354: 초기값/비교값
64      // 라인 147, 302, 303: 이미지/높이 크기
16      // 라인 298: 이미지 컨테이너 크기 (w-16 h-16)
12      // 라인 148, 380: 스피너 크기 (h-12 w-12)
32      // 라인 216: 우편번호 입력 너비 (w-32)
3       // 라인 249, 261, 279, 297, 355: textarea rows, 간격
4       // 라인 168, 279, 281, 290, 326, 360: 간격/패딩/아이콘 크기
5       // 라인 271, 281: 아이콘 크기 (w-5 h-5)
6       // 라인 163, 165, 258, 259, 290, 293, 355: 간격/패딩
8       // 라인 158, 159, 161: 패딩/마진
```

### 문자열 상수
```typescript
'주문/결제'                        // 라인 159: 페이지 타이틀
'배송 정보'                        // 라인 166: 섹션 타이틀
'받는 분 *'                       // 라인 171: 입력 라벨
'연락처 *'                        // 라인 183: 입력 라벨
'이메일'                          // 라인 196: 입력 라벨
'주소 *'                          // 라인 208: 입력 라벨
'우편번호'                        // 라인 215: 플레이스홀더
'주소 검색'                       // 라인 223: 버튼 텍스트
'기본 주소'                       // 라인 230: 플레이스홀더
'상세 주소'                       // 라인 237: 플레이스홀더
'배송 메시지'                     // 라인 244: 입력 라벨
'배송 시 요청사항을 입력해주세요'   // 라인 251: 플레이스홀더
'결제 방법'                       // 라인 259: 섹션 타이틀
'현금결제'                        // 라인 273: 결제 방법
'현장에서 현금으로 결제'           // 라인 274: 결제 설명
'현재 현금결제만 지원됩니다'       // 라인 282: 안내 메시지
'주문 요약'                       // 라인 291: 섹션 타이틀
'수량: '                         // 라인 309: 수량 라벨
'상품 금액'                       // 라인 328: 라벨
'배송비'                          // 라인 332: 라벨
'무료'                           // 라인 335: 무료 배송
'추가 주문 시 무료배송'           // 라인 343: 안내 메시지
'총 결제금액'                     // 라인 347: 총액 라벨
'처리 중...'                     // 라인 357: 로딩 텍스트
'결제하기'                       // 라인 357: 버튼 텍스트
'주문 확인 후 현장에서 현금으로 결제해주세요'  // 라인 361: 안내 메시지
'로딩 중...'                     // 라인 381: 로딩 메시지
'010-0000-0000'                  // 라인 189: 전화번호 플레이스홀더
'/placeholder.jpg'               // 라인 295: 기본 이미지
'cash'                          // 라인 47, 266: 결제 방법 값
```

### API 엔드포인트
```typescript
'/api/cart'                     // 라인 56: 장바구니 API
'/api/payment/create'           // 라인 97: 결제 생성 API
'/payment/confirm'              // 라인 122: 결제 확인 페이지
'/cart'                         // 라인 62, 66: 장바구니 페이지
```

### 외부 스크립트
```typescript
'//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'  // 라인 370: Daum 우편번호 API
```

## 🎨 CSS 클래스 (Tailwind)

### 레이아웃 클래스
```css
min-h-screen                         /* 전체 화면 높이 */
max-w-7xl mx-auto                   /* 최대 너비 7xl 중앙 정렬 */
px-4 sm:px-6 lg:px-8               /* 반응형 패딩 */
py-8                                /* Y축 패딩 */
grid grid-cols-1 lg:grid-cols-3     /* 반응형 그리드 */
lg:col-span-2, lg:col-span-1        /* 그리드 컬럼 스팬 */
md:col-span-2                       /* 중간 화면 컬럼 스팬 */
sticky top-4                        /* 고정 위치 */
```

### 색상 클래스 (다크 테마)
```css
bg-black                            /* 검정 배경 */
bg-gray-900                        /* 어두운 회색 배경 */
bg-gray-800, bg-gray-700           /* 회색 배경 단계 */
bg-red-900/20                      /* 빨간색 투명 배경 */
text-white                         /* 흰색 텍스트 */
text-gray-300, text-gray-400, text-gray-500  /* 회색 텍스트 단계 */
text-red-300, text-red-400         /* 빨간색 텍스트 */
text-green-400                     /* 초록색 텍스트 */
border-gray-700, border-gray-600   /* 회색 테두리 */
border-red-600, border-red-800     /* 빨간색 테두리 */
bg-red-600 hover:bg-red-700        /* 빨간 버튼 */
placeholder-gray-500               /* 플레이스홀더 색상 */
```

### 컴포넌트 스타일
```css
rounded-lg                         /* 둥근 모서리 (큰) */
rounded-md                         /* 둥근 모서리 (중간) */
shadow-sm                          /* 작은 그림자 */
space-y-6, space-y-4, space-y-3, space-y-2  /* 수직 간격 */
focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500  /* 포커스 스타일 */
disabled:opacity-50 disabled:cursor-not-allowed  /* 비활성화 스타일 */
transition-colors                  /* 색상 전환 애니메이션 */
line-through                      /* 취소선 */
```

### 애니메이션 클래스
```css
animate-spin                      /* 회전 애니메이션 */
```

## 🎯 함수 목록

### fetchCart (장바구니 조회)
```typescript
const fetchCart = async () => {}
// 위치: 라인 53-70
// 역할: API에서 장바구니 데이터 조회
// API: GET /api/cart
// 성공시: cartItems 상태 업데이트
// 실패시: /cart 페이지로 리다이렉트
```

### handleAddressSearch (주소 검색)
```typescript
const handleAddressSearch = () => {}
// 위치: 라인 72-85
// 역할: Daum 우편번호 API 호출
// 사용 라이브러리: daum.Postcode
// 결과: postcode와 address 업데이트
```

### handlePayment (결제 처리)
```typescript
const handlePayment = async () => {}
// 위치: 라인 87-131
// 검증:
//   - name, phone, address 필수
// API: POST /api/payment/create
// 요청 본문:
//   - items: 상품 정보
//   - shippingInfo: 배송 정보
//   - paymentMethod: 결제 방법
//   - totalAmount: 총액
// 성공시: /payment/confirm으로 리다이렉트
```

### calculateTotal (총액 계산)
```typescript
const calculateTotal = () => {}
// 위치: 라인 133-137
// 역할: 상품 총액 계산
// 계산식: sum(product.price * quantity)
```

## 🏗️ JSX 구조

### 전체 레이아웃
```jsx
<div className="min-h-screen bg-black">
  <Header />
  <div className="max-w-7xl mx-auto">
    <h1>주문/결제</h1>
    <div className="grid grid-cols-1 lg:grid-cols-3">
      {/* 주문 정보 (왼쪽) */}
      {/* 주문 요약 (오른쪽) */}
    </div>
  </div>
  <Footer />
  {/* Daum 우편번호 스크립트 */}
</div>
```

### 배송 정보 구조 (라인 165-255)
```jsx
<div className="bg-gray-900 rounded-lg">
  <h2>배송 정보</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* 받는 분 */}
    <input type="text" value={shippingInfo.name} />
    
    {/* 연락처 */}
    <input type="tel" value={shippingInfo.phone} />
    
    {/* 이메일 */}
    <input type="email" value={shippingInfo.email} />
    
    {/* 주소 */}
    <div className="md:col-span-2">
      <input value={shippingInfo.postcode} readOnly />
      <button onClick={handleAddressSearch}>주소 검색</button>
      <input value={shippingInfo.address} readOnly />
      <input value={shippingInfo.addressDetail} />
    </div>
    
    {/* 배송 메시지 */}
    <textarea value={shippingInfo.message} rows={3} />
  </div>
</div>
```

### 결제 방법 구조 (라인 257-285)
```jsx
<div className="bg-gray-900 rounded-lg">
  <h2>결제 방법</h2>
  <div className="space-y-3">
    <div className="flex items-center border border-red-600">
      <input type="radio" name="payment" value="cash" checked={true} />
      <Banknote />
      <div>
        <div>현금결제</div>
        <div>현장에서 현금으로 결제</div>
      </div>
    </div>
  </div>
  <div className="bg-red-900/20 border border-red-800">
    <Receipt />
    <span>현재 현금결제만 지원됩니다</span>
  </div>
</div>
```

### 주문 요약 구조 (라인 289-363)
```jsx
<div className="bg-gray-900 rounded-lg sticky top-4">
  <h2>주문 요약</h2>
  
  {/* 상품 목록 */}
  <div className="space-y-4">
    {cartItems.map((item) => (
      <div className="flex gap-3">
        <Image src={item.product.images[0]?.url} />
        <div>
          <h3>{item.product.name}</h3>
          <p>수량: {item.quantity}</p>
          <span>{formatPrice(item.product.price * item.quantity)}</span>
        </div>
      </div>
    ))}
  </div>
  
  {/* 금액 내역 */}
  <div className="border-t">
    <div>상품 금액: {formatPrice(totalPrice)}</div>
    <div>배송비: {shippingFee === 0 ? '무료' : formatPrice(shippingFee)}</div>
    <div>총 결제금액: {formatPrice(finalPrice)}</div>
  </div>
  
  {/* 결제 버튼 */}
  <button onClick={handlePayment}>
    {formatPrice(finalPrice)} 결제하기
  </button>
  
  <p>주문 확인 후 현장에서 현금으로 결제해주세요</p>
</div>
```

### Suspense 래핑 (라인 375-387)
```jsx
<Suspense fallback={<로딩 화면>}>
  <CheckoutContent />
</Suspense>
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
   - 비어있으면 /cart로 리다이렉트
   - 있으면 cartItems 설정
   ↓
5. 사용자 입력
   - 배송 정보 입력
   - 주소 검색 (Daum API)
   ↓
6. 결제 버튼 클릭
   ↓
7. handlePayment 호출
   - 입력값 검증
   - POST /api/payment/create
   ↓
8. 결제 성공시
   /payment/confirm으로 리다이렉트
```

## 📊 조건부 렌더링

### 로딩 상태
```typescript
if (loading) {
  return <로딩 스피너 페이지>
}
```

### 배송비 표시
```typescript
{shippingFee === 0 ? (
  <span className="text-green-400">무료</span>
) : (
  formatPrice(shippingFee)
)}
```

### 무료배송 안내
```typescript
{totalPrice < 50000 && (
  <div>{formatPrice(50000 - totalPrice)} 추가 주문 시 무료배송</div>
)}
```

### 원가 표시
```typescript
{item.product.original_price && item.product.original_price > item.product.price && (
  <span className="line-through">{formatPrice(original_price)}</span>
)}
```

### 버튼 텍스트
```typescript
{isLoading ? '처리 중...' : `${formatPrice(finalPrice)} 결제하기`}
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

### 결제 생성
```typescript
// POST /api/payment/create
// Request Body:
{
  items: [{
    productId: string
    quantity: number
    price: number
  }],
  shippingInfo: {
    name: string
    phone: string
    email: string
    postcode: string
    address: string
    addressDetail: string
    message: string
  },
  paymentMethod: string,
  totalAmount: number
}

// Response:
{
  success: boolean
  paymentKey: string
  orderId: string
  error?: string
}
```

## 🧮 가격 계산 로직

```typescript
const totalPrice = calculateTotal()           // 상품 총액
const shippingFee = totalPrice >= 50000 ? 0 : 3000  // 배송비
const finalPrice = totalPrice + shippingFee   // 최종 결제액
```

## 🔍 특이사항

1. **Suspense 사용**: CheckoutContent를 Suspense로 감싸서 서버 사이드 처리
2. **Daum 우편번호 API**: 외부 스크립트 동적 로드
3. **현금 결제만 지원**: 카드 결제 등 다른 결제 방법 없음
4. **무료배송 기준**: 50,000원 이상 무료배송
5. **window 타입 캐스팅**: Daum API 접근시 window as unknown 사용
6. **에러 처리 부족**: catch 블록에서 console.error만 사용
7. **하드코딩된 결제 방법**: 'cash'로 고정
8. **다크 테마 전용**: 모든 색상이 다크 테마용
9. **토스페이먼츠 언급**: 주석에 토스페이먼츠 결제 위젯 언급

## 🔄 중복 제거 가능 항목

### 포커스 스타일
```css
focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
/* 모든 입력 필드에 반복 */
```

### 입력 필드 스타일
```css
w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md
/* 여러 입력 필드에 반복 */
```

### 플레이스홀더 스타일
```css
placeholder-gray-500
/* 모든 플레이스홀더에 반복 */
```

---

*이 문서는 /app/checkout/page.tsx의 완전한 역설계 매뉴얼입니다.*