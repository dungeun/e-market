import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getLanguagePacks, invalidateLanguageCache } from '@/lib/cache/language-cache';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;

    try {
      // 3단계 캐싱 시스템을 통해 데이터 가져오기
      const languagePacks = await getLanguagePacks(category);
      
      // ID 추가 및 포맷 정리 (동적 언어 지원)
      const formattedPacks = languagePacks.map((row: any, index: number) => {
        const pack: any = {
          id: `lp_${index + 1}`,
          key: row.key,
          category: row.category || 'general',
          description: row.description || null
        };
        
        // 모든 언어 필드 동적으로 복사
        Object.keys(row).forEach(key => {
          if (key !== 'key' && key !== 'category' && key !== 'description') {
            pack[key] = row[key] || '';
          }
        });
        
        return pack;
      });

      return NextResponse.json(formattedPacks);
    } catch (dbError) {
      logger.error('Error getting language packs:', dbError);
      
      // Fallback 데이터 반환 (한국어 + 영어 + 프랑스어)
      const fallbackData = [
        { id: 'lp_1', key: 'header.home', ko: '홈', en: 'Home', fr: 'Accueil', category: 'header' },
        { id: 'lp_2', key: 'header.products', ko: '제품', en: 'Products', fr: 'Produits', category: 'header' },
        { id: 'lp_3', key: 'header.cart', ko: '장바구니', en: 'Cart', fr: 'Panier', category: 'header' },
        { id: 'lp_4', key: 'header.mypage', ko: '마이페이지', en: 'My Page', fr: 'Mon Compte', category: 'header' },
        { id: 'lp_5', key: 'header.login', ko: '로그인', en: 'Login', fr: 'Connexion', category: 'header' },
        { id: 'lp_6', key: 'header.logout', ko: '로그아웃', en: 'Logout', fr: 'Déconnexion', category: 'header' },
        { id: 'lp_7', key: 'common.add_to_cart', ko: '장바구니에 추가', en: 'Add to Cart', fr: 'Ajouter au panier', category: 'common' },
        { id: 'lp_8', key: 'common.buy_now', ko: '바로 구매', en: 'Buy Now', fr: 'Acheter maintenant', category: 'common' },
        { id: 'lp_9', key: 'common.loading', ko: '로딩 중...', en: 'Loading...', fr: 'Chargement...', category: 'common' },
      ];

      const filtered = category 
        ? fallbackData.filter(pack => pack.category === category)
        : fallbackData;

      return NextResponse.json(filtered);
    }
  } catch (error) {
    logger.error('Error in unified language packs API:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// 캐시 무효화 엔드포인트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'invalidate') {
      const category = body.category || undefined;
      await invalidateLanguageCache(category);
      
      logger.info(`Language packs cache invalidated for ${category || 'all categories'}`);
      return NextResponse.json({ 
        success: true, 
        message: `Cache invalidated for ${category || 'all categories'}` 
      });
    }
    
    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error('Error invalidating cache:', error);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}