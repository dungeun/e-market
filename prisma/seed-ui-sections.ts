import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding UI sections...');

  // Hero 섹션 시드
  const heroSection = await prisma.uISection.upsert({
    where: { key: 'hero-main' },
    update: {},
    create: {
      key: 'hero-main',
      type: 'hero',
      title: 'Hero Banner',
      order: 1,
      data: {
        content: {
          slides: [
            {
              id: 'slide-1',
              title: '인플루언서와 함께하는\n브랜드 성장',
              subtitle: '효과적인 마케팅 캠페인을 시작하세요',
              tag: '🔥 핫딜',
              bgColor: 'bg-gradient-to-br from-blue-600 to-purple-700',
              backgroundImage: '/images/hero-slide-1.jpg',
              link: '/campaigns'
            },
            {
              id: 'slide-2',
              title: '검증된 인플루언서\n네트워크',
              subtitle: '10만+ 인플루언서와 함께하세요',
              bgColor: 'bg-gradient-to-br from-green-600 to-teal-700',
              backgroundImage: '/images/hero-slide-2.jpg',
              link: '/influencers'
            },
            {
              id: 'slide-3',
              title: '실시간 캠페인 분석',
              subtitle: '데이터 기반 마케팅 전략',
              bgColor: 'bg-gradient-to-br from-purple-600 to-pink-700',
              backgroundImage: '/images/hero-slide-3.jpg',
              link: '/analytics'
            },
            {
              id: 'slide-4',
              title: '맞춤형 캠페인\n솔루션',
              subtitle: '브랜드에 최적화된 전략',
              tag: '⭐ 프리미엄',
              bgColor: 'bg-gradient-to-br from-orange-600 to-red-700',
              backgroundImage: '/images/hero-slide-4.jpg',
              link: '/solutions'
            },
            {
              id: 'slide-5',
              title: 'AI 기반 매칭 시스템',
              subtitle: '최적의 인플루언서 자동 추천',
              bgColor: 'bg-gradient-to-br from-indigo-600 to-blue-700',
              backgroundImage: '/images/hero-slide-5.jpg',
              link: '/ai-matching'
            },
            {
              id: 'slide-6',
              title: '글로벌 캠페인 지원',
              subtitle: '해외 시장 진출의 파트너',
              tag: '💎 신규 론칭',
              bgColor: 'bg-gradient-to-br from-teal-600 to-green-700',
              backgroundImage: '/images/hero-slide-6.jpg',
              link: '/global'
            }
          ]
        },
        translations: {
          en: {
            slides: [
              {
                id: 'slide-1',
                title: 'Grow Your Brand\nwith Influencers',
                subtitle: 'Start Effective Marketing Campaigns',
                tag: '🔥 Hot Deal',
                bgColor: 'bg-gradient-to-br from-blue-600 to-purple-700',
                backgroundImage: '/images/hero-slide-1.jpg',
                link: '/campaigns'
              },
              {
                id: 'slide-2',
                title: 'Verified Influencer\nNetwork',
                subtitle: 'Join 100K+ Influencers',
                bgColor: 'bg-gradient-to-br from-green-600 to-teal-700',
                backgroundImage: '/images/hero-slide-2.jpg',
                link: '/influencers'
              },
              {
                id: 'slide-3',
                title: 'Real-time Campaign Analytics',
                subtitle: 'Data-driven Marketing Strategy',
                bgColor: 'bg-gradient-to-br from-purple-600 to-pink-700',
                backgroundImage: '/images/hero-slide-3.jpg',
                link: '/analytics'
              },
              {
                id: 'slide-4',
                title: 'Custom Campaign\nSolutions',
                subtitle: 'Brand-optimized Strategy',
                tag: '⭐ Premium',
                bgColor: 'bg-gradient-to-br from-orange-600 to-red-700',
                backgroundImage: '/images/hero-slide-4.jpg',
                link: '/solutions'
              },
              {
                id: 'slide-5',
                title: 'AI-powered Matching System',
                subtitle: 'Auto-recommend Best Influencers',
                bgColor: 'bg-gradient-to-br from-indigo-600 to-blue-700',
                backgroundImage: '/images/hero-slide-5.jpg',
                link: '/ai-matching'
              },
              {
                id: 'slide-6',
                title: 'Global Campaign Support',
                subtitle: 'Partner for Global Expansion',
                tag: '💎 New Launch',
                bgColor: 'bg-gradient-to-br from-teal-600 to-green-700',
                backgroundImage: '/images/hero-slide-6.jpg',
                link: '/global'
              }
            ]
          },
          jp: {
            slides: [
              {
                id: 'slide-1',
                title: 'インフルエンサーと共に\nブランド成長',
                subtitle: '効果的なマーケティングキャンペーンを開始',
                tag: '🔥 ホットディール',
                bgColor: 'bg-gradient-to-br from-blue-600 to-purple-700',
                backgroundImage: '/images/hero-slide-1.jpg',
                link: '/campaigns'
              },
              {
                id: 'slide-2',
                title: '検証済みインフルエンサー\nネットワーク',
                subtitle: '10万人以上のインフルエンサーと一緒に',
                bgColor: 'bg-gradient-to-br from-green-600 to-teal-700',
                backgroundImage: '/images/hero-slide-2.jpg',
                link: '/influencers'
              },
              {
                id: 'slide-3',
                title: 'リアルタイムキャンペーン分析',
                subtitle: 'データ駆動型マーケティング戦略',
                bgColor: 'bg-gradient-to-br from-purple-600 to-pink-700',
                backgroundImage: '/images/hero-slide-3.jpg',
                link: '/analytics'
              },
              {
                id: 'slide-4',
                title: 'カスタムキャンペーン\nソリューション',
                subtitle: 'ブランドに最適化された戦略',
                tag: '⭐ プレミアム',
                bgColor: 'bg-gradient-to-br from-orange-600 to-red-700',
                backgroundImage: '/images/hero-slide-4.jpg',
                link: '/solutions'
              },
              {
                id: 'slide-5',
                title: 'AI基盤マッチングシステム',
                subtitle: '最適なインフルエンサー自動推薦',
                bgColor: 'bg-gradient-to-br from-indigo-600 to-blue-700',
                backgroundImage: '/images/hero-slide-5.jpg',
                link: '/ai-matching'
              },
              {
                id: 'slide-6',
                title: 'グローバルキャンペーンサポート',
                subtitle: '海外市場進出のパートナー',
                tag: '💎 新規ローンチ',
                bgColor: 'bg-gradient-to-br from-teal-600 to-green-700',
                backgroundImage: '/images/hero-slide-6.jpg',
                link: '/global'
              }
            ]
          }
        }
      }
    }
  });

  // Category 섹션 시드
  const categorySection = await prisma.uISection.upsert({
    where: { key: 'category-main' },
    update: {},
    create: {
      key: 'category-main',
      type: 'category',
      title: 'Categories',
      order: 2,
      data: {
        content: {
          categories: [
            {
              id: 'cat-1',
              categoryId: 'beauty',
              name: '뷰티',
              icon: '💄',
              badge: 'HOT'
            },
            {
              id: 'cat-2',
              categoryId: 'fashion',
              name: '패션',
              icon: '👗'
            },
            {
              id: 'cat-3',
              categoryId: 'food',
              name: '푸드',
              icon: '🍽️',
              badge: 'NEW'
            },
            {
              id: 'cat-4',
              categoryId: 'travel',
              name: '여행',
              icon: '✈️'
            },
            {
              id: 'cat-5',
              categoryId: 'tech',
              name: '테크',
              icon: '📱'
            },
            {
              id: 'cat-6',
              categoryId: 'fitness',
              name: '피트니스',
              icon: '💪'
            },
            {
              id: 'cat-7',
              categoryId: 'lifestyle',
              name: '라이프스타일',
              icon: '🌟'
            },
            {
              id: 'cat-8',
              categoryId: 'pet',
              name: '펫',
              icon: '🐕'
            }
          ]
        },
        translations: {
          en: {
            categories: [
              {
                id: 'cat-1',
                categoryId: 'beauty',
                name: 'Beauty',
                icon: '💄',
                badge: 'HOT'
              },
              {
                id: 'cat-2',
                categoryId: 'fashion',
                name: 'Fashion',
                icon: '👗'
              },
              {
                id: 'cat-3',
                categoryId: 'food',
                name: 'Food',
                icon: '🍽️',
                badge: 'NEW'
              },
              {
                id: 'cat-4',
                categoryId: 'travel',
                name: 'Travel',
                icon: '✈️'
              },
              {
                id: 'cat-5',
                categoryId: 'tech',
                name: 'Tech',
                icon: '📱'
              },
              {
                id: 'cat-6',
                categoryId: 'fitness',
                name: 'Fitness',
                icon: '💪'
              },
              {
                id: 'cat-7',
                categoryId: 'lifestyle',
                name: 'Lifestyle',
                icon: '🌟'
              },
              {
                id: 'cat-8',
                categoryId: 'pet',
                name: 'Pet',
                icon: '🐕'
              }
            ]
          },
          jp: {
            categories: [
              {
                id: 'cat-1',
                categoryId: 'beauty',
                name: 'ビューティー',
                icon: '💄',
                badge: 'HOT'
              },
              {
                id: 'cat-2',
                categoryId: 'fashion',
                name: 'ファッション',
                icon: '👗'
              },
              {
                id: 'cat-3',
                categoryId: 'food',
                name: 'フード',
                icon: '🍽️',
                badge: 'NEW'
              },
              {
                id: 'cat-4',
                categoryId: 'travel',
                name: '旅行',
                icon: '✈️'
              },
              {
                id: 'cat-5',
                categoryId: 'tech',
                name: 'テック',
                icon: '📱'
              },
              {
                id: 'cat-6',
                categoryId: 'fitness',
                name: 'フィットネス',
                icon: '💪'
              },
              {
                id: 'cat-7',
                categoryId: 'lifestyle',
                name: 'ライフスタイル',
                icon: '🌟'
              },
              {
                id: 'cat-8',
                categoryId: 'pet',
                name: 'ペット',
                icon: '🐕'
              }
            ]
          }
        }
      }
    }
  });

  // QuickLinks 섹션 시드
  const quicklinksSection = await prisma.uISection.upsert({
    where: { key: 'quicklinks-main' },
    update: {},
    create: {
      key: 'quicklinks-main',
      type: 'quicklinks',
      title: 'Quick Links',
      order: 3,
      data: {
        content: {
          links: [
            {
              id: 'quick-1',
              title: '이벤트',
              icon: '🎉',
              link: '/events'
            },
            {
              id: 'quick-2',
              title: '쿠폰',
              icon: '🎫',
              link: '/coupons'
            },
            {
              id: 'quick-3',
              title: '랭킹',
              icon: '🏆',
              link: '/ranking'
            }
          ]
        },
        translations: {
          en: {
            links: [
              {
                id: 'quick-1',
                title: 'Events',
                icon: '🎉',
                link: '/events'
              },
              {
                id: 'quick-2',
                title: 'Coupons',
                icon: '🎫',
                link: '/coupons'
              },
              {
                id: 'quick-3',
                title: 'Ranking',
                icon: '🏆',
                link: '/ranking'
              }
            ]
          },
          jp: {
            links: [
              {
                id: 'quick-1',
                title: 'イベント',
                icon: '🎉',
                link: '/events'
              },
              {
                id: 'quick-2',
                title: 'クーポン',
                icon: '🎫',
                link: '/coupons'
              },
              {
                id: 'quick-3',
                title: 'ランキング',
                icon: '🏆',
                link: '/ranking'
              }
            ]
          }
        }
      }
    }
  });

  // Promo 섹션 시드
  const promoSection = await prisma.uISection.upsert({
    where: { key: 'promo-main' },
    update: {},
    create: {
      key: 'promo-main',
      type: 'promo',
      title: 'Promotion',
      order: 4,
      data: {
        content: {
          title: '지금 시작하세요!',
          subtitle: '첫 캠페인 30% 할인 이벤트',
          icon: '🚀',
          backgroundColor: '#FEF3C7',
          textColor: '#92400E',
          backgroundImage: '/images/promo-bg.jpg',
          link: '/get-started'
        },
        translations: {
          en: {
            title: 'Start Now!',
            subtitle: 'First Campaign 30% OFF',
            icon: '🚀',
            backgroundColor: '#FEF3C7',
            textColor: '#92400E',
            backgroundImage: '/images/promo-bg.jpg',
            link: '/get-started'
          },
          jp: {
            title: '今すぐ始めよう！',
            subtitle: '初回キャンペーン30%割引',
            icon: '🚀',
            backgroundColor: '#FEF3C7',
            textColor: '#92400E',
            backgroundImage: '/images/promo-bg.jpg',
            link: '/get-started'
          }
        }
      }
    }
  });

  console.log('✅ Seeded UI sections:');
  console.log('- Hero section:', heroSection.id);
  console.log('- Category section:', categorySection.id);
  console.log('- QuickLinks section:', quicklinksSection.id);
  console.log('- Promo section:', promoSection.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });