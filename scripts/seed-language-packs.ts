import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const adminLanguagePacks = [
  // Dashboard
  { key: 'admin.menu.dashboard', value: '대시보드', category: 'menu' },
  { key: 'admin.menu.products', value: '상품 관리', category: 'menu' },
  { key: 'admin.menu.categories', value: '카테고리', category: 'menu' },
  { key: 'admin.menu.orders', value: '주문 관리', category: 'menu' },
  { key: 'admin.menu.users', value: '사용자 관리', category: 'menu' },
  { key: 'admin.menu.payments', value: '결제 관리', category: 'menu' },
  { key: 'admin.menu.reviews', value: '리뷰 관리', category: 'menu' },
  { key: 'admin.menu.coupons', value: '쿠폰 관리', category: 'menu' },
  { key: 'admin.menu.analytics', value: '통계 분석', category: 'menu' },
  { key: 'admin.menu.notifications', value: '알림 관리', category: 'menu' },
  { key: 'admin.menu.ui_config', value: 'UI 설정', category: 'menu' },
  { key: 'admin.menu.settings', value: '시스템 설정', category: 'menu' },

  // Actions
  { key: 'admin.action.logout', value: '로그아웃', category: 'action' },
  { key: 'admin.action.login', value: '로그인', category: 'action' },
  { key: 'admin.action.save', value: '저장', category: 'action' },
  { key: 'admin.action.cancel', value: '취소', category: 'action' },
  { key: 'admin.action.delete', value: '삭제', category: 'action' },
  { key: 'admin.action.edit', value: '편집', category: 'action' },
  { key: 'admin.action.create', value: '생성', category: 'action' },
  { key: 'admin.action.update', value: '업데이트', category: 'action' },

  // Labels
  { key: 'admin.label.admin', value: '관리자', category: 'label' },
  { key: 'admin.label.user', value: '사용자', category: 'label' },
  { key: 'admin.label.loading', value: '로딩 중...', category: 'label' },
  { key: 'admin.label.name', value: '이름', category: 'label' },
  { key: 'admin.label.email', value: '이메일', category: 'label' },
  { key: 'admin.label.status', value: '상태', category: 'label' },
  { key: 'admin.label.created', value: '생성일', category: 'label' },
  { key: 'admin.label.updated', value: '수정일', category: 'label' },

  // Messages
  { key: 'admin.message.success', value: '성공적으로 처리되었습니다', category: 'message' },
  { key: 'admin.message.error', value: '오류가 발생했습니다', category: 'message' },
  { key: 'admin.message.confirm_delete', value: '정말로 삭제하시겠습니까?', category: 'message' },
  { key: 'admin.message.no_data', value: '데이터가 없습니다', category: 'message' },

  // Status
  { key: 'admin.status.active', value: '활성', category: 'status' },
  { key: 'admin.status.inactive', value: '비활성', category: 'status' },
  { key: 'admin.status.pending', value: '대기중', category: 'status' },
  { key: 'admin.status.completed', value: '완료', category: 'status' },
  { key: 'admin.status.cancelled', value: '취소', category: 'status' },

  // Products
  { key: 'admin.product.title', value: '제목', category: 'product' },
  { key: 'admin.product.description', value: '설명', category: 'product' },
  { key: 'admin.product.price', value: '가격', category: 'product' },
  { key: 'admin.product.stock', value: '재고', category: 'product' },
  { key: 'admin.product.category', value: '카테고리', category: 'product' },
  { key: 'admin.product.image', value: '이미지', category: 'product' },

  // Orders
  { key: 'admin.order.number', value: '주문번호', category: 'order' },
  { key: 'admin.order.customer', value: '고객', category: 'order' },
  { key: 'admin.order.total', value: '총액', category: 'order' },
  { key: 'admin.order.status', value: '주문상태', category: 'order' },
  { key: 'admin.order.date', value: '주문일', category: 'order' }
]

async function main() {
  console.log('🌱 Seeding admin language packs...')

  try {
    for (const pack of adminLanguagePacks) {
      await prisma.languagePack.upsert({
        where: {
          languageCode_namespace_key: {
            languageCode: 'ko',
            namespace: 'admin',
            key: pack.key
          }
        },
        update: {
          value: pack.value,
          category: pack.category,
          version: 1
        },
        create: {
          languageCode: 'ko',
          namespace: 'admin',
          key: pack.key,
          value: pack.value,
          category: pack.category,
          isActive: true,
          version: 1
        }
      })
    }

    console.log(`✅ Successfully seeded ${adminLanguagePacks.length} admin language packs`)
  } catch (error) {
    console.error('❌ Error seeding language packs:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })