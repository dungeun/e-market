'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Eye,
  Clock,
  Target,
  Award
} from 'lucide-react'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'

const salesData = {
  daily: [
    { date: '2024-01-09', revenue: 3450000, orders: 45, average: 76667 },
    { date: '2024-01-10', revenue: 4230000, orders: 52, average: 81346 },
    { date: '2024-01-11', revenue: 3890000, orders: 48, average: 81042 },
    { date: '2024-01-12', revenue: 5120000, orders: 61, average: 83934 },
    { date: '2024-01-13', revenue: 4560000, orders: 55, average: 82909 },
    { date: '2024-01-14', revenue: 3780000, orders: 47, average: 80426 },
    { date: '2024-01-15', revenue: 4890000, orders: 58, average: 84310 }
  ],
  weekly: [
    { week: '1주차', revenue: 24500000, orders: 298, average: 82215 },
    { week: '2주차', revenue: 26800000, orders: 321, average: 83489 },
    { week: '3주차', revenue: 25600000, orders: 310, average: 82581 },
    { week: '4주차', revenue: 27900000, orders: 335, average: 83284 }
  ],
  monthly: [
    { month: '10월', revenue: 98500000, orders: 1234, average: 79854 },
    { month: '11월', revenue: 102300000, orders: 1289, average: 79364 },
    { month: '12월', revenue: 115600000, orders: 1456, average: 79396 },
    { month: '1월', revenue: 104800000, orders: 1264, average: 82911 }
  ]
}

const topProducts = [
  { id: 1, name: '무선 이어폰 Pro', category: '전자제품', sales: 234, revenue: 23166000, growth: 15.2 },
  { id: 2, name: '스마트 워치 Series 5', category: '웨어러블', sales: 189, revenue: 56511000, growth: 12.8 },
  { id: 3, name: 'USB-C 허브', category: '액세서리', sales: 456, revenue: 26904000, growth: 8.5 },
  { id: 4, name: '블루투스 키보드', category: '컴퓨터', sales: 167, revenue: 13193000, growth: -3.2 },
  { id: 5, name: '노트북 스탠드', category: '액세서리', sales: 234, revenue: 9126000, growth: 22.4 }
]

const customerStats = [
  { label: '신규 고객', value: 142, change: 12.5, icon: Users },
  { label: '재구매율', value: 34.5, change: 2.3, icon: TrendingUp },
  { label: '평균 구매액', value: 82911, change: 4.2, icon: DollarSign },
  { label: '고객 만족도', value: 4.6, change: 0.2, icon: Award }
]

const categoryPerformance = [
  { category: '전자제품', revenue: 45600000, orders: 534, percentage: 43.5 },
  { category: '패션', revenue: 23400000, orders: 412, percentage: 22.3 },
  { category: '가전제품', revenue: 18900000, orders: 189, percentage: 18.0 },
  { category: '도서', revenue: 9800000, orders: 325, percentage: 9.3 },
  { category: '스포츠', revenue: 7100000, orders: 98, percentage: 6.8 }
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('daily')
  const [dateRange, setDateRange] = useState('7days')

  const currentPeriodData = salesData[period as keyof typeof salesData]
  const totalRevenue = currentPeriodData.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = currentPeriodData.reduce((sum, item) => sum + item.orders, 0)
  const averageOrderValue = Math.round(totalRevenue / totalOrders)

  const previousRevenue = totalRevenue * 0.92 // 예시 데이터
  const revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">판매 분석</h2>
          <p className="text-muted-foreground">판매 데이터를 분석하고 인사이트를 확인합니다.</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">최근 7일</SelectItem>
              <SelectItem value="30days">최근 30일</SelectItem>
              <SelectItem value="90days">최근 90일</SelectItem>
              <SelectItem value="1year">최근 1년</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => toast.info('리포트 다운로드')}>
            <Download className="mr-2 h-4 w-4" />
            리포트
          </Button>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              총 매출
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{(totalRevenue / 1000000).toFixed(1)}M</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              {revenueGrowth}% 증가
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              총 주문
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              8.3% 증가
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              평균 주문액
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{averageOrderValue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              4.2% 증가
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              전환율
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.8%</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="mr-1 h-3 w-3" />
              0.5% 감소
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 매출 추이 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>매출 추이</CardTitle>
            <Tabs value={period} onValueChange={setPeriod}>
              <TabsList>
                <TabsTrigger value="daily">일별</TabsTrigger>
                <TabsTrigger value="weekly">주별</TabsTrigger>
                <TabsTrigger value="monthly">월별</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {period === 'daily' ? '날짜' : period === 'weekly' ? '주차' : '월'}
                </TableHead>
                <TableHead className="text-right">매출</TableHead>
                <TableHead className="text-right">주문</TableHead>
                <TableHead className="text-right">평균 주문액</TableHead>
                <TableHead className="text-right">추세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPeriodData.map((item, index) => {
                const prevValue = index > 0 ? currentPeriodData[index - 1].revenue : item.revenue
                const change = ((item.revenue - prevValue) / prevValue * 100).toFixed(1)
                const isPositive = parseFloat(change) >= 0
                
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {'date' in item ? item.date : 'week' in item ? item.week : item.month}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₩{item.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{item.orders}</TableCell>
                    <TableCell className="text-right">₩{item.average.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className={`flex items-center justify-end ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? (
                          <TrendingUp className="mr-1 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3" />
                        )}
                        {Math.abs(parseFloat(change))}%
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 인기 상품 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              인기 상품 TOP 5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₩{(product.revenue / 1000000).toFixed(1)}M</p>
                    <p className={`text-xs flex items-center justify-end gap-1 ${
                      product.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.growth >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(product.growth)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 카테고리별 성과 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              카테고리별 성과
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryPerformance.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-muted-foreground">{category.percentage}%</span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₩{(category.revenue / 1000000).toFixed(1)}M</span>
                    <span>{category.orders}건</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 고객 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>고객 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {customerStats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{stat.label}</p>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">
                    {stat.label === '평균 구매액' 
                      ? `₩${stat.value.toLocaleString()}`
                      : stat.label === '재구매율'
                      ? `${stat.value}%`
                      : stat.label === '고객 만족도'
                      ? `${stat.value}/5`
                      : stat.value.toLocaleString()
                    }
                  </div>
                  <div className={`flex items-center text-xs ${
                    stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change >= 0 ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {Math.abs(stat.change)}% {stat.change >= 0 ? '증가' : '감소'}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}