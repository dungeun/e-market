const { chromium } = require('playwright');

async function testLanguageSwitch() {
  console.log('🌐 Testing Language Switching with Categories\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // 화면으로 보기
    slowMo: 500      // 천천히 실행
  });
  
  const page = await browser.newContext().then(context => context.newPage());
  
  try {
    console.log('📱 Opening page...');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 1. Japanese로 전환
    console.log('\n🇯🇵 Switching to Japanese...');
    
    // 언어 선택 버튼 클릭
    const langButton = page.locator('button').filter({ hasText: /KO|EN|JP/ }).first();
    await langButton.click();
    await page.waitForTimeout(500);
    
    // 일본어 선택
    await page.locator('text=/日本語|Japanese/').click();
    await page.waitForTimeout(2000);
    
    // 카테고리 텍스트 확인
    const categoryTexts = await page.locator('.text-sm.text-gray-700.text-center').allTextContents();
    console.log('Category texts:', categoryTexts.slice(0, 5));
    
    // 페이지 전체 텍스트 확인
    const bodyText = await page.locator('body').innerText();
    const hasJapaneseCategories = bodyText.includes('ビューティー') || bodyText.includes('電子製品');
    console.log('Japanese categories found:', hasJapaneseCategories);
    
    // 스크린샷 저장
    await page.screenshot({ path: 'japanese-test.png', fullPage: false });
    console.log('Screenshot saved as japanese-test.png');
    
    // 2. English로 전환
    console.log('\n🇬🇧 Switching to English...');
    await langButton.click();
    await page.waitForTimeout(500);
    
    await page.locator('text=English').click();
    await page.waitForTimeout(2000);
    
    const categoryTextsEN = await page.locator('.text-sm.text-gray-700.text-center').allTextContents();
    console.log('Category texts:', categoryTextsEN.slice(0, 5));
    
    const bodyTextEN = await page.locator('body').innerText();
    const hasEnglishCategories = bodyTextEN.includes('Beauty') || bodyTextEN.includes('Electronics');
    console.log('English categories found:', hasEnglishCategories);
    
    await page.screenshot({ path: 'english-test.png', fullPage: false });
    console.log('Screenshot saved as english-test.png');
    
    // 3. Korean으로 전환
    console.log('\n🇰🇷 Switching to Korean...');
    await langButton.click();
    await page.waitForTimeout(500);
    
    await page.locator('text=/한국어|Korean/').click();
    await page.waitForTimeout(2000);
    
    const categoryTextsKO = await page.locator('.text-sm.text-gray-700.text-center').allTextContents();
    console.log('Category texts:', categoryTextsKO.slice(0, 5));
    
    const bodyTextKO = await page.locator('body').innerText();
    const hasKoreanCategories = bodyTextKO.includes('뷰티') || bodyTextKO.includes('전자제품');
    console.log('Korean categories found:', hasKoreanCategories);
    
    await page.screenshot({ path: 'korean-test.png', fullPage: false });
    console.log('Screenshot saved as korean-test.png');
    
    console.log('\n✅ Test Complete!');
    console.log('\nPlease check the browser window and screenshots.');
    
    // 브라우저를 10초간 열어두기
    console.log('Browser will close in 10 seconds...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testLanguageSwitch().catch(console.error);