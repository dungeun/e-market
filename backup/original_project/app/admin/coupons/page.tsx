'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  MoreVertical, 
  Plus,
  Edit,
  Copy,
  Trash,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Users,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Gift
} from 'lucide-react'
import { toast } from 'sonner'

const coupons = [
  {
    id: 'CPN-001',
    code: 'WELCOME10',
    name: '신규 가입 10% 할인',
    type: 'percentage',
    value: 10,
    minOrderAmount: 30000,
    maxDiscount: 10000,
    usageLimit: 1,
    usageCount: 234,
    customerLimit: 1,
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    applicableProducts: 'all',
    description: '신규 회원 가입시 첫 구매 10% 할인'
  },
  {
    id: 'CPN-002',
    code: 'FREESHIP',
    name: '무료 배송 쿠폰',
    type: 'shipping',
    value: 0,
    minOrderAmount: 50000,
    maxDiscount: null,
    usageLimit: 1000,
    usageCount: 456,
    customerLimit: 3,
    status: 'active',
    startDate: '2024-01-10',
    endDate: '2024-02-10',
    applicableProducts: 'all',
    description: '5만원 이상 구매시 무료 배송'
  },
  {
    id: 'CPN-003',
    code: 'FLASH20',
    name: '플래시 세일 20% 할인',
    type: 'percentage',
    value: 20,
    minOrderAmount: 100000,
    maxDiscount: 50000,
    usageLimit: 100,
    usageCount: 100,
    customerLimit: 1,
    status: 'expired',
    startDate: '2024-01-05',
    endDate: '2024-01-07',
    applicableProducts: 'category:electronics',
    description: '전자제품 한정 플래시 세일'
  },
  {
    id: 'CPN-004',
    code: 'VIP30',
    name: 'VIP 고객 30% 할인',
    type: 'percentage',
    value: 30,
    minOrderAmount: 200000,
    maxDiscount: 100000,
    usageLimit: 50,
    usageCount: 12,
    customerLimit: 5,
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    applicableProducts: 'all',
    description: 'VIP 등급 고객 전용 특별 할인'
  },
  {
    id: 'CPN-005',
    code: 'FIXED5000',
    name: '5천원 할인',
    type: 'fixed',
    value: 5000,
    minOrderAmount: 30000,
    maxDiscount: 5000,
    usageLimit: 500,
    usageCount: 234,
    customerLimit: 2,
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-01-31',
    applicableProducts: 'all',
    description: '3만원 이상 구매시 5천원 할인'
  },
  {
    id: 'CPN-006',
    code: 'BIRTHDAY',
    name: '생일 축하 쿠폰',
    type: 'percentage',
    value: 15,
    minOrderAmount: 0,
    maxDiscount: 30000,
    usageLimit: null,
    usageCount: 89,
    customerLimit: 1,
    status: 'draft',
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    applicableProducts: 'all',
    description: '생일 고객 15% 특별 할인'
  }
]

export default function CouponsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusBadge = (status: string) => {
    const statusConfig: unknown = {
      active: { label: '활성', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      expired: { label: '만료', color: 'bg-gray-100 text-gray-800', icon: XCircle },
      draft: { label: '초안', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    }
    
    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />
      case 'fixed':
        return <DollarSign className="h-4 w-4" />
      case 'shipping':
        return <Gift className="h-4 w-4" />
      default:
        return <Tag className="h-4 w-4" />
    }
  }

  const formatValue = (type: string, value: number) => {
    switch(type) {
      case 'percentage':
        return `${value}%`
      case 'fixed':
        return `₩${value.toLocaleString()}`
      case 'shipping':
        return '무료 배송'
      default:
        return value
    }
  }

  const handleCouponAction = (action: string, coupon: unknown) => {
    switch(action) {
      case 'edit':
        toast.info(`${coupon.code} 쿠폰 수정`)
        break
      case 'duplicate':
        toast.success(`${coupon.code} 쿠폰 복제됨`)
        break
      case 'deactivate':
        toast.warning(`${coupon.code} 쿠폰 비활성화`)
        break
      case 'delete':
        toast.error(`${coupon.code} 쿠폰 삭제`)
        break
    }
  }

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.status === 'active').length,
    totalUsage: coupons.reduce((sum, c) => sum + c.usageCount, 0),
    totalSavings: 12340000 // 예시 데이터
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">쿠폰 관리</h2>
          <p className="text-muted-foreground">할인 쿠폰을 생성하고 관리합니다.</p>
        </div>
        <Button onClick={() => toast.success('새 쿠폰 생성')}>
          <Plus className="mr-2 h-4 w-4" />
          쿠폰 생성
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 쿠폰</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">생성된 쿠폰</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">활성 쿠폰</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">사용 가능</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 사용 횟수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">누적 사용</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 할인액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{(stats.totalSavings / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">고객 절약액</p>
          </CardContent>
        </Card>
      </div>

      {/* 쿠폰 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>쿠폰 목록</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="쿠폰 코드, 이름 검색..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>쿠폰 코드</TableHead>
                <TableHead>쿠폰명</TableHead>
                <TableHead>할인</TableHead>
                <TableHead>최소 주문액</TableHead>
                <TableHead>사용 현황</TableHead>
                <TableHead>유효 기간</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(coupon.type)}
                      <code className="font-mono font-semibold">{coupon.code}</code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{coupon.name}</p>
                      <p className="text-xs text-muted-foreground">{coupon.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{formatValue(coupon.type, coupon.value)}</p>
                      {coupon.maxDiscount && (
                        <p className="text-xs text-muted-foreground">
                          최대 ₩{coupon.maxDiscount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.minOrderAmount > 0 
                      ? `₩${coupon.minOrderAmount.toLocaleString()}`
                      : '제한 없음'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{coupon.usageCount} / {coupon.usageLimit || '∞'}</p>
                      {coupon.usageLimit && (
                        <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${(coupon.usageCount / coupon.usageLimit * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{coupon.startDate}</p>
                      <p className="text-muted-foreground">~ {coupon.endDate}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(coupon.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>작업</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleCouponAction('edit', coupon)}>
                          <Edit className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCouponAction('duplicate', coupon)}>
                          <Copy className="mr-2 h-4 w-4" />
                          복제
                        </DropdownMenuItem>
                        {coupon.status === 'active' && (
                          <DropdownMenuItem onClick={() => handleCouponAction('deactivate', coupon)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            비활성화
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleCouponAction('delete', coupon)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}