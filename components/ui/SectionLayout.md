# SectionLayout 컴포넌트

재사용 가능한 섹션 레이아웃 컴포넌트로, 전자상거래 플랫폼의 다양한 섹션들에서 공통으로 사용되는 패턴을 통합한 컴포넌트입니다.

## 주요 특징

- **반응형 디자인**: 모바일 우선 설계로 다양한 화면 크기에 최적화
- **다양한 레이아웃**: Grid, Carousel, List 레이아웃 지원
- **테마 지원**: Light/Dark 테마 자동 전환
- **로딩 상태**: 스켈레톤 UI 내장
- **에러 처리**: 빈 상태 및 에러 상태 UI
- **SEO 최적화**: 적절한 HTML 시맨틱 구조
- **접근성**: ARIA 레이블 및 키보드 네비게이션 지원

## 설치 및 의존성

```tsx
import SectionLayout from '@/components/ui/SectionLayout';
import { Trophy, TrendingUp } from 'lucide-react';
```

## 기본 사용법

### 1. 기본 그리드 레이아웃

```tsx
<SectionLayout
  theme="light"
  layout="grid"
  columns={4}
  header={{
    title: "베스트 상품",
    subtitle: "인기 상품을 확인하세요",
    icon: Trophy
  }}
>
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</SectionLayout>
```

### 2. 로딩 상태

```tsx
<SectionLayout
  loading={true}
  skeleton={{
    count: 6,
    height: '300px',
    showHeader: true
  }}
  header={{ title: "신상품" }}
>
  {/* 로딩 중에는 스켈레톤 UI가 표시됩니다 */}
</SectionLayout>
```

### 3. 다크 테마

```tsx
<SectionLayout
  theme="dark"
  header={{
    title: "트렌딩 상품",
    icon: Flame,
    secondaryIcon: TrendingUp
  }}
  cta={{
    text: "더보기",
    href: "/trending",
    variant: "outline"
  }}
>
  {trendingProducts}
</SectionLayout>
```

## Props 인터페이스

### SectionLayoutProps

| Prop | 타입 | 기본값 | 설명 |
|------|------|---------|------|
| `children` | `ReactNode` | - | 섹션 내용 (필수) |
| `layout` | `'grid' \| 'carousel' \| 'list'` | `'grid'` | 레이아웃 타입 |
| `columns` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `4` | 그리드 컬럼 수 |
| `theme` | `'light' \| 'dark'` | `'light'` | 테마 |
| `header` | `SectionHeader` | - | 헤더 설정 |
| `cta` | `SectionCTA` | - | CTA 버튼 설정 |
| `loading` | `boolean` | `false` | 로딩 상태 |
| `empty` | `boolean` | `false` | 빈 상태 |
| `responsive` | `ResponsiveConfig` | - | 반응형 설정 |

### SectionHeader

```tsx
interface SectionHeader {
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  secondaryIcon?: LucideIcon;
  badge?: {
    text: string;
    color?: string;
  };
  centerAlign?: boolean;
}
```

### 반응형 설정

```tsx
interface ResponsiveConfig {
  mobile?: GridColumns;    // < 768px
  tablet?: GridColumns;    // 768px - 1024px  
  desktop?: GridColumns;   // > 1024px
}
```

## 사용 사례

### 1. BestSellers 섹션

```tsx
const BestSellers = ({ products, loading }) => (
  <SectionLayout
    theme="light"
    columns={4}
    responsive={{ mobile: 2, tablet: 4, desktop: 4 }}
    header={{
      title: "베스트 상품",
      subtitle: "이번 달 베스트",
      icon: Trophy,
      secondaryIcon: TrendingUp
    }}
    loading={loading}
    empty={products.length === 0}
    cta={{
      text: "베스트셀러 전체보기",
      href: "/best-sellers",
      variant: "outline"
    }}
  >
    {products.map((product, index) => (
      <ProductCard
        key={product.id}
        product={product}
        showRanking={index + 1}
      />
    ))}
  </SectionLayout>
);
```

### 2. TrendingProducts 섹션

```tsx
const TrendingProducts = ({ products }) => (
  <SectionLayout
    theme="dark"
    columns={4}
    header={{
      title: "트렌딩 상품",
      icon: Flame,
      secondaryIcon: TrendingUp
    }}
    cta={{
      text: "트렌딩 상품 더보기",
      href: "/trending",
      variant: "outline"
    }}
  >
    {products.map((product, index) => (
      <ProductCard
        key={product.id}
        product={product}
        badgeText={`HOT #${index + 1}`}
      />
    ))}
  </SectionLayout>
);
```

### 3. NewArrivals 섹션

```tsx
const NewArrivals = ({ products }) => (
  <SectionLayout
    theme="light"
    columns={6}
    responsive={{ mobile: 2, tablet: 4, desktop: 6 }}
    header={{
      title: "신상품",
      icon: Sparkles,
      secondaryIcon: Sparkles
    }}
    cta={{
      text: "신상품 더보기",
      href: "/new-arrivals"
    }}
  >
    {products.map(product => (
      <ProductCard
        key={product.id}
        product={product}
        badgeText="NEW"
      />
    ))}
  </SectionLayout>
);
```

## 성능 최적화

### 1. 스켈레톤 로딩

```tsx
// 적절한 스켈레톤 설정
skeleton={{
  count: columns,           // 그리드 컬럼 수와 동일
  height: '300px',         // 실제 콘텐츠 높이와 유사
  showHeader: !!header     // 헤더가 있을 때만 스켈레톤 헤더 표시
}}
```

### 2. 조건부 렌더링

```tsx
// 빈 상태 최적화
empty={!loading && products.length === 0}
emptyState={{
  message: "상품이 없습니다",
  description: "나중에 다시 확인해주세요",
  action: {
    text: "홈으로",
    href: "/"
  }
}}
```

## 접근성 고려사항

### 1. ARIA 레이블

```tsx
section={{
  'aria-label': '베스트셀러 상품 목록',
  'aria-labelledby': 'bestseller-heading'
}}
```

### 2. 키보드 네비게이션

- 모든 CTA 버튼은 키보드로 접근 가능
- Tab 순서는 논리적으로 구성
- Skip links 지원 (필요시)

## 브라우저 지원

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- 모바일 Safari 12+
- Chrome Mobile 60+

## 변경 로그

### v1.0.0
- 초기 릴리즈
- Grid, Carousel, List 레이아웃 지원
- Light/Dark 테마
- 반응형 디자인
- 스켈레톤 로딩
- 접근성 지원

## 기여하기

버그 리포트나 기능 요청은 GitHub Issues를 통해 제출해주세요.

## 라이선스

MIT License