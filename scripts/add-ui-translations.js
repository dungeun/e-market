const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function addUITranslations() {
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
      // Categories
      {
        key: 'category.beauty',
        namespace: 'ui',
        translations: {
          ko: '뷰티',
          en: 'Beauty',
          jp: 'ビューティー'
        }
      },
      {
        key: 'category.electronics',
        namespace: 'ui',
        translations: {
          ko: '전자제품',
          en: 'Electronics',
          jp: '電子製品'
        }
      },
      {
        key: 'category.food',
        namespace: 'ui',
        translations: {
          ko: '맛집',
          en: 'Food',
          jp: 'グルメ'
        }
      },
      {
        key: 'category.travel',
        namespace: 'ui',
        translations: {
          ko: '여행',
          en: 'Travel',
          jp: '旅行'
        }
      },
      {
        key: 'category.sports',
        namespace: 'ui',
        translations: {
          ko: '스포츠',
          en: 'Sports',
          jp: 'スポーツ'
        }
      },
      {
        key: 'category.health',
        namespace: 'ui',
        translations: {
          ko: '건강',
          en: 'Health',
          jp: '健康'
        }
      },
      {
        key: 'category.baby',
        namespace: 'ui',
        translations: {
          ko: '육아',
          en: 'Baby & Kids',
          jp: '育児'
        }
      },
      {
        key: 'category.pet',
        namespace: 'ui',
        translations: {
          ko: '펫',
          en: 'Pet',
          jp: 'ペット'
        }
      },
      {
        key: 'category.digital',
        namespace: 'ui',
        translations: {
          ko: '디지털',
          en: 'Digital',
          jp: 'デジタル'
        }
      },
      {
        key: 'category.culture',
        namespace: 'ui',
        translations: {
          ko: '문화',
          en: 'Culture',
          jp: '文化'
        }
      },
      // Quick Links
      {
        key: 'quicklink.events',
        namespace: 'ui',
        translations: {
          ko: '이벤트',
          en: 'Events',
          jp: 'イベント'
        }
      },
      {
        key: 'quicklink.coupons',
        namespace: 'ui',
        translations: {
          ko: '쿠폰',
          en: 'Coupons',
          jp: 'クーポン'
        }
      },
      {
        key: 'quicklink.ranking',
        namespace: 'ui',
        translations: {
          ko: '랭킹',
          en: 'Ranking',
          jp: 'ランキング'
        }
      },
      // Section Titles
      {
        key: 'section.hero.title',
        namespace: 'ui',
        translations: {
          ko: '새 슬라이드',
          en: 'New Slide',
          jp: '新しいスライド'
        }
      },
      {
        key: 'section.hero.subtitle',
        namespace: 'ui',
        translations: {
          ko: '슬라이드 부제목',
          en: 'Slide Subtitle',
          jp: 'スライドサブタイトル'
        }
      },
      {
        key: 'section.category.title',
        namespace: 'ui',
        translations: {
          ko: '데이터베이스 수정 환영',
          en: 'Database Edit Welcome',
          jp: 'データベース編集歓迎'
        }
      },
      {
        key: 'section.category.subtitle',
        namespace: 'ui',
        translations: {
          ko: 'Make your experience',
          en: 'Make your experience',
          jp: 'Make your experience'
        }
      },
      {
        key: 'section.activecampaigns',
        namespace: 'ui',
        translations: {
          ko: '진행중인 캠페인',
          en: 'Active Campaigns',
          jp: '進行中のキャンペーン'
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
          [trans.namespace, trans.key.split('.').slice(-1)[0], actualLangCode]
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

    console.log('\n✅ All UI translations added successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

addUITranslations();