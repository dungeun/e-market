import { Suspense } from 'react'
import { ProductsTable } from '@/components/admin/products/products-table'
import { ProductsHeader } from '@/components/admin/products/products-header'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <ProductsHeader />
      
      <Suspense fallback={<LoadingSpinner />}>
        <ProductsTable />
      </Suspense>
    </div>
  )
}