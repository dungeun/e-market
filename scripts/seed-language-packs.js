const { Pool } = require('pg');

// 환경변수에서 데이터베이스 URL 가져오기
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/commerce_plugin';

const pool = new Pool({
  connectionString: connectionString,
});

const heroLanguagePacks = [
  // Slide 2
  { namespace: 'hero', key: 'slide2.title', languageCode: 'ko', value: '브랜드 성장을 위한\n완벽한 솔루션' },
  { namespace: 'hero', key: 'slide2.title', languageCode: 'en', value: 'Perfect Solution\nfor Brand Growth' },
  { namespace: 'hero', key: 'slide2.subtitle', languageCode: 'ko', value: '데이터 기반의 스마트한 마케팅 전략으로 비즈니스를 성장시키세요' },
  { namespace: 'hero', key: 'slide2.subtitle', languageCode: 'en', value: 'Grow your business with data-driven smart marketing strategies' },

  // Slide 3
  { namespace: 'hero', key: 'slide3.title', languageCode: 'ko', value: '실시간 분석으로\n더 나은 결과를' },
  { namespace: 'hero', key: 'slide3.title', languageCode: 'en', value: 'Better Results with\nReal-time Analytics' },
  { namespace: 'hero', key: 'slide3.subtitle', languageCode: 'ko', value: '캠페인 성과를 실시간으로 모니터링하고 최적화하세요' },
  { namespace: 'hero', key: 'slide3.subtitle', languageCode: 'en', value: 'Monitor and optimize your campaign performance in real-time' },

  // Slide 4
  { namespace: 'hero', key: 'slide4.tag', languageCode: 'ko', value: '🎯 추천' },
  { namespace: 'hero', key: 'slide4.tag', languageCode: 'en', value: '🎯 Recommended' },
  { namespace: 'hero', key: 'slide4.title', languageCode: 'ko', value: '맞춤형 인플루언서\n매칭 서비스' },
  { namespace: 'hero', key: 'slide4.title', languageCode: 'en', value: 'Customized Influencer\nMatching Service' },
  { namespace: 'hero', key: 'slide4.subtitle', languageCode: 'ko', value: 'AI 기반으로 브랜드에 최적화된 인플루언서를 찾아드립니다' },
  { namespace: 'hero', key: 'slide4.subtitle', languageCode: 'en', value: 'Find the perfect influencers for your brand with AI-powered matching' },

  // Slide 5
  { namespace: 'hero', key: 'slide5.title', languageCode: 'ko', value: '간편한 캠페인\n관리 도구' },
  { namespace: 'hero', key: 'slide5.title', languageCode: 'en', value: 'Simple Campaign\nManagement Tools' },
  { namespace: 'hero', key: 'slide5.subtitle', languageCode: 'ko', value: '직관적인 인터페이스로 캠페인을 쉽게 생성하고 관리하세요' },
  { namespace: 'hero', key: 'slide5.subtitle', languageCode: 'en', value: 'Easily create and manage campaigns with our intuitive interface' },

  // Slide 6
  { namespace: 'hero', key: 'slide6.tag', languageCode: 'ko', value: '💎 프리미엄' },
  { namespace: 'hero', key: 'slide6.tag', languageCode: 'en', value: '💎 Premium' },
  { namespace: 'hero', key: 'slide6.title', languageCode: 'ko', value: '전문가 지원으로\n확실한 성과를' },
  { namespace: 'hero', key: 'slide6.title', languageCode: 'en', value: 'Guaranteed Results\nwith Expert Support' },
  { namespace: 'hero', key: 'slide6.subtitle', languageCode: 'ko', value: '마케팅 전문가의 1:1 컨설팅으로 더욱 확실한 성과를 보장합니다' },
  { namespace: 'hero', key: 'slide6.subtitle', languageCode: 'en', value: 'Get guaranteed results with one-on-one consulting from marketing experts' },

  // Footer translations
  { namespace: 'footer', key: 'service.title', languageCode: 'ko', value: '서비스' },
  { namespace: 'footer', key: 'service.title', languageCode: 'en', value: 'Services' },
  { namespace: 'footer', key: 'service.find_influencers', languageCode: 'ko', value: '인플루언서 찾기' },
  { namespace: 'footer', key: 'service.find_influencers', languageCode: 'en', value: 'Find Influencers' },
  { namespace: 'footer', key: 'service.create_campaign', languageCode: 'ko', value: '캠페인 만들기' },
  { namespace: 'footer', key: 'service.create_campaign', languageCode: 'en', value: 'Create Campaign' },
  
  { namespace: 'footer', key: 'company.title', languageCode: 'ko', value: '회사소개' },
  { namespace: 'footer', key: 'company.title', languageCode: 'en', value: 'Company' },
  { namespace: 'footer', key: 'company.about', languageCode: 'ko', value: '회사소개' },
  { namespace: 'footer', key: 'company.about', languageCode: 'en', value: 'About Us' },
  { namespace: 'footer', key: 'company.contact', languageCode: 'ko', value: '문의하기' },
  { namespace: 'footer', key: 'company.contact', languageCode: 'en', value: 'Contact Us' },
  
  { namespace: 'footer', key: 'legal.title', languageCode: 'ko', value: '법적고지' },
  { namespace: 'footer', key: 'legal.title', languageCode: 'en', value: 'Legal' },
  { namespace: 'footer', key: 'legal.terms', languageCode: 'ko', value: '이용약관' },
  { namespace: 'footer', key: 'legal.terms', languageCode: 'en', value: 'Terms of Service' },
  { namespace: 'footer', key: 'legal.privacy', languageCode: 'ko', value: '개인정보처리방침' },
  { namespace: 'footer', key: 'legal.privacy', languageCode: 'en', value: 'Privacy Policy' },
  
  { namespace: 'footer', key: 'copyright', languageCode: 'ko', value: '© 2024 E-Market Korea. 모든 권리 보유.' },
  { namespace: 'footer', key: 'copyright', languageCode: 'en', value: '© 2024 E-Market Korea. All rights reserved.' },

  // Menu translations
  { namespace: 'menu', key: 'login', languageCode: 'ko', value: '로그인' },
  { namespace: 'menu', key: 'login', languageCode: 'en', value: 'Login' },
  { namespace: 'menu', key: 'signup', languageCode: 'ko', value: '회원가입' },
  { namespace: 'menu', key: 'signup', languageCode: 'en', value: 'Sign Up' },
  
  { namespace: 'language', key: 'selector.label', languageCode: 'ko', value: '언어 선택' },
  { namespace: 'language', key: 'selector.label', languageCode: 'en', value: 'Language' }
];

async function seedLanguagePacks() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 언어팩 데이터 추가 시작...');
    
    for (const pack of heroLanguagePacks) {
      // 기존 데이터가 있는지 확인
      const existing = await client.query(`
        SELECT id FROM language_packs 
        WHERE namespace = $1 AND key = $2 AND "languageCode" = $3
      `, [pack.namespace, pack.key, pack.languageCode]);
      
      if (existing.rows.length === 0) {
        // 새 데이터 삽입
        await client.query(`
          INSERT INTO language_packs (namespace, key, "languageCode", value)
          VALUES ($1, $2, $3, $4)
        `, [pack.namespace, pack.key, pack.languageCode, pack.value]);
        
        console.log(`✅ 추가됨: ${pack.namespace}.${pack.key} (${pack.languageCode}) = ${pack.value}`);
      } else {
        console.log(`⏭️  이미 존재: ${pack.namespace}.${pack.key} (${pack.languageCode})`);
      }
    }
    
    console.log('🎉 언어팩 데이터 추가 완료!');
    
    // 결과 확인
    const result = await client.query(`
      SELECT namespace, COUNT(*) as count 
      FROM language_packs 
      GROUP BY namespace 
      ORDER BY namespace
    `);
    
    console.log('\n📊 현재 언어팩 현황:');
    result.rows.forEach(row => {
      console.log(`  ${row.namespace}: ${row.count}개`);
    });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedLanguagePacks();