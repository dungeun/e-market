'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Save, 
  Upload, 
  Trash2, 
  FileText,
  Star,
  Calendar,
  Tag
} from 'lucide-react'
import { toast } from 'sonner'

export interface ProductTemplate {
  id: string
  name: string
  category: string
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  priceRange: {
    min: number
    max: number
  }
  description: string
  tags: string[]
  featured: boolean
  autoTranslate: boolean
  createdAt: string
  usageCount: number
}

interface ProductTemplateManagerProps {
  onTemplateLoad: (template: ProductTemplate) => void
  currentFormData?: any
}

const DEFAULT_TEMPLATES: ProductTemplate[] = [
  {
    id: 'template_electronics_phone',
    name: '스마트폰 템플릿',
    category: '전자기기',
    condition: 'GOOD',
    priceRange: { min: 100000, max: 1000000 },
    description: '상태 양호한 중고 스마트폰입니다. 정상 작동하며 사용감은 있으나 기능상 문제없습니다.',
    tags: ['스마트폰', '휴대폰', '전자기기'],
    featured: false,
    autoTranslate: true,
    createdAt: '2024-01-01T00:00:00Z',
    usageCount: 15
  },
  {
    id: 'template_furniture_desk',
    name: '가구 템플릿',
    category: '중고 가구',
    condition: 'GOOD',
    priceRange: { min: 50000, max: 500000 },
    description: '실용적인 중고 가구입니다. 일상 사용감은 있으나 구조적으로 견고하며 기능상 문제없습니다.',
    tags: ['가구', '인테리어', '생활용품'],
    featured: true,
    autoTranslate: true,
    createdAt: '2024-01-01T00:00:00Z',
    usageCount: 12
  },
  {
    id: 'template_appliance_tv',
    name: '가전제품 템플릿',
    category: '중고 가전제품',
    condition: 'EXCELLENT',
    priceRange: { min: 100000, max: 800000 },
    description: '깨끗한 중고 가전제품입니다. 정상 작동하며 외관상 흠집이 거의 없는 상태입니다.',
    tags: ['가전제품', 'TV', '전자제품'],
    featured: false,
    autoTranslate: true,
    createdAt: '2024-01-01T00:00:00Z',
    usageCount: 18
  },
  {
    id: 'template_kitchen_items',
    name: '주방용품 템플릿',
    category: '주방용품',
    condition: 'GOOD',
    priceRange: { min: 10000, max: 150000 },
    description: '청결하게 관리된 중고 주방용품입니다. 기능상 문제없이 사용 가능합니다.',
    tags: ['주방용품', '조리도구', '식기'],
    featured: false,
    autoTranslate: true,
    createdAt: '2024-01-01T00:00:00Z',
    usageCount: 9
  }
]

export default function ProductTemplateManager({ 
  onTemplateLoad, 
  currentFormData 
}: ProductTemplateManagerProps) {
  const [templates, setTemplates] = useState<ProductTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ProductTemplate | null>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [loading, setLoading] = useState(false)

  // 템플릿 로드
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = () => {
    try {
      const savedTemplates = localStorage.getItem('productTemplates')
      const userTemplates = savedTemplates ? JSON.parse(savedTemplates) : []
      setTemplates([...DEFAULT_TEMPLATES, ...userTemplates])
    } catch (error) {
      console.error('템플릿 로드 오류:', error)
      setTemplates(DEFAULT_TEMPLATES)
    }
  }

  const saveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('템플릿 이름을 입력하세요.')
      return
    }

    if (!currentFormData) {
      toast.error('저장할 데이터가 없습니다.')
      return
    }

    try {
      const newTemplate: ProductTemplate = {
        id: `template_user_${Date.now()}`,
        name: templateName,
        category: currentFormData.category || '',
        condition: currentFormData.condition || 'GOOD',
        priceRange: {
          min: currentFormData.price ? Math.floor(parseFloat(currentFormData.price) * 0.8) : 0,
          max: currentFormData.price ? Math.ceil(parseFloat(currentFormData.price) * 1.2) : 0
        },
        description: currentFormData.description || '',
        tags: currentFormData.category ? [currentFormData.category] : [],
        featured: currentFormData.featured || false,
        autoTranslate: currentFormData.autoTranslate || true,
        createdAt: new Date().toISOString(),
        usageCount: 0
      }

      // 기존 사용자 템플릿만 가져오기
      const savedTemplates = localStorage.getItem('productTemplates')
      const userTemplates = savedTemplates ? JSON.parse(savedTemplates) : []
      
      // 새 템플릿 추가
      const updatedTemplates = [...userTemplates, newTemplate]
      localStorage.setItem('productTemplates', JSON.stringify(updatedTemplates))
      
      // 상태 업데이트
      setTemplates([...DEFAULT_TEMPLATES, ...updatedTemplates])
      setSaveDialogOpen(false)
      setTemplateName('')
      
      toast.success(`"${templateName}" 템플릿이 저장되었습니다.`)
    } catch (error) {
      console.error('템플릿 저장 오류:', error)
      toast.error('템플릿 저장에 실패했습니다.')
    }
  }

  const loadTemplate = (template: ProductTemplate) => {
    try {
      // 사용 횟수 증가 (사용자 템플릿인 경우만)
      if (template.id.startsWith('template_user_')) {
        const savedTemplates = localStorage.getItem('productTemplates')
        if (savedTemplates) {
          const userTemplates = JSON.parse(savedTemplates)
          const templateIndex = userTemplates.findIndex((t: ProductTemplate) => t.id === template.id)
          if (templateIndex !== -1) {
            userTemplates[templateIndex].usageCount += 1
            localStorage.setItem('productTemplates', JSON.stringify(userTemplates))
            loadTemplates() // 상태 새로고침
          }
        }
      }

      setSelectedTemplate(template)
      onTemplateLoad(template)
      toast.success(`"${template.name}" 템플릿이 적용되었습니다.`)
    } catch (error) {
      console.error('템플릿 로드 오류:', error)
      toast.error('템플릿 로드에 실패했습니다.')
    }
  }

  const deleteTemplate = (templateId: string) => {
    if (!templateId.startsWith('template_user_')) {
      toast.error('기본 템플릿은 삭제할 수 없습니다.')
      return
    }

    try {
      const savedTemplates = localStorage.getItem('productTemplates')
      if (savedTemplates) {
        const userTemplates = JSON.parse(savedTemplates)
        const updatedTemplates = userTemplates.filter((t: ProductTemplate) => t.id !== templateId)
        localStorage.setItem('productTemplates', JSON.stringify(updatedTemplates))
        setTemplates([...DEFAULT_TEMPLATES, ...updatedTemplates])
        toast.success('템플릿이 삭제되었습니다.')
      }
    } catch (error) {
      console.error('템플릿 삭제 오류:', error)
      toast.error('템플릿 삭제에 실패했습니다.')
    }
  }

  const getConditionBadge = (condition: string) => {
    const conditionMap = {
      'EXCELLENT': { label: '최상', color: 'bg-green-100 text-green-800' },
      'GOOD': { label: '양호', color: 'bg-blue-100 text-blue-800' },
      'FAIR': { label: '보통', color: 'bg-yellow-100 text-yellow-800' },
      'POOR': { label: '하급', color: 'bg-red-100 text-red-800' }
    }
    const conditionInfo = conditionMap[condition as keyof typeof conditionMap] || conditionMap.GOOD
    return <Badge className={conditionInfo.color}>{conditionInfo.label}</Badge>
  }

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>상품 등록 템플릿</CardTitle>
          </div>
          
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="mr-2 h-4 w-4" />
                템플릿 저장
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 템플릿 저장</DialogTitle>
                <DialogDescription>
                  현재 입력한 정보를 템플릿으로 저장합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">템플릿 이름</Label>
                  <Input
                    id="templateName"
                    placeholder="예: 내 스마트폰 템플릿"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={saveTemplate}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* 템플릿 선택 */}
          <div className="space-y-2">
            <Label>템플릿 선택</Label>
            <Select onValueChange={(value) => {
              const template = templates.find(t => t.id === value)
              if (template) loadTemplate(template)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="사용할 템플릿을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      {template.featured && <Star className="h-3 w-3 text-yellow-500" />}
                      <span>{template.name}</span>
                      {template.usageCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {template.usageCount}회 사용
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 선택된 템플릿 미리보기 */}
          {selectedTemplate && (
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium flex items-center gap-2">
                      {selectedTemplate.featured && <Star className="h-4 w-4 text-yellow-500" />}
                      {selectedTemplate.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      {selectedTemplate.category}
                      {getConditionBadge(selectedTemplate.condition)}
                    </div>
                  </div>
                  
                  {selectedTemplate.id.startsWith('template_user_') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplate(selectedTemplate.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="text-sm">
                  <p className="font-medium">가격 범위:</p>
                  <p className="text-muted-foreground">
                    {formatPrice(selectedTemplate.priceRange.min)} ~ {formatPrice(selectedTemplate.priceRange.max)}
                  </p>
                </div>

                <div className="text-sm">
                  <p className="font-medium">설명:</p>
                  <p className="text-muted-foreground line-clamp-2">
                    {selectedTemplate.description}
                  </p>
                </div>

                {selectedTemplate.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    생성: {new Date(selectedTemplate.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                  {selectedTemplate.usageCount > 0 && (
                    <span>{selectedTemplate.usageCount}회 사용됨</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 빠른 액션 */}
          <div className="flex flex-wrap gap-2">
            {DEFAULT_TEMPLATES.slice(0, 3).map((template) => (
              <Button
                key={template.id}
                variant="outline"
                size="sm"
                onClick={() => loadTemplate(template)}
                className="text-xs"
              >
                <Upload className="mr-1 h-3 w-3" />
                {template.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}