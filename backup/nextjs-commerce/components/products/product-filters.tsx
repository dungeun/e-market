'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function ProductFilters() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    brand: false,
  })
  
  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">필터</h2>
        
        {/* Category Filter */}
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection('category')}
            className="flex w-full items-center justify-between py-2 text-sm font-medium"
          >
            카테고리
            {openSections.category ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {openSections.category && (
            <div className="mt-2 space-y-2">
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" />
                의류
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" />
                전자제품
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" />
                가구
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" />
                식품
              </label>
            </div>
          )}
        </div>
        
        {/* Price Filter */}
        <div className="border-b pb-4 pt-4">
          <button
            onClick={() => toggleSection('price')}
            className="flex w-full items-center justify-between py-2 text-sm font-medium"
          >
            가격
            {openSections.price ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {openSections.price && (
            <div className="mt-2 space-y-2">
              <label className="flex items-center text-sm">
                <input type="radio" name="price" className="mr-2" />
                ₩0 - ₩10,000
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="price" className="mr-2" />
                ₩10,000 - ₩50,000
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="price" className="mr-2" />
                ₩50,000 - ₩100,000
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="price" className="mr-2" />
                ₩100,000+
              </label>
            </div>
          )}
        </div>
        
        {/* Brand Filter */}
        <div className="pt-4">
          <button
            onClick={() => toggleSection('brand')}
            className="flex w-full items-center justify-between py-2 text-sm font-medium"
          >
            브랜드
            {openSections.brand ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {openSections.brand && (
            <div className="mt-2 space-y-2">
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" />
                Nike
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" />
                Adidas
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" />
                Samsung
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" />
                LG
              </label>
            </div>
          )}
        </div>
      </div>
      
      <Button className="w-full">필터 적용</Button>
    </div>
  )
}