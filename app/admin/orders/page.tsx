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
  const [shippingModal, setShippingModal] = useState<{ isOpen: boolean; order: Order | null; tab: 'direct' | 'courier' }>({
    isOpen: false,
    order: null,
    tab: 'direct'
  })
  const [deliveryStatusModal, setDeliveryStatusModal] = useState<{ isOpen: boolean; order: Order | null }>({
    isOpen: false,
    order: null
  })

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
            toast.success(`주문 ${order.order_number}을(를) 수락했습니다.`)
            fetchOrders() // Refresh data
          } else {
            toast.error('주문 수락에 실패했습니다.')
          }
        } catch (error) {
          toast.error('주문 상태 변경에 실패했습니다.')
        }
        break
      case 'ship':
        // 배송 모달 열기
        console.log('Opening shipping modal for order:', order)
        setShippingModal({
          isOpen: true,
          order: order,
          tab: 'direct' // 직접배송이 기본 탭
        })
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
            toast.warning(`주문 ${order.order_number}을(를) 거절/취소했습니다.`)
            fetchOrders() // Refresh data
          } else {
            toast.error('주문 거절/취소에 실패했습니다.')
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

  const handleShipping = async (type: 'direct' | 'courier', trackingNumber?: string) => {
    if (!shippingModal.order) return

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: shippingModal.order.id,
          status: 'shipped',
          trackingNumber: type === 'courier' ? trackingNumber : null,
          shippingType: type
        })
      })
      const result = await response.json()
      if (result.success) {
        toast.success(
          type === 'direct' 
            ? `주문 ${shippingModal.order.order_number} 직접 배송 시작`
            : `주문 ${shippingModal.order.order_number} 택배 배송 시작`
        )
        setShippingModal({ isOpen: false, order: null, tab: 'direct' })
        fetchOrders()
      } else {
        toast.error('배송 처리에 실패했습니다.')
      }
    } catch (error) {
      toast.error('배송 처리에 실패했습니다.')
    }
  }

  const handleDeliveryStatus = async (status: 'delayed' | 'delivered', delayReason?: string) => {
    if (!deliveryStatusModal.order) return

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: deliveryStatusModal.order.id,
          status: status === 'delivered' ? 'delivered' : 'shipped',
          delayReason: status === 'delayed' ? delayReason : null
        })
      })
      
      const result = await response.json()
      if (result.success) {
        toast.success(
          status === 'delivered'
            ? `주문 ${deliveryStatusModal.order.order_number} 배송 완료`
            : `주문 ${deliveryStatusModal.order.order_number} 배송 지연 처리`
        )
        setDeliveryStatusModal({ isOpen: false, order: null })
        fetchOrders()
      } else {
        toast.error('상태 업데이트에 실패했습니다.')
      }
    } catch (error) {
      toast.error('상태 업데이트에 실패했습니다.')
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
                <TableHead className="w-10 text-center">번호</TableHead>
                <TableHead className="w-32">주문번호</TableHead>
                <TableHead className="w-24">고객</TableHead>
                <TableHead className="w-28">상품</TableHead>
                <TableHead className="w-24 text-right">금액</TableHead>
                <TableHead className="w-24">상태</TableHead>
                <TableHead className="w-20">일시</TableHead>
                <TableHead>작업</TableHead>
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
                orders.map((order, index) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-center text-sm">{orders.length - index}</TableCell>
                    <TableCell>
                      <div className="font-mono text-xs">
                        {order.order_number}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_phone?.slice(-4) || '****'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="truncate max-w-[120px]" title={order.items[0]?.current_product_name || order.items[0]?.product_name || 'N/A'}>
                          {order.items[0]?.current_product_name || order.items[0]?.product_name || 'N/A'}
                        </p>
                        {order.items.length > 1 && (
                          <p className="text-xs text-muted-foreground">
                            외 {order.items.length - 1}개
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      ₩{order.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(order.status)}
                        {order.payment_status === 'paid' && (
                          <Badge className="bg-green-100 text-green-800 text-xs">결제완료</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(order.created_at).toLocaleDateString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOrderAction('view', order)}
                          className="h-8 px-2"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        
                        {order.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOrderAction('process', order)}
                              className="h-8 px-2 text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              수락
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOrderAction('cancel', order)}
                              className="h-8 px-2 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              거절
                            </Button>
                          </>
                        )}
                        
                        {order.status === 'processing' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOrderAction('ship', order)}
                            className="h-8 px-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Truck className="h-3 w-3 mr-1" />
                            배송
                          </Button>
                        )}
                        
                        {order.status === 'shipped' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeliveryStatusModal({ isOpen: true, order: order })}
                            className="h-8 px-2 text-purple-600 hover:bg-purple-50"
                            title="배송 상태 업데이트"
                          >
                            <Package className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {order.status === 'processing' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOrderAction('cancel', order)}
                            className="h-8 px-2 text-red-600 hover:bg-red-50"
                            title="주문 취소"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {order.payment_status === 'paid' && order.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOrderAction('refund', order)}
                            className="h-8 px-2 text-orange-600 hover:bg-orange-50"
                            title="환불 처리"
                          >
                            <DollarSign className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 배송 모달 */}
      {shippingModal.isOpen && shippingModal.order && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShippingModal({ isOpen: false, order: null, tab: 'direct' })}>
          <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl border" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>배송 처리: {shippingModal.order.order_number}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShippingModal({ isOpen: false, order: null, tab: 'direct' })}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* 탭 선택 */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={shippingModal.tab === 'direct' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setShippingModal({ ...shippingModal, tab: 'direct' })}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  직접배송
                </Button>
                <Button
                  variant={shippingModal.tab === 'courier' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setShippingModal({ ...shippingModal, tab: 'courier' })}
                >
                  <Package className="mr-2 h-4 w-4" />
                  택배
                </Button>
              </div>

              {/* 직접배송 탭 */}
              {shippingModal.tab === 'direct' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">직접배송 정보</h4>
                    <p className="text-sm text-gray-600 mb-2">판매자가 직접 구매자에게 배송합니다.</p>
                    <div className="space-y-1 text-sm">
                      <p><strong>고객:</strong> {shippingModal.order.customer_name}</p>
                      <p><strong>연락처:</strong> {shippingModal.order.customer_phone}</p>
                      <p><strong>주소:</strong> {shippingModal.order.shipping_address}</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleShipping('direct')}
                  >
                    직접 배송 시작
                  </Button>
                </div>
              )}

              {/* 택배 탭 */}
              {shippingModal.tab === 'courier' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">택배 정보</h4>
                    <p className="text-sm text-gray-600 mb-3">택배사를 통해 배송합니다.</p>
                    <div className="space-y-1 text-sm mb-3">
                      <p><strong>고객:</strong> {shippingModal.order.customer_name}</p>
                      <p><strong>주소:</strong> {shippingModal.order.shipping_address}</p>
                    </div>
                    <Input
                      id="trackingNumber"
                      placeholder="송장번호 입력"
                      className="mt-2"
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      const trackingInput = document.getElementById('trackingNumber') as HTMLInputElement
                      const trackingNumber = trackingInput?.value
                      if (trackingNumber) {
                        handleShipping('courier', trackingNumber)
                      } else {
                        toast.error('송장번호를 입력해주세요.')
                      }
                    }}
                  >
                    택배 배송 시작
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 배송 상태 모달 (배송중 -> 배송지연/배송완료) */}
      {deliveryStatusModal.isOpen && deliveryStatusModal.order && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setDeliveryStatusModal({ isOpen: false, order: null })}>
          <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl border" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>배송 상태 업데이트: {deliveryStatusModal.order.order_number}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setDeliveryStatusModal({ isOpen: false, order: null })}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">현재 배송 정보</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>고객:</strong> {deliveryStatusModal.order.customer_name}</p>
                  <p><strong>연락처:</strong> {deliveryStatusModal.order.customer_phone}</p>
                  <p><strong>주소:</strong> {deliveryStatusModal.order.shipping_address}</p>
                  {deliveryStatusModal.order.tracking_number && (
                    <p><strong>송장번호:</strong> {deliveryStatusModal.order.tracking_number}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={() => handleDeliveryStatus('delivered')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  배송 완료
                </Button>
                
                <div className="space-y-2">
                  <Button 
                    variant="outline"
                    className="w-full border-orange-500 text-orange-600 hover:bg-orange-50" 
                    onClick={() => {
                      const reason = prompt('배송 지연 사유를 입력하세요:')
                      if (reason) {
                        handleDeliveryStatus('delayed', reason)
                      }
                    }}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    배송 지연
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    배송 지연 시 고객에게 안내 메시지가 발송됩니다
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 주문 상세 모달 */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedOrder(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 shadow-2xl border" onClick={(e) => e.stopPropagation()}>
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