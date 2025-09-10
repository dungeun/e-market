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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  MoreVertical, 
  Eye,
  Filter,
  Truck,
  Package,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  User,
  Calendar,
  AlertTriangle,
  Navigation,
  PackageCheck,
  PackageSearch,
  PackageOpen,
  Loader2,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface DeliveryItem {
  id: string
  orderId: string
  customer: string
  phone: string
  address: string
  status: 'pending' | 'accepted' | 'preparing' | 'in_transit' | 'delivered' | 'returned'
  deliveryDate: string
  trackingNumber: string | null
  courier: string | null
  items: string
  totalAmount: number
  paymentMethod: string
  deliveryNote?: string
  estimatedTime?: string
  actualDeliveryTime?: string
}

const couriers = [
  'CJ대한통운',
  '한진택배',
  '로젠택배',
  '우체국택배',
  '롯데택배',
  '직접배송'
]

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    status: '',
    trackingNumber: '',
    courier: '',
    estimatedTime: '',
    deliveryNote: ''
  })

  // 실제 주문 데이터 가져오기
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-token') || localStorage.getItem('accessToken')
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // 주문 데이터를 배송 데이터로 변환
          const convertedDeliveries: DeliveryItem[] = data.orders.map((order: any) => ({
            id: `DEL-${order.order_number}`,
            orderId: order.order_number,
            customer: order.customer_name,
            phone: order.customer_phone || '010-0000-0000',
            address: order.shipping_address,
            status: mapOrderStatusToDeliveryStatus(order.status),
            deliveryDate: order.delivery_date || order.created_at?.split('T')[0],
            trackingNumber: order.tracking_number,
            courier: order.courier || null,
            items: order.items?.map((item: any) => item.product_name || item.current_product_name).join(', ') || '상품',
            totalAmount: order.total_amount,
            paymentMethod: order.payment_method,
            deliveryNote: order.delivery_note || '',
            estimatedTime: order.estimated_time || null,
            actualDeliveryTime: order.actual_delivery_time || null
          }))
          
          setDeliveries(convertedDeliveries)
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('주문 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 주문 상태를 배송 상태로 매핑
  const mapOrderStatusToDeliveryStatus = (orderStatus: string): DeliveryItem['status'] => {
    const statusMap: { [key: string]: DeliveryItem['status'] } = {
      'pending': 'pending',
      'confirmed': 'accepted',
      'processing': 'preparing',
      'shipped': 'in_transit',
      'delivered': 'delivered',
      'cancelled': 'returned',
      'refunded': 'returned'
    }
    return statusMap[orderStatus] || 'pending'
  }

  // 배송 상태를 주문 상태로 매핑
  const mapDeliveryStatusToOrderStatus = (deliveryStatus: DeliveryItem['status']): string => {
    const statusMap: { [key: string]: string } = {
      'pending': 'pending',
      'accepted': 'confirmed',
      'preparing': 'processing',
      'in_transit': 'shipped',
      'delivered': 'delivered',
      'returned': 'refunded'
    }
    return statusMap[deliveryStatus] || 'pending'
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const getStatusBadge = (status: DeliveryItem['status']) => {
    const statusConfig = {
      pending: { 
        label: '배송 대기', 
        color: 'bg-gray-100 text-gray-800', 
        icon: Clock 
      },
      accepted: { 
        label: '접수 완료', 
        color: 'bg-blue-100 text-blue-800', 
        icon: PackageCheck 
      },
      preparing: { 
        label: '상품 준비중', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: PackageSearch 
      },
      in_transit: { 
        label: '배송중', 
        color: 'bg-purple-100 text-purple-800', 
        icon: Truck 
      },
      delivered: { 
        label: '배송 완료', 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle 
      },
      returned: { 
        label: '반품', 
        color: 'bg-red-100 text-red-800', 
        icon: AlertTriangle 
      }
    }
    
    const config = statusConfig[status]
    const IconComponent = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const handleStatusUpdate = async () => {
    if (!selectedDelivery) return

    try {
      const token = localStorage.getItem('auth-token') || localStorage.getItem('accessToken')
      
      // 주문 상태 업데이트 API 호출
      const orderStatus = mapDeliveryStatusToOrderStatus(updateForm.status as DeliveryItem['status'])
      
      const response = await fetch(`/api/admin/orders/${selectedDelivery.orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: orderStatus,
          tracking_number: updateForm.trackingNumber || null,
          courier: updateForm.courier || null,
          delivery_note: updateForm.deliveryNote || null,
          estimated_time: updateForm.estimatedTime || null
        })
      })
      
      if (response.ok) {
        toast.success('배송 상태가 업데이트되었습니다.')
        setIsUpdateOpen(false)
        setSelectedDelivery(null)
        setUpdateForm({
          status: '',
          trackingNumber: '',
          courier: '',
          estimatedTime: '',
          deliveryNote: ''
        })
        
        // 데이터 새로고침
        await fetchOrders()
      } else {
        toast.error('상태 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('상태 업데이트 중 오류가 발생했습니다.')
    }
  }

  const openUpdateModal = (delivery: DeliveryItem) => {
    setSelectedDelivery(delivery)
    setUpdateForm({
      status: delivery.status,
      trackingNumber: delivery.trackingNumber || '',
      courier: delivery.courier || '',
      estimatedTime: delivery.estimatedTime || '',
      deliveryNote: delivery.deliveryNote || ''
    })
    setIsUpdateOpen(true)
  }

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.phone.includes(searchQuery) ||
      (delivery.trackingNumber && delivery.trackingNumber.includes(searchQuery))
    
    return matchesSearch
  })

  // 주소 간략화 함수 (서울시 성동구 형태로)
  const getShortAddress = (address: string) => {
    const parts = address.split(' ')
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]}`
    }
    return address
  }

  // 통계 계산
  const stats = {
    pending: deliveries.filter(d => d.status === 'pending').length,
    inTransit: deliveries.filter(d => d.status === 'in_transit').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    todayDeliveries: deliveries.filter(d => 
      d.deliveryDate === new Date().toISOString().split('T')[0]
    ).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">배송 관리</h1>
        <p className="text-gray-600 mt-2">주문의 배송 상태를 관리하고 추적할 수 있습니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 배송</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveries.length}</div>
            <p className="text-xs text-muted-foreground">오늘 {stats.todayDeliveries}건 예정</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">배송 대기</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">처리 필요</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">배송중</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground">이동중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">배송 완료</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">이번 달</p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>배송 목록</CardTitle>
            <div className="flex items-center gap-2">
              <Link href="/admin/orders">
                <Button variant="outline" size="sm">
                  주문 관리로 이동
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="주문번호, 고객명, 전화번호, 송장번호로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>주문번호</TableHead>
                  <TableHead>고객정보</TableHead>
                  <TableHead>배송지</TableHead>
                  <TableHead>상품</TableHead>
                  <TableHead>배송상태</TableHead>
                  <TableHead>택배사</TableHead>
                  <TableHead>배송예정일</TableHead>
                  <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      배송 데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">
                        <Link 
                          href={`/admin/orders`}
                          className="text-blue-600 hover:underline"
                        >
                          {delivery.orderId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{delivery.customer}</span>
                          <span className="text-sm text-gray-500">{delivery.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                          onClick={() => {
                            toast.info(delivery.address, {
                              duration: 5000,
                              position: 'top-center'
                            })
                          }}
                          title={delivery.address}
                        >
                          {getShortAddress(delivery.address)}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs truncate" title={delivery.items}>
                          {delivery.items}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                      <TableCell>
                        {delivery.courier && delivery.trackingNumber ? (
                          <button
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            onClick={() => {
                              toast.info(`송장번호: ${delivery.trackingNumber}`, {
                                duration: 5000,
                                position: 'top-center',
                                action: {
                                  label: '배송추적',
                                  onClick: () => window.open(getTrackingUrl(delivery.courier, delivery.trackingNumber!), '_blank')
                                }
                              })
                            }}
                          >
                            {delivery.courier}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">{delivery.courier || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {new Date(delivery.deliveryDate).toLocaleDateString('ko-KR', {
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedDelivery(delivery)
                              setIsDetailOpen(true)
                            }}
                            title="상세 보기"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openUpdateModal(delivery)}
                            title="상태 업데이트"
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                          {delivery.trackingNumber && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                window.open(getTrackingUrl(delivery.courier, delivery.trackingNumber), '_blank')
                              }}
                              title="배송 추적"
                            >
                              <Navigation className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 상세 정보 모달 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>배송 상세 정보</DialogTitle>
            <DialogDescription>
              주문번호: {selectedDelivery?.orderId}
            </DialogDescription>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">고객명</Label>
                  <p className="font-medium">{selectedDelivery.customer}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">연락처</Label>
                  <p className="font-medium">{selectedDelivery.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm text-gray-500">배송지</Label>
                  <p className="font-medium">{selectedDelivery.address}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">결제방법</Label>
                  <p className="font-medium">{selectedDelivery.paymentMethod}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">결제금액</Label>
                  <p className="font-medium">₩{selectedDelivery.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">배송상태</Label>
                  <div className="mt-1">{getStatusBadge(selectedDelivery.status)}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">택배사</Label>
                  <p className="font-medium">{selectedDelivery.courier || '미지정'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">송장번호</Label>
                  <p className="font-medium font-mono">{selectedDelivery.trackingNumber || '미등록'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">배송예정일</Label>
                  <p className="font-medium">{selectedDelivery.deliveryDate}</p>
                </div>
                {selectedDelivery.deliveryNote && (
                  <div className="col-span-2">
                    <Label className="text-sm text-gray-500">배송 메모</Label>
                    <p className="font-medium">{selectedDelivery.deliveryNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 상태 업데이트 모달 */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배송 상태 업데이트</DialogTitle>
            <DialogDescription>
              주문번호: {selectedDelivery?.orderId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>배송 상태</Label>
              <Select value={updateForm.status} onValueChange={(value) => setUpdateForm({...updateForm, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">배송 대기</SelectItem>
                  <SelectItem value="accepted">접수 완료</SelectItem>
                  <SelectItem value="preparing">상품 준비중</SelectItem>
                  <SelectItem value="in_transit">배송중</SelectItem>
                  <SelectItem value="delivered">배송 완료</SelectItem>
                  <SelectItem value="returned">반품</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>택배사</Label>
              <Select value={updateForm.courier} onValueChange={(value) => setUpdateForm({...updateForm, courier: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="택배사 선택" />
                </SelectTrigger>
                <SelectContent>
                  {couriers.map((courier) => (
                    <SelectItem key={courier} value={courier}>
                      {courier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>송장번호</Label>
              <Input
                value={updateForm.trackingNumber}
                onChange={(e) => setUpdateForm({...updateForm, trackingNumber: e.target.value})}
                placeholder="송장번호 입력"
              />
            </div>
            <div>
              <Label>예상 배송 시간</Label>
              <Input
                value={updateForm.estimatedTime}
                onChange={(e) => setUpdateForm({...updateForm, estimatedTime: e.target.value})}
                placeholder="예: 14:00-16:00"
              />
            </div>
            <div>
              <Label>배송 메모</Label>
              <Textarea
                value={updateForm.deliveryNote}
                onChange={(e) => setUpdateForm({...updateForm, deliveryNote: e.target.value})}
                placeholder="배송 관련 메모 입력"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>
              취소
            </Button>
            <Button onClick={handleStatusUpdate}>
              업데이트
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}