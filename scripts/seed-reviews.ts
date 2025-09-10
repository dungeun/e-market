import { getDrizzle } from '../lib/db'
import { reviews, reviewStatus, products, users } from '../drizzle/migrations/schema'
import { eq } from 'drizzle-orm'

async function seedReviews() {
  try {
    console.log('Using DATABASE_URL:', process.env.DATABASE_URL)
    const db = getDrizzle()
    
    console.log('Creating reviews table...')
    
    // Create the reviews table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id varchar(50) PRIMARY KEY DEFAULT ('REV-' || UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex'), 1, 8))),
        product_id varchar(50) NOT NULL,
        product_name varchar(255) NOT NULL,
        user_id varchar(50),
        customer_name varchar(100) NOT NULL,
        customer_email varchar(255),
        rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title varchar(200) NOT NULL,
        content text NOT NULL,
        images jsonb DEFAULT '[]',
        helpful integer DEFAULT 0,
        status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'flagged', 'rejected')),
        verified boolean DEFAULT false,
        reply text,
        reply_date timestamp,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create indexes
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews (product_id)`)
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews (status)`)
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews (rating)`)
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC)`)
    
    console.log('Inserting sample review data...')
    
    // First, create categories if they don't exist
    await db.execute(`
      INSERT INTO categories (id, name, slug, description, level, path) 
      VALUES 
        ('electronics', '전자제품', 'electronics', '전자제품 카테고리', 0, '/electronics'),
        ('accessories', '액세서리', 'accessories', '액세서리 카테고리', 0, '/accessories')
      ON CONFLICT (id) DO NOTHING
    `)
    
    // Get some sample products to reference - use existing products if available, otherwise create new ones
    const existingProducts = await db.execute(`SELECT id, name FROM products LIMIT 5`)
    
    let productData = []
    if (existingProducts.rows.length >= 5) {
      // Use existing products
      productData = existingProducts.rows.slice(0, 5).map((row: any) => ({ id: row.id, name: row.name }))
      console.log('Using existing products:', productData)
    } else {
      // Create sample products
      await db.execute(`
        INSERT INTO products (id, name, slug, description, price, category_id, stock, status) 
        VALUES 
          ('PROD-001', '무선 이어폰 Pro', 'wireless-earphones-pro', '고품질 무선 이어폰', 150000, 'electronics', 50, 'ACTIVE'),
          ('PROD-002', '스마트 워치 Series 5', 'smart-watch-series-5', '최신 스마트 워치', 300000, 'electronics', 30, 'ACTIVE'),
          ('PROD-003', '노트북 스탠드', 'laptop-stand', '인체공학적 노트북 스탠드', 45000, 'accessories', 100, 'ACTIVE'),
          ('PROD-004', 'USB-C 허브', 'usb-c-hub', '다기능 USB-C 허브', 75000, 'accessories', 80, 'ACTIVE'),
          ('PROD-005', '블루투스 키보드', 'bluetooth-keyboard', '무선 블루투스 키보드', 120000, 'accessories', 60, 'ACTIVE')
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          price = EXCLUDED.price
      `)
      
      productData = [
        { id: 'PROD-001', name: '무선 이어폰 Pro' },
        { id: 'PROD-002', name: '스마트 워치 Series 5' },
        { id: 'PROD-003', name: '노트북 스탠드' },
        { id: 'PROD-004', name: 'USB-C 허브' },
        { id: 'PROD-005', name: '블루투스 키보드' }
      ]
    }

    // Insert sample users
    await db.execute(`
      INSERT INTO users (id, email, password, name, type, role) 
      VALUES 
        ('USER-001', 'kim@example.com', '$2a$10$dummy', '김철수', 'customer', 'user'),
        ('USER-002', 'lee@example.com', '$2a$10$dummy', '이영희', 'customer', 'user'),
        ('USER-003', 'park@example.com', '$2a$10$dummy', '박민수', 'customer', 'user'),
        ('USER-004', 'jung@example.com', '$2a$10$dummy', '정수진', 'customer', 'user'),
        ('USER-005', 'choi@example.com', '$2a$10$dummy', '최동현', 'customer', 'user')
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name
    `)
    
    // Insert sample reviews using available products
    const sampleReviews = [
      {
        productId: productData[0].id,
        productName: productData[0].name,
        userId: 'USER-001',
        customerName: '김철수',
        customerEmail: 'kim@example.com',
        rating: 5,
        title: '정말 만족스러운 제품입니다',
        content: '품질이 정말 좋고 기능도 훌륭합니다. 가격 대비 만족도가 높아요.',
        helpful: 23,
        status: 'approved',
        verified: true
      },
      {
        productId: productData[1] ? productData[1].id : productData[0].id,
        productName: productData[1] ? productData[1].name : productData[0].name,
        userId: 'USER-002',
        customerName: '이영희',
        customerEmail: 'lee@example.com',
        rating: 4,
        title: '대체로 만족합니다',
        content: '기능은 다양하고 좋은데 사용법을 익히는데 시간이 좀 걸렸어요. 그래도 유용하게 잘 쓰고 있습니다.',
        helpful: 15,
        status: 'approved',
        verified: true,
        reply: '소중한 리뷰 감사합니다. 사용법 관련 피드백은 다음 제품 개선에 반영하겠습니다.'
      },
      {
        productId: productData[2] ? productData[2].id : productData[0].id,
        productName: productData[2] ? productData[2].name : productData[0].name,
        userId: 'USER-003',
        customerName: '박민수',
        customerEmail: 'park@example.com',
        rating: 2,
        title: '기대에 못 미치네요',
        content: '품질이 생각만큼 좋지 않아서 아쉽습니다. 가격 대비 품질이 좀 더 개선되면 좋겠어요.',
        helpful: 8,
        status: 'pending',
        verified: false
      },
      {
        productId: productData[3] ? productData[3].id : productData[0].id,
        productName: productData[3] ? productData[3].name : productData[0].name,
        userId: 'USER-004',
        customerName: '정수진',
        customerEmail: 'jung@example.com',
        rating: 5,
        title: '필수 아이템!',
        content: '정말 유용한 제품입니다. 디자인도 깔끔하고 성능도 만족스러워요.',
        helpful: 34,
        status: 'approved',
        verified: true
      },
      {
        productId: productData[4] ? productData[4].id : productData[0].id,
        productName: productData[4] ? productData[4].name : productData[0].name,
        userId: 'USER-005',
        customerName: '최동현',
        customerEmail: 'choi@example.com',
        rating: 1,
        title: '불량 제품인 것 같습니다',
        content: '제대로 작동하지 않아서 불편합니다. 환불 요청합니다.',
        images: '[]',
        helpful: 2,
        status: 'flagged',
        verified: true
      },
      {
        productId: productData[0].id,
        productName: productData[0].name,
        userId: 'USER-003',
        customerName: '박지현',
        customerEmail: 'park.ji@example.com',
        rating: 4,
        title: '가성비 좋아요',
        content: '이 가격에 이 정도 품질이면 만족합니다. 전체적으로 괜찮네요.',
        helpful: 12,
        status: 'approved',
        verified: true
      },
      {
        productId: productData[1] ? productData[1].id : productData[0].id,
        productName: productData[1] ? productData[1].name : productData[0].name,
        userId: 'USER-001',
        customerName: '김민수',
        customerEmail: 'kim.min@example.com',
        rating: 3,
        title: '보통이에요',
        content: '기능은 많은데 좀 더 직관적이면 좋겠습니다.',
        helpful: 7,
        status: 'approved',
        verified: false
      },
      {
        productId: productData[2] ? productData[2].id : productData[0].id,
        productName: productData[2] ? productData[2].name : productData[0].name,
        userId: 'USER-002',
        customerName: '이수연',
        customerEmail: 'lee.sy@example.com',
        rating: 5,
        title: '완벽한 제품',
        content: '모든 기능이 정상 작동하고 디자인도 깔끔합니다. 추천해요!',
        helpful: 28,
        status: 'approved',
        verified: true
      }
    ]
    
    for (const review of sampleReviews) {
      await db.execute(`
        INSERT INTO reviews (
          product_id, product_name, user_id, customer_name, customer_email,
          rating, title, content, images, helpful, status, verified, reply
        ) VALUES (
          '${review.productId}', '${review.productName}', '${review.userId}',
          '${review.customerName}', '${review.customerEmail}', ${review.rating},
          '${review.title}', '${review.content}', '[]', ${review.helpful},
          '${review.status}', ${review.verified}, ${review.reply ? `'${review.reply}'` : 'NULL'}
        )
      `)
    }
    
    console.log('✅ Sample reviews data inserted successfully!')
    console.log('Reviews table created and populated with sample data.')
    
  } catch (error) {
    console.error('❌ Error seeding reviews:', error)
    throw error
  }
}

// Run the seed function
seedReviews()
  .then(() => {
    console.log('Seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })