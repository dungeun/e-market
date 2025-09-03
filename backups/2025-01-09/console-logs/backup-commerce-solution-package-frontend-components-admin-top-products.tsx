'use client'

import { useEffect, useState } from 'react'

interface TopProduct {
  id: string
  name: string
  category: string
  revenue: number
  sales: number
}

export function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopProducts()
  }, [])

  const fetchTopProducts = async () => {
    try {
      const response = await fetch('/api/admin/top-products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching top products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">인기 상품 TOP 5</h2>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          데이터가 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {products.slice(0, 5).map((product, index) => (
            <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">₩{product.revenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{product.sales}개 판매</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}