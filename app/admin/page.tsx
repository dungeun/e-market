'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  MoreVertical,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const stats = [
  {
    title: '총 매출',
    value: '₩45,231,890',
    change: '+20.1%',
    trend: 'up',
    icon: DollarSign,
    description: '지난 달 대비',
  },
  {
    title: '신규 고객',
    value: '2,350',
    change: '+180.1%',
    trend: 'up',
    icon: Users,
    description: '지난 달 대비',
  },
  {
    title: '총 주문',
    value: '12,234',
    change: '+19%',
    trend: 'up',
    icon: ShoppingCart,
    description: '지난 달 대비',
  },
  {
    title: '활성 상품',
    value: '573',
    change: '-4.3%',
    trend: 'down',
    icon: Package,
    description: '지난 달 대비',
  },
]

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
  },
]

const topProducts = [
  {
    name: '무선 이어폰 Pro',
    sales: 234,
    revenue: '₩23,400,000',
    growth: '+12.3%',
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
  },
]

export default function AdminDashboard() {
  const handleQuickAction = (action: string) => {
    toast.success(`${action} 페이지로 이동합니다.`)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case '완료':
        return 'bg-green-100 text-green-800'
      case '배송중':
        return 'bg-blue-100 text-blue-800'
      case '처리중':
        return 'bg-yellow-100 text-yellow-800'
      case '취소':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
      <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === 'up' ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                )}
                <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                <span className="ml-1">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 최근 주문 */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>최근 주문</CardTitle>
                <CardDescription>최근 5개의 주문 내역입니다.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleQuickAction('주문 관리')}>
                전체 보기
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={order.avatar} />
                      <AvatarFallback>{order.customer[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{order.amount}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                      {order.status}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.info(`주문 ${order.id} 상세 보기`)}>
                          상세 보기
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info(`주문 ${order.id} 수정`)}>
                          수정
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 인기 상품 */}
        <Card className="col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>인기 상품</CardTitle>
                <CardDescription>이번 달 가장 많이 판매된 상품</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleQuickAction('상품 관리')}>
                전체 보기
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} 판매</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{product.revenue}</p>
                    <p className={`text-xs ${product.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {product.growth}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 작업 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
          <CardDescription>자주 사용하는 기능에 빠르게 접근하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleQuickAction('새 상품 추가')}>
              <Package className="mr-2 h-4 w-4" />
              새 상품 추가
            </Button>
            <Button variant="outline" onClick={() => handleQuickAction('새 캠페인 생성')}>
              <Calendar className="mr-2 h-4 w-4" />
              새 캠페인 생성
            </Button>
            <Button variant="outline" onClick={() => handleQuickAction('주문 처리')}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              주문 처리
            </Button>
            <Button variant="outline" onClick={() => handleQuickAction('매출 리포트')}>
              <DollarSign className="mr-2 h-4 w-4" />
              매출 리포트
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
  )
}