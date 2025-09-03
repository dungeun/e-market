const { Client } = require('pg');

async function addMenuTranslations() {
  const client = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/commerce_plugin?sslmode=disable'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const menuTranslations = [
      {
        key: 'campaigns',
        namespace: 'menu',
        translations: {
          ko: '캠페인',
          en: 'Campaigns',
          jp: 'キャンペーン'
        }
      },
      {
        key: 'influencers',
        namespace: 'menu',
        translations: {
          ko: '인플루언서',
          en: 'Influencers',
          jp: 'インフルエンサー'
        }
      },
      {
        key: 'community',
        namespace: 'menu',
        translations: {
          ko: '커뮤니티',
          en: 'Community',
          jp: 'コミュニティ'
        }
      },
      {
        key: 'pricing',
        namespace: 'menu',
        translations: {
          ko: '가격',
          en: 'Pricing',
          jp: '料金'
        }
      },
      {
        key: 'home',
        namespace: 'menu',
        translations: {
          ko: '홈',
          en: 'Home',
          jp: 'ホーム'
        }
      },
      {
        key: 'login',
        namespace: 'menu',
        translations: {
          ko: '로그인',
          en: 'Login',
          jp: 'ログイン'
        }
      },
      {
        key: 'signup',
        namespace: 'menu',
        translations: {
          ko: '회원가입',
          en: 'Sign Up',
          jp: 'サインアップ'
        }
      },
      {
        key: 'mypage',
        namespace: 'menu',
        translations: {
          ko: '마이페이지',
          en: 'My Page',
          jp: 'マイページ'
        }
      },
      {
        key: 'logout',
        namespace: 'menu',
        translations: {
          ko: '로그아웃',
          en: 'Logout',
          jp: 'ログアウト'
        }
      }
    ];

    // Insert translations for each menu item
    for (const item of menuTranslations) {
      for (const [langCode, value] of Object.entries(item.translations)) {
        const id = `${langCode}_${item.namespace}_${item.key}`;
        
        const query = `
          INSERT INTO language_packs (id, "languageCode", namespace, key, value, "updatedAt")
          VALUES ($1, $2, $3, $4, $5, NOW())
          ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
            value = $5, 
            "updatedAt" = NOW()
        `;
        
        await client.query(query, [id, langCode, item.namespace, item.key, value]);
        console.log(`Added ${item.namespace}.${item.key} [${langCode}]: ${value}`);
      }
    }

    console.log('Menu translations added successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

addMenuTranslations();
