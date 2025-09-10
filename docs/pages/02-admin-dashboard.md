# 📖 페이지 백과사전: /admin (관리자 대시보드)
*파일: /app/admin/page.tsx*

## 🎯 페이지 메타데이터
```yaml
파일경로: /app/admin/page.tsx
페이지경로: /admin
파일크기: 312줄
컴포넌트명: AdminDashboard
렌더링모드: 'use client' (CSR)
최종수정: 현재 버전
```

## 📦 Import 의존성

### UI 컴포넌트 (shadcn/ui)
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
```

### 아이콘 (lucide-react)
```typescript
import { 
  Users,          // 사용자 아이콘 (라인 5)
  Package,        // 패키지 아이콘 (라인 6)
  ShoppingCart,   // 쇼핑카트 아이콘 (라인 7)
  DollarSign,     // 달러 아이콘 (라인 8)
  TrendingUp,     // 상승 트렌드 (라인 9)
  TrendingDown,   // 하락 트렌드 (라인 10)
  ArrowUpRight,   // 화살표 (라인 11)
  MoreVertical,   // 더보기 메뉴 (라인 12)
  Calendar        // 캘린더 아이콘 (라인 13)
} from 'lucide-react'
```

### 외부 라이브러리
```typescript
import { toast } from 'sonner'  // 토스트 알림 (라인 15)
```

## 📌 하드코딩된 데이터

### 통계 데이터 (stats)
```typescript
const stats = [
  {
    title: '총 매출',
    value: '₩45,231,890',    // 하드코딩된 금액
    change: '+20.1%',         // 하드코딩된 변화율
    trend: 'up',
    icon: DollarSign,
    description: '지난 달 대비',
  },
  {
    title: '신규 고객',
    value: '2,350',           // 하드코딩된 숫자
    change: '+180.1%',        // 하드코딩된 변화율
    trend: 'up',
    icon: Users,
    description: '지난 달 대비',
  },
  {
    title: '총 주문',
    value: '12,234',          // 하드코딩된 숫자
    change: '+19%',           // 하드코딩된 변화율
    trend: 'up',
    icon: ShoppingCart,
    description: '지난 달 대비',
  },
  {
    title: '활성 상품',
    value: '573',             // 하드코딩된 숫자
    change: '-4.3%',          // 하드코딩된 변화율
    trend: 'down',
    icon: Package,
    description: '지난 달 대비',
  }
]
```

### 최근 주문 데이터 (recentOrders)
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
  {
    id: '#12346',
    customer: '이영희',
    email: 'lee@example.com',
    amount: '₩89,000',
    status: '처리중',
    date: '2024-01-15',
    avatar: '/placeholder.svg',
  },
  {
    id: '#12347',
    customer: '박민수',
    email: 'park@example.com',
    amount: '₩256,000',
    status: '완료',
    date: '2024-01-14',
    avatar: '/placeholder.svg',
  },
  {
    id: '#12348',
    customer: '정수진',
    email: 'jung@example.com',
    amount: '₩67,000',
    status: '취소',
    date: '2024-01-14',
    avatar: '/placeholder.svg',
  },
  {
    id: '#12349',
    customer: '최동현',
    email: 'choi@example.com',
    amount: '₩189,000',
    status: '배송중',
    date: '2024-01-14',
    avatar: '/placeholder.svg',
  }
]
```

### 인기 상품 데이터 (topProducts)
```typescript
const topProducts = [
  {
    name: '무선 이어폰 Pro',
    sales: 234,               // 판매 수량
    revenue: '₩23,400,000',   // 매출액
    growth: '+12.3%',         // 성장률
  },
  {
    name: '스마트 워치 Series 5',
    sales: 189,
    revenue: '₩18,900,000',
    growth: '+8.2%',
  },
  {
    name: '노트북 스탠드',
    sales: 156,
    revenue: '₩4,680,000',
    growth: '+23.1%',
  },
  {
    name: 'USB-C 허브',
    sales: 142,
    revenue: '₩7,100,000',
    growth: '-2.3%',
  }
]
```

## 📌 하드코딩된 상수값

### 숫자 상수
```typescript
4    // 라인 158, 184: md:grid-cols-4, col-span-4
7    // 라인 184: lg:grid-cols-7
3    // 라인 170, 172, 195, 244, 253, 261: h-3 w-3, col-span-3
2    // 라인 157, 184, 218, 290: grid-cols-2, py-1, gap-2
9    // 라인 204, 262: h-9 w-9
1    // 라인 170, 172, 195, 218, 253, 263: mr-1, ml-1, py-1, index+1
5    // 라인 191: 최근 5개의 주문
8    // 라인 223: h-8 w-8
```

### 문자열 상수 (한국어)
```typescript
// 페이지 타이틀
'최근 주문'           // 라인 190
'인기 상품'          // 라인 248
'빠른 작업'          // 라인 286

// 설명 텍스트
'최근 5개의 주문 내역입니다.'              // 라인 191
'이번 달 가장 많이 판매된 상품'           // 라인 249
'자주 사용하는 기능에 빠르게 접근하세요.'   // 라인 287

// 버튼 텍스트
'전체 보기'          // 라인 194, 252
'새 상품 추가'       // 라인 293
'새 캠페인 생성'     // 라인 297
'주문 처리'         // 라인 301
'매출 리포트'       // 라인 305

// 상태 라벨
'완료'             // 라인 141
'배송중'           // 라인 143
'처리중'           // 라인 145
'취소'             // 라인 147

// 드롭다운 메뉴
'상세 보기'        // 라인 229
'수정'            // 라인 232

// 토스트 메시지
' 페이지로 이동합니다.'  // 라인 136
' 상세 보기'           // 라인 228
' 수정'               // 라인 231

// 기타
' 판매'            // 라인 267 (숫자 뒤)
```

## 🎨 CSS 클래스 (Tailwind)

### 레이아웃 클래스
```css
space-y-6                          /* 수직 간격 6 */
grid gap-4                         /* 그리드 간격 4 */
md:grid-cols-2 lg:grid-cols-4      /* 반응형 그리드 */
col-span-4, col-span-3             /* 그리드 스팬 */
flex flex-row                      /* 플렉스 행 */
flex items-center justify-between  /* 플렉스 정렬 */
```

### 텍스트 스타일
```css
text-sm font-medium               /* 작은 중간 텍스트 */
text-2xl font-bold               /* 큰 볼드 텍스트 */
text-xs text-muted-foreground    /* 매우 작은 음소거 텍스트 */
```

### 색상 클래스
```css
/* 상태별 배경색 */
bg-green-100 text-green-800      /* 완료 상태 */
bg-blue-100 text-blue-800        /* 배송중 상태 */
bg-yellow-100 text-yellow-800    /* 처리중 상태 */
bg-red-100 text-red-800          /* 취소 상태 */
bg-gray-100 text-gray-800        /* 기본 상태 */

/* 트렌드 색상 */
text-green-600                   /* 상승 트렌드 */
text-red-600                     /* 하락 트렌드 */

/* 기타 */
bg-primary/10                    /* 프라이머리 색상 10% 투명도 */
```

### 크기 클래스
```css
h-4 w-4    /* 아이콘 크기 */
h-3 w-3    /* 작은 아이콘 */
h-9 w-9    /* 아바타 크기 */
h-8 w-8    /* 버튼 크기 */
pb-2       /* 패딩 바텀 2 */
px-2 py-1  /* 패딩 XY */
```

## 🎯 함수 목록

### handleQuickAction
```typescript
const handleQuickAction = (action: string) => {
  toast.success(`${action} 페이지로 이동합니다.`)
}
// 위치: 라인 135-137
// 매개변수: action (액션 이름)
// 역할: 토스트 알림 표시
```

### getStatusBadgeColor
```typescript
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case '완료': return 'bg-green-100 text-green-800'
    case '배송중': return 'bg-blue-100 text-blue-800'
    case '처리중': return 'bg-yellow-100 text-yellow-800'
    case '취소': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
// 위치: 라인 139-152
// 매개변수: status (주문 상태)
// 반환값: Tailwind 색상 클래스
```

## 🏗️ JSX 구조

### 전체 구조
```jsx
<div className="space-y-6">
  {/* 통계 카드 섹션 */}
  {/* 메인 콘텐츠 그리드 */}
  {/* 빠른 작업 섹션 */}
</div>
```

### 통계 카드 섹션 (라인 156-182)
```jsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {stats.map((stat) => (
    <Card key={stat.title}>
      <CardHeader>
        <CardTitle>{stat.title}</CardTitle>
        <stat.icon />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        <div className="flex items-center">
          {stat.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
          <span>{stat.change}</span>
          <span>{stat.description}</span>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

### 최근 주문 카드 (라인 186-241)
```jsx
<Card className="col-span-4">
  <CardHeader>
    <CardTitle>최근 주문</CardTitle>
    <CardDescription>최근 5개의 주문 내역입니다.</CardDescription>
    <Button>전체 보기</Button>
  </CardHeader>
  <CardContent>
    {recentOrders.map((order) => (
      <div key={order.id}>
        <Avatar />
        <div>{order.customer}</div>
        <div>{order.amount}</div>
        <span className={getStatusBadgeColor(order.status)}>
          {order.status}
        </span>
        <DropdownMenu>...</DropdownMenu>
      </div>
    ))}
  </CardContent>
</Card>
```

### 인기 상품 카드 (라인 244-280)
```jsx
<Card className="col-span-3">
  <CardHeader>
    <CardTitle>인기 상품</CardTitle>
    <CardDescription>이번 달 가장 많이 판매된 상품</CardDescription>
  </CardHeader>
  <CardContent>
    {topProducts.map((product, index) => (
      <div key={product.name}>
        <div>{index + 1}</div>
        <div>{product.name}</div>
        <div>{product.sales} 판매</div>
        <div>{product.revenue}</div>
        <div>{product.growth}</div>
      </div>
    ))}
  </CardContent>
</Card>
```

### 빠른 작업 섹션 (라인 284-309)
```jsx
<Card>
  <CardHeader>
    <CardTitle>빠른 작업</CardTitle>
    <CardDescription>자주 사용하는 기능에 빠르게 접근하세요.</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => handleQuickAction('새 상품 추가')}>
        <Package /> 새 상품 추가
      </Button>
      <Button onClick={() => handleQuickAction('새 캠페인 생성')}>
        <Calendar /> 새 캠페인 생성
      </Button>
      <Button onClick={() => handleQuickAction('주문 처리')}>
        <ShoppingCart /> 주문 처리
      </Button>
      <Button onClick={() => handleQuickAction('매출 리포트')}>
        <DollarSign /> 매출 리포트
      </Button>
    </div>
  </CardContent>
</Card>
```

## 🔄 데이터 흐름

```
1. 정적 데이터 정의 (stats, recentOrders, topProducts)
   ↓
2. 컴포넌트 렌더링
   ↓
3. map() 함수로 데이터 반복 렌더링
   ↓
4. 이벤트 핸들러 (onClick) 바인딩
   ↓
5. toast 알림 표시
```

## 📊 조건부 렌더링

### 트렌드 아이콘
```typescript
stat.trend === 'up' ? <TrendingUp /> : <TrendingDown />
```

### 트렌드 색상
```typescript
stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
```

### 성장률 색상
```typescript
product.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
```

## 🔍 특이사항

1. **모든 데이터가 하드코딩**: API 호출 없이 정적 데이터 사용
2. **실제 기능 미구현**: 모든 버튼이 toast 알림만 표시
3. **아바타 이미지**: 모두 `/placeholder.svg` 사용
4. **고정된 날짜**: 2024-01-14, 2024-01-15만 사용
5. **이메일 형식**: 단순한 example.com 도메인

## 🔄 중복 제거 가능 항목

### 전역 상수로 추출 가능
- 상태 라벨과 색상 매핑
- 반복되는 아이콘 크기 (h-4 w-4, h-3 w-3)
- 그리드 설정값

### 재사용 가능한 컴포넌트
- 통계 카드
- 주문 리스트 아이템
- 상품 리스트 아이템
- 상태 뱃지

---

*이 문서는 /admin/page.tsx의 완전한 역설계 매뉴얼입니다.*