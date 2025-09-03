

async function main() {
  console.log('Seeding language packs...');

  const translations = [
    // Header Menu
    { key: 'menu.campaigns', ko: '캠페인', en: 'Campaigns', jp: 'キャンペーン', category: 'menu' },
    { key: 'menu.influencers', ko: '인플루언서', en: 'Influencers', jp: 'インフルエンサー', category: 'menu' },
    { key: 'menu.community', ko: '커뮤니티', en: 'Community', jp: 'コミュニティ', category: 'menu' },
    { key: 'menu.pricing', ko: '가격', en: 'Pricing', jp: '価格', category: 'menu' },
    { key: 'menu.get_started', ko: '시작하기', en: 'Get Started', jp: '始める', category: 'menu' },

    // Hero Slides
    { key: 'hero.slide1.tag', ko: '🔥 핫딜', en: '🔥 Hot Deal', jp: '🔥 ホットディール', category: 'hero' },
    { key: 'hero.slide1.title', ko: '인플루언서와 함께하는 브랜드 성장', en: 'Grow Your Brand with Influencers', jp: 'インフルエンサーと共にブランド成長', category: 'hero' },
    { key: 'hero.slide1.subtitle', ko: '효과적인 마케팅 캠페인을 시작하세요', en: 'Start Effective Marketing Campaigns', jp: '効果的なマーケティングキャンペーンを開始', category: 'hero' },
    
    { key: 'hero.slide2.title', ko: '검증된 인플루언서 네트워크', en: 'Verified Influencer Network', jp: '検証済みインフルエンサーネットワーク', category: 'hero' },
    { key: 'hero.slide2.subtitle', ko: '10만+ 인플루언서와 함께하세요', en: 'Join 100K+ Influencers', jp: '10万人以上のインフルエンサーと一緒に', category: 'hero' },
    
    { key: 'hero.slide3.title', ko: '실시간 캠페인 분석', en: 'Real-time Campaign Analytics', jp: 'リアルタイムキャンペーン分析', category: 'hero' },
    { key: 'hero.slide3.subtitle', ko: '데이터 기반 마케팅 전략', en: 'Data-driven Marketing Strategy', jp: 'データ駆動型マーケティング戦略', category: 'hero' },
    
    { key: 'hero.slide4.tag', ko: '⭐ 프리미엄', en: '⭐ Premium', jp: '⭐ プレミアム', category: 'hero' },
    { key: 'hero.slide4.title', ko: '맞춤형 캠페인 솔루션', en: 'Custom Campaign Solutions', jp: 'カスタムキャンペーンソリューション', category: 'hero' },
    { key: 'hero.slide4.subtitle', ko: '브랜드에 최적화된 전략', en: 'Brand-optimized Strategy', jp: 'ブランドに最適化された戦略', category: 'hero' },
    
    { key: 'hero.slide5.title', ko: 'AI 기반 매칭 시스템', en: 'AI-powered Matching System', jp: 'AI基盤マッチングシステム', category: 'hero' },
    { key: 'hero.slide5.subtitle', ko: '최적의 인플루언서 자동 추천', en: 'Auto-recommend Best Influencers', jp: '最適なインフルエンサー自動推薦', category: 'hero' },
    
    { key: 'hero.slide6.tag', ko: '💎 신규 론칭', en: '💎 New Launch', jp: '💎 新規ローンチ', category: 'hero' },
    { key: 'hero.slide6.title', ko: '글로벌 캠페인 지원', en: 'Global Campaign Support', jp: 'グローバルキャンペーンサポート', category: 'hero' },
    { key: 'hero.slide6.subtitle', ko: '해외 시장 진출의 파트너', en: 'Partner for Global Expansion', jp: '海外市場進出のパートナー', category: 'hero' },

    // Categories
    { key: 'category.beauty', ko: '뷰티', en: 'Beauty', jp: 'ビューティー', category: 'category' },
    { key: 'category.fashion', ko: '패션', en: 'Fashion', jp: 'ファッション', category: 'category' },
    { key: 'category.food', ko: '푸드', en: 'Food', jp: 'フード', category: 'category' },
    { key: 'category.travel', ko: '여행', en: 'Travel', jp: '旅行', category: 'category' },
    { key: 'category.tech', ko: '테크', en: 'Tech', jp: 'テック', category: 'category' },
    { key: 'category.fitness', ko: '피트니스', en: 'Fitness', jp: 'フィットネス', category: 'category' },
    { key: 'category.lifestyle', ko: '라이프스타일', en: 'Lifestyle', jp: 'ライフスタイル', category: 'category' },
    { key: 'category.pet', ko: '펫', en: 'Pet', jp: 'ペット', category: 'category' },
    { key: 'category.parenting', ko: '육아', en: 'Parenting', jp: '育児', category: 'category' },
    { key: 'category.game', ko: '게임', en: 'Game', jp: 'ゲーム', category: 'category' },
    { key: 'category.education', ko: '교육', en: 'Education', jp: '教育', category: 'category' },
    
    { key: 'category.badge.hot', ko: 'HOT', en: 'HOT', jp: 'HOT', category: 'category' },
    { key: 'category.badge.new', ko: 'NEW', en: 'NEW', jp: 'NEW', category: 'category' },

    // Quick Links
    { key: 'quicklink.events', ko: '이벤트', en: 'Events', jp: 'イベント', category: 'quicklink' },
    { key: 'quicklink.coupons', ko: '쿠폰', en: 'Coupons', jp: 'クーポン', category: 'quicklink' },
    { key: 'quicklink.ranking', ko: '랭킹', en: 'Ranking', jp: 'ランキング', category: 'quicklink' },

    // Promo
    { key: 'promo.title', ko: '지금 시작하세요!', en: 'Start Now!', jp: '今すぐ始めよう！', category: 'promo' },
    { key: 'promo.subtitle', ko: '첫 캠페인 30% 할인 이벤트', en: 'First Campaign 30% OFF', jp: '初回キャンペーン30%割引', category: 'promo' },

    // Sections
    { key: 'section.categories', ko: '카테고리', en: 'Categories', jp: 'カテゴリー', category: 'section' },
    { key: 'section.ranking', ko: '실시간 랭킹', en: 'Real-time Ranking', jp: 'リアルタイムランキング', category: 'section' },
    { key: 'section.recommended', ko: '추천 캠페인', en: 'Recommended Campaigns', jp: '推薦キャンペーン', category: 'section' },

    // Footer
    { key: 'footer.service.title', ko: '서비스', en: 'Service', jp: 'サービス', category: 'footer' },
    { key: 'footer.service.find_campaigns', ko: '캠페인 찾기', en: 'Find Campaigns', jp: 'キャンペーンを探す', category: 'footer' },
    { key: 'footer.service.find_influencers', ko: '인플루언서 찾기', en: 'Find Influencers', jp: 'インフルエンサーを探す', category: 'footer' },
    { key: 'footer.service.create_campaign', ko: '캠페인 만들기', en: 'Create Campaign', jp: 'キャンペーンを作成', category: 'footer' },
    
    { key: 'footer.company.title', ko: '회사', en: 'Company', jp: '会社', category: 'footer' },
    { key: 'footer.company.about', ko: '회사소개', en: 'About Us', jp: '会社紹介', category: 'footer' },
    { key: 'footer.company.blog', ko: '블로그', en: 'Blog', jp: 'ブログ', category: 'footer' },
    { key: 'footer.company.careers', ko: '채용', en: 'Careers', jp: '採用', category: 'footer' },
    { key: 'footer.company.contact', ko: '문의하기', en: 'Contact', jp: 'お問い合わせ', category: 'footer' },
    
    { key: 'footer.support.title', ko: '지원', en: 'Support', jp: 'サポート', category: 'footer' },
    { key: 'footer.support.help', ko: '도움말', en: 'Help', jp: 'ヘルプ', category: 'footer' },
    { key: 'footer.support.terms', ko: '이용약관', en: 'Terms', jp: '利用規約', category: 'footer' },
    
    { key: 'footer.legal.title', ko: '법적 고지', en: 'Legal', jp: '法的通知', category: 'footer' },
    { key: 'footer.legal.terms', ko: '이용약관', en: 'Terms of Service', jp: '利用規約', category: 'footer' },
    { key: 'footer.legal.privacy', ko: '개인정보처리방침', en: 'Privacy Policy', jp: 'プライバシーポリシー', category: 'footer' },
    
    { key: 'footer.copyright', ko: '© 2024 LinkPick. All rights reserved.', en: '© 2024 LinkPick. All rights reserved.', jp: '© 2024 LinkPick. All rights reserved.', category: 'footer' },

    // Login Page
    { key: 'site.name', ko: 'LinkPick', en: 'LinkPick', jp: 'LinkPick', category: 'site' },
    { key: 'login.title', ko: '로그인', en: 'Login', jp: 'ログイン', category: 'login' },
    { key: 'login.no_account', ko: '계정이 없으신가요?', en: "Don't have an account?", jp: 'アカウントをお持ちでないですか？', category: 'login' },
    { key: 'login.signup_link', ko: '회원가입', en: 'Sign up', jp: '新規登録', category: 'login' },
    { key: 'login.access_denied', ko: '접근 권한이 없습니다', en: 'Access denied', jp: 'アクセス権限がありません', category: 'login' },
    { key: 'login.email_label', ko: '이메일 주소', en: 'Email address', jp: 'メールアドレス', category: 'login' },
    { key: 'login.email_placeholder', ko: '이메일을 입력하세요', en: 'Enter your email', jp: 'メールアドレスを入力してください', category: 'login' },
    { key: 'login.password_label', ko: '비밀번호', en: 'Password', jp: 'パスワード', category: 'login' },
    { key: 'login.password_placeholder', ko: '비밀번호를 입력하세요', en: 'Enter your password', jp: 'パスワードを入力してください', category: 'login' },
    { key: 'login.remember_me', ko: '로그인 상태 유지', en: 'Remember me', jp: 'ログイン状態を保持', category: 'login' },
    { key: 'login.forgot_password', ko: '비밀번호를 잊으셨나요?', en: 'Forgot your password?', jp: 'パスワードをお忘れですか？', category: 'login' },
    { key: 'login.submit', ko: '로그인', en: 'Login', jp: 'ログイン', category: 'login' },
    { key: 'login.loading', ko: '로그인 중...', en: 'Logging in...', jp: 'ログイン中...', category: 'login' },
    { key: 'login.welcome', ko: '환영합니다!', en: 'Welcome!', jp: 'ようこそ！', category: 'login' },
    { key: 'login.failed', ko: '로그인에 실패했습니다.', en: 'Login failed.', jp: 'ログインに失敗しました。', category: 'login' },
    { key: 'login.error', ko: '로그인 중 오류가 발생했습니다.', en: 'An error occurred during login.', jp: 'ログイン中にエラーが発生しました。', category: 'login' },
    { key: 'login.test_accounts', ko: '🧪 테스트 계정 빠른 로그인', en: '🧪 Quick Login Test Accounts', jp: '🧪 テストアカウント クイックログイン', category: 'login' },
    { key: 'login.admin_login', ko: '🔧 관리자로 로그인', en: '🔧 Login as Admin', jp: '🔧 管理者としてログイン', category: 'login' },
    { key: 'login.superadmin_login', ko: '👑 슈퍼 관리자로 로그인', en: '👑 Login as Super Admin', jp: '👑 スーパー管理者としてログイン', category: 'login' },
    { key: 'login.user1_login', ko: '👤 홍길동으로 로그인', en: '👤 Login as Hong Gildong', jp: '👤 ホンギルドンとしてログイン', category: 'login' },
    { key: 'login.user2_login', ko: '👤 김철수로 로그인', en: '👤 Login as Kim Cheolsu', jp: '👤 キムチョルスとしてログイン', category: 'login' },
  ];

  // Create language packs for each language
  const languages = [
    { code: 'ko', field: 'ko' },
    { code: 'en', field: 'en' },
    { code: 'ja', field: 'jp' }
  ];

  let count = 0;
  
  for (const translation of translations) {
    for (const lang of languages) {
      const value = translation[lang.field as keyof typeof translation] as string;
      if (value) {
        await query({
          where: {
            languageCode_namespace_key: {
              languageCode: lang.code,
              namespace: 'default',
              key: translation.key
            }
          },
          update: {
            value,
            category: translation.category,
            isActive: true
          },
          create: {
            languageCode: lang.code,
            namespace: 'default',
            key: translation.key,
            value,
            category: translation.category,
            isActive: true
          }
        });
        count++;
      }
    }
  }

  console.log(`✅ Seeded ${count} language packs`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });