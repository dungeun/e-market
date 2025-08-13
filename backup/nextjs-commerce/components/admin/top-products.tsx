'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

const topProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    sales: 124,
    revenue: 186000000,
    image: '/placeholder-product.jpg',
  },
  {
    id: 2,
    name: 'MacBook Pro M3',
    sales: 89,
    revenue: 267000000,
    image: '/placeholder-product.jpg',
  },
  {
    id: 3,
    name: 'iPad Air',
    sales: 156,
    revenue: 124800000,
    image: '/placeholder-product.jpg',
  },
  {
    id: 4,
    name: 'AirPods Pro',
    sales: 234,
    revenue: 70200000,
    image: '/placeholder-product.jpg',
  },
  {
    id: 5,
    name: 'Apple Watch',
    sales: 178,
    revenue: 89000000,
    image: '/placeholder-product.jpg',
  },
]

export function TopProducts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>인기 상품</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={product.id} className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                {index + 1}
              </div>
              
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                  <div className="w-6 h-6 bg-gray-300 rounded" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.sales}개 판매
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium">
                  {formatPrice(product.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}