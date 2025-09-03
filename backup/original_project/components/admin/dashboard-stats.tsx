'use client'

import { useEffect, useState } from 'react'
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

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const isPositive = change && change > 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center text-sm">
              <TrendIcon className={`mr-1 h-3 w-3 ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`} />
              <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(change)}%
              </span>
              <span className="text-gray-500 ml-1">전월 대비</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const defaultStats = {
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    totalProducts: 0,
    productsChange: 0,
    totalCustomers: 0,
    customersChange: 0,
  }

  const currentStats = stats || defaultStats

  const statsItems = [
    {
      title: '총 매출',
      value: `₩${currentStats.totalRevenue.toLocaleString()}`,
      change: currentStats.revenueChange,
      icon: <DollarSign className="h-6 w-6 text-white" />,
      color: 'bg-green-500',
    },
    {
      title: '총 주문',
      value: currentStats.totalOrders.toLocaleString(),
      change: currentStats.ordersChange,
      icon: <ShoppingCart className="h-6 w-6 text-white" />,
      color: 'bg-blue-500',
    },
    {
      title: '총 상품',
      value: currentStats.totalProducts.toLocaleString(),
      change: currentStats.productsChange,
      icon: <Package className="h-6 w-6 text-white" />,
      color: 'bg-purple-500',
    },
    {
      title: '총 고객',
      value: currentStats.totalCustomers.toLocaleString(),
      change: currentStats.customersChange,
      icon: <Users className="h-6 w-6 text-white" />,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsItems.map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </div>
  )
}