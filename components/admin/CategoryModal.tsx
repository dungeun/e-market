'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: any
  parentCategories?: any[]
  onSave: (category: any) => void
  mode: 'create' | 'edit'
}

export default function CategoryModal({
  isOpen,
  onClose,
  category,
  parentCategories = [],
  onSave,
  mode
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    icon: '',
    color: '#000000'
  })

  useEffect(() => {
    if (category && mode === 'edit') {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parentId: category.parentId || '',
        icon: category.icon || '',
        color: category.color || '#000000'
      })
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentId: '',
        icon: '',
        color: '#000000'
      })
    }
  }, [category, mode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.slug) {
      toast.error('카테고리명과 슬러그는 필수입니다.')
      return
    }

    onSave({
      ...category,
      ...formData
    })
  }

  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    setFormData(prev => ({ ...prev, slug }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? '카테고리 추가' : '카테고리 수정'}
            </DialogTitle>
            <DialogDescription>
              카테고리 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* 상위 카테고리 선택 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent" className="text-right">
                상위 카테고리
              </Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, parentId: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="없음 (대분류)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">없음 (대분류)</SelectItem>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 카테고리명 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                카테고리명 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                  if (mode === 'create') {
                    generateSlug(e.target.value)
                  }
                }}
                className="col-span-3"
                placeholder="예: 생활필수 가전"
                required
              />
            </div>

            {/* 슬러그 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                슬러그 *
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, slug: e.target.value }))
                }
                className="col-span-3"
                placeholder="예: appliances"
                required
              />
            </div>

            {/* 설명 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                설명
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }
                className="col-span-3"
                placeholder="카테고리 설명을 입력하세요"
                rows={3}
              />
            </div>

            {/* 아이콘 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                아이콘
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, icon: e.target.value }))
                  }
                  className="flex-1"
                  placeholder="예: 🏠"
                />
                <div className="w-12 h-10 border rounded flex items-center justify-center text-2xl">
                  {formData.icon || '?'}
                </div>
              </div>
            </div>

            {/* 색상 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                색상
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, color: e.target.value }))
                  }
                  className="w-20"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, color: e.target.value }))
                  }
                  className="flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">
              {mode === 'create' ? '추가' : '수정'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}