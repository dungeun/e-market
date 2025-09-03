const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function addAdditionalTranslations() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'commerce_plugin',
    user: 'postgres',
    password: 'postgres'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const translations = [
      // Additional categories
      {
        key: 'category.tech',
        namespace: 'ui',
        translations: {
          ko: '테크',
          en: 'Tech',
          jp: 'テック'
        }
      },
      {
        key: 'category.lifestyle',
        namespace: 'ui',
        translations: {
          ko: '라이프스타일',
          en: 'Lifestyle',
          jp: 'ライフスタイル'
        }
      },
      {
        key: 'category.game',
        namespace: 'ui',
        translations: {
          ko: '게임',
          en: 'Gaming',
          jp: 'ゲーム'
        }
      },
      {
        key: 'category.education',
        namespace: 'ui',
        translations: {
          ko: '교육',
          en: 'Education',
          jp: '教育'
        }
      }
    ];

    // 각 번역을 데이터베이스에 추가
    for (const trans of translations) {
      console.log(`Adding translation: ${trans.key}`);
      
      // 각 언어별로 레코드 생성
      for (const [langCode, value] of Object.entries(trans.translations)) {
        const actualLangCode = langCode === 'jp' ? 'jp' : langCode;
        
        // 기존 레코드 확인
        const checkResult = await client.query(
          `SELECT id FROM language_packs 
           WHERE namespace = $1 AND key = $2 AND "languageCode" = $3`,
          [trans.namespace, trans.key, actualLangCode]
        );

        if (checkResult.rows.length === 0) {
          // 새 레코드 추가
          await client.query(
            `INSERT INTO language_packs 
             (id, "languageCode", namespace, key, value, category, description, "isActive", version, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
            [
              uuidv4(),
              actualLangCode,
              trans.namespace,
              trans.key,
              value,
              trans.namespace,
              `Translation for ${trans.key}`,
              true,
              1
            ]
          );
          console.log(`  Added ${actualLangCode}: ${value}`);
        } else {
          // 기존 레코드 업데이트
          await client.query(
            `UPDATE language_packs 
             SET value = $1, "updatedAt" = NOW()
             WHERE namespace = $2 AND key = $3 AND "languageCode" = $4`,
            [value, trans.namespace, trans.key, actualLangCode]
          );
          console.log(`  Updated ${actualLangCode}: ${value}`);
        }
      }
    }

    console.log('\n✅ All additional translations added successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

addAdditionalTranslations();