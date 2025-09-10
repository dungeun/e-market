# 📖 페이지 백과사전: /products/[slug] (상품 상세 페이지)
*파일: /app/products/[slug]/page.tsx*

## 🎯 페이지 메타데이터
```yaml
파일경로: /app/products/[slug]/page.tsx
페이지경로: /products/[slug] (동적 라우트)
파일크기: 123줄
컴포넌트명: ProductPage (서버 컴포넌트)
렌더링모드: RSC (React Server Component)
최종수정: 현재 버전
```

## 📦 Import 의존성

### Next.js
```typescript
import { notFound } from 'next/navigation'  // 404 처리
```

### 데이터베이스
```typescript
import { query } from '@/lib/db'  // 데이터베이스 쿼리 유틸리티
```

### 클라이언트 컴포넌트
```typescript
import ProductDetailClient from './ProductDetailClient'  // 클라이언트 컴포넌트
```

## 🔄 TypeScript 인터페이스

### PageProps 인터페이스
```typescript
interface PageProps {
  params: Promise<{ slug: string }>  // 비동기 params (Next.js 15)
}
```

## 📌 하드코딩된 상수값

### 숫자 상수
```typescript
0    // 라인 48, 77, 90, 91: order_index, 기본값
4    // 라인 80: LIMIT 4 (관련 상품 개수)
5    // 라인 37: LIMIT 5 (디버깅용)
```

### 문자열 상수
```typescript
'판매중'                            // 라인 78: 상품 상태 필터
'Searching for product with slug:'  // 라인 13: 콘솔 로그
'Product query result:'             // 라인 29: 콘솔 로그
'rows'                              // 라인 29: 콘솔 로그
'First product found:'              // 라인 31: 콘솔 로그
'Product not found for slug:'       // 라인 35: 콘솔 로그
'Available products:'               // 라인 38: 콘솔 로그
'Error in getProduct:'              // 라인 65: 에러 로그
```

### SQL 쿼리
```sql
-- 상품 조회 쿼리 (라인 16-27)
SELECT 
  p.id, p.name, p.slug, p.description, p.price, p.original_price, p.condition,
  p.category_id, p.stock, p.rating, p.review_count, p.featured, p.new, 
  p.status, p.discount_rate, p.created_at, p.updated_at,
  p.usage_period, p.purchase_date, p.detailed_description,
  p.seller_name, p.seller_location, p.verified_seller, p.defects, p.delivery_method,
  c.name as category_name, c.slug as category_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.slug = $1 AND p.deleted_at IS NULL

-- 이미지 조회 쿼리 (라인 45-49)
SELECT * FROM product_images 
WHERE product_id = $1 
ORDER BY order_index ASC

-- 관련 상품 쿼리 (라인 74-81)
SELECT p.*, pi.url as image_url
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.order_index = 0
WHERE p.category_id = $1 AND p.id != $2 AND p.status = '판매중' AND p.deleted_at IS NULL
ORDER BY p.created_at DESC
LIMIT 4

-- Static Params 생성 쿼리 (라인 101-104)
SELECT slug FROM products 
WHERE deleted_at IS NULL

-- 디버깅용 쿼리 (라인 37)
SELECT name, slug FROM products LIMIT 5
```

## 🎯 함수 목록

### getProduct (상품 조회)
```typescript
async function getProduct(slug: string)
// 위치: 라인 9-68
// 매개변수: slug (상품 슬러그)
// 프로세스:
//   1. URL 디코딩
//   2. 상품 정보 조회 (JOIN categories)
//   3. 상품 없으면 notFound() 호출
//   4. 이미지 조회
//   5. 리뷰 조회 (현재 빈 배열)
// 반환값:
//   - 상품 정보 + images + category + reviews
// 에러 처리:
//   - notFound() 호출
```

### getRelatedProducts (관련 상품 조회)
```typescript
async function getRelatedProducts(categoryId: string | null, currentProductId: string)
// 위치: 라인 70-97
// 매개변수:
//   - categoryId: 카테고리 ID
//   - currentProductId: 현재 상품 ID
// 조건:
//   - 같은 카테고리
//   - 현재 상품 제외
//   - status = '판매중'
//   - deleted_at IS NULL
// 제한: 4개
// 반환값:
//   - 간소화된 상품 정보 배열
```

### generateStaticParams (정적 경로 생성)
```typescript
export async function generateStaticParams()
// 위치: 라인 99-113
// 역할: SSG를 위한 정적 경로 생성
// 쿼리: 모든 상품의 slug 조회
// 반환값:
//   - [{ slug: string }] 배열
// 에러 처리:
//   - 빈 배열 반환
```

### ProductPage (메인 컴포넌트)
```typescript
export default async function ProductPage({ params }: PageProps)
// 위치: 라인 115-123
// 매개변수: params (Promise<{ slug }>)
// 프로세스:
//   1. params await 처리
//   2. getProduct 호출
//   3. getRelatedProducts 호출
//   4. ProductDetailClient 렌더링
```

## 🏗️ 데이터 구조

### 상품 데이터 구조 (getProduct 반환값)
```typescript
{
  // 기본 정보
  id: string
  name: string
  slug: string
  description: string
  price: number
  original_price: number
  condition: string
  
  // 카테고리
  category_id: string
  category: {
    id: string
    name: string
    slug: string
  } | null
  
  // 재고/평가
  stock: number
  rating: number
  review_count: number
  
  // 플래그
  featured: boolean
  new: boolean
  status: string
  discount_rate: number
  
  // 시간 정보
  created_at: Date
  updated_at: Date
  
  // 중고 상품 정보
  usage_period: string
  purchase_date: Date
  detailed_description: string
  
  // 판매자 정보
  seller_name: string
  seller_location: string
  verified_seller: boolean
  defects: string
  delivery_method: string
  
  // 관계 데이터
  images: Array<{
    id: string
    product_id: string
    url: string
    alt: string
    order_index: number
  }>
  reviews: Array<any>  // 현재 빈 배열
}
```

### 관련 상품 데이터 구조
```typescript
{
  id: string
  name: string
  slug: string
  description: string
  price: number
  images: Array<{ url: string }>
  rating: number        // TODO: 현재 0 고정
  reviewCount: number   // TODO: 현재 0 고정
}
```

## 🔄 데이터 흐름

```
1. 페이지 접근 (/products/[slug])
   ↓
2. ProductPage 컴포넌트 실행
   ↓
3. params await 처리
   ↓
4. getProduct(slug) 호출
   ├─ URL 디코딩
   ├─ 상품 정보 조회 (DB)
   ├─ 이미지 조회 (DB)
   └─ 리뷰 조회 (빈 배열)
   ↓
5. 상품 없으면 notFound()
   ↓
6. getRelatedProducts() 호출
   └─ 같은 카테고리 상품 4개 조회
   ↓
7. ProductDetailClient 렌더링
   └─ 클라이언트 컴포넌트에 데이터 전달
```

## 🗄️ 데이터베이스 테이블

### products 테이블 필드
```sql
id, name, slug, description, price, original_price, condition,
category_id, stock, rating, review_count, featured, new, 
status, discount_rate, created_at, updated_at,
usage_period, purchase_date, detailed_description,
seller_name, seller_location, verified_seller, defects, delivery_method,
deleted_at
```

### categories 테이블 필드
```sql
id, name, slug
```

### product_images 테이블 필드
```sql
id, product_id, url, alt, order_index
```

## 📊 조건부 로직

### 카테고리 존재 여부
```typescript
category: product.category_name ? {
  id: product.category_id,
  name: product.category_name,
  slug: product.category_slug
} : null
```

### 관련 상품 조회 조건
```typescript
if (!categoryId) return []  // 카테고리 없으면 빈 배열
```

### 이미지 처리
```typescript
images: product.image_url ? [{ url: product.image_url }] : []
```

## 🔍 특이사항

1. **Next.js 15 패턴**: params가 Promise로 처리됨
2. **서버 컴포넌트**: 데이터 페칭을 서버에서 처리
3. **클라이언트 분리**: UI 로직은 ProductDetailClient에 위임
4. **리뷰 미구현**: reviews는 항상 빈 배열
5. **평점 미구현**: rating, reviewCount는 0 고정
6. **디버깅 코드**: console.log가 여러 곳에 존재
7. **deleted_at 필터**: 소프트 삭제 지원
8. **상태 필터**: 관련 상품은 '판매중'만 조회
9. **generateStaticParams**: SSG 지원

## 🐛 디버깅 로그

```typescript
// 라인 13: 슬러그 검색 시작
console.log('Searching for product with slug:', decodedSlug)

// 라인 29-32: 쿼리 결과 확인
console.log('Product query result:', productResult.rows.length, 'rows')
console.log('First product found:', productResult.rows[0].name)

// 라인 35-38: 상품 못 찾았을 때
console.log('Product not found for slug:', decodedSlug)
console.log('Available products:', allProducts.rows)

// 라인 65: 에러 로깅
console.error('Error in getProduct:', error)
```

## 🔄 중복 제거 가능 항목

### 에러 처리 패턴
```typescript
} catch (error) {
  console.error('Error message:', error)
  // 기본값 반환 또는 notFound()
}
// 여러 함수에서 반복
```

### TODO 코멘트
```typescript
rating: 0, // TODO: Calculate from reviews
reviewCount: 0 // TODO: Calculate from reviews
```

---

*이 문서는 /app/products/[slug]/page.tsx의 완전한 역설계 매뉴얼입니다.*