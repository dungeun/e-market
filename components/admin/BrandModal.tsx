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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { X } from 'lucide-react'

interface BrandModalProps {
  isOpen: boolean
  onClose: () => void
  brand?: any
  onSave: (brand: any) => void
  mode: 'create' | 'edit'
}

export default function BrandModal({
  isOpen,
  onClose,
  brand,
  onSave,
  mode
}: BrandModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    country: '',
    description: '',
    categories: [] as string[],
    logo: ''
  })
  const [categoryInput, setCategoryInput] = useState('')

  useEffect(() => {
    if (brand && mode === 'edit') {
      setFormData({
        name: brand.name || '',
        nameEn: brand.nameEn || '',
        country: brand.country || '',
        description: brand.description || '',
        categories: brand.categories || [],
        logo: brand.logo || ''
      })
    } else {
      setFormData({
        name: '',
        nameEn: '',
        country: '',
        description: '',
        categories: [],
        logo: ''
      })
    }
  }, [brand, mode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast.error('브랜드명은 필수입니다.')
      return
    }

    onSave({
      ...brand,
      ...formData
    })
  }

  const addCategory = () => {
    if (categoryInput && !formData.categories.includes(categoryInput)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, categoryInput]
      }))
      setCategoryInput('')
    }
  }

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? '브랜드 추가' : '브랜드 수정'}
            </DialogTitle>
            <DialogDescription>
              브랜드 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* 브랜드명 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                브랜드명 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                className="col-span-3"
                placeholder="예: 삼성"
                required
              />
            </div>

            {/* 영문명 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nameEn" className="text-right">
                영문명
              </Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, nameEn: e.target.value }))
                }
                className="col-span-3"
                placeholder="예: Samsung"
              />
            </div>

            {/* 국가 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                국가
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, country: e.target.value }))
                }
                className="col-span-3"
                placeholder="예: 한국"
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
                placeholder="브랜드 설명을 입력하세요"
                rows={3}
              />
            </div>

            {/* 적용 카테고리 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                적용 카테고리
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    placeholder="카테고리 추가"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCategory()
                      }
                    }}
                  />
                  <Button type="button" onClick={addCategory} size="sm">
                    추가
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="gap-1">
                      {cat}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeCategory(cat)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* 로고 URL */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="logo" className="text-right">
                로고 URL
              </Label>
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, logo: e.target.value }))
                }
                className="col-span-3"
                placeholder="https://..."
              />
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