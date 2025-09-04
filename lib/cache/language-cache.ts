import { redis } from '@/lib/db/redis';
import { logger } from '@/lib/logger';
import { query } from '@/lib/db';

/**
 * 3단계 캐싱 시스템
 * 1. 메모리 캐시 (< 1ms)
 * 2. Redis 캐시 (< 10ms)  
 * 3. 데이터베이스 (< 50ms)
 */

interface LanguagePackData {
  key: string;
  category: string;
  description?: string;
  [languageCode: string]: string | undefined; // 동적 언어 지원
}

interface CacheData {
  data: LanguagePackData[];
  timestamp: number;
}

// 메모리 캐시
const memoryCache = new Map<string, CacheData>();
const MEMORY_TTL = 5 * 60 * 1000; // 5분
const REDIS_TTL = 30 * 60; // 30분 (초 단위)
const REDIS_KEY_PREFIX = 'language:packs:';

/**
 * 캐시 키 생성
 */
function getCacheKey(category?: string): string {
  return category ? `${REDIS_KEY_PREFIX}category:${category}` : `${REDIS_KEY_PREFIX}all`;
}

/**
 * 메모리 캐시에서 가져오기
 */
function getFromMemory(key: string): LanguagePackData[] | null {
  const cached = memoryCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < MEMORY_TTL) {
    logger.debug(`Memory cache hit for ${key}`);
    return cached.data;
  }
  
  // 만료된 캐시 제거
  if (cached) {
    memoryCache.delete(key);
  }
  
  return null;
}

/**
 * 메모리 캐시에 저장
 */
function saveToMemory(key: string, data: LanguagePackData[]): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // 메모리 캐시 크기 제한 (최대 100개 키)
  if (memoryCache.size > 100) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }
}

/**
 * Redis 캐시에서 가져오기
 */
async function getFromRedis(key: string): Promise<LanguagePackData[] | null> {
  try {
    if (!redis) {
      return null;
    }
    
    const cached = await redis.get(key);
    
    if (cached) {
      logger.debug(`Redis cache hit for ${key}`);
      return JSON.parse(cached);
    }
  } catch (error) {
    logger.warn(`Redis cache read error for ${key}:`, error);
  }
  
  return null;
}

/**
 * Redis 캐시에 저장
 */
async function saveToRedis(key: string, data: LanguagePackData[]): Promise<void> {
  try {
    if (!redis) {
      return;
    }
    
    await redis.setex(key, REDIS_TTL, JSON.stringify(data));
    logger.debug(`Saved to Redis cache: ${key}`);
  } catch (error) {
    logger.warn(`Redis cache write error for ${key}:`, error);
  }
}

/**
 * 언어 설정 가져오기
 */
async function getLanguageSettings(): Promise<string[]> {
  try {
    const result = await query(`
      SELECT selected_languages 
      FROM language_settings 
      WHERE id = 1
    `);
    
    if (result.rows.length > 0) {
      return result.rows[0].selected_languages || ['ko', 'en'];
    }
  } catch (error) {
    logger.warn('Failed to get language settings:', error);
  }
  return ['ko', 'en']; // 기본값
}

/**
 * 데이터베이스에서 가져오기
 */
async function getFromDatabase(category?: string): Promise<LanguagePackData[]> {
  try {
    // 언어 설정 가져오기
    const selectedLanguages = await getLanguageSettings();
    
    // 새로운 동적 시스템과 레거시 시스템 병합 조회
    let whereClause = '';
    const params: any[] = [];
    
    if (category) {
      params.push(category);
      whereClause = 'WHERE lpk.component_type = $1';
    }
    
    // 동적 CASE 문 생성
    const languageCases = selectedLanguages.map(lang => 
      `MAX(CASE WHEN lpt.language_code = '${lang}' THEN lpt.translation END) as ${lang}`
    ).join(',\n        ');
    
    // 새로운 동적 시스템에서 조회
    const dynamicResult = await query(`
      SELECT 
        lpk.key_name as key,
        lpk.component_type as category,
        lpk.description,
        ${languageCases}
      FROM language_pack_keys lpk
      LEFT JOIN language_pack_translations lpt ON lpk.id = lpt.key_id
      ${whereClause}
      ${whereClause ? 'AND' : 'WHERE'} lpk.is_active = true
      GROUP BY lpk.id, lpk.key_name, lpk.component_type, lpk.description
      ORDER BY lpk.key_name ASC
    `, params);
    
    let data = dynamicResult.rows || [];
    
    // 레거시 테이블도 확인
    try {
      const legacyResult = await query(`
        SELECT 
          key,
          ko,
          en,
          ja as jp,
          'general' as category
        FROM language_packs
        ${category ? "WHERE key LIKE $1 || '.%'" : ''}
        ORDER BY key ASC
      `, category ? [category] : []);
      
      // 중복 제거하여 병합
      const existingKeys = new Set(data.map((d: any) => d.key));
      const legacyData = (legacyResult.rows || []).filter((d: any) => !existingKeys.has(d.key));
      data = [...data, ...legacyData];
    } catch (err) {
      // 레거시 테이블이 없어도 계속 진행
      logger.debug('Legacy table not accessible, using dynamic system only');
    }
    
    // 언어 설정에 따라 동적으로 매핑
    return data.map((row: any) => {
      const result: LanguagePackData = {
        key: row.key,
        category: row.category || 'general',
        description: row.description || undefined
      };
      
      // 선택된 언어들 매핑
      for (const lang of selectedLanguages) {
        result[lang] = row[lang] || '';
      }
      
      // 한국어는 항상 포함 (기본 언어)
      if (!result.ko) {
        result.ko = row.ko || '';
      }
      
      return result;
    });
  } catch (error) {
    logger.error('Database query failed:', error);
    throw error;
  }
}

/**
 * 언어팩 데이터 가져오기 (3단계 캐싱)
 */
export async function getLanguagePacks(category?: string): Promise<LanguagePackData[]> {
  const cacheKey = getCacheKey(category);
  const startTime = Date.now();
  
  // 1단계: 메모리 캐시
  const memoryData = getFromMemory(cacheKey);
  if (memoryData) {
    logger.debug(`Language packs served from memory in ${Date.now() - startTime}ms`);
    return memoryData;
  }
  
  // 2단계: Redis 캐시
  const redisData = await getFromRedis(cacheKey);
  if (redisData) {
    // 메모리 캐시에 저장
    saveToMemory(cacheKey, redisData);
    logger.debug(`Language packs served from Redis in ${Date.now() - startTime}ms`);
    return redisData;
  }
  
  // 3단계: 데이터베이스
  const dbData = await getFromDatabase(category);
  
  // 모든 캐시 레벨에 저장
  saveToMemory(cacheKey, dbData);
  await saveToRedis(cacheKey, dbData);
  
  logger.info(`Language packs served from database in ${Date.now() - startTime}ms`);
  return dbData;
}

/**
 * 캐시 무효화
 */
export async function invalidateLanguageCache(category?: string): Promise<void> {
  const cacheKey = getCacheKey(category);
  
  // 메모리 캐시 무효화
  if (category) {
    memoryCache.delete(cacheKey);
  } else {
    memoryCache.clear();
  }
  
  // Redis 캐시 무효화
  try {
    if (redis) {
      if (category) {
        await redis.del(cacheKey);
      } else {
        // 모든 언어팩 캐시 삭제
        const keys = await redis.keys(`${REDIS_KEY_PREFIX}*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }
    }
  } catch (error) {
    logger.warn('Redis cache invalidation error:', error);
  }
  
  logger.info(`Cache invalidated for ${category || 'all categories'}`);
}

/**
 * 캐시 예열 (서버 시작 시)
 */
export async function warmupLanguageCache(): Promise<void> {
  try {
    logger.info('Warming up language cache...');
    
    // 전체 데이터 로드
    await getLanguagePacks();
    
    // 주요 카테고리별 로드
    const categories = ['header', 'common', 'footer', 'auth', 'products'];
    for (const category of categories) {
      await getLanguagePacks(category);
    }
    
    logger.info('Language cache warmup completed');
  } catch (error) {
    logger.error('Language cache warmup failed:', error);
  }
}

/**
 * 캐시 통계
 */
export function getCacheStats() {
  return {
    memoryCacheSize: memoryCache.size,
    memoryCacheKeys: Array.from(memoryCache.keys()),
    memoryTTL: MEMORY_TTL,
    redisTTL: REDIS_TTL
  };
}