import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductFilters } from '@/components/products/product-filters'
import { prisma } from "@/lib/db"

async function getProducts() {
  const products = await query({
    where: {
      isActive: true,
    },
    include: {
      images: true,
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  
  return products
}

export default async function ProductsPage() {
  const products = await getProducts()
  
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8">전체 상품</h1>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <ProductFilters />
            </aside>
            
            <div className="lg:col-span-3">
              <ProductGrid products={products} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}