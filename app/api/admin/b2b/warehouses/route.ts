import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 인증 확인 (선택적)
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    // 모든 활성 창고 조회
    const query = `
      SELECT 
        id,
        code,
        name,
        type,
        address,
        postal_code,
        city,
        region,
        capacity,
        current_stock,
        manager_name,
        phone,
        email,
        is_active
      FROM warehouses
      WHERE is_active = true
      ORDER BY name ASC
    `
    
    const result = await db.query(query)
    
    return NextResponse.json({
      success: true,
      warehouses: result.rows
    })
  } catch (error) {
    console.error('Failed to fetch warehouses:', error)
    return NextResponse.json(
      { success: false, error: '창고 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      name,
      type,
      address,
      postal_code,
      city,
      region,
      capacity,
      manager_name,
      phone,
      email
    } = body

    const query = `
      INSERT INTO warehouses (
        code, name, type, address, postal_code, city, region,
        capacity, current_stock, manager_name, phone, email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, $10, $11)
      RETURNING *
    `

    const values = [
      code,
      name,
      type || 'general',
      address,
      postal_code,
      city,
      region,
      capacity || 0,
      manager_name,
      phone,
      email
    ]

    const result = await db.query(query, values)

    return NextResponse.json({
      success: true,
      warehouse: result.rows[0],
      message: '창고가 성공적으로 등록되었습니다.'
    })
  } catch (error: any) {
    console.error('Failed to create warehouse:', error)
    
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { success: false, error: '이미 존재하는 창고 코드입니다.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: '창고 등록에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: '창고 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 동적으로 UPDATE 쿼리 생성
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
      UPDATE warehouses
      SET ${updateFields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `

    const values = [id, ...Object.values(updateData).filter(v => v !== undefined)]
    const result = await db.query(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '창고를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      warehouse: result.rows[0],
      message: '창고 정보가 업데이트되었습니다.'
    })
  } catch (error) {
    console.error('Failed to update warehouse:', error)
    return NextResponse.json(
      { success: false, error: '창고 업데이트에 실패했습니다.' },
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
        { success: false, error: '창고 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // Soft delete (is_active를 false로 설정)
    const query = `
      UPDATE warehouses
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name
    `

    const result = await db.query(query, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '창고를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${result.rows[0].name} 창고가 비활성화되었습니다.`
    })
  } catch (error) {
    console.error('Failed to delete warehouse:', error)
    return NextResponse.json(
      { success: false, error: '창고 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}