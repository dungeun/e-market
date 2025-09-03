const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// PostgreSQL 연결 설정
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'commerce_plugin',
  user: process.env.DATABASE_USER || 'admin',
  password: process.env.DATABASE_PASSWORD || 'admin123'
});

async function addSectionTranslations() {
  const client = await pool.connect();
  
  try {
    console.log('Adding section translation keys...');
    
    // 섹션 관련 번역 키 추가
    const translations = [
      // Hero Section
      {
        key: 'section.hero.viewMore',
        namespace: 'common',
        translations: {
          ko: '자세히 보기',
          en: 'View More',
          jp: '詳細を見る'
        },
        category: 'section',
        description: '히어로 섹션 버튼 텍스트'
      },
      // Category Section
      {
        key: 'section.category.title',
        namespace: 'common',
        translations: {
          ko: '카테고리',
          en: 'Categories',
          jp: 'カテゴリー'
        },
        category: 'section',
        description: '카테고리 섹션 제목'
      },
      {
        key: 'section.category.description',
        namespace: 'common',
        translations: {
          ko: '원하는 카테고리를 선택하세요',
          en: 'Choose your desired category',
          jp: 'ご希望のカテゴリーをお選びください'
        },
        category: 'section',
        description: '카테고리 섹션 설명'
      }
    ];
    
    for (const trans of translations) {
      // 각 언어별로 레코드 생성
      for (const [langCode, value] of Object.entries(trans.translations)) {
        const id = uuidv4();
        
        // 기존 키가 있는지 확인
        const existingResult = await client.query(
          'SELECT id FROM language_packs WHERE "languageCode" = $1 AND namespace = $2 AND key = $3',
          [langCode, trans.namespace, trans.key]
        );
        
        if (existingResult.rows.length > 0) {
          // 업데이트
          await client.query(
            `UPDATE language_packs 
             SET value = $1, category = $2, description = $3, "updatedAt" = NOW()
             WHERE "languageCode" = $4 AND namespace = $5 AND key = $6`,
            [value, trans.category, trans.description, langCode, trans.namespace, trans.key]
          );
          console.log(`Updated: ${trans.key} (${langCode})`);
        } else {
          // 새로 추가
          await client.query(
            `INSERT INTO language_packs 
             (id, "languageCode", namespace, key, value, category, description, "isActive", version, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
            [id, langCode, trans.namespace, trans.key, value, trans.category, trans.description, true, 1]
          );
          console.log(`Added: ${trans.key} (${langCode})`);
        }
      }
    }
    
    console.log('Section translations added successfully!');
  } catch (error) {
    console.error('Error adding translations:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addSectionTranslations();