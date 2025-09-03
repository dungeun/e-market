import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductDetail } from '@/components/products/product-detail'
import { RelatedProducts } from '@/components/products/related-products'
import { prisma } from "@/lib/db"

async function getProduct(slug: string) {
  const product = await query({
    where: { slug },
    include: {
      images: true,
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })
  
  return product
}

async function getRelatedProducts(categoryId?: string, currentProductId?: string) {
  if (!categoryId) return []
  
  const products = await query({
    where: {
      categoryId,
      isActive: true,
      id: { not: currentProductId },
    },
    include: {
      images: true,
      category: true,
    },
    take: 4,
  })
  
  return products
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProduct(params.slug)
  
  if (!product) {
    notFound()
  }
  
  const relatedProducts = await getRelatedProducts(product.categoryId || undefined, product.id)
  
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <ProductDetail product={product} />
          
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <RelatedProducts products={relatedProducts} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}