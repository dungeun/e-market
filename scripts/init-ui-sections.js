const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin',
  database: 'commerce_plugin'
});

async function initUISections() {
  const client = await pool.connect();
  
  try {
    // ui_sections 테이블에 컬럼 추가
    await client.query(`
      ALTER TABLE ui_sections 
      ADD COLUMN IF NOT EXISTS key VARCHAR(255),
      ADD COLUMN IF NOT EXISTS title VARCHAR(255),
      ADD COLUMN IF NOT EXISTS data JSONB,
      ADD COLUMN IF NOT EXISTS translations JSONB
    `);
    
    console.log('✓ Added missing columns to ui_sections table');
    
    // hero 섹션 데이터 확인
    const checkResult = await client.query(`
      SELECT * FROM ui_sections 
      WHERE type = 'hero' OR key = 'hero'
      LIMIT 1
    `);
    
    if (checkResult.rows.length === 0) {
      // hero 섹션 추가
      await client.query(`
        INSERT INTO ui_sections (name, type, key, title, "order", "isActive", config, data, translations)
        VALUES (
          'Hero Banner',
          'hero',
          'hero',
          '히어로 배너',
          1,
          true,
          '{"autoPlay": true, "duration": 5000}'::jsonb,
          '{
            "slides": [
              {
                "id": "1",
                "title": "특별한 혜택",
                "subtitle": "지금 바로 만나보세요",
                "tag": "🔥 HOT",
                "link": "/products",
                "bgColor": "bg-gradient-to-br from-indigo-600 to-purple-600",
                "visible": true,
                "order": 1
              },
              {
                "id": "2", 
                "title": "신상품 출시",
                "subtitle": "최신 트렌드를 만나보세요",
                "tag": "NEW",
                "link": "/products?filter=new",
                "bgColor": "bg-gradient-to-br from-blue-600 to-cyan-600",
                "visible": true,
                "order": 2
              }
            ]
          }'::jsonb,
          '{}'::jsonb
        )
      `);
      
      console.log('✓ Added hero section data');
    } else {
      console.log('✓ Hero section already exists');
    }
    
    // 다른 기본 섹션들도 추가
    const sections = [
      {
        name: 'Category Section',
        type: 'category',
        key: 'category',
        title: '카테고리',
        order: 2,
        data: {
          categories: [
            { id: 1, name: '패션', icon: '👔', link: '/category/fashion' },
            { id: 2, name: '전자기기', icon: '📱', link: '/category/electronics' },
            { id: 3, name: '뷰티', icon: '💄', link: '/category/beauty' },
            { id: 4, name: '홈&리빙', icon: '🏠', link: '/category/home' }
          ]
        }
      },
      {
        name: 'Recommended Section',
        type: 'recommended',
        key: 'recommended',
        title: '추천 상품',
        order: 3,
        data: {
          title: '오늘의 추천 상품',
          subtitle: '특별히 선별한 인기 상품'
        }
      },
      {
        name: 'Ranking Section',
        type: 'ranking',
        key: 'ranking',
        title: '실시간 랭킹',
        order: 4,
        data: {
          title: '실시간 인기 상품',
          subtitle: '지금 가장 많이 찾는 상품'
        }
      }
    ];
    
    for (const section of sections) {
      const checkSectionResult = await client.query(
        `SELECT * FROM ui_sections WHERE key = $1 LIMIT 1`,
        [section.key]
      );
      
      if (checkSectionResult.rows.length === 0) {
        await client.query(
          `INSERT INTO ui_sections (name, type, key, title, "order", "isActive", data, translations)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            section.name,
            section.type,
            section.key,
            section.title,
            section.order,
            true,
            JSON.stringify(section.data),
            '{}'
          ]
        );
        console.log(`✓ Added ${section.key} section`);
      }
    }
    
    console.log('✅ UI sections initialization completed successfully');
    
  } catch (error) {
    console.error('Error initializing UI sections:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initUISections().catch(console.error);