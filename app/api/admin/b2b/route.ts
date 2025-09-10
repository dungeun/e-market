import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 통계 정보 조회
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM warehouses WHERE is_active = true) as total_warehouses,
        (SELECT SUM(capacity) FROM warehouses WHERE is_active = true) as total_capacity,
        (SELECT SUM(current_stock) FROM warehouses WHERE is_active = true) as total_stock,
        (SELECT COUNT(*) FROM vendors WHERE is_active = true) as total_vendors,
        (SELECT COUNT(*) FROM vendors WHERE status = 'approved' AND is_active = true) as approved_vendors,
        (SELECT COUNT(*) FROM vendors WHERE status = 'pending' AND is_active = true) as pending_vendors
    `
    
    const statsResult = await db.query(statsQuery)
    const stats = statsResult.rows[0]
    
    // 창고 목록 조회
    const warehousesQuery = `
      SELECT 
        id, code, name, type, address, city, region,
        capacity, current_stock, manager_name, phone, email,
        is_active, created_at
      FROM warehouses 
      WHERE is_active = true 
      ORDER BY name ASC
    `
    
    const warehousesResult = await db.query(warehousesQuery)
    
    // 입점업체 목록 조회
    const vendorsQuery = `
      SELECT 
        id, code, company_name, business_number, ceo_name,
        business_type, status, address, phone, email,
        commission_rate, settlement_cycle, contract_start, contract_end,
        is_active, created_at, approved_at
      FROM vendors 
      WHERE is_active = true 
      ORDER BY 
        CASE 
          WHEN status = 'pending' THEN 1
          WHEN status = 'approved' THEN 2
          WHEN status = 'suspended' THEN 3
        END,
        created_at DESC
    `
    
    const vendorsResult = await db.query(vendorsQuery)
    
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          warehouses: parseInt(stats.total_warehouses) || 0,
          capacity: parseInt(stats.total_capacity) || 0,
          stock: parseInt(stats.total_stock) || 0,
          vendors: parseInt(stats.total_vendors) || 0,
          approved: parseInt(stats.approved_vendors) || 0,
          pending: parseInt(stats.pending_vendors) || 0,
          usage: stats.total_capacity > 0 ? 
            Math.round((parseInt(stats.total_stock) / parseInt(stats.total_capacity)) * 100) : 0
        },
        warehouses: warehousesResult.rows,
        vendors: vendorsResult.rows
      }
    })
  } catch (error) {
    console.error('Failed to fetch B2B data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'B2B 데이터를 불러오는데 실패했습니다.',
        data: {
          stats: {
            warehouses: 0,
            capacity: 0,
            stock: 0,
            vendors: 0,
            approved: 0,
            pending: 0,
            usage: 0
          },
          warehouses: [],
          vendors: []
        }
      },
      { status: 500 }
    )
  }
}