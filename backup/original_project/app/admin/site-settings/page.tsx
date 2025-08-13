'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Save, Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Shield, CreditCard } from 'lucide-react'

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState({
    // 기본 정보
    siteName: 'Commerce Store',
    siteUrl: 'https://commerce.example.com',
    logo: '/logo.png',
    favicon: '/favicon.ico',
    description: '최고의 온라인 쇼핑 경험을 제공합니다.',
    keywords: '온라인쇼핑, 이커머스, 전자상거래',
    
    // 연락처
    email: 'contact@commerce.example.com',
    phone: '02-1234-5678',
    address: '서울특별시 강남구 테헤란로 123',
    businessNumber: '123-45-67890',
    
    // 소셜 미디어
    facebook: 'https://facebook.com/commercestore',
    instagram: 'https://instagram.com/commercestore',
    twitter: 'https://twitter.com/commercestore',
    youtube: 'https://youtube.com/commercestore',
    
    // 이메일 설정
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@commerce.example.com',
    smtpPassword: '********',
    emailFrom: 'Commerce Store <noreply@commerce.example.com>',
    
    // 결제 설정
    paymentMethods: {
      card: true,
      bank: true,
      virtualAccount: true,
      phone: false,
      kakao: true,
      naver: true,
      toss: true
    },
    pgProvider: 'tosspayments',
    pgMerchantId: 'merchant_123456',
    pgApiKey: '********',
    
    // SEO 설정
    enableSitemap: true,
    enableRobots: true,
    googleAnalytics: 'G-XXXXXXXXXX',
    naverWebmaster: '',
    googleSearchConsole: '',
    
    // 보안 설정
    enableSSL: true,
    enableCaptcha: true,
    captchaKey: '********',
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    
    // 유지보수
    maintenanceMode: false,
    maintenanceMessage: '시스템 점검 중입니다. 잠시 후 다시 시도해주세요.'
  })

  const handleSave = () => {
    toast.success('사이트 설정이 저장되었습니다.')
  }

  const handleTestEmail = () => {
    toast.info('테스트 이메일을 발송했습니다.')
  }

  const handleTestPayment = () => {
    toast.info('결제 연동 테스트를 시작합니다.')
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">사이트 설정</h2>
          <p className="text-muted-foreground">웹사이트의 기본 설정과 환경을 관리합니다.</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          설정 저장
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">기본 정보</TabsTrigger>
          <TabsTrigger value="contact">연락처</TabsTrigger>
          <TabsTrigger value="email">이메일</TabsTrigger>
          <TabsTrigger value="payment">결제</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="security">보안</TabsTrigger>
        </TabsList>

        {/* 기본 정보 */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>사이트의 기본적인 정보를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">사이트 이름</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">사이트 URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">사이트 설명</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setSettings({...settings, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">검색 키워드</Label>
                <Input
                  id="keywords"
                  value={settings.keywords}
                  onChange={(e) => setSettings({...settings, keywords: e.target.value})}
                  placeholder="쉼표로 구분하여 입력"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenance"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
                <Label htmlFor="maintenance">유지보수 모드</Label>
              </div>
              {settings.maintenanceMode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage">유지보수 메시지</Label>
                  <Textarea
                    id="maintenanceMessage"
                    value={settings.maintenanceMessage}
                    onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})}
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 연락처 */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>연락처 정보</CardTitle>
              <CardDescription>고객에게 표시될 연락처 정보를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <div className="flex">
                    <Mail className="mr-2 h-4 w-4 mt-2.5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({...settings, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  <div className="flex">
                    <Phone className="mr-2 h-4 w-4 mt-2.5 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">주소</Label>
                <div className="flex">
                  <MapPin className="mr-2 h-4 w-4 mt-2.5 text-muted-foreground" />
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings({...settings, address: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessNumber">사업자등록번호</Label>
                <Input
                  id="businessNumber"
                  value={settings.businessNumber}
                  onChange={(e) => setSettings({...settings, businessNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>소셜 미디어</Label>
                <div className="space-y-2">
                  <div className="flex">
                    <Facebook className="mr-2 h-4 w-4 mt-2.5 text-muted-foreground" />
                    <Input
                      placeholder="Facebook URL"
                      value={settings.facebook}
                      onChange={(e) => setSettings({...settings, facebook: e.target.value})}
                    />
                  </div>
                  <div className="flex">
                    <Instagram className="mr-2 h-4 w-4 mt-2.5 text-muted-foreground" />
                    <Input
                      placeholder="Instagram URL"
                      value={settings.instagram}
                      onChange={(e) => setSettings({...settings, instagram: e.target.value})}
                    />
                  </div>
                  <div className="flex">
                    <Twitter className="mr-2 h-4 w-4 mt-2.5 text-muted-foreground" />
                    <Input
                      placeholder="Twitter URL"
                      value={settings.twitter}
                      onChange={(e) => setSettings({...settings, twitter: e.target.value})}
                    />
                  </div>
                  <div className="flex">
                    <Youtube className="mr-2 h-4 w-4 mt-2.5 text-muted-foreground" />
                    <Input
                      placeholder="YouTube URL"
                      value={settings.youtube}
                      onChange={(e) => setSettings({...settings, youtube: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 이메일 설정 */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>이메일 설정</CardTitle>
              <CardDescription>시스템 이메일 발송을 위한 SMTP 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP 호스트</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP 포트</Label>
                  <Input
                    id="smtpPort"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({...settings, smtpPort: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP 사용자</Label>
                  <Input
                    id="smtpUser"
                    value={settings.smtpUser}
                    onChange={(e) => setSettings({...settings, smtpUser: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP 비밀번호</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailFrom">발신자 정보</Label>
                <Input
                  id="emailFrom"
                  value={settings.emailFrom}
                  onChange={(e) => setSettings({...settings, emailFrom: e.target.value})}
                  placeholder="이름 <email@example.com>"
                />
              </div>
              <Button variant="outline" onClick={handleTestEmail}>
                테스트 이메일 발송
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 결제 설정 */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>결제 설정</CardTitle>
              <CardDescription>결제 수단과 PG사 연동을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>결제 수단</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="card"
                      checked={settings.paymentMethods.card}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        paymentMethods: {...settings.paymentMethods, card: checked}
                      })}
                    />
                    <Label htmlFor="card">신용/체크카드</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="bank"
                      checked={settings.paymentMethods.bank}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        paymentMethods: {...settings.paymentMethods, bank: checked}
                      })}
                    />
                    <Label htmlFor="bank">계좌이체</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="virtualAccount"
                      checked={settings.paymentMethods.virtualAccount}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        paymentMethods: {...settings.paymentMethods, virtualAccount: checked}
                      })}
                    />
                    <Label htmlFor="virtualAccount">가상계좌</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="kakao"
                      checked={settings.paymentMethods.kakao}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        paymentMethods: {...settings.paymentMethods, kakao: checked}
                      })}
                    />
                    <Label htmlFor="kakao">카카오페이</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="naver"
                      checked={settings.paymentMethods.naver}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        paymentMethods: {...settings.paymentMethods, naver: checked}
                      })}
                    />
                    <Label htmlFor="naver">네이버페이</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="toss"
                      checked={settings.paymentMethods.toss}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        paymentMethods: {...settings.paymentMethods, toss: checked}
                      })}
                    />
                    <Label htmlFor="toss">토스페이</Label>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="pgProvider">PG사</Label>
                  <select
                    id="pgProvider"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={settings.pgProvider}
                    onChange={(e) => setSettings({...settings, pgProvider: e.target.value})}
                  >
                    <option value="tosspayments">토스페이먼츠</option>
                    <option value="iamport">아임포트</option>
                    <option value="nicepay">나이스페이</option>
                    <option value="inicis">이니시스</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pgMerchantId">가맹점 ID</Label>
                  <Input
                    id="pgMerchantId"
                    value={settings.pgMerchantId}
                    onChange={(e) => setSettings({...settings, pgMerchantId: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pgApiKey">API 키</Label>
                  <Input
                    id="pgApiKey"
                    type="password"
                    value={settings.pgApiKey}
                    onChange={(e) => setSettings({...settings, pgApiKey: e.target.value})}
                  />
                </div>
              </div>
              <Button variant="outline" onClick={handleTestPayment}>
                결제 연동 테스트
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO 설정</CardTitle>
              <CardDescription>검색 엔진 최적화와 웹마스터 도구를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sitemap"
                    checked={settings.enableSitemap}
                    onCheckedChange={(checked) => setSettings({...settings, enableSitemap: checked})}
                  />
                  <Label htmlFor="sitemap">사이트맵 생성</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="robots"
                    checked={settings.enableRobots}
                    onCheckedChange={(checked) => setSettings({...settings, enableRobots: checked})}
                  />
                  <Label htmlFor="robots">robots.txt 사용</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleAnalytics">Google Analytics</Label>
                <Input
                  id="googleAnalytics"
                  value={settings.googleAnalytics}
                  onChange={(e) => setSettings({...settings, googleAnalytics: e.target.value})}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleSearchConsole">Google Search Console</Label>
                <Input
                  id="googleSearchConsole"
                  value={settings.googleSearchConsole}
                  onChange={(e) => setSettings({...settings, googleSearchConsole: e.target.value})}
                  placeholder="인증 코드"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="naverWebmaster">네이버 웹마스터도구</Label>
                <Input
                  id="naverWebmaster"
                  value={settings.naverWebmaster}
                  onChange={(e) => setSettings({...settings, naverWebmaster: e.target.value})}
                  placeholder="인증 코드"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 보안 */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>보안 설정</CardTitle>
              <CardDescription>사이트 보안과 관련된 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ssl"
                    checked={settings.enableSSL}
                    onCheckedChange={(checked) => setSettings({...settings, enableSSL: checked})}
                  />
                  <Label htmlFor="ssl">SSL 인증서 사용</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="captcha"
                    checked={settings.enableCaptcha}
                    onCheckedChange={(checked) => setSettings({...settings, enableCaptcha: checked})}
                  />
                  <Label htmlFor="captcha">CAPTCHA 사용</Label>
                </div>
              </div>
              {settings.enableCaptcha && (
                <div className="space-y-2">
                  <Label htmlFor="captchaKey">CAPTCHA 키</Label>
                  <Input
                    id="captchaKey"
                    type="password"
                    value={settings.captchaKey}
                    onChange={(e) => setSettings({...settings, captchaKey: e.target.value})}
                  />
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">최대 로그인 시도 횟수</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">세션 타임아웃 (분)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}