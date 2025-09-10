'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Progress } from './progress'
import { Badge } from './badge'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Camera,
  FileImage,
  Eye,
  Trash2,
  AlertCircle,
  Check,
  Globe
} from 'lucide-react'
import { toast } from 'sonner'

// Types
interface Language {
  code: string
  name: string
  native_name?: string
  flag_emoji?: string
}

interface UploadedImage {
  id: string
  url: string
  fileName: string
  size: number
  webpUrl?: string
  isConverting?: boolean
  error?: string
  type?: 'thumbnail' | 'detail'
  order?: number
}

interface ImageDimensions {
  width?: number
  height?: number
  aspectRatio?: string
}

interface UnifiedImageUploadProps {
  // Basic properties
  value?: string | string[]
  onChange: (value: string | string[]) => void
  label?: string
  
  // Upload configuration
  multiple?: boolean
  category?: 'campaigns' | 'users' | 'profiles' | 'temp' | 'section-image'
  maxFiles?: number
  maxSize?: number // MB
  acceptedTypes?: string[]
  
  // Image processing
  webpOptimization?: boolean
  dimensions?: ImageDimensions
  
  // UI behavior
  preview?: boolean
  dragAndDrop?: boolean
  showProgress?: boolean
  disabled?: boolean
  className?: string
  
  // Advanced features
  imageTypes?: {
    thumbnail?: { limit: number; label: string }
    detail?: { limit: number; label: string }
  }
  
  // Multi-language support
  languages?: Language[]
  multiLanguage?: boolean
  langFieldPrefix?: string
  
  // Server integration
  uploadEndpoint?: string
  authRequired?: boolean
  customFormData?: (file: File) => FormData
  
  // Callbacks
  onUploadStart?: (file: File) => void
  onUploadSuccess?: (url: string, file: File) => void
  onUploadError?: (error: string, file: File) => void
}

export function UnifiedImageUpload({
  value,
  onChange,
  label = '이미지 업로드',
  multiple = false,
  category = 'temp',
  maxFiles = 5,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  webpOptimization = false,
  dimensions,
  preview = true,
  dragAndDrop = true,
  showProgress = true,
  disabled = false,
  className = '',
  imageTypes,
  languages,
  multiLanguage = false,
  langFieldPrefix = 'image',
  uploadEndpoint = '/api/upload/image',
  authRequired = false,
  customFormData,
  onUploadStart,
  onUploadSuccess,
  onUploadError
}: UnifiedImageUploadProps) {
  // State management
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Convert value to images array for unified handling
  const currentImages = React.useMemo(() => {
    if (multiLanguage && languages) {
      // Multi-language mode
      const langImages: UploadedImage[] = []
      languages.forEach((lang, index) => {
        const fieldName = lang.code === 'ko' ? langFieldPrefix : `${langFieldPrefix}${lang.code.charAt(0).toUpperCase() + lang.code.slice(1)}`
        const url = (value as any)?.[fieldName]
        if (url) {
          langImages.push({
            id: `lang_${lang.code}`,
            url,
            fileName: `${lang.name} 이미지`,
            size: 0,
            type: lang.code as any,
            order: index + 1
          })
        }
      })
      return langImages
    } else if (imageTypes) {
      // Type-based mode (thumbnail/detail)
      return images
    } else {
      // Standard mode
      const urls = Array.isArray(value) ? value : value ? [value] : []
      return urls.map((url, index) => ({
        id: `img_${index}`,
        url,
        fileName: `이미지 ${index + 1}`,
        size: 0,
        order: index + 1
      }))
    }
  }, [value, languages, multiLanguage, langFieldPrefix, images, imageTypes])

  // WebP conversion
  const convertToWebP = useCallback((file: File): Promise<{ webpBlob: Blob; webpUrl: string }> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new window.Image()

      img.onload = () => {
        let { width, height } = img

        // Apply dimension constraints
        if (dimensions?.width && dimensions?.height) {
          width = dimensions.width
          height = dimensions.height
        } else if (dimensions?.width) {
          const ratio = dimensions.width / width
          width = dimensions.width
          height = height * ratio
        } else if (dimensions?.height) {
          const ratio = dimensions.height / height
          height = dimensions.height
          width = width * ratio
        } else {
          // Default max size
          const maxDimension = 1200
          if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height)
            width = width * ratio
            height = height * ratio
          }
        }

        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)

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

      img.onerror = () => reject(new Error('이미지 로드 실패'))
      img.src = URL.createObjectURL(file)
    })
  }, [dimensions])

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `지원하지 않는 파일 형식입니다: ${file.name}`
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `파일 크기가 너무 큽니다: ${file.name} (최대 ${maxSize}MB)`
    }
    return null
  }, [acceptedTypes, maxSize])

  // File upload handler
  const handleFiles = useCallback(async (files: FileList, imageType?: 'thumbnail' | 'detail', langCode?: string) => {
    const fileArray = Array.from(files)
    
    // Validate file count
    if (!multiple && fileArray.length > 1) {
      toast.error('하나의 이미지만 업로드할 수 있습니다.')
      return
    }
    
    if (multiple && currentImages.length + fileArray.length > maxFiles) {
      toast.error(`최대 ${maxFiles}개의 이미지만 업로드할 수 있습니다.`)
      return
    }

    // Validate each file
    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        toast.error(validationError)
        return
      }
    }

    setUploading(true)
    setUploadProgress(0)
    setError('')
    
    const uploadedUrls: string[] = []

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      onUploadStart?.(file)

      try {
        let processedFile = file
        let processedUrl: string

        // WebP optimization if enabled
        if (webpOptimization) {
          const { webpBlob, webpUrl } = await convertToWebP(file)
          processedFile = new File([webpBlob], file.name.replace(/\.[^.]+$/, '.webp'), {
            type: 'image/webp'
          })
          processedUrl = webpUrl
        } else if (!uploadEndpoint || uploadEndpoint.includes('data:')) {
          // Client-side processing (base64)
          processedUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        } else {
          // Server upload
          const formData = customFormData ? customFormData(processedFile) : new FormData()
          if (!customFormData) {
            formData.append('file', processedFile)
            formData.append('category', category)
            if (imageType) formData.append('type', imageType)
            if (langCode) formData.append('language', langCode)
          }

          const headers: Record<string, string> = {}
          if (authRequired) {
            const token = localStorage.getItem('accessToken')
            if (token) headers.Authorization = `Bearer ${token}`
          }

          const response = await fetch(uploadEndpoint, {
            method: 'POST',
            headers,
            body: formData
          })

          if (!response.ok) {
            throw new Error('업로드 실패')
          }

          const result = await response.json()
          if (!result.success || !result.imageUrl) {
            throw new Error(result.error || '업로드 실패')
          }

          processedUrl = result.imageUrl
        }

        uploadedUrls.push(processedUrl)
        onUploadSuccess?.(processedUrl, file)
        
        setUploadProgress(((i + 1) / fileArray.length) * 100)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.'
        setError(errorMessage)
        onUploadError?.(errorMessage, file)
        toast.error(`${file.name}: ${errorMessage}`)
      }
    }

    // Update value based on mode
    if (multiLanguage && langCode) {
      const fieldName = langCode === 'ko' ? langFieldPrefix : `${langFieldPrefix}${langCode.charAt(0).toUpperCase() + langCode.slice(1)}`
      const newValue = { ...(value as any), [fieldName]: uploadedUrls[0] }
      onChange(newValue)
    } else if (imageTypes && imageType) {
      // Update images state for type-based mode
      const newImages = uploadedUrls.map((url, index) => ({
        id: `img_${Date.now()}_${index}`,
        url,
        fileName: `${imageType} ${index + 1}`,
        size: fileArray[index].size,
        type: imageType,
        order: currentImages.filter(img => img.type === imageType).length + index + 1
      }))
      setImages(prev => [...prev, ...newImages])
      onChange([...currentImages, ...newImages])
    } else {
      // Standard mode
      if (multiple) {
        const newUrls = Array.isArray(value) ? [...value, ...uploadedUrls] : uploadedUrls
        onChange(newUrls)
      } else {
        onChange(uploadedUrls[0])
      }
    }

    setUploading(false)
    setUploadProgress(0)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [
    multiple, currentImages, maxFiles, validateFile, onUploadStart, webpOptimization, convertToWebP,
    uploadEndpoint, customFormData, category, authRequired, onUploadSuccess, onUploadError,
    multiLanguage, langFieldPrefix, imageTypes, value, onChange
  ])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!dragAndDrop || disabled) return
    e.preventDefault()
    setDragOver(true)
  }, [dragAndDrop, disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!dragAndDrop) return
    e.preventDefault()
    setDragOver(false)
  }, [dragAndDrop])

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!dragAndDrop || disabled) return
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [dragAndDrop, disabled, handleFiles])

  // File input handler
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, imageType?: 'thumbnail' | 'detail', langCode?: string) => {
    const files = e.target.files
    if (files) {
      handleFiles(files, imageType, langCode)
    }
  }, [handleFiles])

  // Remove image handler
  const handleRemoveImage = useCallback((imageId: string, imageType?: 'thumbnail' | 'detail', langCode?: string) => {
    if (multiLanguage && langCode) {
      const fieldName = langCode === 'ko' ? langFieldPrefix : `${langFieldPrefix}${langCode.charAt(0).toUpperCase() + langCode.slice(1)}`
      const newValue = { ...(value as any) }
      delete newValue[fieldName]
      onChange(newValue)
    } else if (imageTypes && imageType) {
      const newImages = images.filter(img => img.id !== imageId)
      setImages(newImages)
      onChange(newImages)
    } else {
      if (multiple) {
        const urls = Array.isArray(value) ? value : []
        const newUrls = urls.filter((_, index) => `img_${index}` !== imageId)
        onChange(newUrls)
      } else {
        onChange('')
      }
    }
  }, [multiLanguage, langCode, langFieldPrefix, imageTypes, images, multiple, value, onChange])

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Get language display info
  const getLanguageInfo = (langCode: string) => {
    const lang = languages?.find(l => l.code === langCode)
    return {
      name: lang?.name || langCode.toUpperCase(),
      flag: lang?.flag_emoji || '🌐'
    }
  }

  // Multi-language render
  if (multiLanguage && languages) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          <h3 className="text-lg font-semibold">{label}</h3>
        </div>

        {languages.map((lang) => {
          const fieldName = lang.code === 'ko' ? langFieldPrefix : `${langFieldPrefix}${lang.code.charAt(0).toUpperCase() + lang.code.slice(1)}`
          const currentValue = (value as any)?.[fieldName] || ''
          const langInfo = getLanguageInfo(lang.code)

          return (
            <Card key={lang.code} className="border-l-4 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span className="text-lg">{langInfo.flag}</span>
                    {langInfo.name}
                  </span>
                  {currentValue && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveImage('', undefined, lang.code)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {currentValue ? (
                  <div className="relative group">
                    <div className="aspect-video relative rounded-lg overflow-hidden border">
                      <Image
                        src={currentValue}
                        alt={`${langInfo.name} 이미지`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || uploading}
                      >
                        이미지 변경
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        클릭하여 {langInfo.name} 이미지 업로드
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedTypes.join(',')}
                  onChange={(e) => handleFileSelect(e, undefined, lang.code)}
                  className="hidden"
                />
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // Type-based render (thumbnail/detail)
  if (imageTypes) {
    const thumbnailImages = images.filter(img => img.type === 'thumbnail').sort((a, b) => (a.order || 0) - (b.order || 0))
    const detailImages = images.filter(img => img.type === 'detail').sort((a, b) => (a.order || 0) - (b.order || 0))

    return (
      <div className={`space-y-6 ${className}`}>
        <h3 className="text-lg font-semibold">{label}</h3>

        {/* Thumbnail section */}
        {imageTypes.thumbnail && (
          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-500" />
                  {imageTypes.thumbnail.label}
                </h4>
                <Badge variant="outline" className="text-blue-600">
                  {thumbnailImages.length}/{imageTypes.thumbnail.limit}장
                </Badge>
              </div>

              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || uploading || thumbnailImages.length >= imageTypes.thumbnail.limit}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  썸네일 이미지 추가
                </Button>

                {thumbnailImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {thumbnailImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square relative rounded-lg overflow-hidden border">
                          <Image
                            src={image.webpUrl || image.url}
                            alt={image.fileName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 33vw, 20vw"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(image.id, 'thumbnail')}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detail section */}
        {imageTypes.detail && (
          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-green-500" />
                  {imageTypes.detail.label}
                </h4>
                <Badge variant="outline" className="text-green-600">
                  {detailImages.length}/{imageTypes.detail.limit}장
                </Badge>
              </div>

              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || uploading || detailImages.length >= imageTypes.detail.limit}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  상세 이미지 추가
                </Button>

                {detailImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {detailImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square relative rounded-lg overflow-hidden border">
                          <Image
                            src={image.webpUrl || image.url}
                            alt={image.fileName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 33vw, 20vw"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(image.id, 'detail')}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Standard render
  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Upload area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-blue-400'
        } ${dragAndDrop && !disabled ? 'cursor-pointer' : ''}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="text-center">
          {uploading ? (
            <div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">업로드 중...</p>
              {showProgress && (
                <div className="mt-2 max-w-xs mx-auto">
                  <Progress value={uploadProgress} className="h-2" />
                  <span className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}%</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {dragAndDrop ? '이미지를 드래그하거나 클릭하여 업로드' : '클릭하여 이미지 업로드'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} (최대 {maxSize}MB)
              </p>
              {multiple && (
                <p className="text-xs text-gray-500">최대 {maxFiles}개까지 업로드 가능</p>
              )}
              {dimensions && (
                <p className="text-xs text-gray-500">
                  {dimensions.width && dimensions.height
                    ? `권장 크기: ${dimensions.width}x${dimensions.height}px`
                    : dimensions.aspectRatio
                    ? `권장 비율: ${dimensions.aspectRatio}`
                    : ''
                  }
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Image previews */}
      {currentImages.length > 0 && preview && (
        <div className={`grid gap-4 ${multiple ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {currentImages.map((image, index) => (
            <div key={image.id || `img_${index}`} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={image.url}
                  alt={image.fileName || `이미지 ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />

                {/* Loading overlay */}
                {image.isConverting && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-xs">변환 중...</p>
                    </div>
                  </div>
                )}

                {/* Error overlay */}
                {image.error && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                )}

                {/* Success indicator */}
                {!image.isConverting && !image.error && image.webpUrl && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-green-500 text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      WebP
                    </Badge>
                  </div>
                )}

                {/* Remove button */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id || `img_${index}`)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* File info */}
              <div className="mt-2 text-xs text-gray-500">
                <p className="truncate font-medium">{image.fileName}</p>
                {image.size > 0 && <p>{formatFileSize(image.size)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Non-preview mode info */}
      {currentImages.length > 0 && !preview && (
        <div className="space-y-2">
          {currentImages.map((image, index) => (
            <div
              key={image.id || `info_${index}`}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{image.fileName || `이미지 ${index + 1}`}</span>
                {image.size > 0 && <span className="text-xs text-gray-400">({formatFileSize(image.size)})</span>}
              </div>
              <div className="flex items-center space-x-2">
                {image.url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(image.url, '_blank')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveImage(image.id || `img_${index}`)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Features info */}
      {(webpOptimization || currentImages.some(img => img.webpUrl)) && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Badge variant="outline" className="text-green-600">
            WebP 자동변환
          </Badge>
        </div>
      )}
    </div>
  )
}