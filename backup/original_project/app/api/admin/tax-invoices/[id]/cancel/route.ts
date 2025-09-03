import type { AppError } from '@/lib/types/common';
import { NextRequest, NextResponse } from 'next/server'

// POST - 세금계산서 취소
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params
    const body = await request.json()
    const { reason } = body

    // 세금계산서 조회
    const invoice = await query({
      where: { id: invoiceId },
      include: { items: true }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: '세금계산서를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (invoice.status !== 'ISSUED' && invoice.status !== 'MODIFIED') {
      return NextResponse.json(
        { error: '발행된 세금계산서만 취소할 수 있습니다.' },
        { status: 400 }
      )
    }

    // Popbill API 취소 호출
    const popbillResult = await cancelFromPopbill(invoice, reason)
    
    if (popbillResult.success) {
      // 취소 성공 시 DB 업데이트
      const updatedInvoice = await query({
        where: { id: invoiceId },
        data: {
          status: 'CANCELLED',
          ntsResultCode: popbillResult.resultCode,
          updatedAt: new Date()
        },
        include: { items: true }
      })

      return NextResponse.json({
        message: '세금계산서가 성공적으로 취소되었습니다.',
        invoice: updatedInvoice
      })
    } else {
      return NextResponse.json(
        { error: `취소 실패: ${popbillResult.message}` },
        { status: 400 }
      )
    }
  } catch (error) {

    return NextResponse.json(
      { error: '세금계산서 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// Popbill API 취소 호출 함수
async function cancelFromPopbill(invoice: unknown, reason: string) {
  try {
    // TODO: 실제 Popbill API 취소 호출
    // const result = await popbillAPI.delete(
    //   invoice.supplierBusinessNo,
    //   invoice.invoiceNumber,
    //   reason
    // )
    
    // 임시 성공 응답 (개발용)
    return {
      success: true,
      resultCode: '1',
      message: '취소 성공'
    }
  } catch (error) {

    return {
      success: false,
      message: '국세청 취소 실패'
    }
  }
}