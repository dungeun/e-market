'use client'

import { useEffect, useState } from 'react'

interface SalesData {
  date: string
  revenue: number
}

export function SalesChart() {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSalesData()
  }, [])

  const fetchSalesData = async () => {
    try {
      const response = await fetch('/api/admin/sales-data')
      if (response.ok) {
        const data = await response.json()
        setSalesData(data.sales || [])
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 최대값 계산 for Y축 스케일
  const maxRevenue = Math.max(...salesData.map(d => d.revenue), 0)
  const yAxisMax = Math.ceil(maxRevenue / 1000000) * 1000000 || 1000000

  // 간단한 차트 (recharts 없이 구현)
  const chartHeight = 300
  const chartWidth = '100%'

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">매출 추이 (최근 7일)</h2>
      
      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : salesData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          데이터가 없습니다
        </div>
      ) : (
        <div className="relative" style={{ height: chartHeight }}>
          {/* Y축 레이블 */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
            <span>₩{(yAxisMax / 1000000).toFixed(0)}M</span>
            <span>₩{(yAxisMax * 0.75 / 1000000).toFixed(0)}M</span>
            <span>₩{(yAxisMax * 0.5 / 1000000).toFixed(0)}M</span>
            <span>₩{(yAxisMax * 0.25 / 1000000).toFixed(0)}M</span>
            <span>₩0</span>
          </div>
          
          {/* 차트 영역 */}
          <div className="ml-12 h-full relative">
            {/* 그리드 라인 */}
            <div className="absolute inset-0">
              {[0, 25, 50, 75, 100].map((percent) => (
                <div
                  key={percent}
                  className="absolute w-full border-t border-gray-200"
                  style={{ top: `${percent}%` }}
                />
              ))}
            </div>
            
            {/* 바 차트 */}
            <div className="relative h-full flex items-end justify-around px-4">
              {salesData.slice(-7).map((data, index) => {
                const height = (data.revenue / yAxisMax) * 100
                const date = new Date(data.date)
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full max-w-[40px] relative" style={{ height: '100%' }}>
                      <div
                        className="absolute bottom-0 w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                        style={{ height: `${height}%` }}
                        title={`₩${data.revenue.toLocaleString()}`}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-2">
                      {date.getMonth() + 1}/{date.getDate()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* 총 매출 표시 */}
      {!loading && salesData.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">7일 총 매출</span>
            <span className="text-lg font-semibold text-gray-900">
              ₩{salesData.slice(-7).reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}