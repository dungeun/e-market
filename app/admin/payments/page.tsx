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
  CreditCard,
  Wallet,
  Banknote,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Receipt,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'

const payments = [
  {
    id: 'PAY-2024-001',
    orderId: 'ORD-2024-001',
    customer: '김철수',
    amount: 129000,
    method: '신용카드',
    card: 'Visa ****1234',
    status: 'completed',
    date: '2024-01-15 14:23',
    fee: 3870,
    net: 125130
  },
  {
    id: 'PAY-2024-002',
    orderId: 'ORD-2024-002',
    customer: '이영희',
    amount: 299000,
    method: '카카오페이',
    card: null,
    status: 'completed',
    date: '2024-01-14 10:15',
    fee: 8970,
    net: 290030
  },
  {
    id: 'PAY-2024-003',
    orderId: 'ORD-2024-003',
    customer: '박민수',
    amount: 84000,
    method: '네이버페이',
    card: null,
    status: 'completed',
    date: '2024-01-13 16:45',
    fee: 2520,
    net: 81480
  },
  {
    id: 'PAY-2024-004',
    orderId: 'ORD-2024-004',
    customer: '정수진',
    amount: 79000,
    method: '계좌이체',
    card: null,
    status: 'refunded',
    date: '2024-01-12 09:30',
    fee: 0,
    net: -79000,
    refundDate: '2024-01-13 11:20'
  },
  {
    id: 'PAY-2024-005',
    orderId: 'ORD-2024-005',
    customer: '최동현',
    amount: 143000,
    method: '가상계좌',
    card: null,
    status: 'pending',
    date: '2024-01-15 18:20',
    fee: 0,
    net: 0,
    expiryDate: '2024-01-17 18:20'
  },
  {
    id: 'PAY-2024-006',
    orderId: 'ORD-2024-006',
    customer: '홍길동',
    amount: 567000,
    method: '신용카드',
    card: 'Master ****5678',
    status: 'failed',
    date: '2024-01-15 09:45',
    fee: 0,
    net: 0,
    failReason: '카드 한도 초과'
  },
  {
    id: 'PAY-2024-007',
    orderId: 'ORD-2024-007',
    customer: '강민정',
    amount: 234000,
    method: '토스페이',
    card: null,
    status: 'processing',
    date: '2024-01-15 17:30',
    fee: 7020,
    net: 226980
  }
]

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<unknown>(null)

  const getStatusBadge = (status: string) => {
    const statusConfig: unknown = {
      completed: { label: '완료', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { label: '대기중', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { label: '처리중', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      failed: { label: '실패', color: 'bg-red-100 text-red-800', icon: XCircle },
      refunded: { label: '환불', color: 'bg-gray-100 text-gray-800', icon: RefreshCw }
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

  const getMethodIcon = (method: string) => {
    switch(method) {
      case '신용카드':
        return <CreditCard className="h-4 w-4" />
      case '계좌이체':
      case '가상계좌':
        return <Banknote className="h-4 w-4" />
      case '카카오페이':
      case '네이버페이':
      case '토스페이':
        return <Smartphone className="h-4 w-4" />
      default:
        return <Wallet className="h-4 w-4" />
    }
  }

  const handlePaymentAction = (action: string, payment: unknown) => {
    switch(action) {
      case 'view':
        setSelectedPayment(payment)
        break
      case 'refund':
        toast.warning(`${payment.id} 환불 처리`)
        break
      case 'retry':
        toast.info(`${payment.id} 재시도`)
        break
      case 'cancel':
        toast.error(`${payment.id} 취소`)
        break
      case 'receipt':
        toast.success(`${payment.id} 영수증 발행`)
        break
    }
  }

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    totalFee: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.fee, 0),
    totalNet: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.net, 0)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">결제 내역</h2>
          <p className="text-muted-foreground">결제 거래 내역을 확인하고 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('결제 내역 다운로드')}>
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
          <Button variant="outline" onClick={() => toast.info('정산 내역 확인')}>
            <Receipt className="mr-2 h-4 w-4" />
            정산 내역
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 거래</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">건</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">성공</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">대기중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">처리 대기</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">실패</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">거래 실패</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 결제액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{(stats.totalAmount / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">완료 거래</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">순수익</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{(stats.totalNet / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">수수료 제외</p>
          </CardContent>
        </Card>
      </div>

      {/* 경고 메시지 */}
      {stats.failed > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-base text-yellow-900">처리 필요 거래</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800">
              {stats.failed}건의 실패한 거래와 {stats.pending}건의 대기중인 거래가 있습니다.
              즉시 확인이 필요합니다.
            </p>
          </CardContent>
        </Card>
      )}

      {/* 결제 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>결제 거래 내역</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="결제번호, 고객명 검색..."
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
                <TableHead>결제번호</TableHead>
                <TableHead>주문번호</TableHead>
                <TableHead>고객</TableHead>
                <TableHead>결제방법</TableHead>
                <TableHead>결제금액</TableHead>
                <TableHead>수수료</TableHead>
                <TableHead>정산액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>일시</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.orderId}</TableCell>
                  <TableCell>{payment.customer}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMethodIcon(payment.method)}
                      <div>
                        <p className="text-sm">{payment.method}</p>
                        {payment.card && (
                          <p className="text-xs text-muted-foreground">{payment.card}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">₩{payment.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.fee > 0 ? `₩${payment.fee.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className={payment.net < 0 ? 'text-red-600' : ''}>
                    {payment.net !== 0 ? `₩${payment.net.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-sm">{payment.date}</TableCell>
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
                        <DropdownMenuItem onClick={() => handlePaymentAction('view', payment)}>
                          <Eye className="mr-2 h-4 w-4" />
                          상세 보기
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePaymentAction('receipt', payment)}>
                          <Receipt className="mr-2 h-4 w-4" />
                          영수증 발행
                        </DropdownMenuItem>
                        {payment.status === 'completed' && (
                          <DropdownMenuItem onClick={() => handlePaymentAction('refund', payment)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            환불 처리
                          </DropdownMenuItem>
                        )}
                        {payment.status === 'failed' && (
                          <DropdownMenuItem onClick={() => handlePaymentAction('retry', payment)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            재시도
                          </DropdownMenuItem>
                        )}
                        {payment.status === 'pending' && (
                          <DropdownMenuItem 
                            onClick={() => handlePaymentAction('cancel', payment)}
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            거래 취소
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

      {/* 결제 상세 모달 */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedPayment(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>결제 상세: {selectedPayment.id}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPayment(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">결제 정보</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">결제번호:</span>
                      <span className="font-medium">{selectedPayment.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">주문번호:</span>
                      <span className="font-medium">{selectedPayment.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">고객:</span>
                      <span className="font-medium">{selectedPayment.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">결제방법:</span>
                      <span className="font-medium">{selectedPayment.method}</span>
                    </div>
                    {selectedPayment.card && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">카드정보:</span>
                        <span className="font-medium">{selectedPayment.card}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">금액 정보</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">결제금액:</span>
                      <span className="font-medium">₩{selectedPayment.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">수수료:</span>
                      <span className="font-medium">₩{selectedPayment.fee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">정산액:</span>
                      <span className="font-medium">₩{selectedPayment.net.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">상태:</span>
                      {getStatusBadge(selectedPayment.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">거래 일시</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">결제일시:</span>
                    <span className="font-medium">{selectedPayment.date}</span>
                  </div>
                  {selectedPayment.refundDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">환불일시:</span>
                      <span className="font-medium">{selectedPayment.refundDate}</span>
                    </div>
                  )}
                  {selectedPayment.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">만료일시:</span>
                      <span className="font-medium">{selectedPayment.expiryDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedPayment.failReason && (
                <div>
                  <h3 className="font-semibold mb-2">실패 사유</h3>
                  <p className="text-sm text-red-600">{selectedPayment.failReason}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handlePaymentAction('receipt', selectedPayment)}>
                  <Receipt className="mr-2 h-4 w-4" />
                  영수증 발행
                </Button>
                {selectedPayment.status === 'completed' && (
                  <Button variant="outline" className="flex-1" onClick={() => handlePaymentAction('refund', selectedPayment)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    환불 처리
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}