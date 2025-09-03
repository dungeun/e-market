'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUIConfigStore } from '@/lib/stores/ui-config.store';
import { HeaderConfigDB } from '@/components/admin/ui-config/HeaderConfigDB';
import { FooterConfigDB } from '@/components/admin/ui-config/FooterConfigDB';
import { SectionsConfigTab } from '@/components/admin/ui-config/SectionsConfigTab';
import { SectionManagerTab } from '@/components/admin/ui-config/SectionManagerTab';
import { CategoryConfigTab } from '@/components/admin/ui-config/CategoryConfigTab';
import { useLanguage } from '@/hooks/useLanguage';
import { Settings, Layout, List, Move, Tag } from 'lucide-react';
import { toast } from 'sonner';

function UIConfigContent() {
  const { config, resetToDefault } = useUIConfigStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  // URL 파라미터에서 탭 읽기
  const tabParam = searchParams.get('tab');
  const initialTab = (tabParam as 'header' | 'footer' | 'sections' | 'categories') || 'header';
  const [activeTab, setActiveTab] = useState<'header' | 'footer' | 'sections' | 'categories'>(initialTab);

  // URL 파라미터 변경 시 탭 업데이트
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['header', 'footer', 'sections', 'categories'].includes(tab)) {
      setActiveTab(tab as unknown);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as unknown);
    router.push(`/admin/ui-config?tab=${value}`);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">UI 설정</h2>
          <p className="text-muted-foreground">웹사이트의 헤더, 푸터 및 홈페이지 섹션을 관리합니다.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => toast.info('설정이 자동으로 저장됩니다.')}
        >
          <Settings className="mr-2 h-4 w-4" />
          설정
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">헤더 메뉴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">활성 메뉴 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">푸터 섹션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">활성 섹션 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">홈 섹션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">활성 섹션 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">카테고리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">등록된 카테고리</p>
          </CardContent>
        </Card>
      </div>

      {/* 탭 콘텐츠 */}
      <Card>
        <CardHeader>
          <CardTitle>UI 구성 요소 관리</CardTitle>
          <CardDescription>
            웹사이트의 각 구성 요소를 설정하고 관리할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="header">
                <Layout className="mr-2 h-4 w-4" />
                헤더
              </TabsTrigger>
              <TabsTrigger value="footer">
                <Layout className="mr-2 h-4 w-4" />
                푸터
              </TabsTrigger>
              <TabsTrigger value="sections">
                <List className="mr-2 h-4 w-4" />
                섹션 관리
              </TabsTrigger>
              <TabsTrigger value="categories">
                <Tag className="mr-2 h-4 w-4" />
                카테고리
              </TabsTrigger>
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
            <TabsContent value="categories" className="mt-6">
              <CategoryConfigTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* DB 연동 안내 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              실시간 동기화
            </Badge>
            <p className="text-sm text-muted-foreground">
              모든 변경사항이 데이터베이스에 실시간으로 저장되며, 자동 번역 기능이 활성화되어 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UIConfigPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UIConfigContent />
    </Suspense>
  );
}