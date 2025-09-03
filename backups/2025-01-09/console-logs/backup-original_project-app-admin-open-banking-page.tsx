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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlusIcon, SearchIcon, CreditCardIcon, RefreshCwIcon, EyeIcon, LinkIcon, UnlinkIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react'

interface BankAccount {
  id: string
  userId: string
  bankCode: string
  bankName: string
  accountNumber: string
  accountHolderName: string
  accountType: 'CORPORATE' | 'INDIVIDUAL'
  fintechUseNum: string
  inquiryAgreeYn: boolean
  inquiryAgreeDtime?: string
  transferAgreeYn: boolean
  transferAgreeDtime?: string
  isPrimary: boolean
  isActive: boolean
  balance?: number
  createdAt: string
  updatedAt: string
}

interface Transaction {
  id: string
  accountId: string
  transactionDate: string
  transactionTime: string
  transactionType: 'DEPOSIT' | 'WITHDRAWAL'
  transactionAmount: number
  balanceAfter: number
  counterpartyName?: string
  counterpartyAccount?: string
  counterpartyBankCode?: string
  transactionMemo?: string
  bankTransactionId: string
}

interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
  scope: string
  tokenType: string
}

export default function OpenBankingPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // 계좌 등록 상태
  const [newAccount, setNewAccount] = useState({
    bankCode: '',
    accountNumber: '',
    accountHolderName: '',
    accountType: 'CORPORATE' as 'CORPORATE' | 'INDIVIDUAL',
    inquiryAgreeYn: false,
    transferAgreeYn: false
  })

  // 거래내역 조회 필터
  const [transactionFilter, setTransactionFilter] = useState({
    accountId: '',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30일 전
    endDate: new Date().toISOString().split('T')[0],
    transactionType: 'ALL'
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/admin/open-banking/accounts')
      const data = await response.json()
      setAccounts(data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const fetchAccountBalance = async (accountId: string) => {
    setRefreshing(true)
    try {
      const response = await fetch(`/api/admin/open-banking/accounts/${accountId}/balance`)
      const data = await response.json()
      
      // 계좌 정보 업데이트
      setAccounts(prev => prev.map(acc => 
        acc.id === accountId ? { ...acc, balance: data.balance } : acc
      ))
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const fetchTransactions = async (accountId: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: transactionFilter.startDate,
        endDate: transactionFilter.endDate,
        ...(transactionFilter.transactionType !== 'ALL' && { 
          transactionType: transactionFilter.transactionType 
        })
      })

      const response = await fetch(`/api/admin/open-banking/accounts/${accountId}/transactions?${params}`)
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterAccount = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/open-banking/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccount),
      })

      if (response.ok) {
        const created = await response.json()
        setAccounts([created, ...accounts])
        setIsAccountDialogOpen(false)
        resetNewAccount()
      }
    } catch (error) {
      console.error('Error registering account:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlinkAccount = async (accountId: string) => {
    if (!confirm('정말로 이 계좌의 연결을 해제하시겠습니까?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/open-banking/accounts/${accountId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAccounts(prev => prev.filter(acc => acc.id !== accountId))
      }
    } catch (error) {
      console.error('Error unlinking account:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetPrimary = async (accountId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/open-banking/accounts/${accountId}/primary`, {
        method: 'POST',
      })

      if (response.ok) {
        setAccounts(prev => prev.map(acc => ({
          ...acc,
          isPrimary: acc.id === accountId
        })))
      }
    } catch (error) {
      console.error('Error setting primary account:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewTransactions = (account: BankAccount) => {
    setSelectedAccount(account)
    setTransactionFilter(prev => ({ ...prev, accountId: account.id }))
    fetchTransactions(account.id)
    setIsTransactionDialogOpen(true)
  }

  const resetNewAccount = () => {
    setNewAccount({
      bankCode: '',
      accountNumber: '',
      accountHolderName: '',
      accountType: 'CORPORATE',
      inquiryAgreeYn: false,
      transferAgreeYn: false
    })
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

  const getAccountTypeText = (type: string) => {
    return type === 'CORPORATE' ? '법인' : '개인'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString)
    if (timeString) {
      const [hours, minutes, seconds] = timeString.split(':')
      date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds))
    }
    return date.toLocaleString('ko-KR')
  }

  const getTransactionTypeText = (type: string) => {
    return type === 'DEPOSIT' ? '입금' : '출금'
  }

  const getTransactionTypeBadge = (type: string) => {
    return type === 'DEPOSIT' ? 
      <Badge className="bg-blue-500 text-white">입금</Badge> :
      <Badge className="bg-red-500 text-white">출금</Badge>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">오픈뱅킹 관리</h1>
          <p className="text-gray-600 mt-2">계좌 연결 및 거래내역 관리</p>
        </div>
        
        <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              계좌 연결
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>계좌 연결</DialogTitle>
              <DialogDescription>
                오픈뱅킹 API를 통해 새 계좌를 연결합니다.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="bankCode">은행</Label>
                <Select value={newAccount.bankCode} onValueChange={(value) => setNewAccount({...newAccount, bankCode: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="은행을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="001">KB국민은행</SelectItem>
                    <SelectItem value="004">신한은행</SelectItem>
                    <SelectItem value="020">우리은행</SelectItem>
                    <SelectItem value="081">하나은행</SelectItem>
                    <SelectItem value="090">카카오뱅크</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="accountNumber">계좌번호</Label>
                <Input
                  id="accountNumber"
                  value={newAccount.accountNumber}
                  onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
                  placeholder="'-' 없이 입력"
                />
              </div>
              
              <div>
                <Label htmlFor="accountHolderName">예금주명</Label>
                <Input
                  id="accountHolderName"
                  value={newAccount.accountHolderName}
                  onChange={(e) => setNewAccount({...newAccount, accountHolderName: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="accountType">계좌 유형</Label>
                <Select value={newAccount.accountType} onValueChange={(value) => setNewAccount({...newAccount, accountType: value as 'CORPORATE' | 'INDIVIDUAL'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CORPORATE">법인</SelectItem>
                    <SelectItem value="INDIVIDUAL">개인</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    id="inquiryAgree"
                    type="checkbox"
                    checked={newAccount.inquiryAgreeYn}
                    onChange={(e) => setNewAccount({...newAccount, inquiryAgreeYn: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="inquiryAgree" className="text-sm">
                    계좌 조회 서비스 이용 동의
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    id="transferAgree"
                    type="checkbox"
                    checked={newAccount.transferAgreeYn}
                    onChange={(e) => setNewAccount({...newAccount, transferAgreeYn: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="transferAgree" className="text-sm">
                    계좌 이체 서비스 이용 동의
                  </Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                취소
              </Button>
              <Button 
                onClick={handleRegisterAccount} 
                disabled={loading || !newAccount.bankCode || !newAccount.accountNumber || !newAccount.inquiryAgreeYn}
              >
                {loading ? '연결중...' : '연결'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">연결 계좌</TabsTrigger>
          <TabsTrigger value="settings">API 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          {/* 계좌 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>연결된 계좌</CardTitle>
              <CardDescription>
                오픈뱅킹 API를 통해 연결된 계좌 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>은행</TableHead>
                    <TableHead>계좌번호</TableHead>
                    <TableHead>예금주</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>잔액</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>기본계좌</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        {getBankName(account.bankCode)}
                      </TableCell>
                      <TableCell>{account.accountNumber}</TableCell>
                      <TableCell>{account.accountHolderName}</TableCell>
                      <TableCell>{getAccountTypeText(account.accountType)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {account.balance !== undefined ? formatCurrency(account.balance) : '-'}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchAccountBalance(account.id)}
                            disabled={refreshing}
                          >
                            <RefreshCwIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {account.inquiryAgreeYn && (
                            <Badge variant="outline" className="text-xs">조회권한</Badge>
                          )}
                          {account.transferAgreeYn && (
                            <Badge variant="outline" className="text-xs">이체권한</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {account.isPrimary ? (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            기본계좌
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetPrimary(account.id)}
                            disabled={loading}
                          >
                            설정
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTransactions(account)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUnlinkAccount(account.id)}
                            disabled={loading}
                          >
                            <UnlinkIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {accounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        연결된 계좌가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          {/* API 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API 연결 상태</CardTitle>
                <CardDescription>
                  오픈뱅킹 API 연결 상태를 확인합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-sm">정상 연결됨</span>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  마지막 확인: {new Date().toLocaleString('ko-KR')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>토큰 상태</CardTitle>
                <CardDescription>
                  API 인증 토큰 상태를 관리합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Access Token</span>
                    <Badge className="bg-green-500 text-white">유효</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Refresh Token</span>
                    <Badge className="bg-green-500 text-white">유효</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    토큰 갱신
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 거래내역 다이얼로그 */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>거래내역 조회</DialogTitle>
            <DialogDescription>
              {selectedAccount && `${getBankName(selectedAccount.bankCode)} ${selectedAccount.accountNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* 필터 */}
            <Card className="mb-4">
              <CardContent className="pt-4">
                <div className="flex gap-4 items-end">
                  <div>
                    <Label htmlFor="startDate">조회 시작일</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={transactionFilter.startDate}
                      onChange={(e) => setTransactionFilter({...transactionFilter, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">조회 종료일</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={transactionFilter.endDate}
                      onChange={(e) => setTransactionFilter({...transactionFilter, endDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="transactionType">거래 유형</Label>
                    <Select 
                      value={transactionFilter.transactionType} 
                      onValueChange={(value) => setTransactionFilter({...transactionFilter, transactionType: value})}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">전체</SelectItem>
                        <SelectItem value="DEPOSIT">입금</SelectItem>
                        <SelectItem value="WITHDRAWAL">출금</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={() => selectedAccount && fetchTransactions(selectedAccount.id)}
                    disabled={loading}
                  >
                    조회
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 거래내역 */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>거래일시</TableHead>
                  <TableHead>구분</TableHead>
                  <TableHead>상대방</TableHead>
                  <TableHead>거래금액</TableHead>
                  <TableHead>거래후잔액</TableHead>
                  <TableHead>메모</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {formatDateTime(transaction.transactionDate, transaction.transactionTime)}
                    </TableCell>
                    <TableCell>
                      {getTransactionTypeBadge(transaction.transactionType)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{transaction.counterpartyName || '-'}</div>
                        {transaction.counterpartyAccount && (
                          <div className="text-xs text-gray-500">
                            {transaction.counterpartyAccount}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={transaction.transactionType === 'DEPOSIT' ? 'text-blue-600' : 'text-red-600'}>
                      {transaction.transactionType === 'DEPOSIT' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.transactionAmount))}
                    </TableCell>
                    <TableCell>{formatCurrency(transaction.balanceAfter)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {transaction.transactionMemo || '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      거래내역이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}