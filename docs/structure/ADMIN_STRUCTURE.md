# 🛠️ 관리자 시스템 구조 문서
*E-Market Korea - 중고 상품 커머스 플랫폼*

## 📊 관리자 시스템 개요
```yaml
관리자 패널: Next.js App Router 기반
UI 프레임워크: shadcn/ui + Tailwind CSS
레이아웃 시스템: SidebarProvider (Collapsible)
상태 관리: React Hook + 클라이언트 상태
알림 시스템: Sonner Toast
권한 관리: Role-based Access Control
특화 기능: 중고 상품 관리, 다국어 콘텐츠 관리
```

## 🏗️ 관리자 레이아웃 아키텍처

### 레이아웃 구조 (`app/admin/layout.tsx`)

#### 사이드바 시스템
```typescript
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
```

**특징**:
- **Collapsible**: 아이콘 모드로 축소 가능
- **Responsive**: 모바일에서 오버레이 모드
- **State Management**: defaultOpen=true
- **Theme Integration**: shadcn/ui 테마 시스템

#### 네비게이션 구조
```typescript
const sidebarItems = [
  {
    title: '메인',
    items: [
      { title: '대시보드', href: '/admin', icon: Home },
      { title: '판매 분석', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'UI 관리',
    items: [
      { title: 'UI 섹션 설정', href: '/admin/ui-config', icon: Settings },
      { title: '팝업 알림 관리', href: '/admin/popup-alerts', icon: Megaphone },
      { title: '언어팩 관리', href: '/admin/language-packs', icon: Languages },
    ],
  },
  // ... 더 많은 그룹
];
```

### 헤더 시스템
```typescript
<header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
  <SidebarTrigger />
  <div className="flex flex-1 items-center justify-between">
    <h1 className="text-lg font-semibold">
      {/* 동적 페이지 제목 */}
    </h1>
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon">
        <Bell className="h-4 w-4" />
      </Button>
    </div>
  </div>
</header>
```

**기능**:
- **Sticky Header**: 스크롤시 고정
- **동적 제목**: 현재 경로에 따른 제목
- **알림 버튼**: 실시간 알림 (Toast 연동)
- **사이드바 토글**: 반응형 메뉴 제어

## 📊 대시보드 구조 (`app/admin/page.tsx`)

### 통계 카드 시스템
```typescript
const stats = [
  {
    title: '총 매출',
    value: '₩45,231,890',
    change: '+20.1%',
    trend: 'up',
    icon: DollarSign,
    description: '지난 달 대비',
  },
  // ... 더 많은 통계
];
```

**KPI 지표**:
1. **총 매출**: 월별 매출 추이 (`₩45,231,890`)
2. **신규 고객**: 고객 증가율 (`2,350`, `+180.1%`)
3. **총 주문**: 주문량 증가 (`12,234`, `+19%`)
4. **활성 상품**: 상품 수 변동 (`573`, `-4.3%`)

### 실시간 주문 관리
```typescript
const recentOrders = [
  {
    id: '#12345',
    customer: '김철수',
    email: 'kim@example.com',
    amount: '₩125,000',
    status: '배송중',
    date: '2024-01-15',
    avatar: '/placeholder.svg',
  },
  // ... 더 많은 주문
];
```

**주문 상태 관리**:
- `완료`: 거래 완료 (녹색 배지)
- `배송중`: 배송 진행 (파란색 배지)
- `처리중`: 주문 처리 (노란색 배지)
- `취소`: 주문 취소 (빨간색 배지)

### 상품 성과 추적
```typescript
const topProducts = [
  {
    name: '무선 이어폰 Pro',
    sales: 234,
    revenue: '₩23,400,000',
    growth: '+12.3%',
  },
  // ... 더 많은 상품
];
```

## 🎛️ 관리 모듈 구조

### 1. UI 관리 시스템

#### UI 섹션 설정 (`/admin/ui-config`)
```typescript
interface UISectionConfig {
  id: string;
  type: 'hero' | 'products' | 'categories';
  name: string;
  enabled: boolean;
  order: number;
  config: {
    title: Record<LanguageCode, string>;
    subtitle?: Record<LanguageCode, string>;
    viewMore?: Record<LanguageCode, string>;
    filter?: string;
    limit?: number;
  };
}
```

**관리 가능한 섹션**:
- **Hero Section**: 메인 배너, 슬라이드
- **Featured Products**: 추천 상품 그리드
- **New Arrivals**: 신상품 목록
- **Categories**: 카테고리 네비게이션
- **Custom Sections**: 프로모션, 랭킹 등

#### 언어팩 관리 (`/admin/language-packs`)
```typescript
interface LanguagePackManagement {
  keys: LanguagePackKey[];
  translations: LanguagePackTranslation[];
  categories: string[];
  bulkOperations: {
    import: (file: File) => Promise<void>;
    export: (category?: string) => Promise<Blob>;
    sync: () => Promise<SyncResult>;
  };
}
```

**기능**:
- **키 관리**: 번역 키 생성/수정/삭제
- **번역 관리**: 언어별 번역 텍스트 편집
- **벌크 작업**: CSV/JSON 가져오기/내보내기
- **미리보기**: 실시간 번역 적용 확인

### 2. 상품 관리 시스템

#### 상품 목록 관리 (`/admin/products`)
```typescript
interface ProductManagement {
  products: ProductWithDetails[];
  filters: {
    category: string[];
    status: ProductStatus[];
    condition: ProductCondition[];
    seller: string[];
  };
  bulkActions: {
    updateStatus: (ids: string[], status: ProductStatus) => Promise<void>;
    updateCategory: (ids: string[], categoryId: string) => Promise<void>;
    delete: (ids: string[]) => Promise<void>;
  };
}
```

**중고 상품 특화 관리**:
- **상품 상태**: S/A/B/C 등급 관리
- **판매자 검증**: verified_seller 플래그
- **거래 옵션**: 직거래/배송 설정
- **지역 관리**: seller_location 필터링

#### 상품 등록/수정 (`/admin/products/create`, `/admin/products/edit/[id]`)
```typescript
interface ProductForm {
  basicInfo: {
    name: string;
    description: string;
    category_id: string;
    price: number;
  };
  usedGoodsInfo: {
    condition: 'S' | 'A' | 'B' | 'C';
    usage_period: string;
    purchase_date: string;
    defects: string;
  };
  sellerInfo: {
    seller_name: string;
    seller_phone: string;
    seller_location: string;
    verified_seller: boolean;
  };
  tradeOptions: {
    negotiable: boolean;
    direct_trade: boolean;
    delivery_available: boolean;
    warranty_info: string;
  };
  images: ProductImage[];
}
```

### 3. 주문 및 고객 관리

#### 주문 관리 (`/admin/orders`)
```typescript
interface OrderManagement {
  orders: OrderWithDetails[];
  statusUpdate: {
    pending: '대기중';
    processing: '처리중';
    shipped: '배송중';
    delivered: '배송완료';
    cancelled: '취소';
    returned: '반품';
  };
  bulkOperations: {
    updateStatus: (orderIds: string[], status: OrderStatus) => Promise<void>;
    exportReport: (dateRange: DateRange) => Promise<Blob>;
    sendNotification: (orderIds: string[], message: string) => Promise<void>;
  };
}
```

**중고 거래 특화 기능**:
- **직거래 지원**: 만남 장소, 연락처 관리
- **현금 결제**: 오프라인 결제 확인
- **상품 상태 확인**: 실제 상품과 설명 일치 여부

#### 고객 관리 (`/admin/customers`)
```typescript
interface CustomerManagement {
  customers: CustomerProfile[];
  segmentation: {
    newUsers: Customer[];
    activeUsers: Customer[];
    inactiveUsers: Customer[];
    highValueUsers: Customer[];
  };
  tools: {
    sendEmail: (customerIds: string[], template: EmailTemplate) => Promise<void>;
    createSegment: (criteria: SegmentCriteria) => Promise<CustomerSegment>;
    exportData: (customerIds: string[]) => Promise<Blob>;
  };
}
```

### 4. 마케팅 및 프로모션

#### 캠페인 관리 (`/admin/campaigns`)
```typescript
interface CampaignManagement {
  campaigns: Campaign[];
  templates: CampaignTemplate[];
  scheduling: {
    create: (campaign: Campaign) => Promise<void>;
    schedule: (campaignId: string, schedule: Schedule) => Promise<void>;
    pause: (campaignId: string) => Promise<void>;
    resume: (campaignId: string) => Promise<void>;
  };
  analytics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}
```

#### 쿠폰 시스템 (`/admin/coupons`)
```typescript
interface CouponSystem {
  coupons: Coupon[];
  types: {
    percentage: '퍼센트 할인';
    fixed: '고정 금액 할인';
    shipping: '배송비 할인';
    bogo: 'Buy One Get One';
  };
  conditions: {
    minAmount: number;
    maxDiscount: number;
    categories: string[];
    users: string[];
    usageLimit: number;
    expiryDate: Date;
  };
}
```

## 🔒 권한 관리 시스템

### 역할 기반 접근 제어 (RBAC)
```typescript
interface AdminPermissions {
  roles: {
    'SUPER_ADMIN': {
      permissions: ['*']; // 모든 권한
      description: '최고 관리자';
    };
    'ADMIN': {
      permissions: [
        'products.manage',
        'orders.manage',
        'customers.view',
        'ui.manage',
        'language.manage'
      ];
      description: '일반 관리자';
    };
    'MODERATOR': {
      permissions: [
        'products.review',
        'orders.view',
        'customers.view'
      ];
      description: '중간 관리자';
    };
  };
}
```

### 권한 검증 시스템
```typescript
// hooks/useAdminAuth.ts
interface AdminAuth {
  user: AdminUser | null;
  hasPermission: (permission: string) => boolean;
  requirePermission: (permission: string) => void;
  isLoading: boolean;
}
```

## 🎨 UI/UX 디자인 시스템

### shadcn/ui 컴포넌트 활용
```typescript
// 사용된 주요 컴포넌트
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button,
  Input, Label,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  Toast, Toaster,
  Avatar, AvatarFallback, AvatarImage,
  Badge,
  Separator
} from '@/components/ui/*'
```

### 색상 시스템 및 테마
```css
/* Tailwind CSS Classes */
.stats-card {
  @apply bg-white border border-gray-200 rounded-lg shadow-sm;
}

.status-badge {
  @apply inline-flex items-center rounded-full px-2 py-1 text-xs font-medium;
}

.sidebar-nav {
  @apply flex flex-col w-64 bg-white border-r border-gray-200;
}
```

### 반응형 디자인
```typescript
// Grid 시스템
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* 통계 카드 */}
</div>

<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
  <Card className="col-span-4">{/* 주문 목록 */}</Card>
  <Card className="col-span-3">{/* 인기 상품 */}</Card>
</div>
```

## 🔔 알림 및 피드백 시스템

### Toast 알림 시스템
```typescript
import { toast } from 'sonner'

// 사용 패턴
const handleSuccess = () => {
  toast.success('작업이 성공적으로 완료되었습니다.');
}

const handleError = () => {
  toast.error('오류가 발생했습니다. 다시 시도해주세요.');
}

const handleInfo = () => {
  toast.info('알림이 없습니다.');
}
```

### 실시간 알림 (향후 확장)
```typescript
interface NotificationSystem {
  types: {
    newOrder: '신규 주문';
    lowStock: '재고 부족';
    systemAlert: '시스템 알림';
    customerInquiry: '고객 문의';
  };
  delivery: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}
```

## 📊 분석 및 리포팅

### 매출 분석 (`/admin/analytics`)
```typescript
interface SalesAnalytics {
  revenue: {
    daily: RevenueData[];
    monthly: RevenueData[];
    yearly: RevenueData[];
  };
  products: {
    topSelling: ProductSalesData[];
    lowPerforming: ProductSalesData[];
    categoryBreakdown: CategorySalesData[];
  };
  customers: {
    newCustomers: CustomerGrowthData[];
    retention: CustomerRetentionData[];
    segments: CustomerSegmentData[];
  };
}
```

### 리포트 생성
```typescript
interface ReportGeneration {
  sales: {
    generate: (dateRange: DateRange) => Promise<SalesReport>;
    export: (format: 'pdf' | 'excel' | 'csv') => Promise<Blob>;
  };
  inventory: {
    generate: () => Promise<InventoryReport>;
    lowStockAlert: (threshold: number) => Promise<LowStockReport>;
  };
  customer: {
    generate: (segment?: string) => Promise<CustomerReport>;
    export: (anonymized: boolean) => Promise<Blob>;
  };
}
```

## 🔧 시스템 설정 및 구성

### 일반 설정 (`/admin/settings`)
```typescript
interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportPhone: string;
    businessHours: string;
  };
  commerce: {
    currency: 'KRW';
    taxRate: number;
    shippingOptions: ShippingOption[];
    paymentMethods: PaymentMethod[];
  };
  features: {
    enableWishlist: boolean;
    enableReviews: boolean;
    enableChat: boolean;
    enableNotifications: boolean;
  };
}
```

### 알림 설정 (`/admin/notifications`)
```typescript
interface NotificationSettings {
  email: {
    enabled: boolean;
    templates: EmailTemplate[];
    smtp: SMTPConfig;
  };
  sms: {
    enabled: boolean;
    provider: 'coolsms' | 'naver' | 'kakao';
    templates: SMSTemplate[];
  };
  push: {
    enabled: boolean;
    webPush: boolean;
    mobileApp: boolean;
  };
}
```

## 📈 성능 및 최적화

### 로딩 상태 관리
```typescript
// 로딩 패턴
const [isLoading, setIsLoading] = useState(false);

const handleAsyncOperation = async () => {
  setIsLoading(true);
  try {
    await performOperation();
    toast.success('작업 완료');
  } catch (error) {
    toast.error('작업 실패');
  } finally {
    setIsLoading(false);
  }
};
```

### 데이터 캐싱 및 최적화
```typescript
// React Query 패턴 (향후 적용)
const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  });
};
```

## 🚨 에러 처리 및 복구

### 에러 바운더리
```typescript
// 전역 에러 처리
const AdminErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      FallbackComponent={AdminErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Admin Error:', error, errorInfo);
        // 에러 로깅 서비스로 전송
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### 네트워크 에러 처리
```typescript
const handleApiError = (error: ApiError) => {
  switch (error.status) {
    case 401:
      toast.error('권한이 없습니다. 다시 로그인해주세요.');
      router.push('/auth/login');
      break;
    case 403:
      toast.error('접근 권한이 없습니다.');
      break;
    case 500:
      toast.error('서버 오류가 발생했습니다.');
      break;
    default:
      toast.error('알 수 없는 오류가 발생했습니다.');
  }
};
```

---

*이 문서는 E-Market Korea 프로젝트의 완전한 관리자 시스템 매뉴얼입니다.*