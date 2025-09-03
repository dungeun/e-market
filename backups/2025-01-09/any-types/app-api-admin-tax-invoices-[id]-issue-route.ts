// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST - 세금계산서 발행
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params

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

    if (invoice.status !== 'DRAFT') {
      return NextResponse.json(
        { error: '임시저장 상태의 세금계산서만 발행할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 여기서 실제 Popbill API 호출
    const popbillResult = await issueToPopbill(invoice)
    
    if (popbillResult.success) {
      // 발행 성공 시 DB 업데이트
      const updatedInvoice = await query({
        where: { id: invoiceId },
        data: {
          status: 'ISSUED',
          ntsSendDate: new Date(),
          ntsResultCode: popbillResult.resultCode,
          updatedAt: new Date()
        },
        include: { items: true }
      })

      return NextResponse.json({
        message: '세금계산서가 성공적으로 발행되었습니다.',
        invoice: updatedInvoice
      })
    } else {
      return NextResponse.json(
        { error: `발행 실패: ${popbillResult.message}` },
        { status: 400 }
      )
    }
  } catch (error) {

    return NextResponse.json(
      { error: '세금계산서 발행 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// Popbill API 호출 함수 (실제 구현 필요)
async function issueToPopbill(invoice: any) {
  try {
    // Popbill SDK 또는 API 호출
    // 실제 구현에서는 Popbill 라이브러리 사용
    
    const popbillData = {
      writeDate: invoice.issueDate.toISOString().split('T')[0],
      chargeDirection: 'S', // 공급자 과금
      
      // 공급자 정보
      invoicerCorpNum: invoice.supplierBusinessNo.replace(/-/g, ''),
      invoicerTaxRegID: '',
      invoicerCorpName: invoice.supplierCompanyName,
      invoicerCEOName: invoice.supplierCeoName,
      invoicerAddr: invoice.supplierAddress,
      
      // 공급받는자 정보
      invoiceeCorpNum: invoice.buyerBusinessNo.replace(/-/g, ''),
      invoiceeCorpName: invoice.buyerCompanyName,
      invoiceeCEOName: invoice.buyerCeoName,
      invoiceeAddr: invoice.buyerAddress,
      invoiceeEmail1: invoice.buyerEmail,
      
      // 거래 정보
      supplyCostTotal: invoice.supplyAmount.toString(),
      taxTotal: invoice.taxAmount.toString(),
      totalAmount: invoice.totalAmount.toString(),
      
      // 품목 정보
      detailList: invoice.items.map((item: any, index: number) => ({
        serialNum: index + 1,
        purchaseDT: item.itemDate.toISOString().split('T')[0],
        itemName: item.itemName,
        spec: item.specification,
        qty: item.quantity.toString(),
        unitCost: item.unitPrice.toString(),
        supplyCost: item.supplyAmount.toString(),
        tax: item.taxAmount.toString(),
        remark: ''
      }))
    }

    // TODO: 실제 Popbill API 호출
    // const result = await popbillAPI.registIssue(popbillData)
    
    // 임시 성공 응답 (개발용)
    return {
      success: true,
      resultCode: '1',
      message: '발행 성공',
      invoiceNum: invoice.invoiceNumber
    }
  } catch (error) {

    return {
      success: false,
      message: '국세청 전송 실패'
    }
  }
}