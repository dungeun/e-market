'use client'

import { useState, useEffect } from 'react'
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

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  price: number
  current_product_name?: string
  product_image?: string
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  total_amount: number
  status: string
  payment_status: string
  payment_method: string
  shipping_address: string
  tracking_number: string | null
  created_at: string
  delivery_date: string | null
  items: OrderItem[]
}

interface OrderStats {
  total: number
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  totalRevenue: number
}

interface ApiResponse {
  success: boolean
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: OrderStats
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery })
      })
      
      const response = await fetch(`/api/admin/orders?${params}`)
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setOrders(data.orders)
        setStats(data.stats)
      } else {
        toast.error('주문 데이터를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('주문 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery !== '') {
        fetchOrders()
      } else if (searchQuery === '') {
        fetchOrders()
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const getStatusBadge = (status: string) => {
    const statusConfig: unknown = {
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
    const statusConfig: unknown = {
      pending: { label: '결제대기', color: 'bg-yellow-100 text-yellow-800' },
      paid: { label: '결제완료', color: 'bg-green-100 text-green-800' },
      refunded: { label: '환불완료', color: 'bg-gray-100 text-gray-800' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const handleOrderAction = async (action: string, order: Order) => {
    switch(action) {
      case 'view':
        setSelectedOrder(order)
        break
      case 'process':
        try {
          const response = await fetch('/api/admin/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              status: 'processing'
            })
          })
          const result = await response.json()
          if (result.success) {
            toast.success(`주문 ${order.order_number} 처리 시작`)
            fetchOrders() // Refresh data
          } else {
            toast.error('주문 상태 변경에 실패했습니다.')
          }
        } catch (error) {
          toast.error('주문 상태 변경에 실패했습니다.')
        }
        break
      case 'ship':
        const trackingNumber = prompt('송장번호를 입력하세요:')
        if (trackingNumber) {
          try {
            const response = await fetch('/api/admin/orders', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.id,
                status: 'shipped',
                trackingNumber
              })
            })
            const result = await response.json()
            if (result.success) {
              toast.success(`주문 ${order.order_number} 배송 시작`)
              fetchOrders() // Refresh data
            } else {
              toast.error('주문 상태 변경에 실패했습니다.')
            }
          } catch (error) {
            toast.error('주문 상태 변경에 실패했습니다.')
          }
        }
        break
      case 'cancel':
        try {
          const response = await fetch('/api/admin/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              status: 'cancelled'
            })
          })
          const result = await response.json()
          if (result.success) {
            toast.warning(`주문 ${order.order_number} 취소 처리`)
            fetchOrders() // Refresh data
          } else {
            toast.error('주문 상태 변경에 실패했습니다.')
          }
        } catch (error) {
          toast.error('주문 상태 변경에 실패했습니다.')
        }
        break
      case 'refund':
        toast.info(`주문 ${order.order_number} 환불 처리 - 실제 환불 시스템 연동 필요`)
        break
    }
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>주문 상태 필터</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    전체
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                    대기중
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('processing')}>
                    처리중
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('shipped')}>
                    배송중
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('delivered')}>
                    배송완료
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                    취소됨
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <span className="ml-2">주문 데이터를 불러오는 중...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    주문 데이터가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{order.items[0]?.current_product_name || order.items[0]?.product_name || 'N/A'}</p>
                        {order.items.length > 1 && (
                          <p className="text-xs text-muted-foreground">
                            외 {order.items.length - 1}개
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>₩{order.total_amount.toLocaleString()}</TableCell>
                    <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-sm">{new Date(order.created_at).toLocaleString('ko-KR')}</TableCell>
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
                ))
              )}
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
                <CardTitle>주문 상세: {selectedOrder.order_number}</CardTitle>
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
                    <p>이름: {selectedOrder.customer_name}</p>
                    <p>이메일: {selectedOrder.customer_email}</p>
                    <p>전화번호: {selectedOrder.customer_phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Truck className="mr-2 h-4 w-4" />
                    배송 정보
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>주소: {selectedOrder.shipping_address}</p>
                    {selectedOrder.tracking_number && (
                      <p>송장번호: {selectedOrder.tracking_number}</p>
                    )}
                    {selectedOrder.delivery_date && (
                      <p>배송완료: {new Date(selectedOrder.delivery_date).toLocaleDateString('ko-KR')}</p>
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
                    {selectedOrder.items.map((item: OrderItem, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.current_product_name || item.product_name}</TableCell>
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
                        ₩{selectedOrder.total_amount.toLocaleString()}
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
                    <p>결제방법: {selectedOrder.payment_method}</p>
                    <p>결제상태: {getPaymentStatusBadge(selectedOrder.payment_status)}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    주문 상태
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>주문일시: {new Date(selectedOrder.created_at).toLocaleString('ko-KR')}</p>
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