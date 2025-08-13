import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import AddToCartButton from '@/components/AddToCartButton'
import ProductReviews from '@/components/ProductReviews'
import RelatedProducts from '@/components/RelatedProducts'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: true,
      category: true,
      reviews: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!product || product.status !== 'ACTIVE') {
    notFound()
  }

  return product
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true },
  })

  return products.map((product) => ({
    slug: product.slug,
  }))
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0

  const discountPercentage = product.compareAt
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : 0

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 이미지 갤러리 */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              {product.images[0] ? (
                <Image
                  src={product.images[0].url || '/placeholder.svg'}
                  alt={product.images[0].alt || product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image.url || '/placeholder.svg'}
                      alt={image.alt || `${product.name} ${index + 2}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="space-y-6">
            {product.category && (
              <div className="text-sm text-gray-500">
                {product.category.name}
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            
            {/* 평점 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600">
                {avgRating.toFixed(1)} ({product.reviews.length}개 리뷰)
              </span>
            </div>

            {/* 가격 */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-gray-900">
                  ₩{product.price.toLocaleString()}
                </span>
                {product.compareAt && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₩{product.compareAt.toLocaleString()}
                    </span>
                    <span className="text-lg font-semibold text-red-600">
                      {discountPercentage}% 할인
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 재고 상태 */}
            {product.trackStock && (
              <div>
                {product.stock > 0 ? (
                  <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    재고 있음 ({product.stock}개)
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    품절
                  </div>
                )}
              </div>
            )}

            {/* 설명 */}
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>{product.description}</p>
            </div>

            {/* 구매 버튼 */}
            <div className="space-y-4">
              <AddToCartButton 
                productId={product.id}
                disabled={product.trackStock && product.stock === 0}
              />
              
              <button className="w-full py-3 px-6 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                ♡ 찜하기
              </button>
            </div>

            {/* 배송 정보 */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">무료 배송</p>
                  <p className="text-sm text-gray-500">3만원 이상 구매시</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">토스페이 결제</p>
                  <p className="text-sm text-gray-500">간편하고 안전한 결제</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상품 리뷰 */}
        <ProductReviews productId={product.id} reviews={product.reviews} />

        {/* 관련 상품 */}
        <RelatedProducts 
          categoryId={product.categoryId} 
          currentProductId={product.id} 
        />
      </div>
    </div>
  )
}