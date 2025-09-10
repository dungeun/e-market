# 🎨 UI 섹션 구조 문서
*E-Market Korea - 중고 상품 커머스 플랫폼*

## 📊 UI 섹션 시스템 개요
```yaml
UI 관리 시스템: 데이터베이스 기반 동적 구성
관리 페이지: /admin/ui-config (탭 기반 인터페이스)
실시간 동기화: 데이터베이스 ↔ UI 컴포넌트
다국어 지원: 섹션별 언어팩 통합
드래그앤드롭: 섹션 순서 변경 지원
특화 기능: 중고 상품 섹션, 카테고리 관리
```

## 🏗️ UI 섹션 관리 시스템 구조

### 관리자 UI 구성 (`app/admin/ui-config/page.tsx`)

#### 메인 인터페이스
```typescript
interface UIConfigInterface {
  tabs: ['header', 'footer', 'sections', 'categories'];
  statistics: {
    headerMenus: 6;        // 활성 헤더 메뉴 수
    footerSections: 4;     // 활성 푸터 섹션 수
    homeSections: 8;       // 활성 홈 섹션 수
    categories: 12;        // 등록된 카테고리 수
  };
  realTimeSync: boolean;   // 실시간 DB 동기화
  autoTranslation: boolean; // 자동 번역 기능
}
```

#### 탭 기반 관리 시스템
```typescript
const tabs = [
  {
    id: 'header',
    label: '헤더',
    icon: Layout,
    component: HeaderConfigDB,
  },
  {
    id: 'footer', 
    label: '푸터',
    icon: Layout,
    component: FooterConfigDB,
  },
  {
    id: 'sections',
    label: '섹션 관리',
    icon: List,
    component: SectionsConfigTab,
  },
  {
    id: 'categories',
    label: '카테고리',
    icon: Tag,
    component: CategoryConfigTab,
  },
];
```

### URL 기반 상태 관리
```typescript
// URL 파라미터로 탭 상태 관리
const handleTabChange = (value: string) => {
  setActiveTab(value as TabType);
  router.push(`/admin/ui-config?tab=${value}`);
};

// 초기 로딩시 URL에서 탭 복원
const tabParam = searchParams.get('tab');
const initialTab = (tabParam as TabType) || 'header';
```

## 🧩 섹션 컴포넌트 구조

### 1. 헤더 관리 시스템 (`HeaderConfigDB`)

#### 메뉴 관리 인터페이스
```typescript
interface HeaderMenuConfig {
  menus: UIMenuItem[];
  sorting: {
    enabled: boolean;
    dragAndDrop: true;
    realtimeUpdate: true;
  };
  multilingual: {
    supported: ['ko', 'en', 'jp'];
    autoTranslation: boolean;
    fallback: 'ko';
  };
  database: {
    table: 'ui_menus';
    realTimeSync: boolean;
  };
}
```

#### 메뉴 항목 구조
```typescript
interface UIMenuItem {
  id: number;
  name: string;
  slug: string;
  url: string;
  parent_id: number | null;
  menu_order: number;
  is_active: boolean;
  target_blank: boolean;
  icon: string | null;
  css_class: string | null;
  
  // 계층 구조
  children?: UIMenuItem[];
  level: number;
}
```

### 2. 푸터 관리 시스템 (`FooterConfigDB`)

#### 푸터 섹션 구성
```typescript
interface FooterConfig {
  sections: {
    companyInfo: {
      name: string;
      description: string;
      address: string;
      phone: string;
      email: string;
    };
    quickLinks: UIMenuItem[];
    customerService: {
      faq: string;
      contact: string;
      returns: string;
      shipping: string;
    };
    socialMedia: {
      facebook: string;
      instagram: string;
      twitter: string;
      youtube: string;
    };
  };
  legal: {
    privacyPolicy: string;
    termsOfService: string;
    copyright: string;
  };
}
```

### 3. 홈페이지 섹션 관리 (`SectionsConfigTab`)

#### 동적 섹션 시스템
```typescript
interface HomepageSection {
  id: string;
  type: SectionType;
  name: string;
  enabled: boolean;
  order: number;
  config: SectionConfig;
  data?: SectionData;
  
  // 메타데이터
  created_at: string;
  updated_at: string;
  last_modified_by: string;
}

type SectionType = 
  | 'hero'           // 메인 배너
  | 'products'       // 상품 그리드
  | 'categories'     // 카테고리 네비게이션
  | 'quicklinks'     // 빠른 링크
  | 'promo'          // 프로모션 배너
  | 'ranking'        // 랭킹/인기 상품
  | 'recommended'    // 추천 섹션
  | 'new'            // 신상품
  | 'product-grid';  // 커스텀 상품 그리드
```

#### 섹션별 설정 구조
```typescript
// Hero Section 설정
interface HeroSectionConfig {
  slides: {
    id: string;
    title: Record<LanguageCode, string>;
    subtitle: Record<LanguageCode, string>;
    description: Record<LanguageCode, string>;
    image: string;
    mobileImage?: string;
    link: string;
    buttonText: Record<LanguageCode, string>;
    order: number;
    active: boolean;
  }[];
  autoPlay: boolean;
  interval: number; // 밀리초
  showDots: boolean;
  showArrows: boolean;
}

// Products Section 설정
interface ProductsSectionConfig {
  title: Record<LanguageCode, string>;
  subtitle?: Record<LanguageCode, string>;
  viewMore: Record<LanguageCode, string>;
  filter: 'featured' | 'new' | 'bestseller' | 'category';
  categoryId?: string;
  limit: number;
  layout: 'grid' | 'slider';
  columns: 2 | 3 | 4 | 6;
  showPrice: boolean;
  showRating: boolean;
  showQuickView: boolean;
}

// Categories Section 설정
interface CategoriesSectionConfig {
  title: Record<LanguageCode, string>;
  layout: 'grid' | 'slider' | 'list';
  showImage: boolean;
  showProductCount: boolean;
  maxCategories: number;
  parentOnly: boolean;
}
```

### 4. 카테고리 관리 시스템 (`CategoryConfigTab`)

#### 계층형 카테고리 구조
```typescript
interface CategoryManagement {
  tree: CategoryTreeNode[];
  flat: CategoryRow[];
  operations: {
    create: (category: CategoryInput) => Promise<void>;
    update: (id: string, data: CategoryInput) => Promise<void>;
    delete: (id: string) => Promise<void>;
    reorder: (items: CategoryTreeNode[]) => Promise<void>;
  };
  display: {
    layout: 'tree' | 'grid' | 'list';
    showImages: boolean;
    showProductCount: boolean;
  };
}

interface CategoryTreeNode extends CategoryRow {
  children: CategoryTreeNode[];
  depth: number;
  path: string[];
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: string | null;
  position: number;
  is_active: boolean;
  product_count?: number;
}
```

## 🎛️ 섹션 관리 컴포넌트

### 섹션 매니저 (`SectionManagerTab`)
```typescript
interface SectionManager {
  sections: UISectionConfig[];
  dragAndDrop: {
    enabled: boolean;
    onReorder: (sections: UISectionConfig[]) => Promise<void>;
  };
  operations: {
    create: (section: SectionInput) => Promise<void>;
    update: (id: string, data: Partial<SectionInput>) => Promise<void>;
    delete: (id: string) => Promise<void>;
    toggle: (id: string, enabled: boolean) => Promise<void>;
    duplicate: (id: string) => Promise<void>;
  };
  templates: SectionTemplate[];
}

interface SectionTemplate {
  id: string;
  name: string;
  type: SectionType;
  preview: string;
  defaultConfig: SectionConfig;
  requiredFields: string[];
}
```

### 이미지 업로드 시스템 (`SectionImageUpload`)
```typescript
interface ImageUploadSystem {
  accept: 'image/*';
  maxSize: '10MB';
  formats: ['JPEG', 'PNG', 'WebP', 'AVIF'];
  processing: {
    resize: boolean;
    optimize: boolean;
    generateThumbnails: boolean;
  };
  storage: {
    local: '/public/uploads/sections/';
    cdn?: string;
  };
  validation: {
    dimensions: {
      min: { width: 800, height: 400 };
      max: { width: 2560, height: 1440 };
    };
    aspectRatio: '16:9' | '4:3' | '1:1' | 'custom';
  };
}
```

## 📱 반응형 섹션 시스템

### 디바이스별 설정
```typescript
interface ResponsiveConfig {
  desktop: {
    columns: number;
    spacing: number;
    itemsPerRow: number;
  };
  tablet: {
    columns: number;
    spacing: number;
    itemsPerRow: number;
  };
  mobile: {
    columns: number;
    spacing: number;
    itemsPerRow: number;
    stack: boolean;
  };
}

interface ResponsiveSection extends UISectionConfig {
  responsive: ResponsiveConfig;
  mobileConfig?: Partial<SectionConfig>;
  tabletConfig?: Partial<SectionConfig>;
}
```

### 브레이크포인트 시스템
```css
/* Tailwind CSS 브레이크포인트 */
.section-responsive {
  @apply grid gap-4;
  @apply grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4;
}

/* 섹션별 커스텀 브레이크포인트 */
.hero-section {
  @apply h-64 sm:h-80 md:h-96 lg:h-[32rem];
}

.products-grid {
  @apply grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6;
}
```

## 🌐 다국어 섹션 시스템

### 언어별 콘텐츠 관리
```typescript
interface MultilingualSection {
  base: UISectionConfig;
  translations: {
    [key in LanguageCode]: {
      title?: string;
      subtitle?: string;
      description?: string;
      buttonText?: string;
      metadata?: Record<string, string>;
    }
  };
  fallback: {
    language: 'ko';
    showOriginal: boolean;
    showTranslationNotice: boolean;
  };
}
```

### 자동 번역 시스템
```typescript
interface AutoTranslationService {
  provider: 'google' | 'papago' | 'deepl';
  enabled: boolean;
  languages: LanguageCode[];
  queue: {
    pending: TranslationTask[];
    processing: TranslationTask[];
    completed: TranslationTask[];
  };
  validation: {
    humanReview: boolean;
    confidenceThreshold: number;
  };
}

interface TranslationTask {
  id: string;
  sectionId: string;
  field: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  originalText: string;
  translatedText?: string;
  confidence?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}
```

## 🎨 테마 및 스타일 시스템

### 섹션 테마 관리
```typescript
interface SectionTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
  };
  typography: {
    titleFont: string;
    bodyFont: string;
    titleSize: string;
    bodySize: string;
  };
  spacing: {
    padding: string;
    margin: string;
    gap: string;
  };
  effects: {
    shadow: string;
    borderRadius: string;
    animation: string;
  };
}

interface ThemedSection extends UISectionConfig {
  theme: SectionTheme;
  customCSS?: string;
  darkMode?: Partial<SectionTheme>;
}
```

### CSS 변수 시스템
```css
/* 섹션 테마 CSS 변수 */
.section {
  --section-bg: theme('colors.background');
  --section-text: theme('colors.foreground');
  --section-primary: theme('colors.primary.DEFAULT');
  --section-padding: theme('spacing.6');
  --section-radius: theme('borderRadius.lg');
}

.section[data-theme="dark"] {
  --section-bg: theme('colors.gray.900');
  --section-text: theme('colors.gray.100');
}
```

## 📊 성능 및 최적화

### 섹션 로딩 전략
```typescript
interface SectionLoadingStrategy {
  preload: {
    critical: string[];      // 위 섹션들 즉시 로드
    aboveFold: string[];     // 뷰포트 내 섹션들
    lazy: string[];          // 지연 로딩 섹션들
  };
  caching: {
    staticSections: number;  // 정적 섹션 캐시 (1시간)
    dynamicSections: number; // 동적 섹션 캐시 (5분)
    imageAssets: number;     // 이미지 자산 캐시 (24시간)
  };
  optimization: {
    bundleSplitting: boolean;
    imageOptimization: boolean;
    cssMinification: boolean;
  };
}
```

### 섹션 메트릭스
```typescript
interface SectionMetrics {
  performance: {
    loadTime: number;
    renderTime: number;
    interactionTime: number;
  };
  usage: {
    viewCount: number;
    clickRate: number;
    bounceRate: number;
  };
  conversion: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
}
```

## 🔧 개발자 도구

### 섹션 디버깅
```typescript
interface SectionDebugger {
  preview: {
    realtime: boolean;
    deviceEmulation: boolean;
    performanceMetrics: boolean;
  };
  validation: {
    configSchema: boolean;
    accessibilityCheck: boolean;
    performanceAudit: boolean;
  };
  logging: {
    renderEvents: boolean;
    stateChanges: boolean;
    apiCalls: boolean;
  };
}
```

### 섹션 테스트 시스템
```typescript
interface SectionTestSuite {
  unit: {
    configValidation: boolean;
    renderLogic: boolean;
    stateManagement: boolean;
  };
  integration: {
    apiIntegration: boolean;
    languageSwitch: boolean;
    themeSwitch: boolean;
  };
  e2e: {
    userInteractions: boolean;
    crossBrowser: boolean;
    mobileCompatibility: boolean;
  };
}
```

## 🚀 확장성 및 플러그인

### 커스텀 섹션 개발
```typescript
interface CustomSectionAPI {
  register: (section: CustomSectionDefinition) => void;
  unregister: (sectionId: string) => void;
  validate: (config: any) => ValidationResult;
  render: (config: any, context: RenderContext) => React.ReactNode;
}

interface CustomSectionDefinition {
  id: string;
  name: string;
  category: string;
  version: string;
  configSchema: JSONSchema;
  defaultConfig: any;
  component: React.ComponentType<any>;
  adminPanel?: React.ComponentType<any>;
  dependencies?: string[];
}
```

### 플러그인 시스템
```typescript
interface SectionPlugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  
  hooks: {
    beforeRender?: (config: any) => any;
    afterRender?: (element: React.ReactNode) => React.ReactNode;
    onConfigChange?: (newConfig: any, oldConfig: any) => void;
  };
  
  assets: {
    css?: string[];
    js?: string[];
    images?: string[];
  };
}
```

---

*이 문서는 E-Market Korea 프로젝트의 완전한 UI 섹션 시스템 매뉴얼입니다.*