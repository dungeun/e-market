// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { OrderItemGroup } from '@/types/database'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 인기 상품 TOP 5 - OrderItem을 통해 판매량 계산
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: {
        _sum: {
          price: 'desc'
        }
      },
      take: 5
    }) as OrderItemGroup[]

    // 각 상품의 상세 정보 가져오기
    const productIds = topProducts.map(item => item.productId)
    const products = await query({
      where: {
        id: {
          in: productIds
        }
      },
      select: {
        id: true,
        name: true,
        category: true
      }
    })

    // 데이터 매핑
    const result = topProducts.map(item => {
      const product = products.find(p => p.id === item.productId)
      return {
        id: item.productId,
        name: product?.name || 'Unknown Product',
        category: product?.category || 'Uncategorized',
        revenue: item._sum.price || 0,
        sales: item._sum.quantity || 0
      }
    })

    return NextResponse.json({ products: result })
  } catch (error) {

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}