"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, RefreshCw, Settings, Database, Users, Package, ShoppingCart, Calculator, RotateCw } from 'lucide-react'

interface EcountCustomer {
  customerCode: string
  customerName: string
  businessNumber?: string
  representative?: string
  address?: string
  phone?: string
  email?: string
  customerType: 'COMPANY' | 'INDIVIDUAL'
  isActive: boolean
  memo?: string
}

interface EcountItem {
  itemCode: string
  itemName: string
  itemType: string
  unit: string
  salePrice: number
  purchasePrice: number
  stockQuantity: number
  barcode?: string
  specification?: string
  isActive: boolean
  category?: string
}

interface EcountSalesOrder {
  orderNumber: string
  customerCode: string
  orderDate: string
  deliveryDate?: string
  totalAmount: number
  taxAmount: number
  memo?: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
}

interface EcountInventory {
  itemCode: string
  warehouseCode?: string
  currentStock: number
  inStock: number
  outStock: number
  safetyStock?: number
  lastUpdated: string
}

export default function EcountPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [customers, setCustomers] = useState<EcountCustomer[]>([])
  const [items, setItems] = useState<EcountItem[]>([])
  const [orders, setOrders] = useState<EcountSalesOrder[]>([])
  const [inventory, setInventory] = useState<EcountInventory[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 연결 테스트
  const testConnection = async () => {
    setConnectionStatus('testing')
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/ecount/connection-test', {
        method: 'POST',
      })
      const result = await response.json()
      
      if (result.success) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('disconnected')
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      setConnectionStatus('disconnected')
    } finally {
      setIsLoading(false)
    }
  }

  // 데이터 동기화
  const syncData = async (dataType: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/ecount/sync/${dataType}`, {
        method: 'POST',
      })
      const result = await response.json()
      
      if (result.success) {
        // 데이터 새로고침
        await loadData()
      }
    } catch (error) {
      console.error('RotateCw failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 데이터 로드
  const loadData = async () => {
    setIsLoading(true)
    try {
      const [customersRes, itemsRes, ordersRes, inventoryRes] = await Promise.all([
        fetch('/api/admin/ecount/customers'),
        fetch('/api/admin/ecount/items'),
        fetch('/api/admin/ecount/orders'),
        fetch('/api/admin/ecount/inventory')
      ])

      const [customersData, itemsData, ordersData, inventoryData] = await Promise.all([
        customersRes.json(),
        itemsRes.json(),
        ordersRes.json(),
        inventoryRes.json()
      ])

      setCustomers(customersData.data || [])
      setItems(itemsData.data || [])
      setOrders(ordersData.data || [])
      setInventory(inventoryData.data || [])
    } catch (error) {
      console.error('Data load failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">이카운트 ERP 연동</h1>
          <p className="text-muted-foreground mt-2">
            이카운트 ERP 시스템과의 데이터 동기화 및 관리
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={testConnection}
            disabled={isLoading}
          >
            <Settings className="w-4 h-4 mr-2" />
            연결 테스트
          </Button>
          <ConnectionStatus status={connectionStatus} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">대시보드</TabsTrigger>
          <TabsTrigger value="customers">고객 관리</TabsTrigger>
          <TabsTrigger value="items">상품 관리</TabsTrigger>
          <TabsTrigger value="orders">주문 관리</TabsTrigger>
          <TabsTrigger value="inventory">재고 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardView
            customers={customers}
            items={items}
            orders={orders}
            inventory={inventory}
            onRotateCw={syncData}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="customers">
          <CustomersView
            customers={customers}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={() => syncData('customers')}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="items">
          <ItemsView
            items={items}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={() => syncData('items')}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersView
            orders={orders}
            customers={customers}
            onRefresh={() => syncData('orders')}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryView
            inventory={inventory}
            items={items}
            onRefresh={() => syncData('inventory')}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ConnectionStatus({ status }: { status: string }) {
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'testing': return 'bg-yellow-500'
      default: return 'bg-red-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected': return '연결됨'
      case 'testing': return '테스트 중...'
      default: return '연결 안됨'
    }
  }

  return (
    <Badge variant="outline" className="gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      {getStatusText()}
    </Badge>
  )
}

function DashboardView({ customers, items, orders, inventory, onRotateCw, isLoading }: any) {
  const stats = [
    {
      title: '총 고객수',
      value: customers.length,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: '총 상품수',
      value: items.length,
      icon: Package,
      color: 'text-green-600'
    },
    {
      title: '미완료 주문',
      value: orders.filter((o: any) => o.status !== 'COMPLETED').length,
      icon: ShoppingCart,
      color: 'text-orange-600'
    },
    {
      title: '재고 부족 상품',
      value: inventory.filter((i: any) => i.currentStock < (i.safetyStock || 10)).length,
      icon: Database,
      color: 'text-red-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>데이터 동기화</span>
            <Button
              variant="outline"
              onClick={() => onRotateCw('all')}
              disabled={isLoading}
            >
              <RotateCw className="w-4 h-4 mr-2" />
              전체 동기화
            </Button>
          </CardTitle>
          <CardDescription>
            이카운트 ERP와 데이터를 동기화합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {['customers', 'items', 'orders', 'inventory'].map((dataType) => (
              <Button
                key={dataType}
                variant="outline"
                onClick={() => onRotateCw(dataType)}
                disabled={isLoading}
                className="h-20 flex-col"
              >
                <RefreshCw className="w-6 h-6 mb-2" />
                {dataType === 'customers' && '고객 동기화'}
                {dataType === 'items' && '상품 동기화'}
                {dataType === 'orders' && '주문 동기화'}
                {dataType === 'inventory' && '재고 동기화'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 주문</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.orderDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₩{order.totalAmount.toLocaleString()}</p>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>재고 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventory.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.itemCode}</p>
                    <p className="text-sm text-muted-foreground">안전재고: {item.safetyStock || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.currentStock}개</p>
                    <Badge 
                      variant={item.currentStock < (item.safetyStock || 10) ? "destructive" : "default"}
                    >
                      {item.currentStock < (item.safetyStock || 10) ? '부족' : '정상'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CustomersView({ customers, searchTerm, onSearchChange, onRefresh, isLoading }: any) {
  const filteredCustomers = customers.filter((customer: EcountCustomer) =>
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.businessNumber && customer.businessNumber.includes(searchTerm))
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="고객명, 고객코드, 사업자번호로 검색..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-80"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onRefresh} disabled={isLoading} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
          <NewCustomerDialog />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>고객 목록 ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">고객코드</th>
                  <th className="text-left py-2">고객명</th>
                  <th className="text-left py-2">구분</th>
                  <th className="text-left py-2">사업자번호</th>
                  <th className="text-left py-2">연락처</th>
                  <th className="text-left py-2">상태</th>
                  <th className="text-left py-2">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer: EcountCustomer, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{customer.customerCode}</td>
                    <td className="py-2 font-medium">{customer.customerName}</td>
                    <td className="py-2">
                      <Badge variant={customer.customerType === 'COMPANY' ? 'default' : 'secondary'}>
                        {customer.customerType === 'COMPANY' ? '법인' : '개인'}
                      </Badge>
                    </td>
                    <td className="py-2">{customer.businessNumber || '-'}</td>
                    <td className="py-2">{customer.phone || '-'}</td>
                    <td className="py-2">
                      <Badge variant={customer.isActive ? 'default' : 'destructive'}>
                        {customer.isActive ? '활성' : '비활성'}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Button variant="outline" size="sm">
                        수정
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ItemsView({ items, searchTerm, onSearchChange, onRefresh, isLoading }: any) {
  const filteredItems = items.filter((item: EcountItem) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="상품명, 상품코드, 카테고리로 검색..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-80"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onRefresh} disabled={isLoading} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
          <NewItemDialog />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>상품 목록 ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">상품코드</th>
                  <th className="text-left py-2">상품명</th>
                  <th className="text-left py-2">카테고리</th>
                  <th className="text-left py-2">단위</th>
                  <th className="text-right py-2">판매가</th>
                  <th className="text-right py-2">재고</th>
                  <th className="text-left py-2">상태</th>
                  <th className="text-left py-2">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item: EcountItem, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.itemCode}</td>
                    <td className="py-2 font-medium">{item.itemName}</td>
                    <td className="py-2">{item.category || '-'}</td>
                    <td className="py-2">{item.unit}</td>
                    <td className="py-2 text-right">₩{item.salePrice.toLocaleString()}</td>
                    <td className="py-2 text-right">{item.stockQuantity}</td>
                    <td className="py-2">
                      <Badge variant={item.isActive ? 'default' : 'destructive'}>
                        {item.isActive ? '활성' : '비활성'}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Button variant="outline" size="sm">
                        수정
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function OrdersView({ orders, customers, onRefresh, isLoading }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">주문 관리</h2>
          <p className="text-muted-foreground">이카운트 ERP 판매주문 현황</p>
        </div>
        <Button onClick={onRefresh} disabled={isLoading} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>주문 목록 ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">주문번호</th>
                  <th className="text-left py-2">고객코드</th>
                  <th className="text-left py-2">주문일</th>
                  <th className="text-left py-2">배송예정일</th>
                  <th className="text-right py-2">주문금액</th>
                  <th className="text-right py-2">부가세</th>
                  <th className="text-left py-2">상태</th>
                  <th className="text-left py-2">작업</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: EcountSalesOrder, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 font-medium">{order.orderNumber}</td>
                    <td className="py-2">{order.customerCode}</td>
                    <td className="py-2">{order.orderDate}</td>
                    <td className="py-2">{order.deliveryDate || '-'}</td>
                    <td className="py-2 text-right">₩{order.totalAmount.toLocaleString()}</td>
                    <td className="py-2 text-right">₩{order.taxAmount.toLocaleString()}</td>
                    <td className="py-2">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-2">
                      <Button variant="outline" size="sm">
                        상세
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InventoryView({ inventory, items, onRefresh, isLoading }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">재고 관리</h2>
          <p className="text-muted-foreground">이카운트 ERP 재고 현황</p>
        </div>
        <Button onClick={onRefresh} disabled={isLoading} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>재고 현황 ({inventory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">상품코드</th>
                  <th className="text-left py-2">창고</th>
                  <th className="text-right py-2">현재고</th>
                  <th className="text-right py-2">입고</th>
                  <th className="text-right py-2">출고</th>
                  <th className="text-right py-2">안전재고</th>
                  <th className="text-left py-2">상태</th>
                  <th className="text-left py-2">최종수정</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item: EcountInventory, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 font-medium">{item.itemCode}</td>
                    <td className="py-2">{item.warehouseCode || '기본창고'}</td>
                    <td className="py-2 text-right">{item.currentStock}</td>
                    <td className="py-2 text-right">{item.inStock}</td>
                    <td className="py-2 text-right">{item.outStock}</td>
                    <td className="py-2 text-right">{item.safetyStock || '-'}</td>
                    <td className="py-2">
                      <Badge 
                        variant={item.currentStock < (item.safetyStock || 10) ? "destructive" : "default"}
                      >
                        {item.currentStock < (item.safetyStock || 10) ? '부족' : '정상'}
                      </Badge>
                    </td>
                    <td className="py-2 text-sm text-muted-foreground">{item.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: 'secondary',
    CONFIRMED: 'default',
    COMPLETED: 'outline',
    CANCELLED: 'destructive'
  }

  const labels: Record<string, string> = {
    PENDING: '대기',
    CONFIRMED: '확정',
    COMPLETED: '완료',
    CANCELLED: '취소'
  }

  return (
    <Badge variant={variants[status] || 'default'}>
      {labels[status] || status}
    </Badge>
  )
}

function NewCustomerDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          신규 고객
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>신규 고객 등록</DialogTitle>
          <DialogDescription>
            이카운트 ERP에 새로운 고객을 등록합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerName">고객명</Label>
            <Input id="customerName" placeholder="고객명을 입력하세요" />
          </div>
          <div>
            <Label htmlFor="customerType">고객구분</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPANY">법인</SelectItem>
                <SelectItem value="INDIVIDUAL">개인</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="businessNumber">사업자번호</Label>
            <Input id="businessNumber" placeholder="000-00-00000" />
          </div>
          <div>
            <Label htmlFor="phone">연락처</Label>
            <Input id="phone" placeholder="010-0000-0000" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setOpen(false)}>
              등록
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function NewItemDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          신규 상품
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>신규 상품 등록</DialogTitle>
          <DialogDescription>
            이카운트 ERP에 새로운 상품을 등록합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="itemName">상품명</Label>
            <Input id="itemName" placeholder="상품명을 입력하세요" />
          </div>
          <div>
            <Label htmlFor="itemType">상품구분</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRODUCT">완제품</SelectItem>
                <SelectItem value="MATERIAL">원자재</SelectItem>
                <SelectItem value="SERVICE">서비스</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="salePrice">판매가</Label>
            <Input id="salePrice" type="number" placeholder="0" />
          </div>
          <div>
            <Label htmlFor="stockQuantity">초기재고</Label>
            <Input id="stockQuantity" type="number" placeholder="0" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setOpen(false)}>
              등록
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}