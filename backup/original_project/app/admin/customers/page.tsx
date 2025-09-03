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
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  UserPlus,
  UserCheck,
  UserX,
  Award,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const customers = [
  {
    id: 'CUST-001',
    name: '김철수',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    avatar: '/placeholder.svg',
    status: 'active',
    tier: 'vip',
    joinDate: '2023-01-15',
    lastOrder: '2024-01-15',
    totalOrders: 23,
    totalSpent: 2345000,
    points: 12500,
    address: '서울시 강남구 테헤란로 123',
    birthDate: '1985-03-20',
    gender: '남성',
    marketingConsent: true
  },
  {
    id: 'CUST-002',
    name: '이영희',
    email: 'lee@example.com',
    phone: '010-2345-6789',
    avatar: '/placeholder.svg',
    status: 'active',
    tier: 'gold',
    joinDate: '2023-03-20',
    lastOrder: '2024-01-14',
    totalOrders: 15,
    totalSpent: 1567000,
    points: 8900,
    address: '서울시 서초구 서초대로 456',
    birthDate: '1990-07-15',
    gender: '여성',
    marketingConsent: true
  },
  {
    id: 'CUST-003',
    name: '박민수',
    email: 'park@example.com',
    phone: '010-3456-7890',
    avatar: '/placeholder.svg',
    status: 'active',
    tier: 'silver',
    joinDate: '2023-06-10',
    lastOrder: '2024-01-10',
    totalOrders: 8,
    totalSpent: 890000,
    points: 4500,
    address: '부산시 해운대구 해운대로 789',
    birthDate: '1988-11-25',
    gender: '남성',
    marketingConsent: false
  },
  {
    id: 'CUST-004',
    name: '정수진',
    email: 'jung@example.com',
    phone: '010-4567-8901',
    avatar: '/placeholder.svg',
    status: 'inactive',
    tier: 'bronze',
    joinDate: '2023-08-05',
    lastOrder: '2023-12-01',
    totalOrders: 3,
    totalSpent: 234000,
    points: 1200,
    address: '대전시 유성구 대학로 101',
    birthDate: '1995-02-10',
    gender: '여성',
    marketingConsent: true
  },
  {
    id: 'CUST-005',
    name: '최동현',
    email: 'choi@example.com',
    phone: '010-5678-9012',
    avatar: '/placeholder.svg',
    status: 'active',
    tier: 'gold',
    joinDate: '2023-02-28',
    lastOrder: '2024-01-13',
    totalOrders: 19,
    totalSpent: 1890000,
    points: 10200,
    address: '인천시 연수구 송도대로 202',
    birthDate: '1982-09-08',
    gender: '남성',
    marketingConsent: true
  },
  {
    id: 'CUST-006',
    name: '홍길동',
    email: 'hong@example.com',
    phone: '010-6789-0123',
    avatar: '/placeholder.svg',
    status: 'blocked',
    tier: 'bronze',
    joinDate: '2023-11-20',
    lastOrder: '2023-11-25',
    totalOrders: 1,
    totalSpent: 45000,
    points: 0,
    address: '광주시 서구 상무대로 303',
    birthDate: '1993-06-30',
    gender: '남성',
    marketingConsent: false
  }
]

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<unknown>(null)

  const getStatusBadge = (status: string) => {
    const statusConfig: unknown = {
      active: { label: '활성', color: 'bg-green-100 text-green-800', icon: UserCheck },
      inactive: { label: '비활성', color: 'bg-gray-100 text-gray-800', icon: UserX },
      blocked: { label: '차단', color: 'bg-red-100 text-red-800', icon: UserX }
    }
    
    const config = statusConfig[status] || statusConfig.active
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getTierBadge = (tier: string) => {
    const tierConfig: unknown = {
      vip: { label: 'VIP', color: 'bg-purple-100 text-purple-800' },
      gold: { label: 'Gold', color: 'bg-yellow-100 text-yellow-800' },
      silver: { label: 'Silver', color: 'bg-gray-100 text-gray-800' },
      bronze: { label: 'Bronze', color: 'bg-orange-100 text-orange-800' }
    }
    
    const config = tierConfig[tier] || tierConfig.bronze
    return (
      <Badge className={config.color}>
        <Award className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const handleCustomerAction = (action: string, customer: unknown) => {
    switch(action) {
      case 'view':
        setSelectedCustomer(customer)
        break
      case 'edit':
        toast.info(`${customer.name} 고객 정보 수정`)
        break
      case 'email':
        toast.success(`${customer.email}로 이메일 발송`)
        break
      case 'block':
        toast.warning(`${customer.name} 고객 차단`)
        break
      case 'unblock':
        toast.success(`${customer.name} 고객 차단 해제`)
        break
      case 'delete':
        toast.error(`${customer.name} 고객 삭제`)
        break
    }
  }

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    vip: customers.filter(c => c.tier === 'vip').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue: Math.round(customers.reduce((sum, c) => sum + (c.totalSpent / c.totalOrders), 0) / customers.length)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">고객 관리</h2>
          <p className="text-muted-foreground">고객 정보를 관리하고 분석합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('고객 데이터 다운로드')}>
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
          <Button onClick={() => toast.success('새 고객 추가')}>
            <UserPlus className="mr-2 h-4 w-4" />
            고객 추가
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 고객</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">등록된 고객 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">활성 고객</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">최근 3개월 내 구매</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">VIP 고객</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.vip}</div>
            <p className="text-xs text-muted-foreground">최상위 등급</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{(stats.totalRevenue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">누적 구매액</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">평균 구매액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{stats.avgOrderValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">건당 평균</p>
          </CardContent>
        </Card>
      </div>

      {/* 고객 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>고객 목록</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="이름, 이메일 검색..."
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
                <TableHead>고객</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>등급</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>구매</TableHead>
                <TableHead>총 구매액</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback>{customer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{customer.email}</p>
                      <p className="text-muted-foreground">{customer.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTierBadge(customer.tier)}</TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell className="text-sm">{customer.joinDate}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{customer.totalOrders}건</p>
                      <p className="text-xs text-muted-foreground">
                        마지막: {customer.lastOrder}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ₩{customer.totalSpent.toLocaleString()}
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleCustomerAction('view', customer)}>
                          <Eye className="mr-2 h-4 w-4" />
                          상세 보기
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCustomerAction('edit', customer)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          정보 수정
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCustomerAction('email', customer)}>
                          <Mail className="mr-2 h-4 w-4" />
                          이메일 발송
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {customer.status === 'active' ? (
                          <DropdownMenuItem 
                            onClick={() => handleCustomerAction('block', customer)}
                            className="text-red-600"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            고객 차단
                          </DropdownMenuItem>
                        ) : customer.status === 'blocked' ? (
                          <DropdownMenuItem onClick={() => handleCustomerAction('unblock', customer)}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            차단 해제
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 고객 상세 모달 */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedCustomer(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedCustomer.avatar} />
                    <AvatarFallback>{selectedCustomer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedCustomer.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.id}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}>
                  <UserX className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">기본 정보</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {selectedCustomer.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {selectedCustomer.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      생년월일: {selectedCustomer.birthDate}
                    </div>
                    <p>성별: {selectedCustomer.gender}</p>
                    <p>주소: {selectedCustomer.address}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">활동 정보</h3>
                  <div className="space-y-2 text-sm">
                    <p>가입일: {selectedCustomer.joinDate}</p>
                    <p>마지막 주문: {selectedCustomer.lastOrder}</p>
                    <div className="flex gap-2">
                      <span>상태:</span>
                      {getStatusBadge(selectedCustomer.status)}
                    </div>
                    <div className="flex gap-2">
                      <span>등급:</span>
                      {getTierBadge(selectedCustomer.tier)}
                    </div>
                    <p>마케팅 수신: {selectedCustomer.marketingConsent ? '동의' : '거부'}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      총 주문
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedCustomer.totalOrders}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      총 구매액
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₩{selectedCustomer.totalSpent.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Award className="mr-2 h-4 w-4" />
                      포인트
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedCustomer.points.toLocaleString()}P
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleCustomerAction('email', selectedCustomer)}>
                  <Mail className="mr-2 h-4 w-4" />
                  이메일 발송
                </Button>
                <Button variant="outline" className="flex-1">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  구매 내역 보기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}