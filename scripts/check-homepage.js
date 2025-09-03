const { chromium } = require('playwright');

async function checkHomePage() {
  console.log('📸 Taking screenshot of homepage...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newContext().then(context => context.newPage());
  
  try {
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot
    await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true });
    console.log('Screenshot saved as homepage-screenshot.png');
    
    // Get page content
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for menu items
    const menuTexts = await page.locator('nav a').allTextContents();
    console.log('Navigation links found:', menuTexts);
    
    // Check for language selector
    const buttons = await page.locator('button').allTextContents();
    console.log('Buttons found:', buttons.filter(b => b.trim()).slice(0, 10));
    
    // Get all visible text
    const visibleText = await page.locator('body').innerText();
    
    // Check for Korean menu items
    const hasKoreanMenu = visibleText.includes('캠페인') || visibleText.includes('인플루언서');
    console.log('\nKorean menu items present:', hasKoreanMenu);
    
    // Check for categories
    const hasCategories = visibleText.includes('뷰티') || visibleText.includes('전자제품');
    console.log('Korean categories present:', hasCategories);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkHomePage().catch(console.error);