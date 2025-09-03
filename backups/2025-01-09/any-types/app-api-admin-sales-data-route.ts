// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 최근 7일간의 매출 데이터
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 6)
    startDate.setHours(0, 0, 0, 0)

    const salesData: any[] = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const revenue = await prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: 'PAYMENT_COMPLETED',
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      salesData.push({
        date: date.toISOString(),
        revenue: revenue._sum.total || 0
      })
    }

    return NextResponse.json({ sales: salesData })
  } catch (error) {

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}