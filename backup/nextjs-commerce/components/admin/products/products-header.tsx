'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter } from 'lucide-react'
import { ProductModal } from './product-modal'

export function ProductsHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
          <p className="text-gray-600">상품을 추가, 수정, 삭제할 수 있습니다</p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          상품 추가
        </Button>
      </div>
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="상품명, SKU, 카테고리로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          필터
        </Button>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {

          setIsModalOpen(false)
        }}
      />
    </>
  )
}