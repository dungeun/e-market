#!/usr/bin/env node

/**
 * UI 섹션 JSON 생성 스크립트
 * 데이터베이스의 ui_sections 테이블에서 데이터를 읽어 JSON 파일 생성
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { query } from '../lib/db/index.js';

// 기본 섹션 데이터 (데이터베이스에 없는 경우 사용)
const defaultSectionData = {
  hero: {
    ko: {
      slides: [
        {
          id: "hero-1",
          title: "최신 상품을 만나보세요",
          subtitle: "품질 좋은 상품을 저렴한 가격에",
          buttonText: "지금 쇼핑하기",
          buttonLink: "/products",
          backgroundImage: "/images/hero-bg-1.jpg",
          backgroundColor: "#3B82F6",
          textColor: "#FFFFFF"
        }
      ]
    },
    en: {
      slides: [
        {
          id: "hero-1",
          title: "Discover Latest Products",
          subtitle: "Quality products at affordable prices",
          buttonText: "Shop Now",
          buttonLink: "/products",
          backgroundImage: "/images/hero-bg-1.jpg",
          backgroundColor: "#3B82F6",
          textColor: "#FFFFFF"
        }
      ]
    },
    jp: {
      slides: [
        {
          id: "hero-1",
          title: "最新商品を発見",
          subtitle: "お手頃価格で高品質な商品",
          buttonText: "今すぐ購入",
          buttonLink: "/products",
          backgroundImage: "/images/hero-bg-1.jpg",
          backgroundColor: "#3B82F6",
          textColor: "#FFFFFF"
        }
      ]
    }
  },
  category: {
    ko: {
      title: "카테고리",
      items: [
        {
          id: "cat-electronics",
          name: "전자제품",
          slug: "electronics",
          icon: "📱",
          image: "/images/categories/electronics.jpg",
          productCount: 2
        },
        {
          id: "cat-beauty",
          name: "뷰티/화장품",
          slug: "beauty",
          icon: "💄",
          image: "/images/categories/beauty.jpg",
          productCount: 1
        }
      ]
    },
    en: {
      title: "Categories",
      items: [
        {
          id: "cat-electronics",
          name: "Electronics",
          slug: "electronics",
          icon: "📱",
          image: "/images/categories/electronics.jpg",
          productCount: 2
        },
        {
          id: "cat-beauty",
          name: "Beauty & Cosmetics",
          slug: "beauty",
          icon: "💄",
          image: "/images/categories/beauty.jpg",
          productCount: 1
        }
      ]
    },
    jp: {
      title: "カテゴリ",
      items: [
        {
          id: "cat-electronics",
          name: "電子機器",
          slug: "electronics",
          icon: "📱",
          image: "/images/categories/electronics.jpg",
          productCount: 2
        },
        {
          id: "cat-beauty",
          name: "美容・化粧品",
          slug: "beauty",
          icon: "💄",
          image: "/images/categories/beauty.jpg",
          productCount: 1
        }
      ]
    }
  },
  quicklinks: {
    ko: {
      title: "바로가기",
      links: [
        {
          id: "quick-1",
          icon: "🎉",
          link: "/events",
          title: "이벤트"
        },
        {
          id: "quick-2",
          icon: "🎫",
          link: "/coupons",
          title: "쿠폰"
        },
        {
          id: "quick-3",
          icon: "🏆",
          link: "/ranking",
          title: "랭킹"
        }
      ]
    },
    en: {
      title: "Quick Links",
      links: [
        {
          id: "quick-1",
          icon: "🎉",
          link: "/events",
          title: "Events"
        },
        {
          id: "quick-2",
          icon: "🎫",
          link: "/coupons",
          title: "Coupons"
        },
        {
          id: "quick-3",
          icon: "🏆",
          link: "/ranking",
          title: "Ranking"
        }
      ]
    },
    jp: {
      title: "クイックリンク",
      links: [
        {
          id: "quick-1",
          icon: "🎉",
          link: "/events",
          title: "イベント"
        },
        {
          id: "quick-2",
          icon: "🎫",
          link: "/coupons",
          title: "クーポン"
        },
        {
          id: "quick-3",
          icon: "🏆",
          link: "/ranking",
          title: "ランキング"
        }
      ]
    }
  },
  promo: {
    ko: {
      title: "첫 캠페인 수수료 0%",
      subtitle: "지금 시작하고 혜택을 받아보세요",
      icon: "🎁",
      link: "/register",
      backgroundColor: "#FEF3C7",
      textColor: "#000000"
    },
    en: {
      title: "0% Commission on First Campaign",
      subtitle: "Start now and get benefits",
      icon: "🎁",
      link: "/register",
      backgroundColor: "#FEF3C7",
      textColor: "#000000"
    },
    jp: {
      title: "初回キャンペーン手数料0%",
      subtitle: "今すぐ始めて特典をゲット",
      icon: "🎁",
      link: "/register",
      backgroundColor: "#FEF3C7",
      textColor: "#000000"
    }
  },
  ranking: {
    ko: {
      title: "인기 상품",
      subtitle: "가장 많이 팔린 상품들",
      items: []
    },
    en: {
      title: "Popular Products",
      subtitle: "Best selling products",
      items: []
    },
    jp: {
      title: "人気商品",
      subtitle: "ベストセラー商品",
      items: []
    }
  },
  recommended: {
    ko: {
      title: "추천 상품",
      subtitle: "당신을 위한 맞춤 추천",
      items: []
    },
    en: {
      title: "Recommended Products",
      subtitle: "Personalized recommendations for you",
      items: []
    },
    jp: {
      title: "おすすめ商品",
      subtitle: "あなたのためのパーソナル推薦",
      items: []
    }
  }
};

async function generateUISectionsJSON() {
  try {
    console.log('🚀 UI 섹션 JSON 생성 시작...');
    
    // 데이터베이스에서 활성화된 섹션들 가져오기
    const result = await query(
      `SELECT id, key, title, type, "isActive", "order", data, props, style, translations
       FROM ui_sections 
       WHERE "isActive" = true 
       ORDER BY "order" ASC`
    );
    
    const sections = result.rows;
    console.log(`📋 발견된 활성 섹션: ${sections.length}개`);
    
    // JSON 구조 생성
    const uiSectionsData: any = {
      sectionOrder: sections.map(section => section.key)
    };
    
    // 각 섹션 데이터 처리
    for (const section of sections) {
      const sectionKey = section.key;
      console.log(`🔧 처리 중: ${sectionKey}`);
      
      // 데이터베이스의 translations 또는 기본 데이터 사용
      let sectionData = section.translations || {};
      
      // translations가 비어있거나 언어별 데이터가 없으면 기본값 사용
      if (!sectionData.ko && !sectionData.en && !sectionData.jp) {
        if (defaultSectionData[sectionKey as keyof typeof defaultSectionData]) {
          sectionData = defaultSectionData[sectionKey as keyof typeof defaultSectionData];
          console.log(`  ✨ ${sectionKey}: 기본 데이터 사용`);
        } else {
          // 최소한의 구조 생성
          sectionData = {
            ko: { title: section.title || sectionKey },
            en: { title: section.title || sectionKey },
            jp: { title: section.title || sectionKey }
          };
          console.log(`  📝 ${sectionKey}: 최소 구조 생성`);
        }
      } else {
        console.log(`  ✅ ${sectionKey}: 데이터베이스 데이터 사용`);
      }
      
      // data와 props가 있으면 각 언어에 병합
      if (section.data || section.props) {
        ['ko', 'en', 'jp'].forEach(lang => {
          if (!sectionData[lang]) sectionData[lang] = {};
          if (section.data) {
            sectionData[lang] = { ...sectionData[lang], ...section.data };
          }
          if (section.props) {
            sectionData[lang] = { ...sectionData[lang], ...section.props };
          }
        });
      }
      
      uiSectionsData[sectionKey] = sectionData;
    }
    
    // 디렉토리 생성
    const outputDir = join(process.cwd(), 'public', 'locales');
    mkdirSync(outputDir, { recursive: true });
    
    // JSON 파일 생성
    const outputPath = join(outputDir, 'ui-sections.json');
    const jsonContent = JSON.stringify(uiSectionsData, null, 2);
    writeFileSync(outputPath, jsonContent, 'utf-8');
    
    console.log('✅ UI 섹션 JSON 생성 완료!');
    console.log(`📁 경로: ${outputPath}`);
    console.log(`📊 총 섹션 수: ${Object.keys(uiSectionsData).length - 1}`); // sectionOrder 제외
    console.log(`🎯 섹션 순서: ${uiSectionsData.sectionOrder.join(', ')}`);
    
  } catch (error) {
    console.error('❌ UI 섹션 JSON 생성 실패:', error);
    process.exit(1);
  }
}

// 메인 실행
if (require.main === module) {
  generateUISectionsJSON()
    .then(() => {
      console.log('🎉 작업 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 작업 실패:', error);
      process.exit(1);
    });
}

export { generateUISectionsJSON };