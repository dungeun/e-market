'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Save, RotateCcw, Eye } from 'lucide-react'

// Import existing UI config components
import { HeaderConfigTab } from '@/components/admin/ui-config/HeaderConfigTab'
import { FooterConfigTab } from '@/components/admin/ui-config/FooterConfigTab'
import { SectionsConfigTab } from '@/components/admin/ui-config/SectionsConfigTab'
import { SectionOrderTab } from '@/components/admin/ui-config/SectionOrderTab'

export default function UIConfigPage() {
  const [activeTab, setActiveTab] = useState('header')
  const [hasChanges, setHasChanges] = useState(false)

  const handleSave = () => {
    toast.success('UI 설정이 저장되었습니다.')
    setHasChanges(false)
  }

  const handleReset = () => {
    toast.info('설정이 초기화되었습니다.')
    setHasChanges(false)
  }

  const handlePreview = () => {
    window.open('/', '_blank')
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">UI 섹션 설정</h2>
          <p className="text-muted-foreground">웹사이트의 UI 요소들을 관리하고 커스터마이징합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            초기화
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            미리보기
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            저장
          </Button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <Card>
        <CardHeader>
          <CardTitle>UI 구성 요소</CardTitle>
          <CardDescription>각 섹션을 선택하여 세부 설정을 수정할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="header">헤더</TabsTrigger>
              <TabsTrigger value="sections">섹션</TabsTrigger>
              <TabsTrigger value="order">섹션 순서</TabsTrigger>
              <TabsTrigger value="footer">푸터</TabsTrigger>
            </TabsList>
            
            <TabsContent value="header" className="mt-6">
              <HeaderConfigTab onConfigChange={() => setHasChanges(true)} />
            </TabsContent>
            
            <TabsContent value="sections" className="mt-6">
              <SectionsConfigTab onConfigChange={() => setHasChanges(true)} />
            </TabsContent>
            
            <TabsContent value="order" className="mt-6">
              <SectionOrderTab onConfigChange={() => setHasChanges(true)} />
            </TabsContent>
            
            <TabsContent value="footer" className="mt-6">
              <FooterConfigTab onConfigChange={() => setHasChanges(true)} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}