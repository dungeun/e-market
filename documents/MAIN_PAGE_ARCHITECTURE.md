# 메인 페이지 시스템 아키텍처 문서

## 📌 개요
홈페이지(메인 페이지)는 **완전히 동적**으로 구성됩니다. 관리자가 설정한 UI 섹션들이 순서대로 렌더링되며, 각 섹션의 콘텐츠도 실시간으로 변경 가능합니다.

## 🏗️ 시스템 구조

### 1. 페이지 구성 요소

```typescript
// app/(shop)/page.tsx

메인 페이지 구성:
├── 헤더 (Header)
├── 동적 섹션들 (Dynamic Sections)
│   ├── 히어로 배너
│   ├── 카테고리 쇼케이스
│   ├── 베스트셀러
│   ├── 신상품
│   ├── 특별 할인
│   └── ... (관리자 설정)
└── 푸터 (Footer)
```

### 2. 데이터 로딩 전략

#### 2.1 서버 사이드 렌더링 (SSR)
```typescript
// 초기 로드 시 서버에서 데이터 페칭
async function HomePage() {
  // 1. UI 섹션 정보 로드
  const sections = await fetch('/api/public/ui-sections');
  
  // 2. 각 섹션별 데이터 로드 (병렬)
  const sectionData = await Promise.all(
    sections.map(section => loadSectionData(section))
  );
  
  // 3. 렌더링
  return <DynamicSections sections={sectionData} />;
}
```

#### 2.2 캐싱 전략
```
1. 정적 데이터 (캐시 적용)
   - UI 섹션 구조
   - 카테고리 목록
   - 언어팩 데이터
   
2. 동적 데이터 (실시간)
   - 상품 정보
   - 재고 상태
   - 가격 정보
   
3. 하이브리드 캐싱
   - 베스트셀러: 1시간 캐시
   - 신상품: 30분 캐시
   - 프로모션: 실시간
```

### 3. 섹션 렌더링 시스템

#### 3.1 섹션 렌더러
```typescript
// components/sections/SectionRenderer.tsx

function SectionRenderer({ section }) {
  switch(section.type) {
    case 'hero':
      return <HeroSection {...section} />;
    case 'best-sellers':
      return <BestSellersSection {...section} />;
    case 'new-arrivals':
      return <NewArrivalsSection {...section} />;
    // ... 각 섹션 타입별 컴포넌트
    default:
      return null;
  }
}
```

#### 3.2 섹션 컴포넌트 구조
```typescript
// components/sections/BestSellersSection.tsx

interface BestSellersSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  content: {
    layout: 'grid' | 'carousel' | 'list';
    productCount: number;
    selectionMode: 'auto' | 'manual';
    // ... 설정들
  };
  products: Product[];  // 실제 상품 데이터
}
```

### 4. 상품 데이터 로딩

#### 4.1 자동 선택 모드 (베스트셀러)
```sql
-- 베스트 상품 자동 선택 쿼리
SELECT p.*, 
       COUNT(oi.id) as sales_count,
       AVG(r.rating) as avg_rating
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id
LEFT JOIN reviews r ON p.id = r.product_id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
  AND o.status = 'completed'
GROUP BY p.id
HAVING COUNT(oi.id) >= 10  -- minSales
  AND AVG(r.rating) >= 4.0  -- minRating
ORDER BY sales_count DESC
LIMIT 8;  -- productCount
```

#### 4.2 수동 선택 모드
```sql
-- 특정 상품 ID로 조회
SELECT * FROM products
WHERE id = ANY($1::uuid[])
ORDER BY array_position($1::uuid[], id);
```

### 5. 파일 구조

```
commerce-nextjs/
├── app/
│   └── (shop)/
│       └── page.tsx                      # 메인 페이지
├── components/
│   ├── sections/
│   │   ├── SectionRenderer.tsx          # 섹션 렌더러
│   │   ├── HeroSection.tsx              # 히어로 섹션
│   │   ├── BestSellersSection.tsx       # 베스트셀러
│   │   ├── NewArrivalsSection.tsx       # 신상품
│   │   ├── CategorySection.tsx          # 카테고리
│   │   ├── PromoSection.tsx             # 프로모션
│   │   └── [type]Section.tsx            # 각 타입별 섹션
│   ├── product/
│   │   ├── ProductCard.tsx              # 상품 카드
│   │   ├── ProductGrid.tsx              # 상품 그리드
│   │   ├── ProductCarousel.tsx          # 상품 캐러셀
│   │   └── ProductList.tsx              # 상품 리스트
│   └── common/
│       ├── SectionTitle.tsx             # 섹션 타이틀
│       ├── SectionContainer.tsx         # 섹션 컨테이너
│       └── LoadingSection.tsx           # 로딩 스켈레톤
└── hooks/
    ├── useSections.ts                    # 섹션 데이터 훅
    ├── useProducts.ts                    # 상품 데이터 훅
    └── useInfiniteScroll.ts              # 무한 스크롤 훅
```

## 🔄 데이터 플로우

### 1. 페이지 로드 시퀀스
```
1. 사용자가 홈페이지 접속
   ↓
2. Next.js 서버 사이드 렌더링
   ↓
3. UI 섹션 정보 로드
   GET /api/public/ui-sections
   ↓
4. 각 섹션별 데이터 병렬 로드
   - 베스트셀러 → GET /api/products/best-sellers
   - 신상품 → GET /api/products/new-arrivals
   - 카테고리 → GET /api/categories
   ↓
5. HTML 생성 및 전송
   ↓
6. 클라이언트 하이드레이션
   ↓
7. 추가 인터랙션 대기
```

### 2. 실시간 업데이트 플로우
```
1. 관리자가 섹션 수정
   ↓
2. PUT /api/admin/ui-config/sections/[id]
   ↓
3. 캐시 무효화
   ↓
4. Socket.io 이벤트 발생 (옵션)
   ↓
5. 클라이언트 자동 리프레시
```

### 3. 언어 전환 플로우
```
1. 사용자가 언어 선택
   ↓
2. LanguageContext 업데이트
   ↓
3. 언어팩 리로드
   GET /api/public/language-packs
   ↓
4. 섹션별 언어 데이터 적용
   - 제목/부제목 번역
   - 언어별 이미지 변경
   ↓
5. 리렌더링
```

## 🎨 레이아웃 시스템

### 1. 반응형 디자인
```css
/* 브레이크포인트 */
- Mobile: < 640px
- Tablet: 640px - 1024px  
- Desktop: > 1024px

/* 그리드 시스템 */
- Mobile: 1-2 columns
- Tablet: 2-3 columns
- Desktop: 4-6 columns
```

### 2. 섹션별 레이아웃
```typescript
// Grid Layout (기본)
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">

// Carousel Layout
<Swiper slidesPerView={1} md:slidesPerView={3} lg:slidesPerView={4}>

// List Layout  
<div className="flex flex-col space-y-4">

// Masonry Layout
<div className="columns-1 md:columns-3 lg:columns-4 gap-4">
```

### 3. 스켈레톤 UI
```typescript
// 섹션 로딩 중 표시
<div className="animate-pulse">
  <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
  <div className="grid grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-64 bg-gray-200 rounded" />
    ))}
  </div>
</div>
```

## ⚡ 성능 최적화

### 1. 이미지 최적화
```typescript
// Next.js Image 컴포넌트 사용
import Image from 'next/image';

<Image
  src={product.image}
  alt={product.name}
  width={300}
  height={300}
  loading="lazy"        // Lazy loading
  placeholder="blur"    // 블러 플레이스홀더
  quality={75}         // 품질 조정
/>
```

### 2. Code Splitting
```typescript
// 동적 임포트로 번들 크기 감소
const HeroSection = dynamic(
  () => import('@/components/sections/HeroSection'),
  { ssr: true }
);
```

### 3. 데이터 프리페칭
```typescript
// 링크 호버 시 다음 페이지 프리페치
<Link href="/products" prefetch>
  모든 상품 보기
</Link>
```

### 4. 캐싱 헤더
```typescript
// API 응답 캐싱 설정
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 's-maxage=3600, stale-while-revalidate'
  }
});
```

## 📊 모니터링

### 1. Core Web Vitals
```
목표 메트릭:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
```

### 2. 섹션별 로딩 시간
```typescript
// Performance API 사용
performance.mark('section-start');
// 섹션 렌더링
performance.mark('section-end');
performance.measure('section-load', 'section-start', 'section-end');
```

### 3. 에러 트래킹
```typescript
// Sentry 또는 로깅 시스템
try {
  await loadSectionData(section);
} catch (error) {
  logger.error('Section load failed', {
    sectionId: section.id,
    error: error.message
  });
  // 폴백 UI 표시
}
```

## ⚠️ 주의사항

### 1. SEO 최적화
- 서버 사이드 렌더링 필수
- 메타 태그 동적 생성
- 구조화된 데이터 (JSON-LD)

### 2. 접근성 (A11y)
- 시맨틱 HTML 사용
- ARIA 속성 적용
- 키보드 네비게이션 지원

### 3. 에러 처리
- 섹션 로드 실패 시 폴백
- 이미지 로드 실패 시 기본 이미지
- API 타임아웃 처리

## 🔧 유지보수 가이드

### 1. 섹션 순서 변경
```sql
-- 순서 변경
UPDATE ui_sections SET "order" = 2 WHERE id = 'section-1';
UPDATE ui_sections SET "order" = 1 WHERE id = 'section-2';
```

### 2. 섹션 임시 비활성화
```sql
-- 특정 섹션 숨기기
UPDATE ui_sections SET visible = false WHERE id = 'section-id';
```

### 3. 성능 문제 해결
```typescript
// 1. 섹션별 로딩 분석
console.time(`Section ${section.id}`);
await loadSection(section);
console.timeEnd(`Section ${section.id}`);

// 2. 병목 구간 찾기
// Chrome DevTools Performance 탭 활용

// 3. 캐싱 전략 조정
// Redis TTL 증가, CDN 캐싱 활용
```

## 🐛 트러블슈팅

### 문제 1: 페이지 로딩이 느림
- 원인: 많은 섹션 동시 로드
- 해결: 
  - Above-the-fold 섹션 우선 로드
  - 나머지는 Intersection Observer로 지연 로드

### 문제 2: 레이아웃 깨짐
- 원인: 동적 콘텐츠 크기 변경
- 해결:
  - aspect-ratio 고정
  - 스켈레톤 UI 크기 일치

### 문제 3: 언어 전환 시 깜빡임
- 원인: 전체 페이지 리렌더링
- 해결:
  - 텍스트만 선택적 업데이트
  - CSS 트랜지션 적용