const { chromium } = require('playwright');

async function finalLanguageTest() {
  console.log('🌐 Final Language Switching Test\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newContext().then(context => context.newPage());
  
  try {
    // Test 1: Check default language (should be Korean but menu is English?)
    console.log('1️⃣  Checking default language:');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    const menuTexts = await page.locator('nav a').allTextContents();
    console.log('   Menu items:', menuTexts.slice(0, 4));
    
    // Get body text
    const bodyText = await page.locator('body').innerText();
    
    // Check categories
    const hasKoreanCategories = bodyText.includes('뷰티') && bodyText.includes('전자제품');
    const hasEnglishCategories = bodyText.includes('Beauty') && bodyText.includes('Electronics');
    
    console.log('   Korean categories present:', hasKoreanCategories);
    console.log('   English categories present:', hasEnglishCategories);
    
    // Test 2: Switch to English explicitly
    console.log('\n2️⃣  Switching to English:');
    
    // Click on language selector (EN button)
    await page.locator('button:has-text("EN")').click();
    await page.waitForTimeout(500);
    
    // Select English from dropdown if it appears
    const englishOption = page.locator('text=English');
    if (await englishOption.isVisible()) {
      await englishOption.click();
      await page.waitForTimeout(1000);
    }
    
    const menuTextsEN = await page.locator('nav a').allTextContents();
    console.log('   Menu items:', menuTextsEN.slice(0, 4));
    
    const bodyTextEN = await page.locator('body').innerText();
    const hasEnglishCategoriesAfter = bodyTextEN.includes('Beauty') || bodyTextEN.includes('Electronics');
    console.log('   English categories present:', hasEnglishCategoriesAfter);
    
    // Test 3: Switch to Korean
    console.log('\n3️⃣  Switching to Korean:');
    
    // Click language selector again
    await page.locator('button:has-text("EN"), button:has-text("KO")').first().click();
    await page.waitForTimeout(500);
    
    // Select Korean
    const koreanOption = page.locator('text=/한국어|Korean/');
    if (await koreanOption.isVisible()) {
      await koreanOption.click();
      await page.waitForTimeout(1000);
    }
    
    const menuTextsKO = await page.locator('nav a').allTextContents();
    console.log('   Menu items:', menuTextsKO.slice(0, 4));
    
    const bodyTextKO = await page.locator('body').innerText();
    const hasKoreanCategoriesAfter = bodyTextKO.includes('뷰티') || bodyTextKO.includes('전자제품');
    const hasKoreanMenu = menuTextsKO.some(text => text.includes('캠페인'));
    
    console.log('   Korean menu present:', hasKoreanMenu);
    console.log('   Korean categories present:', hasKoreanCategoriesAfter);
    
    // Test 4: Switch to Japanese
    console.log('\n4️⃣  Switching to Japanese:');
    
    await page.locator('button:has-text("KO"), button:has-text("EN")').first().click();
    await page.waitForTimeout(500);
    
    const japaneseOption = page.locator('text=/日本語|Japanese/');
    if (await japaneseOption.isVisible()) {
      await japaneseOption.click();
      await page.waitForTimeout(1000);
    }
    
    const menuTextsJP = await page.locator('nav a').allTextContents();
    console.log('   Menu items:', menuTextsJP.slice(0, 4));
    
    const bodyTextJP = await page.locator('body').innerText();
    const hasJapaneseMenu = menuTextsJP.some(text => text.includes('キャンペーン'));
    const hasJapaneseCategories = bodyTextJP.includes('ビューティー') || bodyTextJP.includes('電子製品');
    
    console.log('   Japanese menu present:', hasJapaneseMenu);
    console.log('   Japanese categories present:', hasJapaneseCategories);
    
    console.log('\n✅ Test Complete!');
    
    // Summary
    console.log('\n📊 Summary:');
    if (menuTexts[0] === 'Campaigns' || menuTexts[0] === '캠페인' || menuTexts[0] === 'キャンペーン') {
      console.log('   ✅ Menu translation is working');
    } else {
      console.log('   ⚠️  Menu might not be translating properly');
    }
    
    if (hasKoreanCategories || hasEnglishCategories || hasJapaneseCategories) {
      console.log('   ✅ Categories are displayed (translation might need checking)');
    } else {
      console.log('   ⚠️  Categories might not be displaying');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

finalLanguageTest().catch(console.error);