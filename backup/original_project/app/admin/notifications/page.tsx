'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Bell, 
  Mail, 
  Smartphone,
  MessageSquare,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Save,
  TestTube,
  Volume2,
  VolumeX
} from 'lucide-react'
import { toast } from 'sonner'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState({
    email: {
      enabled: true,
      newOrder: true,
      orderStatusChange: true,
      paymentReceived: true,
      lowStock: true,
      newCustomer: true,
      newReview: true,
      returnRequest: true,
      dailyReport: true,
      weeklyReport: false,
      monthlyReport: true
    },
    sms: {
      enabled: false,
      newOrder: true,
      orderStatusChange: false,
      paymentFailed: true,
      criticalStock: true,
      urgentReturn: true
    },
    push: {
      enabled: true,
      newOrder: true,
      orderStatusChange: true,
      paymentReceived: true,
      lowStock: true,
      newMessage: true,
      systemUpdate: true
    },
    slack: {
      enabled: true,
      webhookUrl: 'https://hooks.slack.com/services/...',
      channel: '#commerce-alerts',
      newOrder: true,
      paymentIssue: true,
      criticalError: true,
      dailySummary: true
    },
    preferences: {
      quietHours: true,
      quietStart: '22:00',
      quietEnd: '08:00',
      timezone: 'Asia/Seoul',
      language: 'ko',
      frequency: 'realtime',
      bundleEmails: false,
      digestTime: '09:00'
    }
  })

  const [testMode, setTestMode] = useState(false)

  const handleSave = (section: string) => {
    toast.success(`${section} 알림 설정이 저장되었습니다.`)
  }

  const handleTest = (type: string) => {
    toast.info(`${type} 테스트 알림을 발송했습니다.`)
  }

  const toggleAll = (category: string, enabled: boolean) => {
    setNotifications({
      ...notifications,
      [category]: {
        ...notifications[category as keyof typeof notifications],
        enabled
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">알림 설정</h2>
          <p className="text-muted-foreground">알림 채널과 수신 설정을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="testMode">테스트 모드</Label>
          <Switch 
            id="testMode"
            checked={testMode}
            onCheckedChange={setTestMode}
          />
        </div>
      </div>

      {/* 알림 채널 상태 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              이메일
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge className={notifications.email.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {notifications.email.enabled ? '활성' : '비활성'}
              </Badge>
              <Switch 
                checked={notifications.email.enabled}
                onCheckedChange={(checked) => toggleAll('email', checked)}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              SMS
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge className={notifications.sms.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {notifications.sms.enabled ? '활성' : '비활성'}
              </Badge>
              <Switch 
                checked={notifications.sms.enabled}
                onCheckedChange={(checked) => toggleAll('sms', checked)}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              푸시 알림
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge className={notifications.push.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {notifications.push.enabled ? '활성' : '비활성'}
              </Badge>
              <Switch 
                checked={notifications.push.enabled}
                onCheckedChange={(checked) => toggleAll('push', checked)}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Slack
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge className={notifications.slack.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {notifications.slack.enabled ? '활성' : '비활성'}
              </Badge>
              <Switch 
                checked={notifications.slack.enabled}
                onCheckedChange={(checked) => toggleAll('slack', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="email">이메일</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="push">푸시</TabsTrigger>
          <TabsTrigger value="slack">Slack</TabsTrigger>
          <TabsTrigger value="preferences">환경설정</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                이메일 알림
              </CardTitle>
              <CardDescription>이메일로 받을 알림을 선택하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">주문 관련</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-newOrder">새 주문</Label>
                    </div>
                    <Switch 
                      id="email-newOrder"
                      checked={notifications.email.newOrder}
                      disabled={!notifications.email.enabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-orderStatusChange">주문 상태 변경</Label>
                    </div>
                    <Switch 
                      id="email-orderStatusChange"
                      checked={notifications.email.orderStatusChange}
                      disabled={!notifications.email.enabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-paymentReceived">결제 완료</Label>
                    </div>
                    <Switch 
                      id="email-paymentReceived"
                      checked={notifications.email.paymentReceived}
                      disabled={!notifications.email.enabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-returnRequest">반품 요청</Label>
                    </div>
                    <Switch 
                      id="email-returnRequest"
                      checked={notifications.email.returnRequest}
                      disabled={!notifications.email.enabled}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">재고 및 고객</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-lowStock">재고 부족</Label>
                    </div>
                    <Switch 
                      id="email-lowStock"
                      checked={notifications.email.lowStock}
                      disabled={!notifications.email.enabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-newCustomer">신규 고객</Label>
                    </div>
                    <Switch 
                      id="email-newCustomer"
                      checked={notifications.email.newCustomer}
                      disabled={!notifications.email.enabled}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">리포트</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-dailyReport">일일 리포트</Label>
                    <Switch 
                      id="email-dailyReport"
                      checked={notifications.email.dailyReport}
                      disabled={!notifications.email.enabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-weeklyReport">주간 리포트</Label>
                    <Switch 
                      id="email-weeklyReport"
                      checked={notifications.email.weeklyReport}
                      disabled={!notifications.email.enabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-monthlyReport">월간 리포트</Label>
                    <Switch 
                      id="email-monthlyReport"
                      checked={notifications.email.monthlyReport}
                      disabled={!notifications.email.enabled}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {testMode && (
                  <Button variant="outline" onClick={() => handleTest('이메일')}>
                    <TestTube className="mr-2 h-4 w-4" />
                    테스트 발송
                  </Button>
                )}
                <Button onClick={() => handleSave('이메일')}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                SMS 알림
              </CardTitle>
              <CardDescription>중요한 알림을 SMS로 받습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="sms-newOrder">새 주문</Label>
                  </div>
                  <Switch 
                    id="sms-newOrder"
                    checked={notifications.sms.newOrder}
                    disabled={!notifications.sms.enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="sms-paymentFailed">결제 실패</Label>
                  </div>
                  <Switch 
                    id="sms-paymentFailed"
                    checked={notifications.sms.paymentFailed}
                    disabled={!notifications.sms.enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="sms-criticalStock">재고 긴급</Label>
                  </div>
                  <Switch 
                    id="sms-criticalStock"
                    checked={notifications.sms.criticalStock}
                    disabled={!notifications.sms.enabled}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {testMode && (
                  <Button variant="outline" onClick={() => handleTest('SMS')}>
                    <TestTube className="mr-2 h-4 w-4" />
                    테스트 발송
                  </Button>
                )}
                <Button onClick={() => handleSave('SMS')}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="push">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                푸시 알림
              </CardTitle>
              <CardDescription>브라우저 푸시 알림을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="push-newOrder">새 주문</Label>
                  </div>
                  <Switch 
                    id="push-newOrder"
                    checked={notifications.push.newOrder}
                    disabled={!notifications.push.enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="push-lowStock">재고 부족</Label>
                  </div>
                  <Switch 
                    id="push-lowStock"
                    checked={notifications.push.lowStock}
                    disabled={!notifications.push.enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="push-newMessage">새 메시지</Label>
                  </div>
                  <Switch 
                    id="push-newMessage"
                    checked={notifications.push.newMessage}
                    disabled={!notifications.push.enabled}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {testMode && (
                  <Button variant="outline" onClick={() => handleTest('푸시')}>
                    <TestTube className="mr-2 h-4 w-4" />
                    테스트 발송
                  </Button>
                )}
                <Button onClick={() => handleSave('푸시')}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slack">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Slack 연동
              </CardTitle>
              <CardDescription>Slack 채널로 알림을 받습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slackWebhook">Webhook URL</Label>
                  <input
                    id="slackWebhook"
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={notifications.slack.webhookUrl}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slackChannel">채널</Label>
                  <input
                    id="slackChannel"
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={notifications.slack.channel}
                    placeholder="#commerce-alerts"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">알림 유형</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slack-newOrder">새 주문</Label>
                    <Switch 
                      id="slack-newOrder"
                      checked={notifications.slack.newOrder}
                      disabled={!notifications.slack.enabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slack-paymentIssue">결제 문제</Label>
                    <Switch 
                      id="slack-paymentIssue"
                      checked={notifications.slack.paymentIssue}
                      disabled={!notifications.slack.enabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slack-criticalError">시스템 오류</Label>
                    <Switch 
                      id="slack-criticalError"
                      checked={notifications.slack.criticalError}
                      disabled={!notifications.slack.enabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slack-dailySummary">일일 요약</Label>
                    <Switch 
                      id="slack-dailySummary"
                      checked={notifications.slack.dailySummary}
                      disabled={!notifications.slack.enabled}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {testMode && (
                  <Button variant="outline" onClick={() => handleTest('Slack')}>
                    <TestTube className="mr-2 h-4 w-4" />
                    테스트 발송
                  </Button>
                )}
                <Button onClick={() => handleSave('Slack')}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                알림 환경설정
              </CardTitle>
              <CardDescription>알림 수신 방법과 시간을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="quietHours">방해 금지 시간</Label>
                    <p className="text-sm text-muted-foreground">설정한 시간에는 알림을 받지 않습니다</p>
                  </div>
                  <Switch 
                    id="quietHours"
                    checked={notifications.preferences.quietHours}
                  />
                </div>
                {notifications.preferences.quietHours && (
                  <div className="grid gap-4 md:grid-cols-2 pl-4">
                    <div className="space-y-2">
                      <Label htmlFor="quietStart">시작 시간</Label>
                      <input
                        id="quietStart"
                        type="time"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={notifications.preferences.quietStart}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quietEnd">종료 시간</Label>
                      <input
                        id="quietEnd"
                        type="time"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={notifications.preferences.quietEnd}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="frequency">알림 빈도</Label>
                  <Select value={notifications.preferences.frequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">실시간</SelectItem>
                      <SelectItem value="hourly">시간별</SelectItem>
                      <SelectItem value="daily">일별 요약</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">언어</Label>
                  <Select value={notifications.preferences.language}>
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
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="bundleEmails">이메일 묶음 발송</Label>
                  <p className="text-sm text-muted-foreground">여러 알림을 하나의 이메일로 받습니다</p>
                </div>
                <Switch 
                  id="bundleEmails"
                  checked={notifications.preferences.bundleEmails}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={() => handleSave('환경설정')}>
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