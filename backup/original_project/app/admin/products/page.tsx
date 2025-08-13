'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash, 
  Eye,
  Filter,
  Download,
  Upload
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

const products = [
  {
    id: '1',
    name: '무선 이어폰 Pro',
    category: '오디오',
    price: '₩99,000',
    stock: 234,
    status: '판매중',
    image: '/placeholder.svg',
    sales: 156,
  },
  {
    id: '2',
    name: '스마트 워치 Series 5',
    category: '웨어러블',
    price: '₩299,000',
    stock: 89,
    status: '판매중',
    image: '/placeholder.svg',
    sales: 89,
  },
  {
    id: '3',
    name: '노트북 스탠드',
    category: '액세서리',
    price: '₩39,000',
    stock: 0,
    status: '품절',
    image: '/placeholder.svg',
    sales: 234,
  },
  {
    id: '4',
    name: 'USB-C 허브',
    category: '액세서리',
    price: '₩59,000',
    stock: 45,
    status: '판매중',
    image: '/placeholder.svg',
    sales: 67,
  },
  {
    id: '5',
    name: '블루투스 키보드',
    category: '컴퓨터',
    price: '₩79,000',
    stock: 12,
    status: '재고부족',
    image: '/placeholder.svg',
    sales: 45,
  },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleAction = (action: string, productName: string) => {
    toast.success(`${productName} - ${action}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '판매중':
        return <Badge className="bg-green-100 text-green-800">판매중</Badge>
      case '품절':
        return <Badge className="bg-red-100 text-red-800">품절</Badge>
      case '재고부족':
        return <Badge className="bg-yellow-100 text-yellow-800">재고부족</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600'
    if (stock < 20) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">상품 관리</h2>
          <p className="text-muted-foreground">총 {products.length}개의 상품이 등록되어 있습니다.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('상품 가져오기')}>
            <Upload className="mr-2 h-4 w-4" />
            가져오기
          </Button>
          <Button variant="outline" onClick={() => toast.info('상품 내보내기')}>
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
          <Button onClick={() => toast.success('새 상품 추가 페이지로 이동')}>
            <Plus className="mr-2 h-4 w-4" />
            새 상품 추가
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 상품</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">등록된 상품 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">판매 중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.status === '판매중').length}
            </div>
            <p className="text-xs text-muted-foreground">활성 상품</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">재고 부족</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {products.filter(p => p.status === '재고부족').length}
            </div>
            <p className="text-xs text-muted-foreground">재입고 필요</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">품절</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {products.filter(p => p.status === '품절').length}
            </div>
            <p className="text-xs text-muted-foreground">재고 없음</p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>상품 목록</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="상품 검색..."
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
                <TableHead className="w-[50px]">이미지</TableHead>
                <TableHead>상품명</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>가격</TableHead>
                <TableHead>재고</TableHead>
                <TableHead>판매량</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-hidden rounded">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell className={getStockColor(product.stock)}>
                    {product.stock}
                  </TableCell>
                  <TableCell>{product.sales}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleAction('상세 보기', product.name)}>
                          <Eye className="mr-2 h-4 w-4" />
                          상세 보기
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('수정', product.name)}>
                          <Edit className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleAction('삭제', product.name)}
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