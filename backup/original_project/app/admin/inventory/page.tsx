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
  Edit, 
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Filter,
  Download,
  Upload,
  BarChart3,
  History
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

const inventory = [
  {
    id: 'INV-001',
    product: {
      name: '무선 이어폰 Pro',
      sku: 'WEP-PRO-001',
      image: '/placeholder.svg',
      category: '전자제품'
    },
    currentStock: 234,
    minStock: 50,
    maxStock: 500,
    reserved: 12,
    available: 222,
    reorderPoint: 100,
    lastRestocked: '2024-01-10',
    status: 'optimal',
    trend: 'stable',
    location: 'A-12-3'
  },
  {
    id: 'INV-002',
    product: {
      name: '스마트 워치 Series 5',
      sku: 'SW-S5-002',
      image: '/placeholder.svg',
      category: '웨어러블'
    },
    currentStock: 45,
    minStock: 30,
    maxStock: 200,
    reserved: 8,
    available: 37,
    reorderPoint: 50,
    lastRestocked: '2024-01-05',
    status: 'low',
    trend: 'decreasing',
    location: 'B-08-2'
  },
  {
    id: 'INV-003',
    product: {
      name: '노트북 스탠드',
      sku: 'LS-STD-003',
      image: '/placeholder.svg',
      category: '액세서리'
    },
    currentStock: 0,
    minStock: 20,
    maxStock: 100,
    reserved: 0,
    available: 0,
    reorderPoint: 30,
    lastRestocked: '2023-12-20',
    status: 'out-of-stock',
    trend: 'critical',
    location: 'C-15-1'
  },
  {
    id: 'INV-004',
    product: {
      name: 'USB-C 허브',
      sku: 'USB-HUB-004',
      image: '/placeholder.svg',
      category: '액세서리'
    },
    currentStock: 156,
    minStock: 40,
    maxStock: 300,
    reserved: 23,
    available: 133,
    reorderPoint: 80,
    lastRestocked: '2024-01-12',
    status: 'optimal',
    trend: 'increasing',
    location: 'A-10-5'
  },
  {
    id: 'INV-005',
    product: {
      name: '블루투스 키보드',
      sku: 'BT-KB-005',
      image: '/placeholder.svg',
      category: '컴퓨터'
    },
    currentStock: 12,
    minStock: 25,
    maxStock: 150,
    reserved: 3,
    available: 9,
    reorderPoint: 40,
    lastRestocked: '2023-12-28',
    status: 'critical',
    trend: 'decreasing',
    location: 'D-20-4'
  }
]

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusBadge = (status: string) => {
    const statusConfig: unknown = {
      'optimal': { label: '최적', color: 'bg-green-100 text-green-800' },
      'low': { label: '부족', color: 'bg-yellow-100 text-yellow-800' },
      'critical': { label: '긴급', color: 'bg-red-100 text-red-800' },
      'out-of-stock': { label: '품절', color: 'bg-gray-100 text-gray-800' }
    }
    
    const config = statusConfig[status] || statusConfig.optimal
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />
    }
  }

  const handleAction = (action: string, item: unknown) => {
    switch(action) {
      case 'edit':
        toast.info(`${item.product.name} 재고 수정`)
        break
      case 'restock':
        toast.success(`${item.product.name} 재입고 처리`)
        break
      case 'history':
        toast.info(`${item.product.name} 재고 이력 조회`)
        break
      case 'adjust':
        toast.info(`${item.product.name} 재고 조정`)
        break
    }
  }

  const stats = {
    totalItems: inventory.length,
    totalStock: inventory.reduce((sum, item) => sum + item.currentStock, 0),
    lowStock: inventory.filter(item => item.status === 'low' || item.status === 'critical').length,
    outOfStock: inventory.filter(item => item.status === 'out-of-stock').length,
    totalValue: 12345000 // 예시 값
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">재고 관리</h2>
          <p className="text-muted-foreground">상품 재고를 관리하고 모니터링합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('재고 가져오기')}>
            <Upload className="mr-2 h-4 w-4" />
            가져오기
          </Button>
          <Button variant="outline" onClick={() => toast.info('재고 내보내기')}>
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
          <Button onClick={() => toast.success('재고 실사 시작')}>
            <Package className="mr-2 h-4 w-4" />
            재고 실사
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 품목</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">관리 품목</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 재고</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">전체 수량</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">재고 부족</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">주의 필요</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">품절</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">즉시 처리</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">재고 가치</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{(stats.totalValue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">총 자산</p>
          </CardContent>
        </Card>
      </div>

      {/* 경고 메시지 */}
      {stats.outOfStock > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-base text-red-900">재고 경고</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800">
              {stats.outOfStock}개 품목이 품절되었고, {stats.lowStock}개 품목의 재고가 부족합니다.
              즉시 재입고 처리가 필요합니다.
            </p>
          </CardContent>
        </Card>
      )}

      {/* 재고 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>재고 현황</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="상품명, SKU 검색..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상품</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>현재 재고</TableHead>
                <TableHead>가용 재고</TableHead>
                <TableHead>재주문점</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>추세</TableHead>
                <TableHead>위치</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium">{item.product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.product.sku}</TableCell>
                  <TableCell>{item.product.category}</TableCell>
                  <TableCell>
                    <div className={item.currentStock <= item.minStock ? 'text-red-600 font-medium' : ''}>
                      {item.currentStock}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{item.available}</p>
                      {item.reserved > 0 && (
                        <p className="text-xs text-muted-foreground">예약: {item.reserved}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.reorderPoint}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{getTrendIcon(item.trend)}</TableCell>
                  <TableCell className="text-sm">{item.location}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleAction('edit', item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          재고 수정
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('restock', item)}>
                          <Package className="mr-2 h-4 w-4" />
                          재입고
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('adjust', item)}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          재고 조정
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('history', item)}>
                          <History className="mr-2 h-4 w-4" />
                          이력 보기
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