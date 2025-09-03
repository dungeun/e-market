'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import toast from 'react-hot-toast'

const ProductSchema = z.object({
  name: z.string().min(1, '상품명을 입력해주세요'),
  slug: z.string().min(1, 'URL 슬러그를 입력해주세요'),
  description: z.string().optional(),
  price: z.number().positive('가격은 0보다 커야 합니다'),
  compareAtPrice: z.number().optional(),
  sku: z.string().optional(),
  quantity: z.number().int().min(0, '재고는 0 이상이어야 합니다'),
  isActive: z.boolean().default(true),
})

type ProductFormData = z.infer<typeof ProductSchema>

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProductFormData) => void
  product?: any // For editing existing products
}

export function ProductModal({ isOpen, onClose, onSubmit, product }: ProductModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      price: product?.price || 0,
      compareAtPrice: product?.compareAtPrice || undefined,
      sku: product?.sku || '',
      quantity: product?.quantity || 0,
      isActive: product?.isActive ?? true,
    },
  })

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    
    try {
      const url = product ? `/api/products/${product.id}` : '/api/products'
      const method = product ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save product')
      }

      const savedProduct = await response.json()
      onSubmit(savedProduct)
      toast.success(product ? '상품이 수정되었습니다' : '상품이 추가되었습니다')
      onClose()
      form.reset()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('상품 저장 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9ㄱ-ㅎ가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? '상품 수정' : '새 상품 추가'}
          </DialogTitle>
          <DialogDescription>
            상품 정보를 입력해주세요. 모든 필드를 정확히 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">상품명 *</Label>
              <Input
                id="name"
                {...form.register('name')}
                onChange={(e) => {
                  form.setValue('name', e.target.value)
                  if (!product) {
                    form.setValue('slug', generateSlug(e.target.value))
                  }
                }}
                placeholder="상품명을 입력하세요"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL 슬러그 *</Label>
              <Input
                id="slug"
                {...form.register('slug')}
                placeholder="product-url-slug"
              />
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">상품 설명</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="상품에 대한 자세한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">판매가 *</Label>
              <Input
                id="price"
                type="number"
                {...form.register('price', { valueAsNumber: true })}
                placeholder="0"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">정가</Label>
              <Input
                id="compareAtPrice"
                type="number"
                {...form.register('compareAtPrice', { valueAsNumber: true })}
                placeholder="할인 전 가격"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">재고수량 *</Label>
              <Input
                id="quantity"
                type="number"
                {...form.register('quantity', { valueAsNumber: true })}
                placeholder="0"
              />
              {form.formState.errors.quantity && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.quantity.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              {...form.register('sku')}
              placeholder="상품 고유 코드"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">상품 활성화</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '저장 중...' : product ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}