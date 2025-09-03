'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  user?: {
    name: string
    email: string
  }
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentOrders()
  }, [])

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/admin/recent-orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: '대기중', className: 'bg-yellow-100 text-yellow-800' },
      PAID: { label: '결제완료', className: 'bg-green-100 text-green-800' },
      SHIPPING: { label: '배송중', className: 'bg-blue-100 text-blue-800' },
      DELIVERED: { label: '배송완료', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: '취소됨', className: 'bg-red-100 text-red-800' },
    }
    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">최근 주문</h2>
          <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-800">
            전체보기 →
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주문번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                고객
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                금액
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주문일
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  주문 내역이 없습니다.
                </td>
              </tr>
            ) : (
              orders.slice(0, 5).map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.user?.name || '-'}</div>
                    <div className="text-sm text-gray-500">{order.user?.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₩{order.total.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}