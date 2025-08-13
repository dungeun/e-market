'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Save, RotateCcw, Eye } from 'lucide-react'
import { SectionsConfigTab } from '@/components/admin/ui-config/SectionsConfigTab'
import { useLanguage } from '@/hooks/useLanguage'

// 임시 컴포넌트 - 추후 구현
const HeaderConfigDB = () => (
  <div className="text-center py-12 text-gray-500">
    헤더 설정 기능은 준비 중입니다.
  </div>
)

const FooterConfigDB = () => (
  <div className="text-center py-12 text-gray-500">
    푸터 설정 기능은 준비 중입니다.
  </div>
)

const SectionOrderTab = () => (
  <div className="text-center py-12 text-gray-500">
    섹션 순서 관리 기능은 준비 중입니다.
  </div>
)

export default function UIConfigPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  
  // URL 파라미터에서 탭 읽기
  const tabParam = searchParams.get('tab')
  const initialTab = (tabParam as 'header' | 'footer' | 'sections' | 'section-order') || 'sections'
  const [activeTab, setActiveTab] = useState<'header' | 'footer' | 'sections' | 'section-order'>(initialTab)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // URL 파라미터 변경 시 탭 업데이트
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['header', 'footer', 'sections', 'section-order'].includes(tab)) {
      setActiveTab(tab as any)
    }
  }, [searchParams])

  const handleTabChange = (tab: 'header' | 'footer' | 'sections' | 'section-order') => {
    setActiveTab(tab)
    router.push(`/admin/ui-config?tab=${tab}`)
  }

  const handleReset = async () => {
    if (!confirm('정말로 모든 섹션을 초기 상태로 리셋하시겠습니까?')) return
    
    try {
      const response = await fetch('/api/ui-sections/reset', {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('설정이 초기화되었습니다.')
        window.location.reload()
      } else {
        toast.error('초기화에 실패했습니다.')
      }
    } catch (error) {
      toast.error('초기화에 실패했습니다.')
    }
  }

  const handlePreview = () => {
    window.open('/', '_blank')
  }

  return (
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t('admin.ui.title', 'UI 설정 관리')}</h2>
            <p className="text-muted-foreground">{t('admin.ui.description', '헤더, 푸터 및 홈페이지 섹션을 관리합니다.')}</p>
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
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="header">{t('admin.ui.tab.header', '헤더 설정')}</TabsTrigger>
                <TabsTrigger value="footer">{t('admin.ui.tab.footer', '푸터 설정')}</TabsTrigger>
                <TabsTrigger value="sections">{t('admin.ui.tab.sections', '섹션 관리')}</TabsTrigger>
                <TabsTrigger value="section-order">{t('admin.ui.tab.sectionOrder', '섹션 순서')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="header" className="mt-6">
                <HeaderConfigDB />
              </TabsContent>
              
              <TabsContent value="footer" className="mt-6">
                <FooterConfigDB />
              </TabsContent>
              
              <TabsContent value="sections" className="mt-6">
                <SectionsConfigTab />
              </TabsContent>
              
              <TabsContent value="section-order" className="mt-6">
                <SectionOrderTab />
              </TabsContent>
            </Tabs>
            
            {/* DB 연동 안내 */}
            {activeTab === 'sections' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  ✅ {t('admin.ui.dbConnected', '섹션 관리가 데이터베이스와 연동되었습니다. 실시간으로 변경사항이 저장됩니다.')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}