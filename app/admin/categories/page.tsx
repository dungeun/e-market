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
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash, 
  Eye,
  Folder,
  FolderOpen,
  ChevronRight,
  Package,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'

const categories = [
  {
    id: 'CAT-001',
    name: '전자제품',
    slug: 'electronics',
    parent: null,
    description: '스마트폰, 노트북, 태블릿 등',
    productCount: 245,
    status: 'active',
    subcategories: [
      { id: 'CAT-001-1', name: '스마트폰', productCount: 89 },
      { id: 'CAT-001-2', name: '노트북', productCount: 67 },
      { id: 'CAT-001-3', name: '태블릿', productCount: 45 },
      { id: 'CAT-001-4', name: '액세서리', productCount: 44 }
    ]
  },
  {
    id: 'CAT-002',
    name: '패션',
    slug: 'fashion',
    parent: null,
    description: '의류, 신발, 가방 등',
    productCount: 389,
    status: 'active',
    subcategories: [
      { id: 'CAT-002-1', name: '남성의류', productCount: 123 },
      { id: 'CAT-002-2', name: '여성의류', productCount: 156 },
      { id: 'CAT-002-3', name: '신발', productCount: 78 },
      { id: 'CAT-002-4', name: '가방', productCount: 32 }
    ]
  },
  {
    id: 'CAT-003',
    name: '가전제품',
    slug: 'appliances',
    parent: null,
    description: '냉장고, 세탁기, TV 등',
    productCount: 156,
    status: 'active',
    subcategories: [
      { id: 'CAT-003-1', name: '주방가전', productCount: 67 },
      { id: 'CAT-003-2', name: '생활가전', productCount: 45 },
      { id: 'CAT-003-3', name: 'TV/오디오', productCount: 44 }
    ]
  },
  {
    id: 'CAT-004',
    name: '도서',
    slug: 'books',
    parent: null,
    description: '소설, 에세이, 전문서적 등',
    productCount: 892,
    status: 'active',
    subcategories: [
      { id: 'CAT-004-1', name: '소설', productCount: 345 },
      { id: 'CAT-004-2', name: '에세이', productCount: 234 },
      { id: 'CAT-004-3', name: '전문서적', productCount: 213 },
      { id: 'CAT-004-4', name: '만화', productCount: 100 }
    ]
  },
  {
    id: 'CAT-005',
    name: '스포츠',
    slug: 'sports',
    parent: null,
    description: '운동용품, 스포츠웨어 등',
    productCount: 123,
    status: 'inactive',
    subcategories: []
  }
]

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleAction = (action: string, category: any) => {
    switch(action) {
      case 'edit':
        toast.info(`${category.name} 카테고리 수정`)
        break
      case 'delete':
        toast.error(`${category.name} 카테고리 삭제`)
        break
      case 'add-sub':
        toast.success(`${category.name}에 하위 카테고리 추가`)
        break
      case 'view-products':
        toast.info(`${category.name} 카테고리의 상품 보기`)
        break
    }
  }

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">활성</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">비활성</Badge>
    )
  }

  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0)
  const activeCategories = categories.filter(cat => cat.status === 'active').length

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">카테고리 관리</h2>
          <p className="text-muted-foreground">상품 카테고리를 관리합니다.</p>
        </div>
        <Button onClick={() => toast.success('새 카테고리 추가')}>
          <Plus className="mr-2 h-4 w-4" />
          카테고리 추가
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 카테고리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">메인 카테고리</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">활성 카테고리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCategories}</div>
            <p className="text-xs text-muted-foreground">사용 중</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">하위 카테고리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">서브 카테고리</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 상품</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">등록된 상품</p>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>카테고리 목록</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="카테고리 검색..."
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
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>슬러그</TableHead>
                <TableHead>설명</TableHead>
                <TableHead>상품 수</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <>
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.subcategories.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleCategory(category.id)}
                        >
                          <ChevronRight 
                            className={`h-4 w-4 transition-transform ${
                              expandedCategories.includes(category.id) ? 'rotate-90' : ''
                            }`}
                          />
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {expandedCategories.includes(category.id) ? (
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Folder className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">/{category.slug}</TableCell>
                    <TableCell className="text-sm">{category.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {category.productCount}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(category.status)}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleAction('edit', category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('add-sub', category)}>
                            <Plus className="mr-2 h-4 w-4" />
                            하위 카테고리 추가
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('view-products', category)}>
                            <Eye className="mr-2 h-4 w-4" />
                            상품 보기
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleAction('delete', category)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedCategories.includes(category.id) && category.subcategories.map((sub) => (
                    <TableRow key={sub.id} className="bg-muted/50">
                      <TableCell></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 pl-8">
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{sub.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        /{category.slug}/{sub.name.toLowerCase()}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          {sub.productCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 text-xs">활성</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}