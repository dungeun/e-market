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
  Search, 
  MoreVertical, 
  Eye,
  Filter,
  Download,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User
} from 'lucide-react'
import { toast } from 'sonner'

const orders = [
  {
    id: 'ORD-2024-001',
    customer: {
      name: '김철수',
      email: 'kim@example.com',
      phone: '010-1234-5678'
    },
    items: [
      { name: '무선 이어폰 Pro', quantity: 1, price: 99000 },
      { name: 'USB-C 케이블', quantity: 2, price: 15000 }
    ],
    total: 129000,
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: '신용카드',
    shippingAddress: '서울시 강남구 테헤란로 123',
    trackingNumber: '',
    orderDate: '2024-01-15 14:23',
    deliveryDate: null
  },
  {
    id: 'ORD-2024-002',
    customer: {
      name: '이영희',
      email: 'lee@example.com',
      phone: '010-2345-6789'
    },
    items: [
      { name: '스마트 워치', quantity: 1, price: 299000 }
    ],
    total: 299000,
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: '카카오페이',
    shippingAddress: '서울시 서초구 서초대로 456',
    trackingNumber: 'CJ123456789',
    orderDate: '2024-01-14 10:15',
    deliveryDate: '2024-01-16'
  },
  {
    id: 'ORD-2024-003',
    customer: {
      name: '박민수',
      email: 'park@example.com',
      phone: '010-3456-7890'
    },
    items: [
      { name: '노트북 스탠드', quantity: 1, price: 39000 },
      { name: '무선 마우스', quantity: 1, price: 45000 }
    ],
    total: 84000,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: '네이버페이',
    shippingAddress: '부산시 해운대구 해운대로 789',
    trackingNumber: 'HJ987654321',
    orderDate: '2024-01-13 16:45',
    deliveryDate: '2024-01-15'
  },
  {
    id: 'ORD-2024-004',
    customer: {
      name: '정수진',
      email: 'jung@example.com',
      phone: '010-4567-8901'
    },
    items: [
      { name: '블루투스 키보드', quantity: 1, price: 79000 }
    ],
    total: 79000,
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: '계좌이체',
    shippingAddress: '대전시 유성구 대학로 101',
    trackingNumber: '',
    orderDate: '2024-01-12 09:30',
    deliveryDate: null
  },
  {
    id: 'ORD-2024-005',
    customer: {
      name: '최동현',
      email: 'choi@example.com',
      phone: '010-5678-9012'
    },
    items: [
      { name: 'USB 허브', quantity: 2, price: 59000 },
      { name: 'HDMI 케이블', quantity: 1, price: 25000 }
    ],
    total: 143000,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: '가상계좌',
    shippingAddress: '인천시 연수구 송도대로 202',
    trackingNumber: '',
    orderDate: '2024-01-15 18:20',
    deliveryDate: null
  }
]

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { label: '대기중', color: 'bg-gray-100 text-gray-800', icon: Clock },
      processing: { label: '처리중', color: 'bg-blue-100 text-blue-800', icon: Package },
      shipped: { label: '배송중', color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { label: '배송완료', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: '취소됨', color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { label: '결제대기', color: 'bg-yellow-100 text-yellow-800' },
      paid: { label: '결제완료', color: 'bg-green-100 text-green-800' },
      refunded: { label: '환불완료', color: 'bg-gray-100 text-gray-800' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const handleOrderAction = (action: string, order: any) => {
    switch(action) {
      case 'view':
        setSelectedOrder(order)
        break
      case 'process':
        toast.success(`주문 ${order.id} 처리 시작`)
        break
      case 'ship':
        toast.success(`주문 ${order.id} 배송 시작`)
        break
      case 'cancel':
        toast.warning(`주문 ${order.id} 취소 처리`)
        break
      case 'refund':
        toast.info(`주문 ${order.id} 환불 처리`)
        break
    }
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">주문 관리</h2>
          <p className="text-muted-foreground">주문 내역을 확인하고 관리합니다.</p>
        </div>
        <Button variant="outline" onClick={() => toast.info('주문 내역 다운로드')}>
          <Download className="mr-2 h-4 w-4" />
          내보내기
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 주문</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">대기중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">처리중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">배송중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">배송완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* 주문 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>주문 목록</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="주문번호, 고객명 검색..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>주문번호</TableHead>
                <TableHead>고객</TableHead>
                <TableHead>상품</TableHead>
                <TableHead>결제금액</TableHead>
                <TableHead>결제상태</TableHead>
                <TableHead>주문상태</TableHead>
                <TableHead>주문일시</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{order.items[0].name}</p>
                      {order.items.length > 1 && (
                        <p className="text-xs text-muted-foreground">
                          외 {order.items.length - 1}개
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>₩{order.total.toLocaleString()}</TableCell>
                  <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-sm">{order.orderDate}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleOrderAction('view', order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          상세 보기
                        </DropdownMenuItem>
                        {order.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleOrderAction('process', order)}>
                            <Package className="mr-2 h-4 w-4" />
                            주문 처리
                          </DropdownMenuItem>
                        )}
                        {order.status === 'processing' && (
                          <DropdownMenuItem onClick={() => handleOrderAction('ship', order)}>
                            <Truck className="mr-2 h-4 w-4" />
                            배송 시작
                          </DropdownMenuItem>
                        )}
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleOrderAction('cancel', order)}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              주문 취소
                            </DropdownMenuItem>
                          </>
                        )}
                        {order.paymentStatus === 'paid' && order.status !== 'cancelled' && (
                          <DropdownMenuItem onClick={() => handleOrderAction('refund', order)}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            환불 처리
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 주문 상세 모달 */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedOrder(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>주문 상세: {selectedOrder.id}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    고객 정보
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>이름: {selectedOrder.customer.name}</p>
                    <p>이메일: {selectedOrder.customer.email}</p>
                    <p>전화번호: {selectedOrder.customer.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Truck className="mr-2 h-4 w-4" />
                    배송 정보
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>주소: {selectedOrder.shippingAddress}</p>
                    {selectedOrder.trackingNumber && (
                      <p>송장번호: {selectedOrder.trackingNumber}</p>
                    )}
                    {selectedOrder.deliveryDate && (
                      <p>배송완료: {selectedOrder.deliveryDate}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Package className="mr-2 h-4 w-4" />
                  주문 상품
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>상품명</TableHead>
                      <TableHead className="text-center">수량</TableHead>
                      <TableHead className="text-right">가격</TableHead>
                      <TableHead className="text-right">소계</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">₩{item.price.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          ₩{(item.price * item.quantity).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-semibold">
                        총 결제금액
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₩{selectedOrder.total.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    결제 정보
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>결제방법: {selectedOrder.paymentMethod}</p>
                    <p>결제상태: {getPaymentStatusBadge(selectedOrder.paymentStatus)}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    주문 상태
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>주문일시: {selectedOrder.orderDate}</p>
                    <p>상태: {getStatusBadge(selectedOrder.status)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}