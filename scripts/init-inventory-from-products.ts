// 기존 상품들에 대해 재고 데이터를 초기화하는 스크립트
import { getDrizzle, connect } from '@/lib/db'
import { products, inventory, inventoryTransactions } from '@/drizzle/migrations/schema'
import { sql, eq } from 'drizzle-orm'

interface ProductData {
  id: string
  name: string
  stock: number
}

// 기본 재고 설정값들
const DEFAULT_MIN_STOCK = 10
const DEFAULT_MAX_STOCK = 1000
const DEFAULT_REORDER_POINT = 20

// 위치 배열 (예시)
const LOCATIONS = ['A-01-1', 'A-01-2', 'B-02-1', 'B-02-2', 'C-03-1', 'C-03-2', 'D-04-1', 'D-04-2']

// 랜덤 위치 선택
function getRandomLocation(): string {
  return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
}

// 재고 상태 계산
function calculateStatus(currentStock: number, minStock: number, reorderPoint: number): string {
  if (currentStock <= 0) return 'out-of-stock'
  if (currentStock <= reorderPoint) return 'critical'
  if (currentStock <= minStock) return 'low'
  return 'optimal'
}

async function initInventoryFromProducts() {
  try {
    console.log('🚀 기존 상품들의 재고 데이터 초기화를 시작합니다...')

    // 데이터베이스 연결
    await connect()
    const db = getDrizzle()

    // 기존 상품들 조회
    const existingProducts = await db
      .select({
        id: products.id,
        name: products.name,
        stock: products.stock,
      })
      .from(products)

    console.log(`📦 ${existingProducts.length}개의 상품을 발견했습니다.`)

    if (existingProducts.length === 0) {
      console.log('⚠️  등록된 상품이 없습니다.')
      return
    }

    let createdCount = 0
    let skippedCount = 0

    for (const product of existingProducts) {
      try {
        // 이미 재고가 등록된 상품인지 확인
        const existingInventory = await db
          .select()
          .from(inventory)
          .where(eq(inventory.productId, product.id))
          .limit(1)

        if (existingInventory.length > 0) {
          console.log(`⏭️  ${product.name} - 이미 재고가 등록됨`)
          skippedCount++
          continue
        }

        // 기본값 설정
        const currentStock = product.stock || 0
        const minStock = Math.max(DEFAULT_MIN_STOCK, Math.floor(currentStock * 0.2))
        const maxStock = Math.max(DEFAULT_MAX_STOCK, currentStock * 5)
        const reorderPoint = Math.max(DEFAULT_REORDER_POINT, Math.floor(currentStock * 0.3))
        const location = getRandomLocation()
        const status = calculateStatus(currentStock, minStock, reorderPoint)

        // 재고 데이터 생성
        const [newInventory] = await db
          .insert(inventory)
          .values({
            productId: product.id,
            currentStock,
            minStock,
            maxStock,
            reorderPoint,
            location,
            status,
            reservedStock: 0,
          })
          .returning()

        // 초기 재고 트랜잭션 기록
        if (currentStock > 0) {
          await db
            .insert(inventoryTransactions)
            .values({
              inventoryId: newInventory.id,
              productId: product.id,
              transactionType: 'adjustment',
              quantityChange: currentStock,
              quantityBefore: 0,
              quantityAfter: currentStock,
              reason: '초기 재고 설정',
              userId: 'system',
              notes: '기존 상품에서 재고 데이터 마이그레이션',
            })
        }

        console.log(`✅ ${product.name} - 재고 ${currentStock}개 등록됨 (상태: ${status})`)
        createdCount++

      } catch (error) {
        console.error(`❌ ${product.name} 재고 등록 실패:`, error)
      }
    }

    console.log('\n📊 재고 초기화 완료 요약:')
    console.log(`   ✅ 성공: ${createdCount}개`)
    console.log(`   ⏭️  건너뜀: ${skippedCount}개`)
    console.log(`   📦 총 상품: ${existingProducts.length}개`)

    // 재고 상태별 통계
    const stats = await db
      .select({
        status: inventory.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(inventory)
      .groupBy(inventory.status)

    console.log('\n📈 재고 상태 통계:')
    for (const stat of stats) {
      const label = {
        'optimal': '최적',
        'low': '부족',
        'critical': '긴급',
        'out-of-stock': '품절'
      }[stat.status] || stat.status
      
      console.log(`   ${label}: ${stat.count}개`)
    }

  } catch (error) {
    console.error('❌ 재고 초기화 중 오류 발생:', error)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  initInventoryFromProducts()
    .then(() => {
      console.log('\n🎉 재고 초기화가 완료되었습니다!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('스크립트 실행 오류:', error)
      process.exit(1)
    })
}