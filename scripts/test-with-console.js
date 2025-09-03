const { chromium } = require('playwright');

async function testLanguageSwitch() {
  console.log('🌐 Testing Language Switching with Console Output\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // 화면으로 보기
    slowMo: 1000      // 천천히 실행
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Console 로그 캡처
  page.on('console', msg => {
    if (msg.text().includes('Translation') || msg.text().includes('category') || msg.text().includes('Loaded')) {
      console.log('Browser console:', msg.text());
    }
  });
  
  try {
    console.log('📱 Opening page...');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 1. Japanese로 전환
    console.log('\n🇯🇵 Switching to Japanese...');
    
    // 언어 선택 버튼 클릭
    const langButton = page.locator('button').filter({ hasText: /KO|EN|JP/ }).first();
    await langButton.click();
    await page.waitForTimeout(500);
    
    // 일본어 선택
    await page.locator('text=/日本語|Japanese/').click();
    await page.waitForTimeout(3000);
    
    // 카테고리 텍스트 확인
    const categoryTexts = await page.locator('.text-xs.text-gray-700.text-center').allTextContents();
    console.log('Category texts:', categoryTexts.slice(0, 5));
    
    // 페이지 전체 텍스트 확인
    const bodyText = await page.locator('body').innerText();
    const hasJapaneseCategories = bodyText.includes('ビューティー') || bodyText.includes('電子製品');
    console.log('Japanese categories found:', hasJapaneseCategories);
    
    console.log('\n✅ Check console output above for translation debugging');
    console.log('Browser will stay open for 30 seconds...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testLanguageSwitch().catch(console.error);
