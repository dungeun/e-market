import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 인증 확인 (선택적)
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    // 모든 입점업체 조회
    const query = `
      SELECT 
        id,
        code,
        company_name,
        business_number,
        ceo_name,
        business_type,
        status,
        address,
        postal_code,
        phone,
        email,
        website,
        commission_rate,
        settlement_cycle,
        contract_start,
        contract_end,
        is_active,
        created_at,
        approved_at
      FROM vendors
      ORDER BY 
        CASE 
          WHEN status = 'pending' THEN 1
          WHEN status = 'approved' THEN 2
          WHEN status = 'suspended' THEN 3
          WHEN status = 'rejected' THEN 4
        END,
        created_at DESC
    `
    
    const result = await db.query(query)
    
    return NextResponse.json({
      success: true,
      vendors: result.rows
    })
  } catch (error) {
    console.error('Failed to fetch vendors:', error)
    return NextResponse.json(
      { success: false, error: '입점업체 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      company_name,
      business_number,
      ceo_name,
      business_type,
      address,
      postal_code,
      phone,
      email,
      website,
      bank_name,
      bank_account,
      account_holder,
      commission_rate,
      settlement_cycle
    } = body

    const query = `
      INSERT INTO vendors (
        code, company_name, business_number, ceo_name, business_type,
        status, address, postal_code, phone, email, website,
        bank_name, bank_account, account_holder,
        commission_rate, settlement_cycle
      ) VALUES (
        $1, $2, $3, $4, $5, 'pending', $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15
      )
      RETURNING *
    `

    const values = [
      code,
      company_name,
      business_number,
      ceo_name,
      business_type || 'distributor',
      address,
      postal_code,
      phone,
      email,
      website,
      bank_name,
      bank_account,
      account_holder,
      commission_rate || 10.00,
      settlement_cycle || 30
    ]

    const result = await db.query(query, values)

    // 입점 신청 레코드 생성
    const applicationQuery = `
      INSERT INTO vendor_applications (
        vendor_id, application_type, status, submitted_data
      ) VALUES ($1, 'new', 'pending', $2)
    `
    
    await db.query(applicationQuery, [
      result.rows[0].id,
      JSON.stringify(body)
    ])

    return NextResponse.json({
      success: true,
      vendor: result.rows[0],
      message: '입점 신청이 접수되었습니다. 심사 후 연락드리겠습니다.'
    })
  } catch (error: any) {
    console.error('Failed to create vendor:', error)
    
    if (error.code === '23505') { // Unique violation
      if (error.constraint === 'vendors_code_key') {
        return NextResponse.json(
          { success: false, error: '이미 존재하는 업체 코드입니다.' },
          { status: 400 }
        )
      }
      if (error.constraint === 'vendors_business_number_key') {
        return NextResponse.json(
          { success: false, error: '이미 등록된 사업자등록번호입니다.' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: '입점 신청에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: '업체 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 상태 변경 액션 처리
    if (action) {
      let query = ''
      let message = ''
      
      switch (action) {
        case 'approve':
          query = `
            UPDATE vendors
            SET status = 'approved', 
                approved_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
          `
          message = '입점이 승인되었습니다.'
          break
          
        case 'reject':
          query = `
            UPDATE vendors
            SET status = 'rejected',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
          `
          message = '입점이 거절되었습니다.'
          break
          
        case 'suspend':
          query = `
            UPDATE vendors
            SET status = 'suspended',
                is_active = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
          `
          message = '업체가 정지되었습니다.'
          break
          
        case 'activate':
          query = `
            UPDATE vendors
            SET is_active = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
          `
          message = '업체가 활성화되었습니다.'
          break
          
        default:
          return NextResponse.json(
            { success: false, error: '잘못된 액션입니다.' },
            { status: 400 }
          )
      }
      
      const result = await db.query(query, [id])
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: '업체를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        vendor: result.rows[0],
        message
      })
    }

    // 일반 업데이트
    const updateFields = Object.keys(updateData)
      .filter(key => updateData[key] !== undefined)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ')

    if (!updateFields) {
      return NextResponse.json(
        { success: false, error: '업데이트할 데이터가 없습니다.' },
        { status: 400 }
      )
    }

    const query = `
      UPDATE vendors
      SET ${updateFields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `

    const values = [id, ...Object.values(updateData).filter(v => v !== undefined)]
    const result = await db.query(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '업체를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      vendor: result.rows[0],
      message: '업체 정보가 업데이트되었습니다.'
    })
  } catch (error) {
    console.error('Failed to update vendor:', error)
    return NextResponse.json(
      { success: false, error: '업체 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: '업체 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // Soft delete (is_active를 false로 설정)
    const query = `
      UPDATE vendors
      SET is_active = false, 
          status = 'suspended',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, company_name
    `

    const result = await db.query(query, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '업체를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${result.rows[0].company_name} 업체가 비활성화되었습니다.`
    })
  } catch (error) {
    console.error('Failed to delete vendor:', error)
    return NextResponse.json(
      { success: false, error: '업체 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}