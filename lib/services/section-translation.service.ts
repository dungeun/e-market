import { translateText } from './translation.service';
import { query } from '@/lib/db';

interface SectionTranslationOptions {
  sectionKey: string;
  content: unknown;
  autoTranslate: boolean;
}

/**
 * 이모지를 보존하면서 텍스트만 번역
 */
async function translateTagText(text: string, from: string, to: string): Promise<string> {
  // 이모지 패턴
  const emojiRegex = /[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]/gu;
  
  // 이모지 찾기
  const emojis = text.match(emojiRegex) || [];
  
  // 이모지 제거한 텍스트
  const textOnly = text.replace(emojiRegex, '').trim();
  
  if (!textOnly) return text;
  
  // 텍스트 번역
  const translated = await translateText(textOnly, from, to);
  
  // 이모지 다시 붙이기 (원본 위치 유지)
  if (emojis.length > 0) {
    // 첫 번째 이모지가 앞에 있었는지 확인
    if (text.indexOf(emojis[0]) === 0) {
      return emojis[0] + ' ' + translated;
    } else {
      return translated + ' ' + emojis[0];
    }
  }
  
  return translated;
}

/**
 * 슬라이드 번역
 */
async function translateSlide(slide: unknown, targetLang: string): Promise<unknown> {
  const translatedSlide = { ...slide };
  
  if (slide.title) {
    translatedSlide.title = await translateText(slide.title, 'ko', targetLang);
  }
  
  if (slide.subtitle) {
    translatedSlide.subtitle = await translateText(slide.subtitle, 'ko', targetLang);
  }
  
  if (slide.tag) {
    translatedSlide.tag = await translateTagText(slide.tag, 'ko', targetLang);
  }
  
  return translatedSlide;
}

/**
 * 카테고리 번역
 */
async function translateCategory(category: unknown, targetLang: string): Promise<unknown> {
  const translatedCategory = { ...category };
  
  if (category.name) {
    translatedCategory.name = await translateText(category.name, 'ko', targetLang);
  }
  
  if (category.badge) {
    translatedCategory.badge = await translateText(category.badge, 'ko', targetLang);
  }
  
  return translatedCategory;
}

/**
 * 섹션별 자동 번역 처리
 */
export async function translateSectionContent(
  options: SectionTranslationOptions
): Promise<unknown> {
  const { sectionKey, content, autoTranslate } = options;

  if (!autoTranslate || !content) {
    return {};
  }

  try {
    const translations: unknown = {
      en: {},
      jp: {}
    };

    switch (sectionKey) {
      case 'hero':
        if (content.slides && Array.isArray(content.slides)) {
          translations.en.slides = [];
          translations.jp.slides = [];

          for (const slide of content.slides) {
            // 영어 번역
            const enSlide = await translateSlide(slide, 'en');
            translations.en.slides.push(enSlide);

            // 일본어 번역
            const jpSlide = await translateSlide(slide, 'ja');
            translations.jp.slides.push(jpSlide);
          }
        }
        break;

      case 'category':
        if (content.categories && Array.isArray(content.categories)) {
          translations.en.categories = [];
          translations.jp.categories = [];

          for (const category of content.categories) {
            // 영어 번역
            const enCategory = await translateCategory(category, 'en');
            translations.en.categories.push(enCategory);

            // 일본어 번역
            const jpCategory = await translateCategory(category, 'ja');
            translations.jp.categories.push(jpCategory);
          }
        }
        break;

      case 'recommended':
      case 'ranking':
        if (content.title) {
          translations.en.title = await translateText(content.title, 'ko', 'en');
          translations.jp.title = await translateText(content.title, 'ko', 'ja');
        }
        
        if (content.subtitle) {
          translations.en.subtitle = await translateText(content.subtitle, 'ko', 'en');
          translations.jp.subtitle = await translateText(content.subtitle, 'ko', 'ja');
        }
        break;

      case 'quicklinks':
        if (content.links && Array.isArray(content.links)) {
          translations.en.links = [];
          translations.jp.links = [];

          for (const link of content.links) {
            const enLink = { ...link };
            const jpLink = { ...link };
            
            if (link.title) {
              enLink.title = await translateTagText(link.title, 'ko', 'en');
              jpLink.title = await translateTagText(link.title, 'ko', 'ja');
            }
            
            translations.en.links.push(enLink);
            translations.jp.links.push(jpLink);
          }
        }
        break;

      default:
        // 기본적으로 title과 subtitle만 번역
        if (content.title) {
          translations.en.title = await translateText(content.title, 'ko', 'en');
          translations.jp.title = await translateText(content.title, 'ko', 'ja');
        }
        
        if (content.subtitle) {
          translations.en.subtitle = await translateText(content.subtitle, 'ko', 'en');
          translations.jp.subtitle = await translateText(content.subtitle, 'ko', 'ja');
        }
    }

    return translations;
  } catch (error) {

    return {};
  }
}

/**
 * 언어팩에 저장
 */
export async function saveToLanguagePack(
  sectionKey: string,
  translations: any
): Promise<void> {
  try {
    // language_packs 테이블에 저장
    const languages = ['ko', 'en', 'ja'];
    
    for (const lang of languages) {
      if (translations[lang]) {
        const namespace = `ui.${sectionKey}`;
        const value = JSON.stringify(translations[lang]);
        
        // Upsert: 있으면 업데이트, 없으면 삽입
        await query(`
          INSERT INTO language_packs (namespace, key, "languageCode", value, description)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (namespace, key, "languageCode") 
          DO UPDATE SET 
            value = EXCLUDED.value,
            "updatedAt" = NOW()
        `, [namespace, 'content', lang, value, `UI Section: ${sectionKey}`]);
      }
    }

  } catch (error) {

    // 에러를 던지지 않고 로그만 남김 (번역 실패가 전체 업데이트를 막지 않도록)
  }
}