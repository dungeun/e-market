import { DashboardStats } from '@/components/admin/dashboard-stats'
import { RecentOrders } from '@/components/admin/recent-orders'
import { SalesChart } from '@/components/admin/sales-chart'
import { TopProducts } from '@/components/admin/top-products'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600">전체 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Charts and tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChart />
        <TopProducts />
      </div>

      <RecentOrders />
    </div>
  )
}