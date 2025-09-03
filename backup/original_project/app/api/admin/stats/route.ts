import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 현재 날짜 기준 이전 달 계산
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // 통계 데이터 가져오기
    const [
      totalRevenue,
      lastMonthRevenue,
      totalOrders,
      lastMonthOrders,
      totalProducts,
      lastMonthProducts,
      totalCustomers,
      lastMonthCustomers
    ] = await Promise.all([
      // 총 매출
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'PAYMENT_COMPLETED' }
      }),
      // 지난달 매출
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: 'PAYMENT_COMPLETED',
          createdAt: {
            gte: lastMonth,
            lt: currentMonth
          }
        }
      }),
      // 총 주문
      query(),
      // 지난달 주문
      query({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: currentMonth
          }
        }
      }),
      // 총 상품
      query(),
      // 지난달 등록 상품
      query({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: currentMonth
          }
        }
      }),
      // 총 고객
      query(),
      // 지난달 가입 고객
      query({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: currentMonth
          }
        }
      })
    ])

    const revenue = totalRevenue._sum.total || 0
    const lastRevenue = lastMonthRevenue._sum.total || 0

    // 변화율 계산
    const revenueChange = lastRevenue > 0 ? ((revenue - lastRevenue) / lastRevenue) * 100 : 0
    const ordersChange = lastMonthOrders > 0 ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0
    const productsChange = lastMonthProducts > 0 ? ((totalProducts - lastMonthProducts) / lastMonthProducts) * 100 : 0
    const customersChange = lastMonthCustomers > 0 ? ((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 : 0

    return NextResponse.json({
      totalRevenue: revenue,
      revenueChange: Math.round(revenueChange * 10) / 10,
      totalOrders,
      ordersChange: Math.round(ordersChange * 10) / 10,
      totalProducts,
      productsChange: Math.round(productsChange * 10) / 10,
      totalCustomers,
      customersChange: Math.round(customersChange * 10) / 10
    })
  } catch (error) {

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}