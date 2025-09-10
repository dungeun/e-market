# 📖 페이지 백과사전: /products (상품 목록 페이지)
*파일: /app/products/page.tsx*

## 🎯 페이지 메타데이터
```yaml
파일경로: /app/products/page.tsx
페이지경로: /products
파일크기: 252줄
컴포넌트명: ProductsPage
렌더링모드: 'use client' (CSR)
최종수정: 현재 버전
```

## 📦 Import 의존성

### React/Next.js
```typescript
import { useState, useEffect } from 'react'  // React 훅
```

### 컴포넌트
```typescript
import ProductCard from '@/components/sections/ProductCard'  // 상품 카드 컴포넌트
import { Slider } from '@/components/ui/slider'             // 가격 슬라이더
import Header from '@/components/Header'                    // 헤더 컴포넌트
import Footer from '@/components/Footer'                    // 푸터 컴포넌트
```

## 🔄 TypeScript 인터페이스

### Product 인터페이스
```typescript
interface Product {
  id: string                                    // 상품 ID
  name: string                                  // 상품명
  slug: string                                  // URL 슬러그
  description: string                           // 상품 설명
  price: number                                // 가격
  compareAt?: number                            // 할인 전 가격 (선택)
  images: { url: string; alt?: string }[]      // 이미지 배열
  rating: number                                // 평점
  reviewCount: number                           // 리뷰 수
  category?: { id: string; name: string }      // 카테고리 (선택)
}
```

### Category 인터페이스
```typescript
interface Category {
  id: string           // 카테고리 ID
  name: string        // 카테고리명
  productCount: number // 상품 수
}
```

## 🔧 State 변수

### 데이터 상태
```typescript
const [products, setProducts] = useState<Product[]>([])      // 상품 목록
const [categories, setCategories] = useState<Category[]>([]) // 카테고리 목록
const [loading, setLoading] = useState(true)                 // 로딩 상태
```

### 필터 상태
```typescript
const [selectedCategory, setSelectedCategory] = useState<string>('')  // 선택된 카테고리
const [priceRange, setPriceRange] = useState([0, 1000000])           // 가격 범위
const [searchQuery, setSearchQuery] = useState('')                   // 검색어
```

### 정렬 상태
```typescript
const [sortBy, setSortBy] = useState('createdAt')   // 정렬 기준
const [sortOrder, setSortOrder] = useState('desc')  // 정렬 순서
```

### 페이지네이션
```typescript
const [page, setPage] = useState(1)              // 현재 페이지
const [totalPages, setTotalPages] = useState(1)  // 전체 페이지 수
```

## 📌 하드코딩된 상수값

### 숫자 상수
```typescript
12      // 라인 49: 페이지당 상품 수 (limit)
1000000 // 라인 33, 157: 최대 가격 (1백만원)
10000   // 라인 158: 가격 슬라이더 스텝
0       // 라인 33, 162: 최소 가격
1       // 라인 36, 76, 123, 138, 177, 212, 215, 224, 226: 페이지 번호
64      // 라인 64: 높이 (h-64)
12      // 라인 194: 로딩 스피너 크기 (h-12 w-12)
264     // 라인 95: 사이드바 너비 (w-64)
```

### 문자열 상수
```typescript
'전체 상품'                    // 라인 89: 페이지 타이틀
'원하시는 상품을 찾아보세요'    // 라인 90: 서브타이틀
'상품명 검색...'               // 라인 105: 검색 플레이스홀더
'검색'                        // 라인 99: 검색 섹션 제목
'카테고리'                    // 라인 113: 카테고리 섹션 제목
'전체'                        // 라인 127: 전체 카테고리 라벨
'가격'                        // 라인 152: 가격 섹션 제목
'정렬'                        // 라인 170: 정렬 섹션 제목
'최신순'                      // 라인 181: 정렬 옵션
'가격 낮은순'                 // 라인 182: 정렬 옵션
'가격 높은순'                 // 라인 183: 정렬 옵션
'이름순'                      // 라인 184: 정렬 옵션
'검색 결과가 없습니다.'        // 라인 206: 결과 없음 메시지
'이전'                        // 라인 218: 페이지네이션 버튼
'다음'                        // 라인 240: 페이지네이션 버튼
```

### API 엔드포인트
```typescript
'/api/products'  // 라인 62: 상품 목록 API
```

### 정렬 옵션 값
```typescript
'createdAt-desc'  // 라인 181: 최신순
'price-asc'       // 라인 182: 가격 낮은순
'price-desc'      // 라인 183: 가격 높은순
'name-asc'        // 라인 184: 이름순
```

## 🎨 CSS 클래스 (Tailwind)

### 레이아웃 클래스
```css
min-h-screen                          /* 전체 화면 높이 */
max-w-7xl mx-auto                    /* 최대 너비 7xl 중앙 정렬 */
px-4 sm:px-6 lg:px-8                /* 반응형 패딩 */
py-8                                 /* Y축 패딩 */
flex gap-8                           /* Flexbox 8 간격 */
w-64 flex-shrink-0                   /* 고정 너비 264px */
flex-1                               /* 나머지 공간 차지 */
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  /* 반응형 그리드 */
```

### 색상 클래스
```css
bg-gray-50                           /* 배경색 */
bg-white                             /* 흰색 배경 */
text-gray-900                        /* 진한 텍스트 */
text-gray-600, text-gray-700         /* 중간 텍스트 */
text-gray-500                        /* 연한 텍스트 */
bg-indigo-600 text-white             /* 선택된 페이지 */
border-gray-300                      /* 회색 테두리 */
border-indigo-600                    /* 인디고 테두리 */
hover:bg-gray-50                     /* 호버 배경 */
```

### 컴포넌트 스타일
```css
rounded-lg                           /* 둥근 모서리 (큰) */
rounded-md                           /* 둥근 모서리 (중간) */
shadow-sm                            /* 작은 그림자 */
space-y-6, space-y-4, space-y-2      /* 수직 간격 */
focus:outline-none focus:ring-2 focus:ring-indigo-500  /* 포커스 스타일 */
disabled:opacity-50 disabled:cursor-not-allowed        /* 비활성화 스타일 */
```

### 애니메이션 클래스
```css
animate-spin                         /* 회전 애니메이션 */
```

## 🎯 함수 목록

### fetchProducts (상품 목록 조회)
```typescript
const fetchProducts = async () => {}
// 위치: 라인 44-72
// 역할: API에서 상품 목록 조회
// 프로세스:
//   1. URLSearchParams 생성
//   2. 필터 파라미터 추가 (category, search)
//   3. API 호출
//   4. 상태 업데이트 (products, totalPages)
// API: GET /api/products?page=1&limit=12&sort=createdAt&order=desc
```

### handleSearch (검색 처리)
```typescript
const handleSearch = (e: React.FormEvent) => {}
// 위치: 라인 74-78
// 매개변수: e (폼 이벤트)
// 역할: 검색 폼 제출 처리
// 프로세스:
//   1. 기본 이벤트 방지
//   2. 페이지를 1로 리셋
//   3. fetchProducts 호출
```

### filteredProducts (가격 필터링)
```typescript
const filteredProducts = products.filter(...)
// 위치: 라인 80-82
// 역할: 클라이언트 사이드 가격 필터링
// 조건: price >= priceRange[0] && price <= priceRange[1]
```

## 🏗️ JSX 구조

### 전체 레이아웃
```jsx
<div className="min-h-screen bg-gray-50">
  <Header />
  <div className="max-w-7xl mx-auto">
    {/* 페이지 헤더 */}
    <div className="flex gap-8">
      {/* 사이드바 필터 */}
      {/* 상품 그리드 */}
    </div>
  </div>
  <Footer />
</div>
```

### 사이드바 구조 (라인 95-188)
```jsx
<div className="w-64 flex-shrink-0">
  <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
    {/* 검색 섹션 */}
    {/* 카테고리 필터 */}
    {/* 가격 범위 슬라이더 */}
    {/* 정렬 셀렉트박스 */}
  </div>
</div>
```

### 카테고리 필터 구조 (라인 112-148)
```jsx
<div>
  <h3>카테고리</h3>
  <div className="space-y-2">
    <label>
      <input type="radio" name="category" value="" />
      <span>전체</span>
    </label>
    {categories.map((category) => (
      <label>
        <input type="radio" name="category" value={category.id} />
        <span>{category.name} ({category.productCount})</span>
      </label>
    ))}
  </div>
</div>
```

### 가격 필터 구조 (라인 151-166)
```jsx
<div>
  <h3>가격</h3>
  <Slider
    value={priceRange}
    onValueChange={setPriceRange}
    max={1000000}
    step={10000}
  />
  <div className="flex justify-between">
    <span>₩{priceRange[0].toLocaleString()}</span>
    <span>₩{priceRange[1].toLocaleString()}</span>
  </div>
</div>
```

### 상품 그리드 구조 (라인 191-245)
```jsx
<div className="flex-1">
  {loading ? (
    <div className="animate-spin">로딩 스피너</div>
  ) : (
    <>
      <div className="grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {/* 빈 결과 메시지 */}
      {/* 페이지네이션 */}
    </>
  )}
</div>
```

### 페이지네이션 구조 (라인 211-243)
```jsx
<div className="mt-8 flex justify-center gap-2">
  <button onClick={() => setPage(p => Math.max(1, p - 1))}>
    이전
  </button>
  {[...Array(totalPages)].map((_, i) => (
    <button onClick={() => setPage(i + 1)}>
      {i + 1}
    </button>
  ))}
  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
    다음
  </button>
</div>
```

## 🔄 데이터 흐름

```
1. 페이지 로드
   ↓
2. useEffect 트리거 (초기 렌더링)
   ↓
3. fetchProducts 호출
   ↓
4. API 요청 (/api/products)
   - page, limit, sort, order 파라미터
   - category, search 조건부 파라미터
   ↓
5. 응답 데이터 파싱
   - products 배열
   - pagination 정보
   ↓
6. 상태 업데이트
   - setProducts(data.products)
   - setTotalPages(data.pagination.totalPages)
   ↓
7. 클라이언트 필터링
   - 가격 범위 필터 (filteredProducts)
   ↓
8. UI 렌더링
```

## 📊 조건부 렌더링

### 로딩 상태
```typescript
{loading ? (
  // 로딩 스피너 표시
) : (
  // 상품 그리드 표시
)}
```

### 빈 결과
```typescript
{filteredProducts.length === 0 && (
  <div>검색 결과가 없습니다.</div>
)}
```

### 페이지네이션
```typescript
{totalPages > 1 && (
  // 페이지네이션 컨트롤 표시
)}
```

### 페이지 버튼 스타일
```typescript
page === i + 1
  ? 'bg-indigo-600 text-white'  // 현재 페이지
  : 'border-gray-300 hover:bg-gray-50'  // 다른 페이지
```

### 버튼 비활성화
```typescript
disabled={page === 1}           // 첫 페이지에서 이전 버튼
disabled={page === totalPages}  // 마지막 페이지에서 다음 버튼
```

## 🔌 API 통신

### 상품 목록 API
```typescript
// GET /api/products
// Query Parameters:
{
  page: string        // 페이지 번호 (기본: "1")
  limit: string       // 페이지당 항목 수 (기본: "12")
  sort: string        // 정렬 기준 (createdAt|price|name)
  order: string       // 정렬 순서 (asc|desc)
  category?: string   // 카테고리 ID (선택)
  search?: string     // 검색어 (선택)
}

// Response:
{
  products: Product[]
  pagination: {
    totalPages: number
    currentPage: number
    totalItems: number
  }
}
```

## 🔍 특이사항

1. **클라이언트 사이드 가격 필터**: 서버에서 받은 데이터를 클라이언트에서 추가 필터링
2. **카테고리 데이터 없음**: categories 상태는 선언되었지만 데이터 로드 로직 없음
3. **하드코딩된 최대 가격**: 1,000,000원으로 고정
4. **페이지네이션 전체 표시**: 모든 페이지 번호 표시 (많을 경우 문제)
5. **검색 엔터키 처리**: 폼 제출로 검색 처리
6. **라디오 버튼 사용**: 카테고리 선택에 라디오 버튼 (단일 선택)
7. **에러 처리 미완성**: catch 블록 비어있음 (라인 67-68)

## 🔄 중복 제거 가능 항목

### API 파라미터 생성
```typescript
// 반복되는 파라미터 설정 로직
params.append('page', page.toString())
params.append('limit', '12')
// 함수화 가능
```

### 페이지 리셋 로직
```typescript
setPage(1)  // 여러 곳에서 반복 (라인 76, 123, 138, 177)
```

### 포커스 스타일
```css
focus:outline-none focus:ring-2 focus:ring-indigo-500
/* 입력 필드에 반복 적용 */
```

---

*이 문서는 /app/products/page.tsx의 완전한 역설계 매뉴얼입니다.*