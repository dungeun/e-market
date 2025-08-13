'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { Eye } from 'lucide-react'
import Link from 'next/link'

const recentOrders = [
  {
    id: 'ORD-001',
    customer: '김철수',
    email: 'kim@example.com',
    amount: 125000,
    status: 'pending',
    date: new Date('2024-01-15'),
  },
  {
    id: 'ORD-002',
    customer: '이영희',
    email: 'lee@example.com',
    amount: 89000,
    status: 'processing',
    date: new Date('2024-01-14'),
  },
  {
    id: 'ORD-003',
    customer: '박민수',
    email: 'park@example.com',
    amount: 156000,
    status: 'shipped',
    date: new Date('2024-01-13'),
  },
  {
    id: 'ORD-004',
    customer: '정다은',
    email: 'jung@example.com',
    amount: 78000,
    status: 'delivered',
    date: new Date('2024-01-12'),
  },
  {
    id: 'ORD-005',
    customer: '최현우',
    email: 'choi@example.com',
    amount: 234000,
    status: 'cancelled',
    date: new Date('2024-01-11'),
  },
]

const statusLabels = {
  pending: '결제 대기',
  processing: '처리 중',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소됨',
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function RecentOrders() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>최근 주문</CardTitle>
        <Link href="/admin/orders">
          <Button variant="outline" size="sm">
            전체 보기
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                
                <div>
                  <p className="text-sm">{order.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.date)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">{formatPrice(order.amount)}</p>
                  <Badge 
                    variant="secondary"
                    className={statusColors[order.status as keyof typeof statusColors]}
                  >
                    {statusLabels[order.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
                
                <Link href={`/admin/orders/${order.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}