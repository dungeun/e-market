'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  Store, 
  Globe,
  Mail,
  Shield,
  Database,
  Truck,
  CreditCard,
  Users,
  FileText,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lock,
  Key,
  Server,
  HardDrive
} from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Commerce Store',
      siteUrl: 'https://commerce.example.com',
      adminEmail: 'admin@example.com',
      timezone: 'Asia/Seoul',
      language: 'ko',
      currency: 'KRW',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h'
    },
    store: {
      storeName: 'Commerce Store',
      storeEmail: 'store@example.com',
      storePhone: '02-1234-5678',
      storeAddress: '서울시 강남구 테헤란로 123',
      businessNumber: '123-45-67890',
      ceoName: '홍길동',
      onlineBusinessNumber: '2024-서울강남-1234'
    },
    shipping: {
      freeShippingThreshold: 50000,
      defaultShippingFee: 3000,
      expressShippingFee: 5000,
      returnPeriod: 7,
      exchangePeriod: 7
    },
    payment: {
      enableCreditCard: true,
      enableBankTransfer: true,
      enableVirtualAccount: true,
      enableKakaoPay: true,
      enableNaverPay: true,
      enableTossPay: false,
      pgProvider: 'nicepay',
      merchantId: 'MERCHANT123',
      taxRate: 10
    },
    inventory: {
      trackInventory: true,
      allowBackorders: false,
      lowStockThreshold: 10,
      outOfStockThreshold: 0,
      holdStockMinutes: 60
    },
    email: {
      orderConfirmation: true,
      shippingNotification: true,
      deliveryNotification: true,
      returnNotification: true,
      promotionalEmails: true,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'noreply@example.com'
    },
    security: {
      requireEmailVerification: true,
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecialChars: false,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      enableTwoFactor: false,
      sessionTimeout: 60
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '03:00',
      backupRetention: 30,
      backupLocation: 'cloud'
    }
  })

  const handleSave = (section: string) => {
    toast.success(`${section} 설정이 저장되었습니다.`)
  }

  const handleReset = (section: string) => {
    toast.info(`${section} 설정이 초기화되었습니다.`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">일반 설정</h2>
          <p className="text-muted-foreground">시스템 전반의 설정을 관리합니다.</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid grid-cols-8 w-full">
          <TabsTrigger value="general">일반</TabsTrigger>
          <TabsTrigger value="store">스토어</TabsTrigger>
          <TabsTrigger value="shipping">배송</TabsTrigger>
          <TabsTrigger value="payment">결제</TabsTrigger>
          <TabsTrigger value="inventory">재고</TabsTrigger>
          <TabsTrigger value="email">이메일</TabsTrigger>
          <TabsTrigger value="security">보안</TabsTrigger>
          <TabsTrigger value="backup">백업</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                일반 설정
              </CardTitle>
              <CardDescription>사이트의 기본 정보를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">사이트 이름</Label>
                  <Input 
                    id="siteName" 
                    value={settings.general.siteName}
                    onChange={(e) => setSettings({...settings, general: {...settings.general, siteName: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">사이트 URL</Label>
                  <Input 
                    id="siteUrl" 
                    value={settings.general.siteUrl}
                    onChange={(e) => setSettings({...settings, general: {...settings.general, siteUrl: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">관리자 이메일</Label>
                  <Input 
                    id="adminEmail" 
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => setSettings({...settings, general: {...settings.general, adminEmail: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">시간대</Label>
                  <Select value={settings.general.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Seoul">서울 (GMT+9)</SelectItem>
                      <SelectItem value="Asia/Tokyo">도쿄 (GMT+9)</SelectItem>
                      <SelectItem value="America/New_York">뉴욕 (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">언어</Label>
                  <Select value={settings.general.language}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">통화</Label>
                  <Select value={settings.general.currency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KRW">KRW (₩)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleReset('일반')}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  초기화
                </Button>
                <Button onClick={() => handleSave('일반')}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                스토어 정보
              </CardTitle>
              <CardDescription>사업자 정보와 연락처를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">상호명</Label>
                  <Input 
                    id="storeName" 
                    value={settings.store.storeName}
                    onChange={(e) => setSettings({...settings, store: {...settings.store, storeName: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ceoName">대표자명</Label>
                  <Input 
                    id="ceoName" 
                    value={settings.store.ceoName}
                    onChange={(e) => setSettings({...settings, store: {...settings.store, ceoName: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessNumber">사업자등록번호</Label>
                  <Input 
                    id="businessNumber" 
                    value={settings.store.businessNumber}
                    onChange={(e) => setSettings({...settings, store: {...settings.store, businessNumber: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onlineBusinessNumber">통신판매업신고번호</Label>
                  <Input 
                    id="onlineBusinessNumber" 
                    value={settings.store.onlineBusinessNumber}
                    onChange={(e) => setSettings({...settings, store: {...settings.store, onlineBusinessNumber: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">대표 이메일</Label>
                  <Input 
                    id="storeEmail" 
                    type="email"
                    value={settings.store.storeEmail}
                    onChange={(e) => setSettings({...settings, store: {...settings.store, storeEmail: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">대표 전화번호</Label>
                  <Input 
                    id="storePhone" 
                    value={settings.store.storePhone}
                    onChange={(e) => setSettings({...settings, store: {...settings.store, storePhone: e.target.value}})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">사업장 주소</Label>
                <Textarea 
                  id="storeAddress" 
                  value={settings.store.storeAddress}
                  onChange={(e) => setSettings({...settings, store: {...settings.store, storeAddress: e.target.value}})}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleReset('스토어')}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  초기화
                </Button>
                <Button onClick={() => handleSave('스토어')}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                배송 설정
              </CardTitle>
              <CardDescription>배송료와 정책을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="freeShippingThreshold">무료배송 기준금액</Label>
                  <Input 
                    id="freeShippingThreshold" 
                    type="number"
                    value={settings.shipping.freeShippingThreshold}
                    onChange={(e) => setSettings({...settings, shipping: {...settings.shipping, freeShippingThreshold: parseInt(e.target.value)}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultShippingFee">기본 배송료</Label>
                  <Input 
                    id="defaultShippingFee" 
                    type="number"
                    value={settings.shipping.defaultShippingFee}
                    onChange={(e) => setSettings({...settings, shipping: {...settings.shipping, defaultShippingFee: parseInt(e.target.value)}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expressShippingFee">특급 배송료</Label>
                  <Input 
                    id="expressShippingFee" 
                    type="number"
                    value={settings.shipping.expressShippingFee}
                    onChange={(e) => setSettings({...settings, shipping: {...settings.shipping, expressShippingFee: parseInt(e.target.value)}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returnPeriod">반품 가능 기간 (일)</Label>
                  <Input 
                    id="returnPeriod" 
                    type="number"
                    value={settings.shipping.returnPeriod}
                    onChange={(e) => setSettings({...settings, shipping: {...settings.shipping, returnPeriod: parseInt(e.target.value)}})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleReset('배송')}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  초기화
                </Button>
                <Button onClick={() => handleSave('배송')}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                결제 설정
              </CardTitle>
              <CardDescription>결제 방법과 PG 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">결제 방법</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableCreditCard">신용카드</Label>
                    <Switch 
                      id="enableCreditCard"
                      checked={settings.payment.enableCreditCard}
                      onCheckedChange={(checked) => setSettings({...settings, payment: {...settings.payment, enableCreditCard: checked}})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableBankTransfer">계좌이체</Label>
                    <Switch 
                      id="enableBankTransfer"
                      checked={settings.payment.enableBankTransfer}
                      onCheckedChange={(checked) => setSettings({...settings, payment: {...settings.payment, enableBankTransfer: checked}})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableKakaoPay">카카오페이</Label>
                    <Switch 
                      id="enableKakaoPay"
                      checked={settings.payment.enableKakaoPay}
                      onCheckedChange={(checked) => setSettings({...settings, payment: {...settings.payment, enableKakaoPay: checked}})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableNaverPay">네이버페이</Label>
                    <Switch 
                      id="enableNaverPay"
                      checked={settings.payment.enableNaverPay}
                      onCheckedChange={(checked) => setSettings({...settings, payment: {...settings.payment, enableNaverPay: checked}})}
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pgProvider">PG사</Label>
                  <Select value={settings.payment.pgProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nicepay">나이스페이</SelectItem>
                      <SelectItem value="inicis">이니시스</SelectItem>
                      <SelectItem value="toss">토스페이먼츠</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">부가세율 (%)</Label>
                  <Input 
                    id="taxRate" 
                    type="number"
                    value={settings.payment.taxRate}
                    onChange={(e) => setSettings({...settings, payment: {...settings.payment, taxRate: parseInt(e.target.value)}})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleReset('결제')}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  초기화
                </Button>
                <Button onClick={() => handleSave('결제')}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                재고 설정
              </CardTitle>
              <CardDescription>재고 관리 정책을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="trackInventory">재고 추적</Label>
                    <p className="text-sm text-muted-foreground">재고 수량을 추적하고 관리합니다</p>
                  </div>
                  <Switch 
                    id="trackInventory"
                    checked={settings.inventory.trackInventory}
                    onCheckedChange={(checked) => setSettings({...settings, inventory: {...settings.inventory, trackInventory: checked}})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowBackorders">백오더 허용</Label>
                    <p className="text-sm text-muted-foreground">재고가 없어도 주문을 받습니다</p>
                  </div>
                  <Switch 
                    id="allowBackorders"
                    checked={settings.inventory.allowBackorders}
                    onCheckedChange={(checked) => setSettings({...settings, inventory: {...settings.inventory, allowBackorders: checked}})}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">재고 부족 기준</Label>
                  <Input 
                    id="lowStockThreshold" 
                    type="number"
                    value={settings.inventory.lowStockThreshold}
                    onChange={(e) => setSettings({...settings, inventory: {...settings.inventory, lowStockThreshold: parseInt(e.target.value)}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holdStockMinutes">재고 보류 시간 (분)</Label>
                  <Input 
                    id="holdStockMinutes" 
                    type="number"
                    value={settings.inventory.holdStockMinutes}
                    onChange={(e) => setSettings({...settings, inventory: {...settings.inventory, holdStockMinutes: parseInt(e.target.value)}})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleReset('재고')}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  초기화
                </Button>
                <Button onClick={() => handleSave('재고')}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                이메일 설정
              </CardTitle>
              <CardDescription>이메일 알림과 SMTP 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">이메일 알림</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="orderConfirmation">주문 확인</Label>
                    <Switch 
                      id="orderConfirmation"
                      checked={settings.email.orderConfirmation}
                      onCheckedChange={(checked) => setSettings({...settings, email: {...settings.email, orderConfirmation: checked}})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shippingNotification">배송 알림</Label>
                    <Switch 
                      id="shippingNotification"
                      checked={settings.email.shippingNotification}
                      onCheckedChange={(checked) => setSettings({...settings, email: {...settings.email, shippingNotification: checked}})}
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP 호스트</Label>
                  <Input 
                    id="smtpHost" 
                    value={settings.email.smtpHost}
                    onChange={(e) => setSettings({...settings, email: {...settings.email, smtpHost: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP 포트</Label>
                  <Input 
                    id="smtpPort" 
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => setSettings({...settings, email: {...settings.email, smtpPort: parseInt(e.target.value)}})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleReset('이메일')}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  초기화
                </Button>
                <Button onClick={() => handleSave('이메일')}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                보안 설정
              </CardTitle>
              <CardDescription>계정 보안과 인증 정책을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">비밀번호 정책</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">최소 길이</Label>
                    <Input 
                      id="passwordMinLength" 
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => setSettings({...settings, security: {...settings.security, passwordMinLength: parseInt(e.target.value)}})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="passwordRequireUppercase">대문자 필수</Label>
                    <Switch 
                      id="passwordRequireUppercase"
                      checked={settings.security.passwordRequireUppercase}
                      onCheckedChange={(checked) => setSettings({...settings, security: {...settings.security, passwordRequireUppercase: checked}})}
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">최대 로그인 시도</Label>
                  <Input 
                    id="maxLoginAttempts" 
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => setSettings({...settings, security: {...settings.security, maxLoginAttempts: parseInt(e.target.value)}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">세션 타임아웃 (분)</Label>
                  <Input 
                    id="sessionTimeout" 
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({...settings, security: {...settings.security, sessionTimeout: parseInt(e.target.value)}})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleReset('보안')}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  초기화
                </Button>
                <Button onClick={() => handleSave('보안')}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                백업 설정
              </CardTitle>
              <CardDescription>데이터 백업 정책을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup">자동 백업</Label>
                  <p className="text-sm text-muted-foreground">데이터를 자동으로 백업합니다</p>
                </div>
                <Switch 
                  id="autoBackup"
                  checked={settings.backup.autoBackup}
                  onCheckedChange={(checked) => setSettings({...settings, backup: {...settings.backup, autoBackup: checked}})}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">백업 주기</Label>
                  <Select value={settings.backup.backupFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">매일</SelectItem>
                      <SelectItem value="weekly">매주</SelectItem>
                      <SelectItem value="monthly">매월</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupTime">백업 시간</Label>
                  <Input 
                    id="backupTime" 
                    type="time"
                    value={settings.backup.backupTime}
                    onChange={(e) => setSettings({...settings, backup: {...settings.backup, backupTime: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupRetention">보관 기간 (일)</Label>
                  <Input 
                    id="backupRetention" 
                    type="number"
                    value={settings.backup.backupRetention}
                    onChange={(e) => setSettings({...settings, backup: {...settings.backup, backupRetention: parseInt(e.target.value)}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupLocation">백업 위치</Label>
                  <Select value={settings.backup.backupLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cloud">클라우드</SelectItem>
                      <SelectItem value="local">로컬</SelectItem>
                      <SelectItem value="both">둘 다</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => toast.info('즉시 백업 시작')}>
                  <Server className="mr-2 h-4 w-4" />
                  즉시 백업
                </Button>
                <Button onClick={() => handleSave('백업')}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}