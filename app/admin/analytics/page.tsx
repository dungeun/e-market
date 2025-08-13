'use client'

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">분석 대시보드</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">총 매출</h3>
          <p className="text-3xl font-bold text-green-600">₩12,345,678</p>
          <p className="text-sm text-gray-500">전월 대비 +12%</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">주문 수</h3>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
          <p className="text-sm text-gray-500">전월 대비 +8%</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">방문자 수</h3>
          <p className="text-3xl font-bold text-purple-600">45,678</p>
          <p className="text-sm text-gray-500">전월 대비 +15%</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">전환율</h3>
          <p className="text-3xl font-bold text-orange-600">2.7%</p>
          <p className="text-sm text-gray-500">전월 대비 +0.3%</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">최근 주문</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">주문 번호</th>
                <th className="text-left py-2">고객</th>
                <th className="text-left py-2">금액</th>
                <th className="text-left py-2">상태</th>
                <th className="text-left py-2">날짜</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">#12345</td>
                <td className="py-2">김철수</td>
                <td className="py-2">₩89,000</td>
                <td className="py-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">완료</span>
                </td>
                <td className="py-2">2024-08-13</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">#12346</td>
                <td className="py-2">이영희</td>
                <td className="py-2">₩156,000</td>
                <td className="py-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">배송중</span>
                </td>
                <td className="py-2">2024-08-13</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}