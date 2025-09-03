import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

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

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: string
  originalPrice?: number
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  category: string
  stock: number
  images: UploadedImage[]
  rating?: number
  reviewCount?: number
  featured: boolean
  new: boolean
  status?: string
  discountRate?: number
  createdAt: string
  updatedAt: string
}

interface TrashedProduct extends Product {
  deletedAt: string
}

interface CacheData {
  metadata: {
    language: string
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
    generated: string
    cacheVersion: string
    ttl: number
    nextPage: number | null
    prevPage: number | null
  }
  products: Product[]
  filters: {
    categories: Array<{
      id: string
      slug: string
      name: string
      count: number
    }>
    priceRange: {
      min: string
      max: string
    }
    brands: any[]
  }
}

// GET /api/admin/products/trash - 휴지통 상품 목록 조회
export async function GET() {
  try {
    const cacheDir = path.join(process.cwd(), 'public', 'cache', 'products')
    const trashFilePath = path.join(cacheDir, 'products-trash.json')

    let trashData: { products: TrashedProduct[] }
    try {
      const trashFileContent = await fs.readFile(trashFilePath, 'utf8')
      trashData = JSON.parse(trashFileContent)
    } catch (error) {
      trashData = { products: [] }
    }

    return NextResponse.json({
      success: true,
      products: trashData.products,
      totalItems: trashData.products.length
    })

  } catch (error) {
    console.error('Error fetching trash products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trash products' },
      { status: 500 }
    )
  }
}

// POST /api/admin/products/trash - 휴지통에서 상품 복구
export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const cacheDir = path.join(process.cwd(), 'public', 'cache', 'products')
    const productsFilePath = path.join(cacheDir, 'products-ko-page-1.json')
    const trashFilePath = path.join(cacheDir, 'products-trash.json')

    // 휴지통 데이터 읽기
    let trashData: { products: TrashedProduct[] }
    try {
      const trashFileContent = await fs.readFile(trashFilePath, 'utf8')
      trashData = JSON.parse(trashFileContent)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Trash file not found' },
        { status: 404 }
      )
    }

    // 복구할 상품 찾기
    const productIndex = trashData.products.findIndex(product => product.id === productId)
    
    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found in trash' },
        { status: 404 }
      )
    }

    // 휴지통에서 상품 제거
    const restoredProduct = trashData.products.splice(productIndex, 1)[0]

    // 삭제 관련 필드 제거
    const { deletedAt, ...cleanProduct } = restoredProduct
    const productToRestore: Product = {
      ...cleanProduct,
      updatedAt: new Date().toISOString()
    }

    // 기존 상품 데이터 읽기
    let existingData: CacheData
    try {
      const fileContent = await fs.readFile(productsFilePath, 'utf8')
      existingData = JSON.parse(fileContent)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Products cache file not found' },
        { status: 404 }
      )
    }

    // 상품 목록에 복구된 상품 추가 (맨 앞에)
    existingData.products.unshift(productToRestore)

    // 메타데이터 업데이트
    existingData.metadata.totalItems = existingData.products.length
    existingData.metadata.generated = new Date().toISOString()

    // 파일들 저장
    await Promise.all([
      fs.writeFile(productsFilePath, JSON.stringify(existingData, null, 2), 'utf8'),
      fs.writeFile(trashFilePath, JSON.stringify(trashData, null, 2), 'utf8')
    ])

    return NextResponse.json({
      success: true,
      message: 'Product restored successfully',
      restoredProduct: productToRestore
    })

  } catch (error) {
    console.error('Error restoring product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to restore product' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/products/trash - 휴지통에서 상품 영구 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const cacheDir = path.join(process.cwd(), 'public', 'cache', 'products')
    const trashFilePath = path.join(cacheDir, 'products-trash.json')

    // 휴지통 데이터 읽기
    let trashData: { products: TrashedProduct[] }
    try {
      const trashFileContent = await fs.readFile(trashFilePath, 'utf8')
      trashData = JSON.parse(trashFileContent)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Trash file not found' },
        { status: 404 }
      )
    }

    // 삭제할 상품 찾기
    const productIndex = trashData.products.findIndex(product => product.id === productId)
    
    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found in trash' },
        { status: 404 }
      )
    }

    // 휴지통에서 상품 영구 제거
    const deletedProduct = trashData.products.splice(productIndex, 1)[0]

    // 휴지통 파일 저장
    await fs.writeFile(trashFilePath, JSON.stringify(trashData, null, 2), 'utf8')

    return NextResponse.json({
      success: true,
      message: 'Product permanently deleted',
      deletedProduct: deletedProduct
    })

  } catch (error) {
    console.error('Error permanently deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to permanently delete product' },
      { status: 500 }
    )
  }
}