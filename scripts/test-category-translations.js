const { chromium } = require('playwright');

async function testCategoryTranslations() {
  console.log('🌐 Testing Category Translations\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newContext().then(context => context.newPage());
  
  try {
    // Test 1: Korean (default)
    console.log('1️⃣  Testing Korean categories:');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'korean-categories.png', fullPage: false });
    
    // Check for Korean categories
    const bodyText = await page.locator('body').innerText();
    const hasKoreanCategories = bodyText.includes('뷰티') || bodyText.includes('전자제품');
    console.log('   Korean categories present:', hasKoreanCategories);
    
    // Get category texts
    const categoryTexts = await page.locator('.text-sm.text-gray-700.text-center').allTextContents();
    console.log('   Category labels:', categoryTexts.slice(0, 5));
    
    // Test 2: English
    console.log('\n2️⃣  Testing English categories:');
    
    // Click language selector
    await page.locator('button').filter({ hasText: /KO|EN|JP/ }).first().click();
    await page.waitForTimeout(500);
    
    // Select English
    await page.locator('text=English').click();
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({ path: 'english-categories.png', fullPage: false });
    
    const bodyTextEN = await page.locator('body').innerText();
    const hasEnglishCategories = bodyTextEN.includes('Beauty') || bodyTextEN.includes('Electronics');
    console.log('   English categories present:', hasEnglishCategories);
    
    const categoryTextsEN = await page.locator('.text-sm.text-gray-700.text-center').allTextContents();
    console.log('   Category labels:', categoryTextsEN.slice(0, 5));
    
    // Test 3: Japanese
    console.log('\n3️⃣  Testing Japanese categories:');
    
    // Click language selector
    await page.locator('button').filter({ hasText: /KO|EN|JP/ }).first().click();
    await page.waitForTimeout(500);
    
    // Select Japanese
    await page.locator('text=/日本語|Japanese/').click();
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({ path: 'japanese-categories.png', fullPage: false });
    
    const bodyTextJP = await page.locator('body').innerText();
    const hasJapaneseCategories = bodyTextJP.includes('ビューティー') || bodyTextJP.includes('電子製品');
    console.log('   Japanese categories present:', hasJapaneseCategories);
    
    const categoryTextsJP = await page.locator('.text-sm.text-gray-700.text-center').allTextContents();
    console.log('   Category labels:', categoryTextsJP.slice(0, 5));
    
    // Summary
    console.log('\n📊 Summary:');
    if (hasKoreanCategories && hasEnglishCategories && hasJapaneseCategories) {
      console.log('   ✅ All languages working correctly!');
    } else {
      console.log('   ⚠️  Some languages may not be working:');
      if (!hasKoreanCategories) console.log('      - Korean categories not found');
      if (!hasEnglishCategories) console.log('      - English categories not found');
      if (!hasJapaneseCategories) console.log('      - Japanese categories not found');
    }
    
    console.log('\n📸 Screenshots saved:');
    console.log('   - korean-categories.png');
    console.log('   - english-categories.png');
    console.log('   - japanese-categories.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testCategoryTranslations().catch(console.error);