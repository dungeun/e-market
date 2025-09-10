'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Plus,
  Building2,
  Warehouse,
  MapPin,
  Phone,
  Mail,
  Package
} from 'lucide-react'
import { toast } from 'sonner'
import KakaoAddressModal from '@/components/KakaoAddressModal'

interface Vendor {
  id: number
  code: string
  company_name: string
  business_number: string
  ceo_name: string
  business_type: string
  status: string
  phone: string
  email: string
  commission_rate: number
  created_at: string
}

interface WarehouseData {
  id: number
  code: string
  name: string
  type: string
  address: string
  city: string
  region: string
  capacity: number
  current_stock: number
  manager_name: string
  phone: string
  is_active: boolean
}

export default function B2BManagementPage() {
  const [activeTab, setActiveTab] = useState('vendors')
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showVendorDialog, setShowVendorDialog] = useState(false)
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false)
  
  const [vendorForm, setVendorForm] = useState({
    company_name: '',
    business_number: '',
    ceo_name: '',
    business_type: 'manufacturer',
    address: '',
    phone: '',
    email: '',
    commission_rate: '10'
  })
  
  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    address: '',
    postal_code: '',
    city: '',
    region: '',
    capacity: '',
    manager_name: '',
    phone: '',
    email: ''
  })
  const [showAddressModal, setShowAddressModal] = useState(false)

  const handleAddressComplete = (data: { zonecode: string; address: string }) => {
    setWarehouseForm({
      ...warehouseForm,
      postal_code: data.zonecode,
      address: data.address
    })
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/b2b')
      const data = await response.json()
      
      if (data.success) {
        setVendors(data.vendors || [])
        setWarehouses(data.warehouses || [])
      }
    } catch (error) {
      console.error('Error loading B2B data:', error)
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddVendor = async () => {
    try {
      const response = await fetch('/api/admin/b2b/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorForm)
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success('입점업체가 추가되었습니다.')
        setShowVendorDialog(false)
        loadData()
        setVendorForm({
          company_name: '',
          business_number: '',
          ceo_name: '',
          business_type: 'manufacturer',
          address: '',
          phone: '',
          email: '',
          commission_rate: '10'
        })
      } else {
        toast.error(data.error || '입점업체 추가 실패')
      }
    } catch (error) {
      toast.error('입점업체 추가 중 오류가 발생했습니다.')
    }
  }

  const handleAddWarehouse = async () => {
    try {
      // 창고 코드 자동 생성 (WH + 타임스탬프 기반)
      const timestamp = Date.now().toString().slice(-6)
      const autoCode = `WH${timestamp}`
      
      const warehouseData = {
        ...warehouseForm,
        code: autoCode,
        type: 'general' // 기본값으로 설정
      }
      
      const response = await fetch('/api/admin/b2b/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouseData)
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success('창고가 추가되었습니다.')
        setShowWarehouseDialog(false)
        loadData()
        setWarehouseForm({
          name: '',
          address: '',
          postal_code: '',
          city: '',
          region: '',
          capacity: '',
          manager_name: '',
          phone: '',
          email: ''
        })
      } else {
        toast.error(data.error || '창고 추가 실패')
      }
    } catch (error) {
      toast.error('창고 추가 중 오류가 발생했습니다.')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: '대기중', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: '승인됨', className: 'bg-green-100 text-green-800' },
      rejected: { label: '거절됨', className: 'bg-red-100 text-red-800' },
      suspended: { label: '정지됨', className: 'bg-gray-100 text-gray-800' }
    }
    const config = statusMap[status] || statusMap.pending
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getBusinessTypeBadge = (type: string) => {
    const typeMap: Record<string, string> = {
      manufacturer: '제조사',
      distributor: '유통사',
      retailer: '소매업체'
    }
    return <Badge variant="outline">{typeMap[type] || type}</Badge>
  }

  const getWarehouseTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; className: string }> = {
      general: { label: '일반', className: 'bg-blue-100 text-blue-800' },
      cold: { label: '냉장/냉동', className: 'bg-cyan-100 text-cyan-800' },
      hazmat: { label: '위험물', className: 'bg-orange-100 text-orange-800' }
    }
    const config = typeMap[type] || typeMap.general
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">B2B 관리</h2>
          <p className="text-muted-foreground">입점업체 및 창고를 관리합니다.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 입점업체</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
            <p className="text-xs text-muted-foreground">
              승인: {vendors.filter(v => v.status === 'approved').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">운영 창고</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehouses.length}</div>
            <p className="text-xs text-muted-foreground">
              활성: {warehouses.filter(w => w.is_active).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 재고 용량</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {warehouses.reduce((sum, w) => sum + w.capacity, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              사용중: {warehouses.reduce((sum, w) => sum + w.current_stock, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">평균 사용률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {warehouses.length > 0 
                ? Math.round(
                    (warehouses.reduce((sum, w) => sum + w.current_stock, 0) / 
                     warehouses.reduce((sum, w) => sum + w.capacity, 0)) * 100
                  ) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">창고 사용률</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vendors">입점업체</TabsTrigger>
          <TabsTrigger value="warehouses">창고/물류센터</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>입점업체 목록</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="업체명, 사업자번호 검색..."
                      className="pl-8 w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setShowVendorDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    입점업체 추가
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>코드</TableHead>
                    <TableHead>업체명</TableHead>
                    <TableHead>사업자번호</TableHead>
                    <TableHead>대표자</TableHead>
                    <TableHead>업체유형</TableHead>
                    <TableHead>수수료율</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>연락처</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        데이터를 불러오는 중...
                      </TableCell>
                    </TableRow>
                  ) : vendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        등록된 입점업체가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendors.filter(v => 
                      v.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      v.business_number?.includes(searchQuery)
                    ).map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-mono">{vendor.code}</TableCell>
                        <TableCell className="font-medium">{vendor.company_name}</TableCell>
                        <TableCell>{vendor.business_number}</TableCell>
                        <TableCell>{vendor.ceo_name}</TableCell>
                        <TableCell>{getBusinessTypeBadge(vendor.business_type)}</TableCell>
                        <TableCell>{vendor.commission_rate}%</TableCell>
                        <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {vendor.phone}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {vendor.email}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>창고/물류센터 목록</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="창고명, 지역 검색..."
                      className="pl-8 w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setShowWarehouseDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    창고 추가
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>코드</TableHead>
                    <TableHead>창고명</TableHead>
                    <TableHead>주소</TableHead>
                    <TableHead>지역</TableHead>
                    <TableHead>총 용량</TableHead>
                    <TableHead>사용률</TableHead>
                    <TableHead>담당자</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        데이터를 불러오는 중...
                      </TableCell>
                    </TableRow>
                  ) : warehouses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        등록된 창고가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    warehouses.filter(w => 
                      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      w.region?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((warehouse) => (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-mono">{warehouse.code}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4" />
                            {warehouse.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {warehouse.address}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{warehouse.city}, {warehouse.region}</TableCell>
                        <TableCell>{warehouse.capacity.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(warehouse.current_stock / warehouse.capacity) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm">
                              {Math.round((warehouse.current_stock / warehouse.capacity) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{warehouse.manager_name}</div>
                            <div className="text-muted-foreground">{warehouse.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {warehouse.is_active ? (
                            <Badge className="bg-green-100 text-green-800">운영중</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">중단</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 입점업체 추가 다이얼로그 */}
      <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>입점업체 추가</DialogTitle>
            <DialogDescription>
              새로운 입점업체 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">업체명</Label>
                <Input
                  id="company_name"
                  value={vendorForm.company_name}
                  onChange={(e) => setVendorForm({...vendorForm, company_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_number">사업자등록번호</Label>
                <Input
                  id="business_number"
                  placeholder="123-45-67890"
                  value={vendorForm.business_number}
                  onChange={(e) => setVendorForm({...vendorForm, business_number: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ceo_name">대표자명</Label>
                <Input
                  id="ceo_name"
                  value={vendorForm.ceo_name}
                  onChange={(e) => setVendorForm({...vendorForm, ceo_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_type">업체유형</Label>
                <Select
                  value={vendorForm.business_type}
                  onValueChange={(value) => setVendorForm({...vendorForm, business_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturer">제조사</SelectItem>
                    <SelectItem value="distributor">유통사</SelectItem>
                    <SelectItem value="retailer">소매업체</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">주소</Label>
              <Input
                id="address"
                value={vendorForm.address}
                onChange={(e) => setVendorForm({...vendorForm, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  placeholder="02-1234-5678"
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm({...vendorForm, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm({...vendorForm, email: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission_rate">수수료율 (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                min="0"
                max="100"
                value={vendorForm.commission_rate}
                onChange={(e) => setVendorForm({...vendorForm, commission_rate: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVendorDialog(false)}>
              취소
            </Button>
            <Button onClick={handleAddVendor}>
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 창고 추가 다이얼로그 */}
      <Dialog open={showWarehouseDialog} onOpenChange={setShowWarehouseDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>창고 추가</DialogTitle>
            <DialogDescription>
              새로운 창고/물류센터 정보를 입력하세요. (코드는 자동 생성됩니다)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* 창고명과 보관용량 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wh_name">창고명 *</Label>
                <Input
                  id="wh_name"
                  placeholder="서울 중앙 물류센터"
                  value={warehouseForm.name}
                  onChange={(e) => setWarehouseForm({...warehouseForm, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">보관 용량 *</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="50000"
                  value={warehouseForm.capacity}
                  onChange={(e) => setWarehouseForm({...warehouseForm, capacity: e.target.value})}
                />
              </div>
            </div>

            {/* 주소 */}
            <div className="space-y-2">
              <Label>주소 *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="주소를 검색하세요"
                  value={warehouseForm.address}
                  readOnly
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center gap-1"
                >
                  <MapPin className="h-4 w-4" />
                  검색
                </Button>
              </div>
              {warehouseForm.postal_code && (
                <div className="text-sm text-muted-foreground">
                  우편번호: {warehouseForm.postal_code}
                </div>
              )}
            </div>

            {/* 지역 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">도시 *</Label>
                <Input
                  id="city"
                  placeholder="서울"
                  value={warehouseForm.city}
                  onChange={(e) => setWarehouseForm({...warehouseForm, city: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">지역 *</Label>
                <Input
                  id="region"
                  placeholder="강남구"
                  value={warehouseForm.region}
                  onChange={(e) => setWarehouseForm({...warehouseForm, region: e.target.value})}
                />
              </div>
            </div>

            {/* 담당자 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager_name">담당자명 *</Label>
                <Input
                  id="manager_name"
                  placeholder="김철수"
                  value={warehouseForm.manager_name}
                  onChange={(e) => setWarehouseForm({...warehouseForm, manager_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wh_phone">연락처 *</Label>
                <Input
                  id="wh_phone"
                  placeholder="02-1234-5678"
                  value={warehouseForm.phone}
                  onChange={(e) => setWarehouseForm({...warehouseForm, phone: e.target.value})}
                />
              </div>
            </div>

            {/* 이메일 */}
            <div className="space-y-2">
              <Label htmlFor="wh_email">이메일</Label>
              <Input
                id="wh_email"
                type="email"
                placeholder="contact@warehouse.com"
                value={warehouseForm.email}
                onChange={(e) => setWarehouseForm({...warehouseForm, email: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarehouseDialog(false)}>
              취소
            </Button>
            <Button onClick={handleAddWarehouse}>
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 카카오 주소 검색 모달 */}
      <KakaoAddressModal 
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onComplete={handleAddressComplete}
      />
    </div>
  )
}