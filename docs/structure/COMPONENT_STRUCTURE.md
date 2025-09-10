# 🧩 컴포넌트 구조 문서
*E-Market Korea - 중고 상품 커머스 플랫폼*

## 📊 컴포넌트 시스템 개요
```yaml
UI 라이브러리: shadcn/ui
스타일링: Tailwind CSS
컴포넌트 수: 100+ 컴포넌트
아키텍처: Compound Component Pattern
상태 관리: Zustand + React Context
타입스크립트: 완전 타입 지원
```

## 🏗️ 컴포넌트 계층 구조

### 기본 UI 컴포넌트 (`/components/ui/`)
shadcn/ui 기반의 기본 컴포넌트들

```typescript
interface BaseUIComponents {
  // Form Controls
  Button: {
    variants: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];
    sizes: ['default', 'sm', 'lg', 'icon'];
    features: ['loading', 'disabled', 'asChild'];
  };
  
  Input: {
    types: ['text', 'email', 'password', 'number', 'search'];
    features: ['placeholder', 'disabled', 'error'];
  };
  
  Textarea: {
    features: ['auto-resize', 'character-count', 'error-state'];
  };
  
  Select: {
    features: ['single', 'multiple', 'searchable', 'async'];
    components: ['SelectTrigger', 'SelectContent', 'SelectItem'];
  };
  
  Checkbox: {
    states: ['checked', 'unchecked', 'indeterminate'];
    features: ['label', 'description', 'error'];
  };
  
  RadioGroup: {
    orientation: ['horizontal', 'vertical'];
    features: ['label', 'description', 'error'];
  };
  
  Switch: {
    sizes: ['default', 'sm', 'lg'];
    features: ['label', 'description'];
  };

  // Layout Components
  Card: {
    components: ['CardHeader', 'CardTitle', 'CardDescription', 'CardContent', 'CardFooter'];
    variants: ['default', 'outline'];
  };
  
  Separator: {
    orientation: ['horizontal', 'vertical'];
    decorative: boolean;
  };
  
  ScrollArea: {
    features: ['horizontal', 'vertical', 'both'];
    scrollbar: 'custom-styled';
  };
  
  Tabs: {
    components: ['TabsList', 'TabsTrigger', 'TabsContent'];
    orientation: ['horizontal', 'vertical'];
  };
  
  Sheet: {
    positions: ['top', 'right', 'bottom', 'left'];
    components: ['SheetTrigger', 'SheetContent', 'SheetHeader', 'SheetFooter'];
  };

  // Data Display
  Table: {
    components: ['TableHeader', 'TableBody', 'TableFooter', 'TableRow', 'TableHead', 'TableCell'];
    features: ['sorting', 'filtering', 'pagination'];
  };
  
  Badge: {
    variants: ['default', 'secondary', 'destructive', 'outline'];
    features: ['removable', 'clickable'];
  };
  
  Avatar: {
    components: ['AvatarImage', 'AvatarFallback'];
    sizes: ['sm', 'md', 'lg', 'xl'];
  };

  // Feedback Components
  Alert: {
    variants: ['default', 'destructive'];
    components: ['AlertTitle', 'AlertDescription'];
  };
  
  Toast: {
    variants: ['default', 'destructive'];
    positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  };
  
  Progress: {
    features: ['determinate', 'indeterminate', 'circular', 'linear'];
  };

  // Navigation
  NavigationMenu: {
    components: ['NavigationMenuList', 'NavigationMenuItem', 'NavigationMenuContent'];
    features: ['keyboard-navigation', 'hover-trigger'];
  };
  
  Breadcrumb: {
    components: ['BreadcrumbList', 'BreadcrumbItem', 'BreadcrumbLink', 'BreadcrumbSeparator'];
  };

  // Overlay Components
  Dialog: {
    components: ['DialogTrigger', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogDescription', 'DialogFooter'];
    features: ['modal', 'non-modal', 'nested'];
  };
  
  Popover: {
    components: ['PopoverTrigger', 'PopoverContent'];
    placement: ['top', 'bottom', 'left', 'right', 'auto'];
  };
  
  Tooltip: {
    components: ['TooltipTrigger', 'TooltipContent'];
    placement: ['top', 'bottom', 'left', 'right'];
  };
  
  DropdownMenu: {
    components: ['DropdownMenuTrigger', 'DropdownMenuContent', 'DropdownMenuItem'];
    features: ['sub-menus', 'checkable-items', 'radio-items'];
  };
}
```

### 비즈니스 컴포넌트 (`/components/`)

#### 상품 관련 컴포넌트
```typescript
interface ProductComponents {
  ProductCard: {
    path: '/components/ProductCard.tsx';
    features: ['이미지 갤러리', '가격 표시', '상태 배지', '찜 기능'];
    variants: ['grid', 'list', 'featured'];
    props: {
      product: Product;
      variant?: 'grid' | 'list' | 'featured';
      showQuickActions?: boolean;
    };
  };
  
  ProductGrid: {
    path: '/components/ProductGrid.tsx';
    features: ['무한 스크롤', '필터링', '정렬', '로딩 상태'];
    props: {
      products: Product[];
      loading?: boolean;
      hasMore?: boolean;
      onLoadMore?: () => void;
    };
  };
  
  ProductDetail: {
    path: '/components/ProductDetail.tsx';
    features: ['이미지 갤러리', '옵션 선택', '리뷰', '연관상품'];
    components: ['ImageGallery', 'ProductInfo', 'SellerInfo', 'ReviewSection'];
  };
  
  ProductImageGallery: {
    path: '/components/ProductImageGallery.tsx';
    features: ['썸네일', '확대', '슬라이드', '모바일 터치'];
    libraries: ['swiper', 'react-image-gallery'];
  };
  
  ProductFilters: {
    path: '/components/ProductFilters.tsx';
    features: ['가격 범위', '카테고리', '상품 상태', '지역'];
    props: {
      filters: FilterState;
      onFilterChange: (filters: FilterState) => void;
    };
  };
  
  ProductSearch: {
    path: '/components/ProductSearch.tsx';
    features: ['자동완성', '최근 검색어', '인기 검색어', '필터 통합'];
    debounce: '300ms';
  };
}
```

#### 레이아웃 컴포넌트
```typescript
interface LayoutComponents {
  Header: {
    path: '/components/Header.tsx';
    features: ['로고', '네비게이션', '검색', '사용자 메뉴', '언어 선택'];
    responsive: 'mobile-first';
    components: ['Navigation', 'UserMenu', 'LanguageSwitch'];
  };
  
  Footer: {
    path: '/components/Footer.tsx';
    features: ['링크 섹션', '회사 정보', '소셜 미디어', '저작권'];
    sections: ['about', 'support', 'legal', 'social'];
  };
  
  Sidebar: {
    path: '/components/Sidebar.tsx';
    features: ['접기/펼치기', '메뉴 하이라이트', '권한 기반 표시'];
    variants: ['admin', 'user'];
  };
  
  Navigation: {
    path: '/components/Navigation.tsx';
    features: ['메뉴 하이라이트', '드롭다운', '모바일 햄버거'];
    data: 'database-driven';
  };
  
  Breadcrumbs: {
    path: '/components/Breadcrumbs.tsx';
    features: ['자동 생성', 'SEO 지원', '구조화된 데이터'];
    generation: 'route-based';
  };
}
```

#### 폼 컴포넌트
```typescript
interface FormComponents {
  FormField: {
    path: '/components/forms/FormField.tsx';
    features: ['라벨', '에러 메시지', '헬프 텍스트', '필수 표시'];
    validation: 'react-hook-form';
  };
  
  LoginForm: {
    path: '/components/forms/LoginForm.tsx';
    features: ['소셜 로그인', '비밀번호 표시/숨김', '자동 로그인'];
    providers: ['google', 'naver', 'kakao'];
  };
  
  RegisterForm: {
    path: '/components/forms/RegisterForm.tsx';
    features: ['실시간 검증', '약관 동의', '이메일 인증'];
    validation: 'zod';
  };
  
  ProductForm: {
    path: '/components/forms/ProductForm.tsx';
    features: ['이미지 업로드', '옵션 관리', '미리보기'];
    steps: ['basic', 'images', 'options', 'shipping'];
  };
  
  CheckoutForm: {
    path: '/components/forms/CheckoutForm.tsx';
    features: ['주소 입력', '결제 수단', '쿠폰 적용'];
    integration: ['daum-postcode', 'toss-payments'];
  };
}
```

#### UI 섹션 컴포넌트
```typescript
interface UISectionComponents {
  HeroSection: {
    path: '/components/sections/HeroSection.tsx';
    features: ['슬라이드', '자동 재생', '내비게이션', '모바일 최적화'];
    animation: 'framer-motion';
  };
  
  FeaturedProducts: {
    path: '/components/sections/FeaturedProducts.tsx';
    features: ['자동 갱신', '더보기', '카테고리 필터'];
    data: 'server-side';
  };
  
  CategoriesSection: {
    path: '/components/sections/CategoriesSection.tsx';
    features: ['그리드 레이아웃', '아이콘 표시', '상품 수 표시'];
    layout: 'masonry';
  };
  
  PromoSection: {
    path: '/components/sections/PromoSection.tsx';
    features: ['배너 이미지', 'CTA 버튼', '만료 시간'];
    variants: ['banner', 'card', 'inline'];
  };
  
  NewArrivals: {
    path: '/components/sections/NewArrivals.tsx';
    features: ['최신 상품', '자동 갱신', '슬라이더'];
    updateInterval: '10분';
  };
  
  QuickLinks: {
    path: '/components/sections/QuickLinks.tsx';
    features: ['아이콘 링크', '빠른 접근', '관리자 편집'];
    grid: 'responsive';
  };
}
```

### 관리자 전용 컴포넌트 (`/components/admin/`)

#### UI 설정 컴포넌트
```typescript
interface AdminUIComponents {
  HeaderConfigDB: {
    path: '/components/admin/ui-config/HeaderConfigDB.tsx';
    features: ['메뉴 관리', '드래그앤드롭', '다국어 지원'];
    data: 'real-time-sync';
  };
  
  FooterConfigDB: {
    path: '/components/admin/ui-config/FooterConfigDB.tsx';
    features: ['섹션 관리', '링크 관리', '소셜 미디어'];
    sections: ['company', 'links', 'social', 'legal'];
  };
  
  SectionsConfigTab: {
    path: '/components/admin/ui-config/SectionsConfigTab.tsx';
    features: ['섹션 CRUD', '순서 변경', '가시성 제어'];
    dragDrop: 'react-beautiful-dnd';
  };
  
  SectionManagerTab: {
    path: '/components/admin/ui-config/SectionManagerTab.tsx';
    features: ['템플릿 관리', '미리보기', '일괄 편집'];
    templates: 'predefined';
  };
  
  CategoryConfigTab: {
    path: '/components/admin/ui-config/CategoryConfigTab.tsx';
    features: ['계층형 관리', '이미지 업로드', '순서 변경'];
    tree: 'react-sortable-tree';
  };
}
```

#### 데이터 관리 컴포넌트
```typescript
interface AdminDataComponents {
  AdminTable: {
    path: '/components/admin/AdminTable.tsx';
    features: ['정렬', '필터', '페이지네이션', '일괄 작업'];
    libraries: ['@tanstack/react-table'];
  };
  
  DataImportExport: {
    path: '/components/admin/DataImportExport.tsx';
    features: ['엑셀 업로드', '데이터 검증', '진행률 표시'];
    formats: ['csv', 'xlsx', 'json'];
  };
  
  StatsDashboard: {
    path: '/components/admin/StatsDashboard.tsx';
    features: ['실시간 데이터', '차트', '필터', '내보내기'];
    charts: 'recharts';
  };
  
  AuditLog: {
    path: '/components/admin/AuditLog.tsx';
    features: ['활동 로그', '필터링', '검색', '내보내기'];
    realTime: 'websocket';
  };
}
```

### 공통 유틸리티 컴포넌트

#### 피드백 컴포넌트
```typescript
interface FeedbackComponents {
  Loading: {
    path: '/components/common/Loading.tsx';
    variants: ['spinner', 'skeleton', 'pulse', 'progress'];
    sizes: ['sm', 'md', 'lg'];
  };
  
  ErrorBoundary: {
    path: '/components/common/ErrorBoundary.tsx';
    features: ['에러 캐치', '폴백 UI', '리포트', '재시도'];
    logging: 'automatic';
  };
  
  ConfirmDialog: {
    path: '/components/common/ConfirmDialog.tsx';
    features: ['커스텀 메시지', '위험 수준', '키보드 지원'];
    variants: ['info', 'warning', 'danger'];
  };
  
  NotificationToast: {
    path: '/components/common/NotificationToast.tsx';
    features: ['자동 닫기', '액션 버튼', '위치 설정'];
    positions: ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
  };
}
```

#### 미디어 컴포넌트
```typescript
interface MediaComponents {
  ImageUpload: {
    path: '/components/common/ImageUpload.tsx';
    features: ['드래그앤드롭', '미리보기', '진행률', '에러 처리'];
    formats: ['jpg', 'png', 'webp', 'avif'];
    maxSize: '10MB';
  };
  
  OptimizedImage: {
    path: '/components/common/OptimizedImage.tsx';
    features: ['지연 로딩', '자동 최적화', '폴백 이미지'];
    integration: 'next/image';
  };
  
  VideoPlayer: {
    path: '/components/common/VideoPlayer.tsx';
    features: ['컨트롤', '자막', '품질 선택', '전체화면'];
    library: 'video.js';
  };
}
```

## 🎨 스타일링 시스템

### Tailwind CSS 구성
```typescript
interface TailwindConfig {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))';
        secondary: 'hsl(var(--secondary))';
        background: 'hsl(var(--background))';
        foreground: 'hsl(var(--foreground))';
      };
      fontFamily: {
        sans: ['Inter', 'sans-serif'];
        mono: ['JetBrains Mono', 'monospace'];
      };
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out';
        'slide-up': 'slideUp 0.3s ease-out';
      };
    };
  };
  
  plugins: [
    '@tailwindcss/forms',
    '@tailwindcss/typography',
    'tailwindcss-animate'
  ];
}
```

### CSS Variables 시스템
```css
/* globals.css */
:root {
  /* Colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  
  /* Spacing */
  --header-height: 4rem;
  --sidebar-width: 16rem;
  --footer-height: 8rem;
  
  /* Animation */
  --animation-fast: 150ms;
  --animation-normal: 300ms;
  --animation-slow: 500ms;
}
```

## 🔧 컴포넌트 패턴

### Compound Component Pattern
```typescript
// Example: Card Component
interface CardComponent {
  Card: React.FC<CardProps>;
  Header: React.FC<CardHeaderProps>;
  Title: React.FC<CardTitleProps>;
  Description: React.FC<CardDescriptionProps>;
  Content: React.FC<CardContentProps>;
  Footer: React.FC<CardFooterProps>;
}

// Usage
<Card>
  <Card.Header>
    <Card.Title>Product Title</Card.Title>
    <Card.Description>Product description</Card.Description>
  </Card.Header>
  <Card.Content>
    {/* Content */}
  </Card.Content>
  <Card.Footer>
    {/* Actions */}
  </Card.Footer>
</Card>
```

### Render Props Pattern
```typescript
interface RenderPropsExample {
  DataProvider: {
    children: (data: Data, loading: boolean, error: Error | null) => React.ReactNode;
    fetchData: () => void;
  };
}

// Usage
<DataProvider>
  {(data, loading, error) => (
    loading ? <Loading /> : 
    error ? <Error error={error} /> :
    <DataDisplay data={data} />
  )}
</DataProvider>
```

### Hook-Based State Management
```typescript
interface ComponentHooks {
  useProductCard: {
    state: {
      isFavorite: boolean;
      isLoading: boolean;
    };
    actions: {
      toggleFavorite: () => void;
      addToCart: () => void;
    };
  };
  
  useProductFilters: {
    state: FilterState;
    actions: {
      setFilter: (key: string, value: any) => void;
      resetFilters: () => void;
      applyFilters: () => void;
    };
  };
  
  useImageUpload: {
    state: {
      files: File[];
      uploading: boolean;
      progress: number;
    };
    actions: {
      uploadFiles: (files: File[]) => Promise<string[]>;
      removeFile: (index: number) => void;
    };
  };
}
```

## 📱 반응형 컴포넌트

### 반응형 전략
```typescript
interface ResponsiveStrategy {
  breakpoints: {
    sm: '640px';
    md: '768px';
    lg: '1024px';
    xl: '1280px';
    '2xl': '1536px';
  };
  
  patterns: {
    mobileFirst: 'base styles for mobile, then desktop overrides';
    conditionalRendering: 'different components for different screen sizes';
    responsiveProps: 'props that change based on screen size';
  };
}
```

### 모바일 최적화
```typescript
interface MobileOptimization {
  touchTargets: {
    minSize: '44px';
    spacing: '8px';
  };
  
  gestures: {
    swipe: 'product image gallery, category navigation';
    pinchZoom: 'product detail images';
    pullToRefresh: 'product lists';
  };
  
  performance: {
    lazyLoading: 'all images and heavy components';
    codesplitting: 'route-based and component-based';
    bundleSize: 'optimized for mobile networks';
  };
}
```

## 🌐 국제화 컴포넌트

### 다국어 지원
```typescript
interface I18nComponents {
  LanguageSwitch: {
    path: '/components/LanguageSwitch.tsx';
    features: ['현재 언어 표시', '언어 선택', '자동 전환'];
    storage: 'cookie + localStorage';
  };
  
  TranslatedText: {
    path: '/components/TranslatedText.tsx';
    features: ['실시간 번역', '폴백 언어', '번역 상태'];
    fallback: 'korean';
  };
  
  RTLSupport: {
    features: ['오른쪽에서 왼쪽', '레이아웃 미러링', 'CSS 로직 조정'];
    languages: ['arabic', 'hebrew'];
  };
}
```

### 문화적 적응
```typescript
interface CulturalAdaptation {
  currency: {
    display: 'locale-aware';
    formatting: 'Intl.NumberFormat';
  };
  
  dateTime: {
    display: 'locale-aware';
    formatting: 'Intl.DateTimeFormat';
  };
  
  colors: {
    cultural: 'red means danger in Western cultures, luck in Asian cultures';
    adaptation: 'context-sensitive color choices';
  };
}
```

## 🧪 테스팅 전략

### 테스트 유형
```typescript
interface TestingStrategy {
  unit: {
    framework: 'Jest + React Testing Library';
    coverage: '80%+';
    focus: 'component logic, hooks, utilities';
  };
  
  integration: {
    framework: 'Jest + MSW';
    coverage: '70%+';
    focus: 'API integration, form submission';
  };
  
  e2e: {
    framework: 'Playwright';
    coverage: 'critical user flows';
    focus: 'user scenarios, cross-browser';
  };
  
  visual: {
    framework: 'Chromatic';
    coverage: 'all UI components';
    focus: 'visual regression, responsive design';
  };
}
```

### 테스트 도구
```typescript
interface TestingTools {
  '@testing-library/react': 'component testing';
  '@testing-library/jest-dom': 'custom matchers';
  'msw': 'API mocking';
  '@storybook/react': 'component development';
  'chromatic': 'visual testing';
}
```

## 📚 스토리북 통합

### 컴포넌트 문서화
```typescript
interface StorybookIntegration {
  stories: {
    location: '/stories/**/*.stories.tsx';
    format: 'CSF 3.0';
  };
  
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-design-tokens',
    'storybook-dark-mode'
  ];
  
  features: {
    docs: 'auto-generated documentation';
    controls: 'interactive component props';
    viewport: 'responsive testing';
    accessibility: 'a11y testing';
  };
}
```

## ⚡ 성능 최적화

### 컴포넌트 최적화
```typescript
interface PerformanceOptimization {
  memoization: {
    React.memo: 'expensive rendering components';
    useMemo: 'expensive calculations';
    useCallback: 'stable function references';
  };
  
  codesplitting: {
    lazy: 'React.lazy for route components';
    dynamic: 'dynamic imports for heavy components';
    suspense: 'loading boundaries';
  };
  
  bundleOptimization: {
    treeshaking: 'unused code elimination';
    compression: 'gzip + brotli';
    caching: 'aggressive browser caching';
  };
}
```

### 렌더링 최적화
```typescript
interface RenderingOptimization {
  virtualization: {
    library: 'react-window';
    usage: 'large lists, tables';
  };
  
  imageOptimization: {
    nextImage: 'automatic optimization';
    lazyLoading: 'intersection observer';
    placeholders: 'blur, shimmer effects';
  };
  
  stateManagement: {
    zustand: 'global state';
    context: 'component tree state';
    reducer: 'complex state logic';
  };
}
```

---

*이 문서는 E-Market Korea 프로젝트의 완전한 컴포넌트 구조 매뉴얼입니다.*