'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  quantity: number
  isActive: boolean
  images: Array<{ id: string; url: string; alt?: string }>
  category?: { id: string; name: string }
  createdAt: string
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        setProducts(products.map(p => 
          p.id === productId ? { ...p, isActive: !isActive } : p
        ))
      }
    } catch (error) {
      console.error('Error updating product status:', error)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">이미지</TableHead>
            <TableHead>상품명</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>가격</TableHead>
            <TableHead>재고</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="w-[100px]">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.slug}</div>
                </div>
              </TableCell>
              
              <TableCell>
                {product.category ? (
                  <Badge variant="secondary">{product.category.name}</Badge>
                ) : (
                  <span className="text-gray-400">미분류</span>
                )}
              </TableCell>
              
              <TableCell>
                <div>
                  <div className="font-medium">{formatPrice(product.price)}</div>
                  {product.compareAtPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className={`font-medium ${product.quantity <= 0 ? 'text-red-600' : 
                  product.quantity <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {product.quantity}
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant={product.isActive ? 'default' : 'secondary'}>
                  {product.isActive ? '활성' : '비활성'}
                </Badge>
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      상세보기
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => toggleProductStatus(product.id, product.isActive)}
                    >
                      {product.isActive ? '비활성화' : '활성화'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {products.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          등록된 상품이 없습니다.
        </div>
      )}
    </div>
  )
}