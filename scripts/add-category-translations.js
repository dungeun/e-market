const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/commerce_plugin'
});

async function addCategoryTranslations() {
  const categoryTranslations = [
    {
      key: 'beauty',
      namespace: 'category',
      translations: {
        ko: '뷰티',
        en: 'Beauty',
        jp: 'ビューティー'
      }
    },
    {
      key: 'electronics',
      namespace: 'category',
      translations: {
        ko: '전자제품',
        en: 'Electronics',
        jp: '電子製品'
      }
    },
    {
      key: 'food',
      namespace: 'category',
      translations: {
        ko: '식품',
        en: 'Food',
        jp: '食品'
      }
    },
    {
      key: 'travel',
      namespace: 'category',
      translations: {
        ko: '여행',
        en: 'Travel',
        jp: '旅行'
      }
    },
    {
      key: 'fashion',
      namespace: 'category',
      translations: {
        ko: '패션',
        en: 'Fashion',
        jp: 'ファッション'
      }
    },
    {
      key: 'sports',
      namespace: 'category',
      translations: {
        ko: '스포츠',
        en: 'Sports',
        jp: 'スポーツ'
      }
    },
    {
      key: 'lifestyle',
      namespace: 'category',
      translations: {
        ko: '라이프스타일',
        en: 'Lifestyle',
        jp: 'ライフスタイル'
      }
    },
    {
      key: 'health',
      namespace: 'category',
      translations: {
        ko: '건강',
        en: 'Health',
        jp: '健康'
      }
    },
    {
      key: 'baby',
      namespace: 'category',
      translations: {
        ko: '육아',
        en: 'Baby & Kids',
        jp: '育児'
      }
    },
    {
      key: 'game',
      namespace: 'category',
      translations: {
        ko: '게임',
        en: 'Gaming',
        jp: 'ゲーム'
      }
    },
    {
      key: 'insurance',
      namespace: 'category',
      translations: {
        ko: '보험',
        en: 'Insurance',
        jp: '保険'
      }
    },
    {
      key: 'cart',
      namespace: 'category',
      translations: {
        ko: '쇼핑',
        en: 'Shopping',
        jp: 'ショッピング'
      }
    },
    {
      key: 'warning',
      namespace: 'category',
      translations: {
        ko: '주의사항',
        en: 'Warnings',
        jp: '注意事項'
      }
    },
    {
      key: 'mobile',
      namespace: 'category',
      translations: {
        ko: '모바일',
        en: 'Mobile',
        jp: 'モバイル'
      }
    },
    {
      key: 'book',
      namespace: 'category',
      translations: {
        ko: '도서',
        en: 'Books',
        jp: '書籍'
      }
    },
    {
      key: 'home',
      namespace: 'category',
      translations: {
        ko: '홈/리빙',
        en: 'Home & Living',
        jp: 'ホーム＆リビング'
      }
    }
  ];

  console.log('🌐 Adding category translations to database...');

  try {
    // 트랜잭션 시작
    await pool.query('BEGIN');

    for (const item of categoryTranslations) {
      // 각 언어별로 별도의 레코드 삽입
      for (const [langCode, value] of Object.entries(item.translations)) {
        const id = `${langCode}_${item.namespace}_${item.key}`;
        const query = `
          INSERT INTO language_packs (id, "languageCode", namespace, key, value, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          ON CONFLICT (id) 
          DO UPDATE SET 
            value = $5,
            "updatedAt" = NOW()
        `;

        await pool.query(query, [
          id,
          langCode,
          item.namespace,
          item.key,
          value
        ]);

        console.log(`✅ Added/Updated: ${langCode}.${item.namespace}.${item.key} = ${value}`);
      }
    }

    // 트랜잭션 커밋
    await pool.query('COMMIT');
    
    console.log('\n✅ All category translations added successfully!');
    
    // 확인
    const result = await pool.query(`
      SELECT key, translations 
      FROM language_packs 
      WHERE namespace = 'category'
      ORDER BY key
    `);
    
    console.log('\n📋 Current category translations:');
    result.rows.forEach(row => {
      console.log(`${row.key}: ${JSON.stringify(row.translations)}`);
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error adding category translations:', error);
  } finally {
    await pool.end();
  }
}

addCategoryTranslations().catch(console.error);