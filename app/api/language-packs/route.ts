// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Fallback language pack data when database is unavailable
const fallbackLanguagePacks = [
  // Header & Navigation
  { key: 'header.home', ko: '홈', en: 'Home', jp: 'ホーム', category: 'header' },
  { key: 'header.products', ko: '제품', en: 'Products', jp: '製品', category: 'header' },
  { key: 'header.cart', ko: '장바구니', en: 'Cart', jp: 'カート', category: 'header' },
  { key: 'header.mypage', ko: '마이페이지', en: 'My Page', jp: 'マイページ', category: 'header' },
  { key: 'header.login', ko: '로그인', en: 'Login', jp: 'ログイン', category: 'header' },
  { key: 'header.logout', ko: '로그아웃', en: 'Logout', jp: 'ログアウト', category: 'header' },
  { key: 'header.search', ko: '검색', en: 'Search', jp: '検索', category: 'header' },
  
  // Footer
  { key: 'footer.company', ko: '회사소개', en: 'About Us', jp: '会社情報', category: 'footer' },
  { key: 'footer.terms', ko: '이용약관', en: 'Terms', jp: '利用規約', category: 'footer' },
  { key: 'footer.privacy', ko: '개인정보처리방침', en: 'Privacy Policy', jp: 'プライバシーポリシー', category: 'footer' },
  { key: 'footer.contact', ko: '연락처', en: 'Contact', jp: 'お問い合わせ', category: 'footer' },
  { key: 'footer.copyright', ko: '© 2024 Commerce. All rights reserved.', en: '© 2024 Commerce. All rights reserved.', jp: '© 2024 Commerce. All rights reserved.', category: 'footer' },
  
  // Common
  { key: 'common.add_to_cart', ko: '장바구니에 추가', en: 'Add to Cart', jp: 'カートに追加', category: 'common' },
  { key: 'common.buy_now', ko: '바로 구매', en: 'Buy Now', jp: '今すぐ購入', category: 'common' },
  { key: 'common.price', ko: '가격', en: 'Price', jp: '価格', category: 'common' },
  { key: 'common.quantity', ko: '수량', en: 'Quantity', jp: '数量', category: 'common' },
  { key: 'common.total', ko: '합계', en: 'Total', jp: '合計', category: 'common' },
  { key: 'common.save', ko: '저장', en: 'Save', jp: '保存', category: 'common' },
  { key: 'common.cancel', ko: '취소', en: 'Cancel', jp: 'キャンセル', category: 'common' },
  { key: 'common.confirm', ko: '확인', en: 'Confirm', jp: '確認', category: 'common' },
  { key: 'common.delete', ko: '삭제', en: 'Delete', jp: '削除', category: 'common' },
  { key: 'common.edit', ko: '수정', en: 'Edit', jp: '編集', category: 'common' },
  { key: 'common.loading', ko: '로딩 중...', en: 'Loading...', jp: '読み込み中...', category: 'common' },
  
  // Products
  { key: 'products.title', ko: '제품 목록', en: 'Product List', jp: '製品リスト', category: 'products' },
  { key: 'products.new', ko: '신제품', en: 'New Products', jp: '新製品', category: 'products' },
  { key: 'products.popular', ko: '인기 제품', en: 'Popular Products', jp: '人気製品', category: 'products' },
  { key: 'products.sale', ko: '할인 상품', en: 'Sale Items', jp: 'セール商品', category: 'products' },
  { key: 'products.out_of_stock', ko: '품절', en: 'Out of Stock', jp: '在庫切れ', category: 'products' },
  
  // Auth
  { key: 'auth.email', ko: '이메일', en: 'Email', jp: 'メール', category: 'auth' },
  { key: 'auth.password', ko: '비밀번호', en: 'Password', jp: 'パスワード', category: 'auth' },
  { key: 'auth.signin', ko: '로그인', en: 'Sign In', jp: 'サインイン', category: 'auth' },
  { key: 'auth.signup', ko: '회원가입', en: 'Sign Up', jp: 'サインアップ', category: 'auth' },
  { key: 'auth.forgot_password', ko: '비밀번호 찾기', en: 'Forgot Password', jp: 'パスワードを忘れた', category: 'auth' },
  
  // Checkout
  { key: 'checkout.title', ko: '결제하기', en: 'Checkout', jp: 'チェックアウト', category: 'checkout' },
  { key: 'checkout.shipping', ko: '배송 정보', en: 'Shipping Info', jp: '配送情報', category: 'checkout' },
  { key: 'checkout.payment', ko: '결제 정보', en: 'Payment Info', jp: '支払い情報', category: 'checkout' },
  { key: 'checkout.review', ko: '주문 확인', en: 'Review Order', jp: '注文確認', category: 'checkout' },
  { key: 'checkout.complete', ko: '결제 완료', en: 'Payment Complete', jp: '支払い完了', category: 'checkout' },
];

// GET /api/language-packs - 공개 언어팩 조회 (인증 불필요)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    
    try {
      // Try to fetch from database first
      const where: unknown = {};
      
      if (category) {
        where.category = category;
      }

      let whereConditions: string[] = [];
      const params: unknown[] = [];
      
      if (category) {
        params.push(category);
        whereConditions.push(`namespace = $${params.length}`);
      }
      
      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
      
      const result = await query(`
        SELECT DISTINCT
          CASE 
            WHEN key LIKE '%.%' THEN key
            ELSE namespace || '.' || key
          END as key,
          namespace,
          key as original_key,
          MAX(CASE WHEN "languageCode" = 'ko' THEN value ELSE NULL END) as ko,
          MAX(CASE WHEN "languageCode" = 'en' THEN value ELSE NULL END) as en,
          MAX(CASE WHEN "languageCode" IN ('ja', 'jp') THEN value ELSE NULL END) as jp,
          MAX(description) as description
        FROM language_packs
        ${whereClause}
        GROUP BY namespace, key
        ORDER BY namespace ASC, key ASC
      `, params);
      
      const languagePacks = result.rows.map((row, index) => ({
        id: `lp_${index + 1}`,
        key: row.key,
        ko: row.ko,
        en: row.en,
        jp: row.jp,
        category: row.namespace,
        description: row.description
      }));

      return NextResponse.json(languagePacks);
    } catch (dbError) {
      // Database error - use fallback data

      // Filter by category if specified
      let filteredPacks = fallbackLanguagePacks;
      if (category) {
        filteredPacks = fallbackLanguagePacks.filter(pack => pack.category === category);
      }
      
      // Add IDs to the fallback data
      const languagePacksWithIds = filteredPacks.map((pack, index) => ({
        id: `lp_${index + 1}`,
        ...pack,
        description: null
      }));
      
      return NextResponse.json(languagePacksWithIds);
    }
  } catch (error) {

    // Return fallback data even on general errors
    const languagePacksWithIds = fallbackLanguagePacks.map((pack, index) => ({
      id: `lp_${index + 1}`,
      ...pack,
      description: null
    }));
    
    return NextResponse.json(languagePacksWithIds);
  }
}