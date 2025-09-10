# 📖 페이지 백과사전: /admin/products/page.tsx
*완전한 역설계 매뉴얼 - 모든 변수, 클래스, 함수, 상수 포함*

## 🎯 페이지 메타데이터
```yaml
파일경로: /app/admin/products/page.tsx
페이지경로: /admin/products
파일크기: 667줄
컴포넌트명: ProductsPage
렌더링모드: 'use client' (CSR)
최종수정: 현재 버전
```

## 📦 Import 의존성 완전 목록

### React 핵심
```typescript
import { useState, useEffect } from 'react'
```

### UI 컴포넌트 (shadcn/ui)
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
```

### 아이콘 (lucide-react)
```typescript
import { 
  Plus,        // 추가 아이콘
  Search,      // 검색 아이콘
  Edit,        // 편집 아이콘
  Trash,       // 삭제 아이콘
  Eye,         // 보기 아이콘
  Filter,      // 필터 아이콘
  Download,    // 다운로드 아이콘
  Upload,      // 업로드 아이콘
  Copy,        // 복사 아이콘
  RotateCcw    // 새로고침 아이콘 (미사용)
} from 'lucide-react'
```

### 외부 라이브러리
```typescript
import { toast } from 'sonner'  // 토스트 알림
import Image from 'next/image'  // Next.js 이미지 최적화
```

### 내부 유틸리티
```typescript
import { adminApiCall } from '@/lib/api/client'  // API 호출 래퍼
```

## 🏗️ TypeScript 인터페이스 정의

### UploadedImage 인터페이스
```typescript
interface UploadedImage {
  id: string                      // 이미지 고유 ID
  url: string                     // 원본 이미지 URL
  fileName: string                // 파일명
  size: number                    // 파일 크기 (bytes)
  webpUrl?: string               // WebP 변환 URL (선택)
  isConverting?: boolean         // 변환 중 상태 (선택)
  error?: string                 // 에러 메시지 (선택)
  type: 'thumbnail' | 'detail'  // 이미지 타입
  order: number                  // 정렬 순서
}
```

### Product 인터페이스
```typescript
interface Product {
  id: string                                                    // 상품 ID
  name: string                                                  // 상품명
  slug: string                                                  // URL 슬러그
  description: string                                           // 상품 설명
  price: string                                                 // 현재 가격
  images: UploadedImage[] | string[]                          // 이미지 배열 (신/구 형식)
  category: string | { id: string; name: string; slug: string } | null  // 카테고리
  rating: number                                               // 평점
  reviewCount: number                                          // 리뷰 수
  stock: number                                                // 재고 수량
  featured: boolean                                            // 추천 상품 여부
  new: boolean                                                 // 신상품 여부
  status: string                                               // 판매 상태
  condition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'         // 중고 상태 (선택)
  originalPrice?: string | number                             // 원가 (선택)
  discountRate?: number                                        // 할인율 (선택)
  createdAt?: string                                          // 생성일 (선택)
  updatedAt?: string                                          // 수정일 (선택)
}
```

## 🔧 컴포넌트 State 변수

```typescript
const [products, setProducts] = useState<Product[]>([])        // 상품 목록 배열
const [loading, setLoading] = useState(true)                   // 로딩 상태
const [searchQuery, setSearchQuery] = useState('')             // 검색 쿼리
const [categories, setCategories] = useState<string[]>([])     // 카테고리 목록
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)  // 선택된 상품
const [showDetailModal, setShowDetailModal] = useState(false)  // 상세 모달 표시 여부
```

## 📌 하드코딩된 상수값

### 숫자 상수
```typescript
5     // 라인 126: 재고부족 기준값
20    // 라인 229: 재고 경고 색상 기준값
250   // 라인 313: 검색 입력창 너비 (w-[250px])
50    // 라인 328: 이미지 썸네일 크기 (w-[50px])
200   // 라인 403: 설명 텍스트 최대 너비 (max-w-[200px])
10    // 라인 343, 359: 테이블 컬럼 수 (colSpan={10})
4     // 라인 499: 모달 이미지 최대 표시 수
1.2   // 라인 99: 원가 계산 배율
100   // 라인 133: 할인율 계산 기준
```

### 문자열 상수 (한국어)
```typescript
// 페이지 제목
'중고 상품 관리'           // 라인 238
'중고상품 등록'           // 라인 252

// 통계 카드 라벨
'전체 상품'              // 라인 261
'판매 중'                // 라인 270
'재고 부족'              // 라인 281
'품절'                   // 라인 292

// 테이블 헤더
'이미지'                 // 라인 328
'상품명'                 // 라인 329
'카테고리'               // 라인 330
'현재가격'               // 라인 331
'원가'                   // 라인 332
'할인율'                 // 라인 333
'상태'                   // 라인 334
'컨디션'                 // 라인 335
'재고'                   // 라인 336
'작업'                   // 라인 337

// 상태 라벨
'판매중지'               // 라인 123
'품절'                   // 라인 124
'재고부족'               // 라인 125
'판매중'                 // 라인 126

// 컨디션 라벨
'최상'                   // 라인 143
'양호'                   // 라인 144
'보통'                   // 라인 145
'하급'                   // 라인 146

// 버튼 텍스트
'가져오기'               // 라인 244
'내보내기'               // 라인 248
'미리보기 (새 창)'        // 라인 436
'수정'                   // 라인 445
'복제'                   // 라인 454
'임시 삭제'              // 라인 463
'닫기'                   // 라인 636
'수정하기'               // 라인 647
'복제하기'               // 라인 658

// 알림 메시지
'상품 목록을 불러오는데 실패했습니다.'     // 라인 116
'상품 복사에 실패했습니다.'              // 라인 184
'상품 삭제에 실패했습니다.'              // 라인 209
'상품 가져오기'                         // 라인 242
'상품 내보내기'                         // 라인 247
'상품 목록을 불러오는 중...'             // 라인 344
'등록된 상품이 없습니다.'                // 라인 350
```

### CSS 클래스 (Tailwind)

#### 레이아웃 클래스
```css
space-y-6               /* 수직 간격 6 단위 */
flex items-center justify-between  /* 플렉스 양끝 정렬 */
grid gap-4 md:grid-cols-4  /* 4열 그리드 (모바일 반응형) */
max-w-4xl              /* 최대 너비 4xl */
max-h-[90vh]           /* 최대 높이 뷰포트 90% */
overflow-y-auto        /* 수직 스크롤 */
```

#### 텍스트 스타일
```css
text-2xl font-bold     /* 제목 크기 */
text-sm font-medium    /* 작은 제목 */
text-xs text-muted-foreground  /* 부가 설명 */
text-lg font-semibold  /* 섹션 제목 */
```

#### 색상 클래스 (상태별)
```css
/* 성공/활성 */
text-green-600
bg-green-100 text-green-800
hover:text-green-800 hover:bg-green-50

/* 경고 */
text-yellow-600
bg-yellow-100 text-yellow-800

/* 위험/에러 */
text-red-600
bg-red-100 text-red-800
hover:text-red-800 hover:bg-red-50

/* 정보 */
text-blue-600
bg-blue-100 text-blue-800
hover:text-blue-800 hover:bg-blue-50

/* 특수 */
text-purple-600
hover:text-purple-800 hover:bg-purple-50
```

#### 버튼 스타일
```css
h-8 w-8               /* 아이콘 버튼 크기 */
h-4 w-4               /* 아이콘 크기 */
mr-2                  /* 오른쪽 마진 */
```

## 🎯 함수 목록 및 시그니처

### 1. loadProducts (비동기 데이터 로드)
```typescript
const loadProducts = async (): Promise<void>
// 위치: 라인 85-120
// 역할: API에서 상품 목록을 가져와 state에 저장
// API 호출: GET /api/admin/products
// State 업데이트: setProducts, setCategories, setLoading
// 에러 처리: toast.error 알림
```

### 2. getProductStatus (상태 계산)
```typescript
const getProductStatus = (stock: number, currentStatus?: string): string
// 위치: 라인 122-127
// 매개변수:
//   - stock: 재고 수량
//   - currentStatus: 현재 상태 (선택)
// 반환값: '판매중지' | '품절' | '재고부족' | '판매중'
// 로직:
//   1. currentStatus가 'ACTIVE'가 아니면 → '판매중지'
//   2. stock === 0 → '품절'
//   3. stock < 5 → '재고부족'
//   4. 기본값 → '판매중'
```

### 3. calculateDiscountRate (할인율 계산)
```typescript
const calculateDiscountRate = (originalPrice?: string, currentPrice?: string): number
// 위치: 라인 129-134
// 매개변수: 원가, 현재가격 (문자열)
// 반환값: 할인율 (0-100)
// 계산식: Math.round(((원가 - 현재가) / 원가) * 100)
```

### 4. formatPrice (가격 포맷팅)
```typescript
const formatPrice = (price: string | number): string
// 위치: 라인 136-139
// 매개변수: 가격 (문자열 또는 숫자)
// 반환값: '₩1,000' 형식의 문자열
// 로케일: ko-KR
```

### 5. getConditionBadge (컨디션 뱃지)
```typescript
const getConditionBadge = (condition: string): JSX.Element
// 위치: 라인 141-150
// 매개변수: 상품 컨디션 상태
// 반환값: Badge 컴포넌트
// 매핑:
//   EXCELLENT → '최상' (녹색)
//   GOOD → '양호' (파란색)
//   FAIR → '보통' (노란색)
//   POOR → '하급' (빨간색)
```

### 6. handleViewDetail (상세보기)
```typescript
const handleViewDetail = (product: Product): void
// 위치: 라인 152-155
// 역할: 새 창에서 상품 페이지 열기
// URL 패턴: /products/[slug]
```

### 7. handleEditProduct (수정)
```typescript
const handleEditProduct = (product: Product): void
// 위치: 라인 157-160
// 역할: 수정 페이지로 이동
// URL 패턴: /admin/products/edit/[id]
```

### 8. handleCopyProduct (복제)
```typescript
const handleCopyProduct = async (product: Product): Promise<void>
// 위치: 라인 162-186
// 역할: 상품 복제
// API 호출: POST /api/admin/products
// 복제 규칙: 이름에 ' (복사)' 추가, ID는 undefined
```

### 9. handleDeleteProduct (삭제)
```typescript
const handleDeleteProduct = async (product: Product): Promise<void>
// 위치: 라인 188-212
// 역할: 상품 임시 삭제 (휴지통)
// API 호출: DELETE /api/admin/products?id=[id]
// 확인 다이얼로그: window.confirm 사용
```

### 10. getStatusBadge (상태 뱃지)
```typescript
const getStatusBadge = (status: string): JSX.Element
// 위치: 라인 214-225
// 반환: Badge 컴포넌트 (색상별)
```

### 11. getStockColor (재고 색상)
```typescript
const getStockColor = (stock: number): string
// 위치: 라인 227-231
// 반환: Tailwind 색상 클래스
// 규칙:
//   stock === 0 → 'text-red-600'
//   stock < 20 → 'text-yellow-600'
//   기본 → 'text-green-600'
```

### 12. getImageSrc (이미지 소스 추출) - 인라인 함수
```typescript
const getImageSrc = (product: Product): string | null
// 위치: 라인 361-374, 500-508
// 역할: 신/구 이미지 형식 호환 처리
// 로직:
//   1. 객체 형식: image.webpUrl || image.url
//   2. 문자열 형식: 직접 반환
//   3. 없으면: null
```

## 🔌 API 엔드포인트 호출

### GET /api/admin/products
```typescript
// 위치: 라인 88-90
// 메소드: GET
// 용도: 상품 목록 조회
// 응답 구조:
{
  success: boolean
  data: {
    products: Product[]
  }
}
```

### POST /api/admin/products
```typescript
// 위치: 라인 170-173
// 메소드: POST
// 용도: 상품 생성/복제
// 요청 본문: Product 객체 (id 제외)
```

### DELETE /api/admin/products
```typescript
// 위치: 라인 192-194
// 메소드: DELETE
// 용도: 상품 삭제
// 쿼리 파라미터: ?id=[product.id]
```

## 🎨 UI 구조 트리

```
ProductsPage
├── 헤더 섹션
│   ├── 제목: "중고 상품 관리"
│   ├── 부제: "총 X개의 중고 상품이 등록되어 있습니다"
│   └── 액션 버튼들
│       ├── 가져오기 버튼 (Upload 아이콘)
│       ├── 내보내기 버튼 (Download 아이콘)
│       └── 중고상품 등록 버튼 (Plus 아이콘)
│
├── 통계 카드 섹션 (4개 그리드)
│   ├── 전체 상품 카드
│   ├── 판매 중 카드 (녹색)
│   ├── 재고 부족 카드 (노란색)
│   └── 품절 카드 (빨간색)
│
├── 상품 목록 카드
│   ├── 카드 헤더
│   │   ├── 제목: "상품 목록"
│   │   └── 검색/필터 영역
│   │       ├── 검색 입력창 (Search 아이콘)
│   │       └── 필터 버튼 (Filter 아이콘)
│   │
│   └── 테이블
│       ├── 헤더 (10개 컬럼)
│       └── 바디 (상품 행들)
│           └── 각 행의 액션 버튼들
│               ├── 미리보기 (Eye)
│               ├── 수정 (Edit)
│               ├── 복제 (Copy)
│               └── 삭제 (Trash)
│
└── 상세보기 모달 (Dialog)
    ├── 모달 헤더
    ├── 이미지 섹션 (2x2 그리드)
    ├── 상품 정보 섹션
    └── 액션 버튼들
```

## 🔄 데이터 흐름

### 1. 페이지 로드 시퀀스
```
1. useEffect([]) 트리거
2. loadProducts() 호출
3. setLoading(true)
4. API 호출: GET /api/admin/products
5. 데이터 변환 (transformedProducts)
6. setProducts() 업데이트
7. 카테고리 추출 (uniqueCategories)
8. setCategories() 업데이트
9. setLoading(false)
```

### 2. 검색 필터링
```
1. searchQuery state 변경
2. products.filter() 실행
3. product.name.toLowerCase().includes(searchQuery.toLowerCase())
4. 필터링된 결과 렌더링
```

### 3. 상품 액션 플로우
```
복제: handleCopyProduct → POST API → loadProducts()
삭제: confirm() → DELETE API → loadProducts()
수정: 페이지 이동 → /admin/products/edit/[id]
미리보기: 새 창 열기 → /products/[slug]
```

## 📊 조건부 렌더링 로직

### 로딩 상태
```typescript
loading ? '...' : products.length  // 통계 카드
loading ? <로딩 메시지> : <테이블 데이터>  // 테이블
```

### 빈 상태
```typescript
products.length === 0 ? <빈 상태 메시지> : <상품 목록>
```

### 이미지 처리
```typescript
이미지 있음 && 유효한 URL ? <Image> : <placeholder>
```

### 할인 표시
```typescript
discountRate > 0 ? <할인 뱃지> : '-'
```

## 🛡️ 에러 처리 패턴

### try-catch 블록
```typescript
try {
  // API 호출
} catch (error) {
  toast.error('에러 메시지')
  console.error(error)  // 일부 함수에만 있음
}
```

### 이미지 에러 핸들링
```typescript
onError={(e) => {
  const target = e.target as HTMLImageElement;
  target.src = '/placeholder.svg';
}}
```

## 🔍 검색 및 필터 로직

### 현재 구현된 필터
- 상품명 검색 (대소문자 무시)
- 실시간 필터링 (onChange 이벤트)

### 미구현 기능 (UI만 존재)
- Filter 버튼 (라인 318-320)
- 카테고리 필터 (categories state는 있지만 미사용)

## 📝 메모 및 특이사항

### 1. 이미지 형식 호환성
- 신규 형식: UploadedImage 객체 (url, webpUrl 등)
- 기존 형식: 문자열 배열
- 두 형식 모두 처리하는 로직 구현됨

### 2. 하드코딩된 계산값
- 원가 없을 때: 현재가 * 1.2로 자동 계산
- 할인율: 원가와 현재가 차이로 자동 계산

### 3. 미사용 import
- RotateCcw (새로고침 아이콘) import되었지만 미사용

### 4. 모달 상태
- showDetailModal state 있지만 실제로 사용 안 됨
- selectedProduct도 설정하는 코드 없음

### 5. URL 패턴
- 상품 상세: /products/[slug]
- 상품 수정: /admin/products/edit/[id]
- 상품 등록: /admin/products/create

## 🔄 중복 제거 가능 항목

### 전역 상수로 추출 가능
- 재고 기준값 (5, 20)
- 상태 라벨 문자열들
- 색상 클래스 매핑
- API 엔드포인트 경로

### 재사용 가능한 유틸리티
- formatPrice() → 전역 유틸리티
- getImageSrc() → 이미지 처리 헬퍼
- 상태/컨디션 매핑 객체들

### 컴포넌트 분리 가능
- 통계 카드 섹션
- 상품 테이블
- 상세보기 모달
- 액션 버튼 그룹

---

*이 문서는 /admin/products/page.tsx의 완전한 역설계 매뉴얼입니다.*
*모든 변수, 함수, 클래스, 상수값이 포함되어 있으며, 이 문서만으로 페이지를 완전히 재구성할 수 있습니다.*