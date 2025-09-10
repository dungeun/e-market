import { db } from '../lib/db'

async function seedB2BData() {
  try {
    console.log('🚀 B2B 데이터 시딩 시작...')

    // 1. 창고 데이터 추가
    console.log('📦 창고 데이터 추가 중...')
    const warehouseData = [
      {
        code: 'WH001',
        name: '서울 중앙 물류센터',
        type: 'general',
        address: '서울특별시 강남구 테헤란로 123',
        postal_code: '06234',
        city: '서울',
        region: '서울',
        capacity: 50000,
        current_stock: 12000,
        manager_name: '김철수',
        phone: '02-1234-5678',
        email: 'seoul@warehouse.com',
        operating_hours: JSON.stringify({
          "mon-fri": "09:00-18:00",
          "sat": "09:00-13:00"
        })
      },
      {
        code: 'WH002',
        name: '경기 북부 물류센터',
        type: 'general',
        address: '경기도 고양시 일산동구 중앙로 456',
        postal_code: '10380',
        city: '고양',
        region: '경기',
        capacity: 75000,
        current_stock: 23000,
        manager_name: '이영희',
        phone: '031-987-6543',
        email: 'gyeonggi@warehouse.com',
        operating_hours: JSON.stringify({
          "mon-fri": "08:00-20:00",
          "sat": "09:00-15:00"
        })
      },
      {
        code: 'WH003',
        name: '부산 냉장 물류센터',
        type: 'cold',
        address: '부산광역시 사하구 감천항로 789',
        postal_code: '49434',
        city: '부산',
        region: '부산',
        capacity: 30000,
        current_stock: 8500,
        manager_name: '박민수',
        phone: '051-555-1234',
        email: 'busan@warehouse.com',
        operating_hours: JSON.stringify({
          "24/7": true
        })
      },
      {
        code: 'WH004',
        name: '인천 국제 물류센터',
        type: 'general',
        address: '인천광역시 중구 공항로 321',
        postal_code: '22382',
        city: '인천',
        region: '인천',
        capacity: 100000,
        current_stock: 45000,
        manager_name: '최대한',
        phone: '032-777-8888',
        email: 'incheon@warehouse.com',
        operating_hours: JSON.stringify({
          "24/7": true
        })
      }
    ]

    for (const warehouse of warehouseData) {
      try {
        await db.query(`
          INSERT INTO warehouses (
            code, name, type, address, postal_code, city, region,
            capacity, current_stock, manager_name, phone, email, operating_hours
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            address = EXCLUDED.address,
            capacity = EXCLUDED.capacity,
            current_stock = EXCLUDED.current_stock,
            updated_at = CURRENT_TIMESTAMP
        `, [
          warehouse.code,
          warehouse.name,
          warehouse.type,
          warehouse.address,
          warehouse.postal_code,
          warehouse.city,
          warehouse.region,
          warehouse.capacity,
          warehouse.current_stock,
          warehouse.manager_name,
          warehouse.phone,
          warehouse.email,
          warehouse.operating_hours
        ])
        console.log(`✅ 창고 추가됨: ${warehouse.name}`)
      } catch (error) {
        console.error(`❌ 창고 추가 실패 ${warehouse.name}:`, error)
      }
    }

    // 2. 입점업체 데이터 추가
    console.log('\n🏢 입점업체 데이터 추가 중...')
    const vendorData = [
      {
        code: 'V001',
        company_name: '삼성패션',
        business_number: '123-45-67890',
        ceo_name: '김대표',
        business_type: 'manufacturer',
        status: 'approved',
        address: '서울시 강남구 삼성로 100',
        postal_code: '06234',
        phone: '02-3333-4444',
        email: 'contact@samsungfashion.com',
        website: 'https://www.samsungfashion.com',
        bank_name: '국민은행',
        bank_account: '123-456-789012',
        account_holder: '삼성패션(주)',
        commission_rate: 15.00,
        settlement_cycle: 30,
        contract_start: '2024-01-01',
        contract_end: '2025-12-31'
      },
      {
        code: 'V002',
        company_name: 'LG뷰티',
        business_number: '234-56-78901',
        ceo_name: '박대표',
        business_type: 'distributor',
        status: 'approved',
        address: '서울시 영등포구 여의대로 200',
        postal_code: '07320',
        phone: '02-5555-6666',
        email: 'info@lgbeauty.com',
        website: 'https://www.lgbeauty.com',
        bank_name: '우리은행',
        bank_account: '234-567-890123',
        account_holder: 'LG뷰티(주)',
        commission_rate: 12.00,
        settlement_cycle: 30,
        contract_start: '2024-01-01',
        contract_end: '2025-12-31'
      },
      {
        code: 'V003',
        company_name: '신세계푸드',
        business_number: '345-67-89012',
        ceo_name: '최대표',
        business_type: 'manufacturer',
        status: 'approved',
        address: '서울시 중구 소공로 300',
        postal_code: '04530',
        phone: '02-7777-8888',
        email: 'sales@shinsegaefood.com',
        website: 'https://www.shinsegaefood.com',
        bank_name: '신한은행',
        bank_account: '345-678-901234',
        account_holder: '신세계푸드(주)',
        commission_rate: 10.00,
        settlement_cycle: 15,
        contract_start: '2024-03-01',
        contract_end: '2025-02-28'
      },
      {
        code: 'V004',
        company_name: '현대백화점',
        business_number: '456-78-90123',
        ceo_name: '정대표',
        business_type: 'retailer',
        status: 'approved',
        address: '서울시 강남구 압구정로 165',
        postal_code: '06001',
        phone: '02-9999-0000',
        email: 'contact@hyundai.com',
        website: 'https://www.hyundai.com',
        bank_name: '하나은행',
        bank_account: '456-789-012345',
        account_holder: '현대백화점(주)',
        commission_rate: 18.00,
        settlement_cycle: 45,
        contract_start: '2024-02-01',
        contract_end: '2026-01-31'
      },
      {
        code: 'V005',
        company_name: '스타트업테크',
        business_number: '567-89-01234',
        ceo_name: '이대표',
        business_type: 'manufacturer',
        status: 'pending',
        address: '서울시 서초구 강남대로 500',
        postal_code: '06521',
        phone: '02-1111-2222',
        email: 'info@startuptech.com',
        website: 'https://www.startuptech.com',
        bank_name: '카카오뱅크',
        bank_account: '567-890-123456',
        account_holder: '스타트업테크(주)',
        commission_rate: 20.00,
        settlement_cycle: 30,
        contract_start: null,
        contract_end: null
      }
    ]

    for (const vendor of vendorData) {
      try {
        const result = await db.query(`
          INSERT INTO vendors (
            code, company_name, business_number, ceo_name, business_type,
            status, address, postal_code, phone, email, website,
            bank_name, bank_account, account_holder,
            commission_rate, settlement_cycle,
            contract_start, contract_end,
            approved_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
            $12, $13, $14, $15, $16, $17, $18,
            ${vendor.status === 'approved' ? 'CURRENT_TIMESTAMP' : 'NULL'}
          )
          ON CONFLICT (code) DO UPDATE SET
            company_name = EXCLUDED.company_name,
            status = EXCLUDED.status,
            updated_at = CURRENT_TIMESTAMP
          RETURNING id
        `, [
          vendor.code,
          vendor.company_name,
          vendor.business_number,
          vendor.ceo_name,
          vendor.business_type,
          vendor.status,
          vendor.address,
          vendor.postal_code,
          vendor.phone,
          vendor.email,
          vendor.website,
          vendor.bank_name,
          vendor.bank_account,
          vendor.account_holder,
          vendor.commission_rate,
          vendor.settlement_cycle,
          vendor.contract_start,
          vendor.contract_end
        ])
        
        console.log(`✅ 입점업체 추가됨: ${vendor.company_name} (${vendor.status})`)
        
        // 입점 신청 레코드 생성 (pending 상태인 경우)
        if (vendor.status === 'pending' && result.rows[0]) {
          await db.query(`
            INSERT INTO vendor_applications (
              vendor_id, application_type, status, submitted_data
            ) VALUES ($1, 'new', 'pending', $2)
            ON CONFLICT DO NOTHING
          `, [
            result.rows[0].id,
            JSON.stringify(vendor)
          ])
          console.log(`  📝 입점 신청 레코드 생성됨`)
        }
      } catch (error) {
        console.error(`❌ 입점업체 추가 실패 ${vendor.company_name}:`, error)
      }
    }

    // 3. 통계 출력
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM warehouses WHERE is_active = true) as total_warehouses,
        (SELECT SUM(capacity) FROM warehouses WHERE is_active = true) as total_capacity,
        (SELECT SUM(current_stock) FROM warehouses WHERE is_active = true) as total_stock,
        (SELECT COUNT(*) FROM vendors WHERE is_active = true) as total_vendors,
        (SELECT COUNT(*) FROM vendors WHERE status = 'approved') as approved_vendors,
        (SELECT COUNT(*) FROM vendors WHERE status = 'pending') as pending_vendors
    `)

    console.log('\n📊 B2B 시스템 현황:')
    console.log('=====================================')
    console.log(`창고: ${stats.rows[0].total_warehouses}개`)
    console.log(`총 용량: ${parseInt(stats.rows[0].total_capacity).toLocaleString()}개`)
    console.log(`현재 재고: ${parseInt(stats.rows[0].total_stock).toLocaleString()}개`)
    console.log(`입점업체: ${stats.rows[0].total_vendors}개`)
    console.log(`  - 승인: ${stats.rows[0].approved_vendors}개`)
    console.log(`  - 대기: ${stats.rows[0].pending_vendors}개`)
    console.log('=====================================')

    console.log('\n✅ B2B 데이터 시딩 완료!')
    process.exit(0)
  } catch (error) {
    console.error('❌ B2B 데이터 시딩 실패:', error)
    process.exit(1)
  }
}

// 실행
seedB2BData()