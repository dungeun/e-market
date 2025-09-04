import { query } from '@/lib/db';
import { logger } from '@/lib/logger';

// Types
interface LanguagePack {
  id: string;
  key: string;
  ko: string;
  en: string;
  ja: string;
  category: string;
  description?: string;
}

// 메모리 캐시
let cachedLanguagePacks: Record<string, LanguagePack> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10분 (언어팩은 자주 변경되지 않음)

export async function getCachedLanguagePacks(): Promise<
  Record<string, LanguagePack>
> {
  const now = Date.now();

  // 캐시가 유효한 경우 바로 반환
  if (cachedLanguagePacks && now - cacheTimestamp < CACHE_TTL) {
    return cachedLanguagePacks;
  }

  try {
    // DB에서 언어팩 데이터 가져오기 (타임아웃 3초)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Language pack timeout")), 3000);
    });

    // language_packs 테이블에서 데이터 조회 - 점(.) 구분자 사용
    const sql = `
      SELECT 
        key,
        key as full_key,
        ko,
        en,
        ja,
        'general' as category,
        '' as description
      FROM language_packs
    `;
    
    const packsPromise = query(sql);

    const result = (await Promise.race([packsPromise, timeoutPromise])) as any;
    const packs = result.rows || result;

    // 키-값 형태로 변환 - 점(.) 구분자로 통일
    const languagePacks = packs.reduce(
      (acc, pack) => {
        // key를 직접 사용 (이미 점(.) 구분자 포함)
        const fullKey = pack.key || pack.full_key;
        acc[fullKey] = {
          id: fullKey,
          key: fullKey,
          ko: pack.ko || '',
          en: pack.en || '',
          ja: pack.ja || '',
          category: pack.category || 'general',
          description: pack.description || undefined,
        };
        return acc;
      },
      {} as Record<string, LanguagePack>,
    );

    // 캐시 업데이트
    cachedLanguagePacks = languagePacks;
    cacheTimestamp = now;

    logger.info(`Language packs cached: ${Object.keys(languagePacks).length} packs`);
    return languagePacks;
  } catch (error) {
    logger.error('Failed to load language packs:', error);

    // DB 실패 시 빈 객체 반환
    const fallbackPacks: Record<string, LanguagePack> = {};

    // 실패한 경우에도 캐시하여 반복 요청 방지 (2분간)
    if (!cachedLanguagePacks) {
      cachedLanguagePacks = fallbackPacks;
      cacheTimestamp = now - CACHE_TTL + 120000; // 2분 후 다시 시도
    }

    return cachedLanguagePacks;
  }
}

// 캐시 무효화 함수 (관리자에서 언어팩 업데이트 시 사용)
export function invalidateLanguagePacksCache(): void {
  cachedLanguagePacks = null;
  cacheTimestamp = 0;
  logger.info('Language packs cache invalidated');
}

/**
 * Get language pack by key
 */
export async function getLanguagePack(key: string): Promise<LanguagePack | null> {
  const packs = await getCachedLanguagePacks();
  return packs[key] || null;
}

/**
 * Get language packs by category
 */
export async function getLanguagePacksByCategory(category: string): Promise<Record<string, LanguagePack>> {
  const packs = await getCachedLanguagePacks();
  return Object.entries(packs)
    .filter(([_, pack]) => pack.category === category)
    .reduce((acc, [key, pack]) => {
      acc[key] = pack;
      return acc;
    }, {} as Record<string, LanguagePack>);
}

/**
 * Get translated text for a key
 */
export async function getTranslation(key: string, lang: 'ko' | 'en' | 'ja' = 'ko'): Promise<string> {
  const pack = await getLanguagePack(key);
  if (!pack) return key; // Return key as fallback
  return pack[lang] || pack.ko || key;
}

/**
 * Get multiple translations
 */
export async function getTranslations(keys: string[], lang: 'ko' | 'en' | 'ja' = 'ko'): Promise<Record<string, string>> {
  const packs = await getCachedLanguagePacks();
  return keys.reduce((acc, key) => {
    const pack = packs[key];
    acc[key] = pack ? (pack[lang] || pack.ko || key) : key;
    return acc;
  }, {} as Record<string, string>);
}
