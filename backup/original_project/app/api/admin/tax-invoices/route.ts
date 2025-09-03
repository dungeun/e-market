import type { User, RequestContext } from '@/lib/types/common';
import type { AppError } from '@/lib/types/common';
import { NextRequest, NextResponse } from 'next/server'

// GET - 세금계산서 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    const where: unknown = {}

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { supplierCompanyName: { contains: search, mode: 'insensitive' } },
        { buyerCompanyName: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [invoices, total] = await Promise.all([
      query({
        where,
        include: {
          items: true,
          order: {
            select: {
              id: true,
              orderNumber: true,
              userId: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      query({ where })
    ])

    return NextResponse.json({
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {

    return NextResponse.json(
      { error: '세금계산서 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST - 새 세금계산서 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      orderId,
      supplierBusinessNo,
      supplierCompanyName,
      supplierCeoName,
      supplierAddress,
      buyerBusinessNo,
      buyerCompanyName,
      buyerCeoName,
      buyerAddress,
      buyerEmail,
      items
    } = body

    // 공급가액, 세액 계산
    let totalSupplyAmount = 0
    let totalTaxAmount = 0

    const processedItems = items.map((item: unknown) => {
      const supplyAmount = item.quantity * item.unitPrice
      const taxAmount = Math.round(supplyAmount * 0.1) // 부가세 10%
      
      totalSupplyAmount += supplyAmount
      totalTaxAmount += taxAmount

      return {
        itemName: item.itemName,
        specification: item.specification || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        supplyAmount,
        taxAmount,
        itemDate: new Date()
      }
    })

    const totalAmount = totalSupplyAmount + totalTaxAmount

    // 세금계산서 번호 생성
    const invoiceNumber = `INV${Date.now()}`

    const invoice = await query({
      data: {
        invoiceNumber,
        orderId,
        supplierBusinessNo,
        supplierCompanyName,
        supplierCeoName,
        supplierAddress,
        buyerBusinessNo,
        buyerCompanyName,
        buyerCeoName,
        buyerAddress,
        buyerEmail,
        supplyAmount: totalSupplyAmount,
        taxAmount: totalTaxAmount,
        totalAmount,
        status: 'DRAFT',
        issueDate: new Date(),
        items: {
          create: processedItems
        }
      },
      include: {
        items: true
      }
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {

    return NextResponse.json(
      { error: '세금계산서 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}