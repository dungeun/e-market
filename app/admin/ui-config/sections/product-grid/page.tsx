'use client';

import React, { useState, useEffect } from 'react';
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

export default function ProductGridConfigPage() {
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

  // 섹션 데이터 가져오기
  useEffect(() => {
    if (sectionId) {
      fetchSection(sectionId);
    } else {
      setLoading(false);
    }
  }, [sectionId]);

  const fetchSection = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/ui-sections`);
      const data = await response.json();
      
      if (data.success && data.sections) {
        const targetSection = data.sections.find((s: any) => s.id === id || s.key === id);
        
        if (targetSection) {
          setSection(targetSection);
          setFormData({
            title: targetSection.title || '',
            subtitle: targetSection.data?.subtitle || '',
            sortBy: targetSection.data?.sortBy || 'newest',
            itemsPerPage: targetSection.data?.itemsPerPage || 12,
            categories: targetSection.data?.categories || [],
            showFilters: targetSection.data?.showFilters !== false,
            showSearch: targetSection.data?.showSearch !== false,
            isActive: targetSection.isActive !== false
          });
        } else {
          toast.error('섹션을 찾을 수 없습니다.');
          router.push('/admin/ui-config?tab=sections');
        }
      }
    } catch (error) {
      console.error('Error fetching section:', error);
      toast.error('섹션 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!section) {
      toast.error('섹션 정보가 없습니다.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/ui-sections`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: section.id,
          title: formData.title,
          content: {
            subtitle: formData.subtitle,
            sortBy: formData.sortBy,
            itemsPerPage: formData.itemsPerPage,
            categories: formData.categories,
            showFilters: formData.showFilters,
            showSearch: formData.showSearch
          },
          visible: formData.isActive,
          autoTranslate: true
        })
      });

      if (response.ok) {
        toast.success('섹션이 성공적으로 저장되었습니다.');
        router.push('/admin/ui-config?tab=sections');
      } else {
        throw new Error('Failed to save section');
      }
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('섹션 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/ui-config?tab=sections')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            섹션 목록
          </Button>
          <div>
            <h1 className="text-2xl font-bold">상품 그리드 섹션 설정</h1>
            <p className="text-gray-600">{section?.key || 'product-grid'} 섹션을 설정합니다.</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>

      {/* 설정 폼 */}
      <div className="grid gap-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>섹션의 기본 정보를 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="섹션 제목을 입력하세요"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="subtitle">부제목</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="섹션 부제목을 입력하세요 (선택사항)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">섹션 활성화</Label>
            </div>
          </CardContent>
        </Card>

        {/* 상품 표시 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>상품 표시 설정</CardTitle>
            <CardDescription>상품을 어떻게 표시할지 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="sortBy">정렬 방식</Label>
              <Select
                value={formData.sortBy}
                onValueChange={(value) => setFormData(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="oldest">오래된순</SelectItem>
                  <SelectItem value="price-low">낮은 가격순</SelectItem>
                  <SelectItem value="price-high">높은 가격순</SelectItem>
                  <SelectItem value="popular">인기순</SelectItem>
                  <SelectItem value="rating">평점순</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="itemsPerPage">페이지당 상품 수</Label>
              <Select
                value={formData.itemsPerPage.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, itemsPerPage: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8개</SelectItem>
                  <SelectItem value="12">12개</SelectItem>
                  <SelectItem value="16">16개</SelectItem>
                  <SelectItem value="20">20개</SelectItem>
                  <SelectItem value="24">24개</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 필터 및 검색 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>필터 및 검색</CardTitle>
            <CardDescription>사용자가 사용할 수 있는 기능을 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="showFilters"
                checked={formData.showFilters}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showFilters: checked }))}
              />
              <Label htmlFor="showFilters">카테고리 필터 표시</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showSearch"
                checked={formData.showSearch}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showSearch: checked }))}
              />
              <Label htmlFor="showSearch">검색 기능 표시</Label>
            </div>
          </CardContent>
        </Card>

        {/* 미리보기 */}
        <Card>
          <CardHeader>
            <CardTitle>미리보기</CardTitle>
            <CardDescription>현재 설정으로 어떻게 표시되는지 미리보기입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="text-center space-y-2 mb-4">
                <h3 className="text-xl font-semibold">{formData.title || '섹션 제목'}</h3>
                {formData.subtitle && (
                  <p className="text-gray-600">{formData.subtitle}</p>
                )}
              </div>
              
              {formData.showSearch && (
                <div className="mb-4">
                  <Input placeholder="상품 검색..." className="max-w-sm mx-auto" disabled />
                </div>
              )}
              
              {formData.showFilters && (
                <div className="mb-4 flex justify-center">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" disabled>전체</Button>
                    <Button variant="outline" size="sm" disabled>전자제품</Button>
                    <Button variant="outline" size="sm" disabled>의류</Button>
                    <Button variant="outline" size="sm" disabled>가구</Button>
                  </div>
                </div>
              )}
              
              <div className={`grid gap-4 ${
                formData.itemsPerPage <= 8 ? 'grid-cols-4' : 
                formData.itemsPerPage <= 12 ? 'grid-cols-6' : 
                'grid-cols-8'
              }`}>
                {Array.from({ length: Math.min(formData.itemsPerPage, 12) }).map((_, i) => (
                  <div key={i} className="bg-white p-3 rounded border text-center">
                    <div className="w-full h-20 bg-gray-200 rounded mb-2"></div>
                    <p className="text-xs font-medium">상품 {i + 1}</p>
                    <p className="text-xs text-gray-500">₩{(10000 + i * 1000).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  정렬: {
                    formData.sortBy === 'newest' ? '최신순' :
                    formData.sortBy === 'oldest' ? '오래된순' :
                    formData.sortBy === 'price-low' ? '낮은 가격순' :
                    formData.sortBy === 'price-high' ? '높은 가격순' :
                    formData.sortBy === 'popular' ? '인기순' : '평점순'
                  } | {formData.itemsPerPage}개씩 표시
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}