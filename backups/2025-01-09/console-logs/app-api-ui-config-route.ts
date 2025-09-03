// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { jsonLanguageService, LanguageCode } from '@/lib/services/json-language.service';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/ui-config - 최적화된 언어별 UI 설정 조회
export async function GET(request: NextRequest) {
  try {
    // 언어 파라미터 추출
    const { searchParams } = new URL(request.url);
    const language = (searchParams.get('lang') || 'ko') as LanguageCode;

    // 유효한 언어인지 확인
    if (!['ko', 'en', 'jp'].includes(language)) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    try {
      // 새로운 언어별 JSON 데이터 로드
      const languageData = await jsonLanguageService.loadLanguageData(language);
      
      if (!languageData) {
        throw new Error(`Failed to load ${language} language data`);
      }

      // UI Config 형태로 변환
      const config = {
        header: {
          logo: {
            text: language === 'ko' ? 'LinkPick' : language === 'en' ? 'LinkPick' : 'LinkPick',
            imageUrl: null
          },
          menus: [
            { 
              id: 'menu-1', 
              label: language === 'ko' ? '캠페인' : language === 'en' ? 'Campaigns' : 'キャンペーン', 
              href: '/campaigns', 
              order: 1, 
              visible: true 
            },
            { 
              id: 'menu-2', 
              label: language === 'ko' ? '인플루언서' : language === 'en' ? 'Influencers' : 'インフルエンサー', 
              href: '/influencers', 
              order: 2, 
              visible: true 
            },
            { 
              id: 'menu-3', 
              label: language === 'ko' ? '커뮤니티' : language === 'en' ? 'Community' : 'コミュニティ', 
              href: '/community', 
              order: 3, 
              visible: true 
            },
            { 
              id: 'menu-4', 
              label: language === 'ko' ? '가격정책' : language === 'en' ? 'Pricing' : '料金プラン', 
              href: '/pricing', 
              order: 4, 
              visible: true 
            },
          ],
          ctaButton: {
            text: language === 'ko' ? '시작하기' : language === 'en' ? 'Get Started' : '始める',
            href: '/register',
            visible: true
          }
        },
        footer: {
          columns: [
            {
              id: 'column-1',
              title: language === 'ko' ? '서비스' : language === 'en' ? 'Services' : 'サービス',
              order: 1,
              links: [
                { 
                  id: 'link-1', 
                  label: language === 'ko' ? '인플루언서 찾기' : language === 'en' ? 'Find Influencers' : 'インフルエンサーを探す', 
                  href: '/influencers', 
                  order: 1, 
                  visible: true 
                },
                { 
                  id: 'link-2', 
                  label: language === 'ko' ? '캠페인 만들기' : language === 'en' ? 'Create Campaign' : 'キャンペーンを作成', 
                  href: '/campaigns/create', 
                  order: 2, 
                  visible: true 
                },
              ]
            },
            {
              id: 'column-2', 
              title: language === 'ko' ? '회사소개' : language === 'en' ? 'About' : '会社について',
              order: 2,
              links: [
                { 
                  id: 'link-3', 
                  label: language === 'ko' ? '회사소개' : language === 'en' ? 'About Us' : '会社概要', 
                  href: '/about', 
                  order: 1, 
                  visible: true 
                },
                { 
                  id: 'link-4', 
                  label: language === 'ko' ? '문의하기' : language === 'en' ? 'Contact' : 'お問い合わせ', 
                  href: '/contact', 
                  order: 2, 
                  visible: true 
                },
              ]
            },
            {
              id: 'column-3',
              title: language === 'ko' ? '법적고지' : language === 'en' ? 'Legal' : '法的情報',
              order: 3,
              links: [
                { 
                  id: 'link-5', 
                  label: language === 'ko' ? '이용약관' : language === 'en' ? 'Terms of Service' : '利用規約', 
                  href: '/terms', 
                  order: 1, 
                  visible: true 
                },
                { 
                  id: 'link-6', 
                  label: language === 'ko' ? '개인정보처리방침' : language === 'en' ? 'Privacy Policy' : 'プライバシーポリシー', 
                  href: '/privacy', 
                  order: 2, 
                  visible: true 
                },
              ]
            }
          ],
          social: [
            { platform: 'twitter', url: 'https://twitter.com/linkpick', visible: true },
            { platform: 'facebook', url: 'https://facebook.com/linkpick', visible: true },
            { platform: 'instagram', url: 'https://instagram.com/linkpick', visible: true }
          ],
          copyright: language === 'ko' ? '© 2024 LinkPick. 모든 권리 보유.' : 
                    language === 'en' ? '© 2024 LinkPick. All rights reserved.' : 
                    '© 2024 LinkPick. 全著作権所有。'
        },
        mainPage: {
          sectionOrder: languageData.sectionOrder,
          sections: languageData.sections,
          customSections: []
        },
        metadata: {
          version: languageData.version,
          lastUpdated: languageData.lastUpdated,
          language: languageData.language
        }
      };

      return NextResponse.json({ config });
      
    } catch (languageError) {
      console.warn(`언어별 데이터 로드 실패 (${language}), 기본 설정 사용:`, languageError);
      
      // 기본 설정 반환 (한국어)
      const defaultConfig = {
        header: {
          logo: {
            text: 'LinkPick',
            imageUrl: null
          },
          menus: [
            { id: 'menu-1', label: '캠페인', href: '/campaigns', order: 1, visible: true },
            { id: 'menu-2', label: '인플루언서', href: '/influencers', order: 2, visible: true },
            { id: 'menu-3', label: '커뮤니티', href: '/community', order: 3, visible: true },
            { id: 'menu-4', label: '가격정책', href: '/pricing', order: 4, visible: true },
          ],
          ctaButton: {
            text: '시작하기',
            href: '/register',
            visible: true
          }
        },
        footer: {
          columns: [
            {
              id: 'column-1',
              title: '서비스',
              order: 1,
              links: [
                { id: 'link-1', label: '인플루언서 찾기', href: '/influencers', order: 1, visible: true },
                { id: 'link-2', label: '캠페인 만들기', href: '/campaigns/create', order: 2, visible: true },
              ]
            }
          ],
          social: [],
          copyright: '© 2024 LinkPick. 모든 권리 보유.'
        },
        mainPage: {
          sectionOrder: ["hero", "category", "quicklinks", "promo", "active-campaigns", "ranking"],
          sections: {},
          customSections: []
        },
        metadata: {
          version: 'fallback',
          lastUpdated: new Date().toISOString(),
          language: 'ko'
        }
      };

      return NextResponse.json({ config: defaultConfig });
    }

  } catch (error) {
    console.error('UI config 조회 오류:', error);
    
    // 최종 폴백
    const fallbackConfig = {
      header: {
        logo: { text: 'LinkPick', imageUrl: null },
        menus: [
          { id: 'menu-1', label: '캠페인', href: '/campaigns', order: 1, visible: true }
        ],
        ctaButton: { text: '시작하기', href: '/register', visible: true }
      },
      footer: {
        columns: [],
        social: [],
        copyright: '© 2024 LinkPick. 모든 권리 보유.'
      },
      mainPage: {
        sectionOrder: ["hero", "category"],
        sections: {},
        customSections: []
      },
      metadata: {
        version: 'error-fallback',
        lastUpdated: new Date().toISOString(),
        language: 'ko'
      }
    };
    
    return NextResponse.json({ config: fallbackConfig });
  }
}