'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign } from 'lucide-react'

interface StatsData {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  totalProducts: number
  productsChange: number
  totalCustomers: number
  customersChange: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalRevenue: 1250000,
    revenueChange: 12.5,
    totalOrders: 148,
    ordersChange: -2.3,
    totalProducts: 1247,
    productsChange: 5.1,
    totalCustomers: 2341,
    customersChange: 8.2,
  })

  // In a real app, fetch this data from your API
  useEffect(() => {
    // fetchDashboardStats()
  }, [])

  const statsItems = [
    {
      title: '총 매출',
      value: formatPrice(stats.totalRevenue),
      change: stats.revenueChange,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: '총 주문',
      value: stats.totalOrders.toLocaleString(),
      change: stats.ordersChange,
      icon: ShoppingCart,
      color: 'text-blue-600',
    },
    {
      title: '총 상품',
      value: stats.totalProducts.toLocaleString(),
      change: stats.productsChange,
      icon: Package,
      color: 'text-purple-600',
    },
    {
      title: '총 고객',
      value: stats.totalCustomers.toLocaleString(),
      change: stats.customersChange,
      icon: Users,
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsItems.map((item) => {
        const Icon = item.icon
        const isPositive = item.change > 0
        const TrendIcon = isPositive ? TrendingUp : TrendingDown
        
        return (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <Icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="flex items-center text-xs">
                <TrendIcon className={`mr-1 h-3 w-3 ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`} />
                <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(item.change)}%
                </span>
                <span className="text-muted-foreground ml-1">전월 대비</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}