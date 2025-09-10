'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface ProductGridSection {
  id: string;
  key: string;
  type: string;
  title: string;
  order: number;
  isActive: boolean;
  data: {
    subtitle?: string;
    sortBy?: string;
    itemsPerPage?: number;
    categories?: string[];
    showFilters?: boolean;
    showSearch?: boolean;
  };
}

function ProductGridConfigContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionId = searchParams.get('id');
  
  const [section, setSection] = useState<ProductGridSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    sortBy: 'newest',
    itemsPerPage: 12,
    categories: [] as string[],
    showFilters: true,
    showSearch: true,
    isActive: true
  });

  useEffect(() => {
    if (sectionId) {
      fetchSection();
    }
  }, [sectionId]);

  const fetchSection = async () => {
    try {
      const response = await fetch(`/api/admin/ui-config/sections/${sectionId}`);
      if (response.ok) {
        const data = await response.json();
        setSection(data);
        setFormData({
          title: data.title || '',
          subtitle: data.data?.subtitle || '',
          sortBy: data.data?.sortBy || 'newest',
          itemsPerPage: data.data?.itemsPerPage || 12,
          categories: data.data?.categories || [],
          showFilters: data.data?.showFilters ?? true,
          showSearch: data.data?.showSearch ?? true,
          isActive: data.isActive ?? true
        });
      }
    } catch (error) {
      console.error('Failed to fetch section:', error);
      toast.error('섹션 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/ui-config/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          visible: formData.isActive,
          subtitle: formData.subtitle,
          sortBy: formData.sortBy,
          itemsPerPage: formData.itemsPerPage,
          productCount: formData.itemsPerPage,
          categories: formData.categories,
          categoryFilter: formData.categories?.[0] || '',
          showFilters: formData.showFilters,
          showSearch: formData.showSearch
        }),
      });

      if (response.ok) {
        toast.success('섹션이 업데이트되었습니다.');
        router.push('/admin/ui-config?tab=sections');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Failed to save section:', error);
      toast.error('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/ui-config?tab=sections')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>
        
        <h1 className="text-3xl font-bold">상품 그리드 섹션 설정</h1>
        <p className="text-gray-500">상품 목록을 표시하는 섹션을 구성합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기본 설정</CardTitle>
          <CardDescription>섹션의 기본 정보를 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="베스트셀러"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subtitle">부제목</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="가장 인기 있는 상품들"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>섹션 활성화</Label>
              <p className="text-sm text-muted-foreground">
                이 섹션을 홈페이지에 표시합니다
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>표시 옵션</CardTitle>
          <CardDescription>상품 목록 표시 방식을 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sortBy">정렬 방식</Label>
              <Select
                value={formData.sortBy}
                onValueChange={(value) => setFormData({ ...formData, sortBy: value })}
              >
                <SelectTrigger id="sortBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="popular">인기순</SelectItem>
                  <SelectItem value="price-low">낮은 가격순</SelectItem>
                  <SelectItem value="price-high">높은 가격순</SelectItem>
                  <SelectItem value="rating">평점순</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itemsPerPage">페이지당 상품 수</Label>
              <Input
                id="itemsPerPage"
                type="number"
                min="4"
                max="24"
                value={formData.itemsPerPage}
                onChange={(e) => setFormData({ ...formData, itemsPerPage: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>필터 표시</Label>
                <p className="text-sm text-muted-foreground">
                  카테고리 및 가격 필터를 표시합니다
                </p>
              </div>
              <Switch
                checked={formData.showFilters}
                onCheckedChange={(checked) => setFormData({ ...formData, showFilters: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>검색창 표시</Label>
                <p className="text-sm text-muted-foreground">
                  상품 검색 기능을 제공합니다
                </p>
              </div>
              <Switch
                checked={formData.showSearch}
                onCheckedChange={(checked) => setFormData({ ...formData, showSearch: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>미리보기</CardTitle>
          <CardDescription>실제 화면에서 어떻게 표시되는지 확인합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-2">{formData.title || '제목 없음'}</h2>
            {formData.subtitle && (
              <p className="text-gray-600 mb-4">{formData.subtitle}</p>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4">
                  <div className="bg-gray-200 h-40 rounded mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-6 gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/ui-config?tab=sections')}
        >
          취소
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  );
}

export default function ProductGridConfigPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
      <ProductGridConfigContent />
    </Suspense>
  );
}