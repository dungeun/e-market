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
import { Textarea } from '@/components/ui/textarea'
import { SearchIcon, CheckIcon, XIcon, EyeIcon, LinkIcon, RefreshCwIcon } from 'lucide-react'

interface CorporatePayment {
  id: string
  bankCode: string
  bankName: string
  accountNumber: string
  transactionDate: string
  depositorName: string
  depositorAccount?: string
  amount: number
  balanceAfter: number
  matchedOrderId?: string
  matchingStatus: 'AUTO_MATCHED' | 'MANUAL_MATCHED' | 'UNMATCHED'
  matchingScore: number
  transactionMemo?: string
  bankTransactionId: string
  processedAt?: string
  orderInfo?: {
    id: string
    orderNumber: string
    customerName: string
    totalAmount: number
  }
}

interface MatchingCandidate {
  orderId: string
  orderNumber: string
  customerName: string
  totalAmount: number
  score: number
  reasons: string[]
}

export default function CorporatePaymentsPage() {
  const [payments, setPayments] = useState<CorporatePayment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<CorporatePayment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [bankFilter, setBankFilter] = useState<string>('ALL')
  const [selectedPayment, setSelectedPayment] = useState<CorporatePayment | null>(null)
  const [matchingCandidates, setMatchingCandidates] = useState<MatchingCandidate[]>([])
  const [isMatchingDialogOpen, setIsMatchingDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [manualMatchOrderId, setManualMatchOrderId] = useState('')

  useEffect(() => {
    fetchPayments()
    // 실시간 업데이트를 위한 폴링 (실제 운영에서는 WebSocket 사용 권장)
    const interval = setInterval(fetchPayments, 30000) // 30초마다 업데이트
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, statusFilter, bankFilter])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/corporate-payments')
      const data = await response.json()
      setPayments(data)
    } catch (error) {

    }
  }

  const filterPayments = () => {
    let filtered = payments

    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.depositorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.bankTransactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.orderInfo?.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.orderInfo?.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(payment => payment.matchingStatus === statusFilter)
    }

    if (bankFilter !== 'ALL') {
      filtered = filtered.filter(payment => payment.bankCode === bankFilter)
    }

    setFilteredPayments(filtered)
  }

  const handleViewDetails = async (payment: CorporatePayment) => {
    setSelectedPayment(payment)
    setIsDetailDialogOpen(true)
  }

  const handleFindMatches = async (payment: CorporatePayment) => {
    setSelectedPayment(payment)
    setLoading(true)
    
    try {
      const response = await fetch(`/api/admin/corporate-payments/${payment.id}/find-matches`)
      const candidates = await response.json()
      setMatchingCandidates(candidates)
      setIsMatchingDialogOpen(true)
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const handleAutoMatch = async (paymentId: string, orderId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/corporate-payments/${paymentId}/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })

      if (response.ok) {
        fetchPayments()
        setIsMatchingDialogOpen(false)
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const handleManualMatch = async () => {
    if (!selectedPayment || !manualMatchOrderId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/corporate-payments/${selectedPayment.id}/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderId: manualMatchOrderId,
          isManual: true 
        }),
      })

      if (response.ok) {
        fetchPayments()
        setIsMatchingDialogOpen(false)
        setManualMatchOrderId('')
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const handleUnmatch = async (paymentId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/corporate-payments/${paymentId}/unmatch`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchPayments()
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AUTO_MATCHED: { color: 'bg-green-500', text: '자동매칭' },
      MANUAL_MATCHED: { color: 'bg-blue-500', text: '수동매칭' },
      UNMATCHED: { color: 'bg-red-500', text: '미매칭' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-500', text: status }
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    )
  }

  const getMatchingScoreBadge = (score: number) => {
    if (score >= 0.9) return <Badge className="bg-green-500 text-white">높음</Badge>
    if (score >= 0.7) return <Badge className="bg-yellow-500 text-white">보통</Badge>
    if (score >= 0.5) return <Badge className="bg-orange-500 text-white">낮음</Badge>
    return <Badge className="bg-red-500 text-white">매우낮음</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  const getBankName = (bankCode: string) => {
    const bankNames: { [key: string]: string } = {
      '001': 'KB국민은행',
      '003': '기업은행',
      '004': '신한은행',
      '011': '농협은행',
      '020': '우리은행',
      '023': 'SC제일은행',
      '081': '하나은행',
      '088': '신한은행',
      '090': '카카오뱅크',
      '089': '케이뱅크'
    }
    return bankNames[bankCode] || `은행코드: ${bankCode}`
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">법인 입금확인</h1>
          <p className="text-gray-600 mt-2">법인 계좌 입금 내역 및 주문 매칭 관리</p>
        </div>
        
        <Button onClick={fetchPayments} disabled={loading}>
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 입금</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}건</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">자동 매칭</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {payments.filter(p => p.matchingStatus === 'AUTO_MATCHED').length}건
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">수동 매칭</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {payments.filter(p => p.matchingStatus === 'MANUAL_MATCHED').length}건
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">미매칭</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {payments.filter(p => p.matchingStatus === 'UNMATCHED').length}건
            </div>
          </CardContent>
        </Card>
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
                  placeholder="입금자명, 거래ID, 주문번호로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">매칭 상태</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="UNMATCHED">미매칭</SelectItem>
                  <SelectItem value="AUTO_MATCHED">자동매칭</SelectItem>
                  <SelectItem value="MANUAL_MATCHED">수동매칭</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bank">은행</Label>
              <Select value={bankFilter} onValueChange={setBankFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="은행 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="001">KB국민은행</SelectItem>
                  <SelectItem value="004">신한은행</SelectItem>
                  <SelectItem value="020">우리은행</SelectItem>
                  <SelectItem value="081">하나은행</SelectItem>
                  <SelectItem value="090">카카오뱅크</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 입금 내역 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>입금 내역</CardTitle>
          <CardDescription>
            총 {filteredPayments.length}건의 입금 내역이 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>입금일시</TableHead>
                <TableHead>은행</TableHead>
                <TableHead>입금자명</TableHead>
                <TableHead>입금액</TableHead>
                <TableHead>매칭상태</TableHead>
                <TableHead>신뢰도</TableHead>
                <TableHead>주문정보</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {formatDateTime(payment.transactionDate)}
                  </TableCell>
                  <TableCell>{getBankName(payment.bankCode)}</TableCell>
                  <TableCell>{payment.depositorName}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{getStatusBadge(payment.matchingStatus)}</TableCell>
                  <TableCell>
                    {payment.matchingStatus !== 'UNMATCHED' && 
                      getMatchingScoreBadge(payment.matchingScore)
                    }
                  </TableCell>
                  <TableCell>
                    {payment.orderInfo ? (
                      <div className="text-sm">
                        <div className="font-medium">{payment.orderInfo.orderNumber}</div>
                        <div className="text-gray-500">{payment.orderInfo.customerName}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">매칭 안됨</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(payment)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      {payment.matchingStatus === 'UNMATCHED' ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleFindMatches(payment)}
                          disabled={loading}
                        >
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUnmatch(payment.id)}
                          disabled={loading}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 상세 정보 다이얼로그 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>입금 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>거래 ID</Label>
                  <div className="mt-1 text-sm">{selectedPayment.bankTransactionId}</div>
                </div>
                <div>
                  <Label>입금일시</Label>
                  <div className="mt-1 text-sm">{formatDateTime(selectedPayment.transactionDate)}</div>
                </div>
                <div>
                  <Label>은행</Label>
                  <div className="mt-1 text-sm">{getBankName(selectedPayment.bankCode)}</div>
                </div>
                <div>
                  <Label>계좌번호</Label>
                  <div className="mt-1 text-sm">{selectedPayment.accountNumber}</div>
                </div>
                <div>
                  <Label>입금자명</Label>
                  <div className="mt-1 text-sm">{selectedPayment.depositorName}</div>
                </div>
                <div>
                  <Label>입금액</Label>
                  <div className="mt-1 text-sm font-bold">{formatCurrency(selectedPayment.amount)}</div>
                </div>
                <div>
                  <Label>거래 후 잔액</Label>
                  <div className="mt-1 text-sm">{formatCurrency(selectedPayment.balanceAfter)}</div>
                </div>
                <div>
                  <Label>매칭 상태</Label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.matchingStatus)}</div>
                </div>
              </div>
              {selectedPayment.transactionMemo && (
                <div>
                  <Label>거래 메모</Label>
                  <div className="mt-1 text-sm bg-gray-50 p-2 rounded">{selectedPayment.transactionMemo}</div>
                </div>
              )}
              {selectedPayment.orderInfo && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">매칭된 주문 정보</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>주문번호: {selectedPayment.orderInfo.orderNumber}</div>
                    <div>고객명: {selectedPayment.orderInfo.customerName}</div>
                    <div>주문금액: {formatCurrency(selectedPayment.orderInfo.totalAmount)}</div>
                    <div>매칭 신뢰도: {(selectedPayment.matchingScore * 100).toFixed(1)}%</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 매칭 후보 다이얼로그 */}
      <Dialog open={isMatchingDialogOpen} onOpenChange={setIsMatchingDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>주문 매칭</DialogTitle>
            <DialogDescription>
              입금 정보와 일치하는 주문을 찾았습니다. 매칭할 주문을 선택하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedPayment && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">입금 정보</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>입금자명: {selectedPayment.depositorName}</div>
                  <div>입금액: {formatCurrency(selectedPayment.amount)}</div>
                  <div>입금일시: {formatDateTime(selectedPayment.transactionDate)}</div>
                </div>
              </div>
            )}

            {matchingCandidates.length > 0 ? (
              <div>
                <h4 className="font-semibold mb-3">매칭 후보 ({matchingCandidates.length}건)</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {matchingCandidates.map((candidate) => (
                    <div
                      key={candidate.orderId}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{candidate.orderNumber}</span>
                          {getMatchingScoreBadge(candidate.score)}
                        </div>
                        <div className="text-sm text-gray-600">
                          고객: {candidate.customerName} | 금액: {formatCurrency(candidate.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          매칭 이유: {candidate.reasons.join(', ')}
                        </div>
                      </div>
                      <Button
                        onClick={() => selectedPayment && handleAutoMatch(selectedPayment.id, candidate.orderId)}
                        disabled={loading}
                      >
                        매칭
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                자동 매칭 가능한 주문이 없습니다.
              </div>
            )}

            {/* 수동 매칭 */}
            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold mb-3">수동 매칭</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="주문 ID 입력"
                  value={manualMatchOrderId}
                  onChange={(e) => setManualMatchOrderId(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleManualMatch}
                  disabled={loading || !manualMatchOrderId}
                >
                  수동 매칭
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMatchingDialogOpen(false)}>
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}