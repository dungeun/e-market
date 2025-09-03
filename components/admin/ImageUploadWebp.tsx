'use client';

import React from 'react';

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Camera,
  FileImage,
  Check,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface UploadedImage {
  id: string
  url: string
  fileName: string
  size: number
  webpUrl?: string
  isConverting?: boolean
  error?: string
  type: 'thumbnail' | 'detail'
  order: number
}

interface ImageUploadWebpProps {
  images: UploadedImage[]
  onImagesChange: (images: UploadedImage[]) => void
  maxImages?: number
  maxSize?: number // MB
  thumbnailLimit?: number
  detailLimit?: number
  mode?: 'both' | 'thumbnail' | 'detail'
}

const ImageUploadWebp = React.memo(function ImageUploadWebp({ 
  images, 
  onImagesChange, 
  maxImages = 6,
  maxSize = 5,
  thumbnailLimit = 3,
  detailLimit = 3,
  mode = 'both'
}: ImageUploadWebpProps) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 파일을 WebP로 변환
  const convertToWebP = useCallback((file: File): Promise<{ webpBlob: Blob; webpUrl: string }> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // 이미지 크기 조정 (최대 1200px)
        const maxWidth = 1200
        const maxHeight = 1200
        let { width, height } = img

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // 이미지 그리기
        ctx?.drawImage(img, 0, 0, width, height)

        // WebP로 변환 (품질 80%)
        canvas.toBlob(
          (webpBlob) => {
            if (webpBlob) {
              const webpUrl = URL.createObjectURL(webpBlob)
              resolve({ webpBlob, webpUrl })
            } else {
              reject(new Error('WebP 변환 실패'))
            }
          },
          'image/webp',
          0.8
        )
      }

      img.onerror = () => {
        reject(new Error('이미지 로드 실패'))
      }

      img.src = URL.createObjectURL(file)
    })
  }, [])

  // 파일 업로드 처리 (타입별 제한 적용)
  const handleFiles = useCallback(async (files: FileList, imageType: 'thumbnail' | 'detail' = 'thumbnail') => {
    const thumbnailCount = images.filter(img => img.type === 'thumbnail').length
    const detailCount = images.filter(img => img.type === 'detail').length
    
    // 타입별 제한 체크
    const remainingSlots = imageType === 'thumbnail' 
      ? thumbnailLimit - thumbnailCount 
      : detailLimit - detailCount

    if (files.length > remainingSlots) {
      const typeName = imageType === 'thumbnail' ? '썸네일' : '상세페이지'
      toast.error(`${typeName} 이미지는 최대 ${imageType === 'thumbnail' ? thumbnailLimit : detailLimit}장까지 업로드할 수 있습니다. (현재: ${imageType === 'thumbnail' ? thumbnailCount : detailCount}장)`)
      return
    }

    setUploading(true)
    const newImages: UploadedImage[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // 파일 크기 체크
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`${file.name}: 파일 크기는 ${maxSize}MB 이하여야 합니다.`)
        continue
      }

      // 이미지 파일 체크
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}: 이미지 파일만 업로드할 수 있습니다.`)
        continue
      }

      const imageId = `img_${Date.now()}_${i}`
      const originalUrl = URL.createObjectURL(file)
      
      // 순서 계산
      const currentTypeImages = images.filter(img => img.type === imageType)
      const order = currentTypeImages.length + i + 1
      
      // 임시 이미지 객체 생성
      const tempImage: UploadedImage = {
        id: imageId,
        url: originalUrl,
        fileName: file.name,
        size: file.size,
        isConverting: true,
        type: imageType,
        order: order
      }
      
      newImages.push(tempImage)
      onImagesChange([...images, ...newImages])

      try {
        // WebP 변환
        const { webpBlob, webpUrl } = await convertToWebP(file)
        
        // 실제로는 서버에 업로드해야 함 (현재는 로컬 URL 사용)
        const uploadedImage: UploadedImage = {
          ...tempImage,
          webpUrl,
          isConverting: false,
          size: webpBlob.size
        }

        // 변환 완료된 이미지로 업데이트
        const updatedImages = [...images, ...newImages]
        const imageIndex = updatedImages.findIndex(img => img.id === imageId)
        if (imageIndex !== -1) {
          updatedImages[imageIndex] = uploadedImage
          onImagesChange(updatedImages)
        }

        const typeName = imageType === 'thumbnail' ? '썸네일' : '상세페이지'
        toast.success(`${file.name} ${typeName} 이미지 WebP 변환 완료`)
      } catch (error) {

        // 오류 발생시 이미지 상태 업데이트
        const updatedImages = [...images, ...newImages]
        const imageIndex = updatedImages.findIndex(img => img.id === imageId)
        if (imageIndex !== -1) {
          updatedImages[imageIndex] = {
            ...tempImage,
            isConverting: false,
            error: '변환 실패'
          }
          onImagesChange(updatedImages)
        }

        toast.error(`${file.name}: WebP 변환에 실패했습니다.`)
      }
    }

    setUploading(false)
  }, [images, onImagesChange, thumbnailLimit, detailLimit, maxSize, convertToWebP])

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      // 기본적으로 썸네일로 업로드
      handleFiles(files, 'thumbnail')
    }
  }, [handleFiles])

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, imageType: 'thumbnail' | 'detail' = 'thumbnail') => {
    const files = e.target.files
    if (files) {
      handleFiles(files, imageType)
    }
    // input 초기화
    e.target.value = ''
  }, [handleFiles])

  // 이미지 삭제
  const removeImage = useCallback((imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId)
    onImagesChange(updatedImages)
    toast.success('이미지가 삭제되었습니다.')
  }, [images, onImagesChange])

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const thumbnailImages = images.filter(img => img.type === 'thumbnail').sort((a, b) => a.order - b.order)
  const detailImages = images.filter(img => img.type === 'detail').sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-6">
      {/* 썸네일 이미지 섹션 */}
      {(mode === 'both' || mode === 'thumbnail') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-500" />
              썸네일 이미지
            </h3>
            <Badge variant="outline" className="text-blue-600">
              {thumbnailImages.length}/{thumbnailLimit}장
            </Badge>
          </div>
          
          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    상품 목록에서 보여질 대표 이미지입니다. (최대 {thumbnailLimit}장)
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.multiple = true
                        input.accept = 'image/*'
                        input.onchange = (e) => handleFileSelect(e as unknown, 'thumbnail')
                        input.click()
                      }}
                      disabled={uploading || thumbnailImages.length >= thumbnailLimit}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      썸네일 추가
                    </Button>
                  </div>
                </div>

                {thumbnailImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {thumbnailImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <Card className="overflow-hidden">
                          <div className="aspect-square relative">
                            <img
                              src={image.webpUrl || image.url}
                              alt={image.fileName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                            
                            {/* 상태 오버레이 */}
                            {image.isConverting && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-white text-center">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                                  <p className="text-xs">변환 중...</p>
                                </div>
                              </div>
                            )}

                            {image.error && (
                              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-red-500" />
                              </div>
                            )}

                            {!image.isConverting && !image.error && image.webpUrl && (
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">
                                  <Camera className="h-3 w-3 mr-1" />
                                  {image.order}
                                </Badge>
                              </div>
                            )}

                            {/* 삭제 버튼 */}
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          
                          {/* 파일 정보 */}
                          <CardContent className="p-2">
                            <p className="text-xs truncate font-medium">
                              {image.fileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(image.size)}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 상세 이미지 섹션 */}
      {(mode === 'both' || mode === 'detail') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-green-500" />
              상세페이지 이미지
            </h3>
            <Badge variant="outline" className="text-green-600">
              {detailImages.length}/{detailLimit}장
            </Badge>
          </div>
          
          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    상품 상세페이지에서 보여질 이미지입니다. (최대 {detailLimit}장)
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.multiple = true
                        input.accept = 'image/*'
                        input.onchange = (e) => handleFileSelect(e as unknown, 'detail')
                        input.click()
                      }}
                      disabled={uploading || detailImages.length >= detailLimit}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      상세 이미지 추가
                    </Button>
                  </div>
                </div>

                {detailImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {detailImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <Card className="overflow-hidden">
                          <div className="aspect-square relative">
                            <img
                              src={image.webpUrl || image.url}
                              alt={image.fileName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                            
                            {/* 상태 오버레이 */}
                            {image.isConverting && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-white text-center">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                                  <p className="text-xs">변환 중...</p>
                                </div>
                              </div>
                            )}

                            {image.error && (
                              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-red-500" />
                              </div>
                            )}

                            {!image.isConverting && !image.error && image.webpUrl && (
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  {image.order}
                                </Badge>
                              </div>
                            )}

                            {/* 삭제 버튼 */}
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          
                          {/* 파일 정보 */}
                          <CardContent className="p-2">
                            <p className="text-xs truncate font-medium">
                              {image.fileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(image.size)}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 드래그 앤 드롭 전용 영역 */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              ) : (
                <div className="p-2 bg-primary/10 rounded-full">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
            
            <div>
              <p className="font-medium">
                {uploading ? '업로드 중...' : '이미지를 여기에 드래그하세요'}
              </p>
              <p className="text-sm text-muted-foreground">
                드래그한 이미지는 썸네일로 등록됩니다
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 전체 업로드 상태 */}
      {(thumbnailImages.length > 0 || detailImages.length > 0) && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              썸네일: {thumbnailImages.length}장
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              상세: {detailImages.length}장
            </Badge>
          </div>
          <Badge variant="outline">
            WebP 자동변환
          </Badge>
        </div>
      )}
    </div>
    )
});

export default ImageUploadWebp;