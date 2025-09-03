import { query } from './lib/db.js';
import fs from 'fs';
import path from 'path';

(async () => {
  try {
    console.log('=== 현재 히어로 섹션 데이터 전체 점검 ===\n');
    
    // 1. 데이터베이스 확인
    console.log('1. 데이터베이스 (ui_sections) 확인:');
    console.log('=====================================');
    const dbResult = await query(`
      SELECT id, key, type, title, "isActive", data
      FROM ui_sections 
      WHERE type = 'hero' OR key = 'hero'
    `);
    
    if (dbResult.rows.length > 0) {
      const hero = dbResult.rows[0];
      console.log('✅ DB에 hero 섹션 있음');
      console.log('- isActive:', hero.isActive);
      console.log('- Slides 개수:', hero.data?.slides?.length || 0);
      
      if (hero.data?.slides) {
        console.log('\nDB 슬라이드 내용:');
        hero.data.slides.forEach((slide: any, idx: number) => {
          console.log(`\n  슬라이드 ${idx + 1}:`);
          console.log(`    제목: ${JSON.stringify(slide.title)}`);
          console.log(`    부제목: ${JSON.stringify(slide.subtitle)}`);
          console.log(`    visible: ${slide.visible}`);
        });
      }
    } else {
      console.log('❌ DB에 hero 섹션 없음');
    }
    
    // 2. JSON 캐시 파일 확인
    console.log('\n\n2. JSON 캐시 파일 확인:');
    console.log('========================');
    const jsonPath = path.join(process.cwd(), 'public/cache/homepage-unified.json');
    
    if (fs.existsSync(jsonPath)) {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      const heroSection = jsonData.sections?.hero;
      
      if (heroSection) {
        console.log('✅ JSON 파일에 hero 섹션 있음');
        console.log('- visible:', heroSection.visible);
        console.log('- Slides 개수:', heroSection.data?.slides?.length || 0);
        
        if (heroSection.data?.slides) {
          console.log('\nJSON 슬라이드 내용:');
          heroSection.data.slides.forEach((slide: any, idx: number) => {
            console.log(`\n  슬라이드 ${idx + 1}:`);
            console.log(`    제목: ${JSON.stringify(slide.title)}`);
            console.log(`    부제목: ${JSON.stringify(slide.subtitle)}`);
            console.log(`    visible: ${slide.visible}`);
          });
        }
      }
    } else {
      console.log('❌ JSON 캐시 파일 없음');
    }
    
    // 3. 어드민 API 테스트 (토큰 포함)
    console.log('\n\n3. 어드민 API 응답 테스트:');
    console.log('===========================');
    
    // 먼저 로그인
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123!'
      })
    });
    
    if (loginResponse.ok) {
      const { token } = await loginResponse.json();
      
      // 어드민 API 호출
      const adminResponse = await fetch('http://localhost:3000/api/admin/ui-sections/hero', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (adminResponse.ok) {
        const data = await adminResponse.json();
        console.log('✅ 어드민 API 응답 성공');
        console.log('- section 있음?:', !!data.section);
        console.log('- slides 개수:', data.section?.data?.slides?.length || data.section?.content?.slides?.length || 0);
        
        const slides = data.section?.data?.slides || data.section?.content?.slides;
        if (slides) {
          console.log('\n어드민 API 슬라이드:');
          slides.forEach((slide: any, idx: number) => {
            console.log(`\n  슬라이드 ${idx + 1}:`);
            console.log(`    제목: ${JSON.stringify(slide.title)}`);
            console.log(`    부제목: ${JSON.stringify(slide.subtitle)}`);
          });
        }
      } else {
        console.log('❌ 어드민 API 응답 실패:', adminResponse.status);
      }
    } else {
      console.log('❌ 로그인 실패');
    }
    
    // 4. 메인 페이지가 보는 데이터
    console.log('\n\n4. 메인 페이지 데이터 소스:');
    console.log('============================');
    
    // home/sections API 확인
    const homeResponse = await fetch('http://localhost:3000/api/home/sections');
    if (homeResponse.ok) {
      const data = await homeResponse.json();
      const hero = data.sections?.find((s: any) => s.type === 'hero');
      
      if (hero) {
        console.log('✅ /api/home/sections에 hero 있음');
        console.log('- Slides 개수:', hero.data?.slides?.length || 0);
        
        if (hero.data?.slides) {
          console.log('\n/api/home/sections 슬라이드:');
          hero.data.slides.forEach((slide: any, idx: number) => {
            console.log(`\n  슬라이드 ${idx + 1}:`);
            console.log(`    제목: ${JSON.stringify(slide.title)}`);
            console.log(`    부제목: ${JSON.stringify(slide.subtitle)}`);
          });
        }
      } else {
        console.log('❌ /api/home/sections에 hero 없음');
      }
    }
    
    console.log('\n\n=== 문제 진단 ===');
    console.log('=================');
    console.log('📍 현재 상황:');
    console.log('- 어드민: 슬라이드가 안 보임 (데이터는 있는데 렌더링 문제?)');
    console.log('- 메인: "새 슬라이드", "데이터베이스 수정 완료" 등 이상한 슬라이드 표시');
    console.log('\n📍 가능한 원인:');
    console.log('- 어드민 페이지의 조건부 렌더링 문제');
    console.log('- 데이터 구조 불일치 (data vs content)');
    console.log('- 메인 페이지가 잘못된 소스에서 데이터를 가져옴');
    
  } catch (error: any) {
    console.error('오류:', error.message);
  }
  
  process.exit(0);
})();