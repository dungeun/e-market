import { prisma } from "@/lib/db"
import ProductCard from '@/components/sections/ProductCard'

interface RelatedProductsProps {
  categoryId: string | null
  currentProductId: string
}

async function getRelatedProducts(categoryId: string | null, currentProductId: string) {
  if (!categoryId) return []

  const products = await query({
    where: {
      categoryId,
      id: { not: currentProductId },
      status: 'ACTIVE',
    },
    take: 4,
    include: {
      images: true,
      category: true,
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return products.map(product => ({
    ...product,
    rating: product.reviews.length > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
      : 0,
    reviewCount: product.reviews.length,
  }))
}

export default async function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const relatedProducts = await getRelatedProducts(categoryId, currentProductId)

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <div className="mt-16 border-t pt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">관련 상품</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              description: product.description || undefined,
              images: product.images.map(img => ({ url: img.url })),
              prices: [{
                amount: product.price
              }],
              rating: product.rating
            }} 
          />
        ))}
      </div>
    </div>
  )
}