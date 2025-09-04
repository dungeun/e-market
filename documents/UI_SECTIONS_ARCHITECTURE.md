# UI 섹션 시스템 아키텍처 문서

## 📌 개요
홈페이지의 UI 구성요소를 **동적으로 관리**하는 시스템입니다. 관리자가 섹션을 추가/수정/삭제하고, 순서를 변경하며, 각 섹션의 콘텐츠를 실시간으로 관리할 수 있습니다.

## 🏗️ 시스템 구조

### 1. 데이터베이스 구조

#### ui_sections 테이블
```sql
CREATE TABLE ui_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,          -- 섹션 고유 키 (예: 'best-sellers')
  type VARCHAR(50),                          -- 섹션 타입
  title VARCHAR(255),                         -- 섹션 제목
  content JSONB,                              -- 섹션 설정 (JSON)
  "order" INTEGER DEFAULT 0,                 -- 표시 순서
  visible BOOLEAN DEFAULT true,              -- 표시 여부
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- content 필드 구조 예시
{
  "subtitle": "인기 상품을 만나보세요",
  "layout": "grid",
  "productCount": 8,
  "showPrice": true,
  "showRating": true,
  "showBadge": true,
  "sortBy": "popularity",
  "categoryFilter": "",
  "selectionMode": "auto",      -- 'auto' | 'manual'
  "minSales": 10,               -- 자동 선택 조건
  "minRating": 4.0,
  "dateRange": 30,
  "manualProducts": [],         -- 수동 선택된 상품 ID
  "images": {                   -- 언어별 이미지
    "ko": "image-url",
    "en": "image-url"
  }
}
```

### 2. 섹션 타입

#### 2.1 상품 섹션 (Product Sections)
```typescript
type ProductSection = {
  'best-sellers'       // 베스트셀러
  'new-arrivals'       // 신상품
  'flash-sale'         // 플래시 세일
  'featured-products'  // 추천 상품
  'trending-products'  // 트렌딩 상품
  'category-showcase'  // 카테고리 쇼케이스
  'seasonal-collection'// 시즌 컬렉션
  'special-offers'     // 특별 할인
  'recommended'        // 맞춤 추천
  'recently-viewed'    // 최근 본 상품
}
```

#### 2.2 콘텐츠 섹션 (Content Sections)
```typescript
type ContentSection = {
  'hero'              // 히어로 배너
  'newsletter'        // 뉴스레터
  'testimonials'      // 고객 후기
  'instagram-feed'    // 인스타그램 피드
  'brand-spotlight'   // 브랜드 스포트라이트
  'video-showcase'    // 비디오 쇼케이스
  'banner-grid'       // 배너 그리드
}
```

### 3. API 구조

#### 3.1 섹션 관리 API
```
GET /api/admin/ui-config/sections
  - 모든 섹션 목록 조회
  - 순서대로 정렬

POST /api/admin/ui-config/sections
  - 새 섹션 생성
  - 자동 순서 할당

GET /api/admin/ui-config/sections/[id]
  - 특정 섹션 상세 조회
  - ID 또는 key로 조회 가능

PUT /api/admin/ui-config/sections/[id]
  - 섹션 수정
  - content 필드 업데이트

DELETE /api/admin/ui-config/sections/[id]
  - 섹션 삭제
```

#### 3.2 공개 API
```
GET /api/public/ui-sections
  - 활성화된 섹션만 조회
  - 순서대로 정렬
  - 캐싱 적용
```

### 4. 파일 구조

```
commerce-nextjs/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── ui-config/
│   │   │       └── sections/
│   │   │           ├── route.ts              # 섹션 목록/생성
│   │   │           └── [id]/
│   │   │               └── route.ts          # 개별 섹션 CRUD
│   │   └── public/
│   │       └── ui-sections/
│   │           └── route.ts                  # 공개 섹션 조회
│   └── admin/
│       └── ui-config/
│           ├── page.tsx                       # UI 설정 메인 페이지
│           └── sections/
│               ├── new/
│               │   └── page.tsx              # 새 섹션 생성 (deprecated)
│               ├── [id]/
│               │   └── page.tsx              # 섹션 편집 (통합)
│               └── [type]/                   # 타입별 특화 페이지
│                   └── page.tsx
├── components/
│   ├── admin/
│   │   └── ui-config/
│   │       ├── SectionList.tsx              # 섹션 목록 컴포넌트
│   │       ├── SectionEditor.tsx            # 섹션 편집기
│   │       └── SectionImageUpload.tsx       # 이미지 업로드
│   └── sections/
│       ├── BestSellersSection.tsx           # 베스트셀러 섹션
│       ├── HeroSection.tsx                  # 히어로 섹션
│       └── [SectionType].tsx                # 각 섹션 타입별 컴포넌트
└── documents/
    └── UI_SECTIONS_ARCHITECTURE.md          # 이 문서
```

## 🔄 데이터 플로우

### 1. 섹션 렌더링 프로세스 (홈페이지)
```
1. 페이지 로드
   ↓
2. GET /api/public/ui-sections
   ↓
3. visible=true인 섹션만 조회
   ↓
4. order 순서대로 정렬
   ↓
5. 각 섹션 타입에 맞는 컴포넌트 렌더링
   ↓
6. content 필드의 설정 적용
```

### 2. 베스트 상품 선택 프로세스
```
자동 선택 모드:
1. selectionMode = 'auto'
   ↓
2. 조건 확인
   - minSales: 최소 판매량
   - minRating: 최소 평점
   - dateRange: 기간 (일)
   ↓
3. 상품 테이블 조회
   - 판매량 >= minSales
   - 평점 >= minRating
   - 최근 dateRange일 내 데이터
   ↓
4. sortBy 기준 정렬
   ↓
5. productCount만큼 선택

수동 선택 모드:
1. selectionMode = 'manual'
   ↓
2. manualProducts 배열의 상품 ID 사용
   ↓
3. 선택된 상품 조회 및 표시
```

### 3. 섹션 편집 프로세스
```
1. /admin/ui-config/sections/[id] 접근
   ↓
2. GET /api/admin/ui-config/sections/[id]
   ↓
3. 섹션 데이터 로드
   ↓
4. 편집 폼 표시
   - 기본 정보 (제목, 부제목)
   - 타입별 설정
   - 레이아웃 옵션
   - 표시 옵션
   ↓
5. PUT /api/admin/ui-config/sections/[id]
   ↓
6. content 필드 업데이트
   ↓
7. 캐시 무효화
```

## 🎨 섹션 설정 옵션

### 1. 공통 설정
```typescript
interface CommonSettings {
  title: string;           // 섹션 제목
  subtitle?: string;       // 부제목
  visible: boolean;        // 표시 여부
  order: number;           // 순서
  backgroundColor?: string;// 배경색
  textColor?: string;      // 텍스트색
  layout: LayoutType;      // 레이아웃
}
```

### 2. 레이아웃 타입
```typescript
type LayoutType = 
  | 'grid'        // 그리드
  | 'carousel'    // 캐러셀 (슬라이더)
  | 'list'        // 리스트
  | 'masonry'     // 메이슨리 (Pinterest 스타일)
  | 'featured';   // 피처드 (대형+소형)
```

### 3. 상품 섹션 설정
```typescript
interface ProductSectionSettings {
  productCount: number;      // 표시할 상품 수
  showPrice: boolean;        // 가격 표시
  showRating: boolean;       // 평점 표시
  showBadge: boolean;        // 배지 표시
  sortBy: SortOption;        // 정렬 기준
  categoryFilter?: string;   // 카테고리 필터
  
  // 베스트셀러 전용
  selectionMode?: 'auto' | 'manual';
  minSales?: number;
  minRating?: number;
  dateRange?: number;
  manualProducts?: string[];
}
```

### 4. 정렬 옵션
```typescript
type SortOption = 
  | 'popularity'    // 인기순
  | 'newest'        // 신상품순
  | 'price-low'     // 가격 낮은순
  | 'price-high'    // 가격 높은순
  | 'rating'        // 평점순
  | 'discount'      // 할인률순
  | 'sales';        // 판매량순
```

## 📸 이미지 관리

### 1. 다국어 이미지 지원
```typescript
interface SectionImages {
  [languageCode: string]: string;  // 언어별 이미지 URL
}

// 예시
{
  "ko": "https://cdn.example.com/banner-ko.jpg",
  "en": "https://cdn.example.com/banner-en.jpg",
  "fr": "https://cdn.example.com/banner-fr.jpg"
}
```

### 2. 이미지 업로드 프로세스
```
1. SectionImageUpload 컴포넌트
   ↓
2. 언어별 탭 표시
   ↓
3. 각 언어별 이미지 업로드
   ↓
4. CDN 업로드 (Cloudinary/S3)
   ↓
5. URL을 content.images에 저장
```

## ⚠️ 주의사항

### 1. ID vs Key
- **ID**: UUID 형식 (예: '3532757e-6f43-443a-a66c-19f6127f4887')
- **Key**: 읽기 쉬운 문자열 (예: 'best-sellers')
- 두 가지 모두로 조회 가능

### 2. 순서 관리
- order 필드로 표시 순서 결정
- 새 섹션은 자동으로 마지막 순서 할당
- 드래그 앤 드롭으로 순서 변경 가능

### 3. 캐싱
- 공개 API는 캐싱 적용
- 섹션 수정 시 캐시 무효화 필요
- Redis 캐시 TTL: 10분

### 4. 타입 안정성
```typescript
// ❌ 잘못된 예
const content = JSON.parse(section.content);

// ✅ 올바른 예  
const content = typeof section.content === 'string' 
  ? JSON.parse(section.content) 
  : section.content || {};
```

## 🔧 유지보수 가이드

### 1. 새 섹션 타입 추가
```typescript
// 1. 타입 정의 추가
const newSectionType = {
  value: 'new-type',
  label: '새 타입',
  description: '설명',
  category: 'product'
};

// 2. 컴포넌트 생성
// components/sections/NewTypeSection.tsx

// 3. 렌더러에 추가
// app/(shop)/page.tsx
```

### 2. 섹션 백업
```sql
-- 전체 섹션 백업
CREATE TABLE ui_sections_backup AS 
SELECT * FROM ui_sections;

-- 특정 섹션 백업
INSERT INTO ui_sections_backup
SELECT * FROM ui_sections WHERE id = '...';
```

### 3. 섹션 복구
```sql
-- 백업에서 복구
INSERT INTO ui_sections
SELECT * FROM ui_sections_backup
WHERE id = '...'
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();
```

## 📊 성능 고려사항

### 1. 쿼리 최적화
```sql
-- 인덱스 생성
CREATE INDEX idx_ui_sections_order ON ui_sections("order");
CREATE INDEX idx_ui_sections_visible ON ui_sections(visible);
CREATE INDEX idx_ui_sections_key ON ui_sections(key);
```

### 2. 이미지 최적화
- Next.js Image 컴포넌트 사용
- 언어별 이미지 lazy loading
- WebP 포맷 우선 사용

### 3. 렌더링 최적화
- 섹션별 컴포넌트 code splitting
- Suspense로 비동기 로딩
- 스켈레톤 UI 적용

## 🐛 트러블슈팅

### 문제 1: 섹션이 표시되지 않음
- 원인: visible = false
- 해결: Admin에서 visible 체크

### 문제 2: 베스트 상품이 비어있음  
- 원인: 자동 선택 조건이 너무 엄격
- 해결: minSales, minRating 조정

### 문제 3: 이미지가 깨짐
- 원인: 언어별 이미지 누락
- 해결: 기본 이미지 폴백 설정