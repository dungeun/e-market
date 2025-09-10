'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Star
} from 'lucide-react'
import { toast } from 'sonner'

interface SalesData {
  period: string
  revenue: number
  orders: number
  customers: number
  avgOrderValue: number
  growth: number
}

interface ProductAnalytics {
  id: string
  name: string
  category: string
  sales: number
  revenue: number
  growth: number
  rating: number
  stock: number
}

interface CustomerAnalytics {
  segment: string
  count: number
  revenue: number
  percentage: number
  avgOrderValue: number
}

interface AnalyticsStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  avgOrderValue: number
  revenueGrowth: number
  orderGrowth: number
  customerGrowth: number
  conversionRate: number
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<AnalyticsStats>({
    totalRevenue: 45231890,
    totalOrders: 12234,
    totalCustomers: 2350,
    avgOrderValue: 156000,
    revenueGrowth: 20.1,
    orderGrowth: 19.0,
    customerGrowth: 18.2,
    conversionRate: 3.4
  })

  // 샘플 매출 데이터
  const salesData: SalesData[] = [
    { period: '2024-01-01', revenue: 1250000, orders: 45, customers: 28, avgOrderValue: 27777, growth: 12.5 },
    { period: '2024-01-02', revenue: 1340000, orders: 52, customers: 31, avgOrderValue: 25769, growth: 7.2 },
    { period: '2024-01-03', revenue: 980000, orders: 38, customers: 24, avgOrderValue: 25789, growth: -26.9 },
    { period: '2024-01-04', revenue: 1680000, orders: 61, customers: 42, avgOrderValue: 27541, growth: 71.4 },
    { period: '2024-01-05', revenue: 1420000, orders: 49, customers: 35, avgOrderValue: 28979, growth: -15.5 },
  ]

  // 상품 분석 데이터
  const productData: ProductAnalytics[] = [
    {
      id: '1',
      name: '무선 이어폰 Pro',
      category: '전자제품',
      sales: 234,
      revenue: 23400000,
      growth: 12.3,
      rating: 4.8,
      stock: 89
    },
    {
      id: '2',
      name: '스마트 워치 Series 5',
      category: '웨어러블',
      sales: 189,
      revenue: 18900000,
      growth: 8.2,
      rating: 4.6,
      stock: 156
    },
    {
      id: '3',
      name: '노트북 스탠드',
      category: '액세서리',
      sales: 156,
      revenue: 4680000,
      growth: 23.1,
      rating: 4.4,
      stock: 234
    },
    {
      id: '4',
      name: 'USB-C 허브',
      category: '액세서리',
      sales: 142,
      revenue: 7100000,
      growth: -2.3,
      rating: 4.2,
      stock: 67
    },
    {
      id: '5',
      name: '블루투스 키보드',
      category: '입력장치',
      sales: 98,
      revenue: 9800000,
      growth: 15.7,
      rating: 4.5,
      stock: 123
    }
  ]

  // 고객 세그먼트 데이터
  const customerSegments: CustomerAnalytics[] = [
    { segment: 'VIP 고객', count: 156, revenue: 15600000, percentage: 34.5, avgOrderValue: 250000 },
    { segment: '일반 고객', count: 892, revenue: 17840000, percentage: 39.4, avgOrderValue: 89000 },
    { segment: '신규 고객', count: 567, revenue: 8505000, percentage: 18.8, avgOrderValue: 67000 },
    { segment: '휴면 고객', count: 234, revenue: 3276000, percentage: 7.2, avgOrderValue: 45000 }
  ]

  const formatCurrency = (amount: number) => `₩${amount.toLocaleString()}`

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const handleExport = (type: string) => {
    toast.success(`${type} 데이터를 내보내는 중...`)
    // 실제 데이터 내보내기 로직 구현
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">판매 분석</h2>
          <p className="text-muted-foreground">매출 데이터와 성과 지표를 분석합니다.</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">최근 7일</SelectItem>
              <SelectItem value="30d">최근 30일</SelectItem>
              <SelectItem value="90d">최근 90일</SelectItem>
              <SelectItem value="1y">최근 1년</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport('전체')}>
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
        </div>
      </div>

      {/* 핵심 지표 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{stats.revenueGrowth}%</span>
              <span className="ml-1">지난 달 대비</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 주문</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{stats.orderGrowth}%</span>
              <span className="ml-1">지난 달 대비</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 고객</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{stats.customerGrowth}%</span>
              <span className="ml-1">지난 달 대비</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 주문금액</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{stats.conversionRate}%</span>
              <span className="ml-1">전환율</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 상품별 성과 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>상품별 성과</CardTitle>
                <CardDescription>판매량 기준 상위 5개 상품</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('상품')}>
                <Eye className="mr-1 h-3 w-3" />
                전체 보기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>상품명</TableHead>
                  <TableHead className="text-center">판매량</TableHead>
                  <TableHead className="text-center">평점</TableHead>
                  <TableHead className="text-right">매출</TableHead>
                  <TableHead className="text-right">성장률</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productData.map((product) => {
                  const GrowthIcon = getGrowthIcon(product.growth)
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{product.sales}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{product.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                      <TableCell className="text-right">
                        <div className={`flex items-center justify-end gap-1 ${getGrowthColor(product.growth)}`}>
                          <GrowthIcon className="h-3 w-3" />
                          <span className="text-sm">{product.growth > 0 ? '+' : ''}{product.growth}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 고객 세그먼트 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>고객 세그먼트</CardTitle>
                <CardDescription>고객 유형별 매출 기여도</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('고객')}>
                <Eye className="mr-1 h-3 w-3" />
                전체 보기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customerSegments.map((segment) => (
                <div key={segment.segment} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{segment.segment}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{segment.count}명</span>
                      <span>평균 {formatCurrency(segment.avgOrderValue)}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold">{formatCurrency(segment.revenue)}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-600 rounded-full" 
                          style={{ width: `${segment.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{segment.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 일별 매출 추이 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>일별 매출 추이</CardTitle>
              <CardDescription>최근 5일간의 매출 및 주문 현황</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-1 h-3 w-3" />
                필터
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('매출추이')}>
                <Download className="mr-1 h-3 w-3" />
                내보내기
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead className="text-right">매출</TableHead>
                <TableHead className="text-center">주문 수</TableHead>
                <TableHead className="text-center">고객 수</TableHead>
                <TableHead className="text-right">평균 주문금액</TableHead>
                <TableHead className="text-right">성장률</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((data) => {
                const GrowthIcon = getGrowthIcon(data.growth)
                return (
                  <TableRow key={data.period}>
                    <TableCell>{new Date(data.period).toLocaleDateString('ko-KR')}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(data.revenue)}
                    </TableCell>
                    <TableCell className="text-center">{data.orders}</TableCell>
                    <TableCell className="text-center">{data.customers}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(data.avgOrderValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`flex items-center justify-end gap-1 ${getGrowthColor(data.growth)}`}>
                        <GrowthIcon className="h-3 w-3" />
                        <span>{data.growth > 0 ? '+' : ''}{data.growth}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}