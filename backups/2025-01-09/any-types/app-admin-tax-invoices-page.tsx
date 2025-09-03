'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlusIcon, SearchIcon, FileTextIcon, SendIcon, EditIcon, TrashIcon } from 'lucide-react'

interface TaxInvoice {
  id: string
  invoiceNumber: string
  orderId: string
  supplierBusinessNo: string
  supplierCompanyName: string
  buyerBusinessNo: string
  buyerCompanyName: string
  buyerEmail: string
  supplyAmount: number
  taxAmount: number
  totalAmount: number
  status: 'DRAFT' | 'ISSUED' | 'MODIFIED' | 'CANCELLED'
  issueDate: string
  ntsSendDate?: string
  ntsResultCode?: string
  items: TaxInvoiceItem[]
}

interface TaxInvoiceItem {
  id: string
  itemName: string
  specification: string
  quantity: number
  unitPrice: number
  supplyAmount: number
  taxAmount: number
}

export default function TaxInvoicesPage() {
  const [invoices, setInvoices] = useState<TaxInvoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<TaxInvoice[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<TaxInvoice | null>(null)
  const [loading, setLoading] = useState(false)

  // 새 세금계산서 생성 상태
  const [newInvoice, setNewInvoice] = useState({
    supplierBusinessNo: '',
    supplierCompanyName: '',
    supplierCeoName: '',
    supplierAddress: '',
    buyerBusinessNo: '',
    buyerCompanyName: '',
    buyerCeoName: '',
    buyerAddress: '',
    buyerEmail: '',
    items: [{
      itemName: '',
      specification: '',
      quantity: 1,
      unitPrice: 0
    }]
  })

  useEffect(() => {
    fetchInvoices()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, searchTerm, statusFilter])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/admin/tax-invoices')
      const data = await response.json()
      setInvoices(data)
    } catch (error) {

    }
  }

  const filterInvoices = () => {
    let filtered = invoices

    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.buyerCompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.supplierCompanyName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    setFilteredInvoices(filtered)
  }

  const handleCreateInvoice = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/tax-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInvoice),
      })

      if (response.ok) {
        const created = await response.json()
        setInvoices([created, ...invoices])
        setIsCreateDialogOpen(false)
        resetNewInvoice()
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const handleIssueInvoice = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/tax-invoices/${id}/issue`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchInvoices()
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const handleCancelInvoice = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/tax-invoices/${id}/cancel`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchInvoices()
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const resetNewInvoice = () => {
    setNewInvoice({
      supplierBusinessNo: '',
      supplierCompanyName: '',
      supplierCeoName: '',
      supplierAddress: '',
      buyerBusinessNo: '',
      buyerCompanyName: '',
      buyerCeoName: '',
      buyerAddress: '',
      buyerEmail: '',
      items: [{
        itemName: '',
        specification: '',
        quantity: 1,
        unitPrice: 0
      }]
    })
  }

  const addInvoiceItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, {
        itemName: '',
        specification: '',
        quantity: 1,
        unitPrice: 0
      }]
    })
  }

  const removeInvoiceItem = (index: number) => {
    const updatedItems = newInvoice.items.filter((_, i) => i !== index)
    setNewInvoice({
      ...newInvoice,
      items: updatedItems
    })
  }

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    const updatedItems = [...newInvoice.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setNewInvoice({
      ...newInvoice,
      items: updatedItems
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-500', text: '임시저장' },
      ISSUED: { color: 'bg-green-500', text: '발행완료' },
      MODIFIED: { color: 'bg-blue-500', text: '수정발행' },
      CANCELLED: { color: 'bg-red-500', text: '발행취소' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-500', text: status }
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">세금계산서 관리</h1>
          <p className="text-gray-600 mt-2">전자세금계산서 발행 및 관리</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              새 세금계산서
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>세금계산서 생성</DialogTitle>
              <DialogDescription>
                새로운 전자세금계산서를 생성합니다.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* 공급자 정보 */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">공급자 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplierBusinessNo">사업자등록번호</Label>
                    <Input
                      id="supplierBusinessNo"
                      value={newInvoice.supplierBusinessNo}
                      onChange={(e) => setNewInvoice({...newInvoice, supplierBusinessNo: e.target.value})}
                      placeholder="000-00-00000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierCompanyName">상호명</Label>
                    <Input
                      id="supplierCompanyName"
                      value={newInvoice.supplierCompanyName}
                      onChange={(e) => setNewInvoice({...newInvoice, supplierCompanyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierCeoName">대표자명</Label>
                    <Input
                      id="supplierCeoName"
                      value={newInvoice.supplierCeoName}
                      onChange={(e) => setNewInvoice({...newInvoice, supplierCeoName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierAddress">주소</Label>
                    <Input
                      id="supplierAddress"
                      value={newInvoice.supplierAddress}
                      onChange={(e) => setNewInvoice({...newInvoice, supplierAddress: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* 공급받는자 정보 */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">공급받는자 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buyerBusinessNo">사업자등록번호</Label>
                    <Input
                      id="buyerBusinessNo"
                      value={newInvoice.buyerBusinessNo}
                      onChange={(e) => setNewInvoice({...newInvoice, buyerBusinessNo: e.target.value})}
                      placeholder="000-00-00000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="buyerCompanyName">상호명</Label>
                    <Input
                      id="buyerCompanyName"
                      value={newInvoice.buyerCompanyName}
                      onChange={(e) => setNewInvoice({...newInvoice, buyerCompanyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="buyerCeoName">대표자명</Label>
                    <Input
                      id="buyerCeoName"
                      value={newInvoice.buyerCeoName}
                      onChange={(e) => setNewInvoice({...newInvoice, buyerCeoName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="buyerAddress">주소</Label>
                    <Input
                      id="buyerAddress"
                      value={newInvoice.buyerAddress}
                      onChange={(e) => setNewInvoice({...newInvoice, buyerAddress: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="buyerEmail">담당자 이메일</Label>
                    <Input
                      id="buyerEmail"
                      type="email"
                      value={newInvoice.buyerEmail}
                      onChange={(e) => setNewInvoice({...newInvoice, buyerEmail: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* 품목 정보 */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">품목 정보</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addInvoiceItem}>
                    품목 추가
                  </Button>
                </div>
                {newInvoice.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 mb-2 items-end">
                    <div>
                      <Label htmlFor={`itemName-${index}`}>품목명</Label>
                      <Input
                        id={`itemName-${index}`}
                        value={item.itemName}
                        onChange={(e) => updateInvoiceItem(index, 'itemName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`specification-${index}`}>규격</Label>
                      <Input
                        id={`specification-${index}`}
                        value={item.specification}
                        onChange={(e) => updateInvoiceItem(index, 'specification', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`quantity-${index}`}>수량</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`unitPrice-${index}`}>단가</Label>
                      <Input
                        id={`unitPrice-${index}`}
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      {newInvoice.items.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeInvoiceItem(index)}
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreateInvoice} disabled={loading}>
                {loading ? '생성중...' : '생성'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">검색</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="계산서번호, 회사명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">상태</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="DRAFT">임시저장</SelectItem>
                  <SelectItem value="ISSUED">발행완료</SelectItem>
                  <SelectItem value="MODIFIED">수정발행</SelectItem>
                  <SelectItem value="CANCELLED">발행취소</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 세금계산서 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>세금계산서 목록</CardTitle>
          <CardDescription>
            총 {filteredInvoices.length}건의 세금계산서가 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>계산서번호</TableHead>
                <TableHead>공급받는자</TableHead>
                <TableHead>공급가액</TableHead>
                <TableHead>세액</TableHead>
                <TableHead>합계금액</TableHead>
                <TableHead>발행일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.buyerCompanyName}</TableCell>
                  <TableCell>{formatCurrency(invoice.supplyAmount)}</TableCell>
                  <TableCell>{formatCurrency(invoice.taxAmount)}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm">
                        <FileTextIcon className="h-4 w-4" />
                      </Button>
                      {invoice.status === 'DRAFT' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleIssueInvoice(invoice.id)}
                          disabled={loading}
                        >
                          <SendIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {(invoice.status === 'ISSUED' || invoice.status === 'MODIFIED') && (
                        <>
                          <Button variant="outline" size="sm">
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelInvoice(invoice.id)}
                            disabled={loading}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}