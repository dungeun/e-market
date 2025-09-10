/**
 * 통합 데이터베이스 쿼리 서비스
 * - 중복 쿼리 패턴 통합
 * - Prepared Statement 활용
 * - Connection Pool 최적화
 * - 쿼리 캐싱 레이어
 * - N+1 문제 해결을 위한 배치 쿼리
 * - 타입 안전성 확보
 */

import { QueryResult } from 'pg';
import { query, getClient, transaction } from '@/lib/db';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

// Redis 캐시 인스턴스 - REDIS_URL 우선 사용
const redisUrl = process.env.REDIS_URL;
const redis = redisUrl
  ? new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectionName: 'unified-query-service'
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectionName: 'unified-query-service'
    });

redis.on('error', (err) => {
  console.warn('Redis connection error (unified query service):', err.message);
});

// 캐시 TTL 상수
const CACHE_TTL = {
  SHORT: 60,      // 1분 - 자주 변경되는 데이터
  MEDIUM: 300,    // 5분 - 보통 캐시
  LONG: 3600,     // 1시간 - 안정적인 데이터
  EXTENDED: 86400 // 24시간 - 정적 데이터
};

// 일반적인 쿼리 타입 정의
export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface QueryOptions {
  useCache?: boolean;
  cacheTTL?: number;
  transaction?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface OrderByOptions {
  column: string;
  direction: 'ASC' | 'DESC';
}

export interface BatchQueryItem {
  id: string;
  params: unknown[];
}

// 일반적인 WHERE 조건 타입
export type WhereCondition = {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'ILIKE' | 'IN' | 'NOT IN' | 'IS NULL' | 'IS NOT NULL';
  value?: unknown;
  values?: unknown[]; // IN, NOT IN 연산자용
};

export class UnifiedQueryService {
  private readonly cachePrefix = 'query:';
  private readonly defaultCacheTTL = CACHE_TTL.MEDIUM;
  
  // =============================================================================
  // 1. 기본 CRUD 패턴 통합
  // =============================================================================
  
  /**
   * 단일 ID로 엔티티 조회 (WHERE id = $1 패턴)
   */
  async findById<T extends BaseEntity>(
    table: string,
    id: string,
    options: QueryOptions = {}
  ): Promise<T | null> {
    const cacheKey = `${this.cachePrefix}${table}:id:${id}`;
    
    // 캐시 확인
    if (options.useCache !== false) {
      const cached = await this.getCachedResult<T>(cacheKey);
      if (cached) return cached;
    }
    
    const queryText = `SELECT * FROM ${table} WHERE id = $1 LIMIT 1`;
    const result = await query(queryText, [id]);
    
    const entity = result.rows[0] || null;
    
    // 캐시 저장
    if (entity && options.useCache !== false) {
      await this.setCachedResult(
        cacheKey,
        entity,
        options.cacheTTL || this.defaultCacheTTL
      );
    }
    
    return entity;
  }
  
  /**
   * 복수 ID로 엔티티 배치 조회 (N+1 문제 해결)
   */
  async findByIds<T extends BaseEntity>(
    table: string,
    ids: string[],
    options: QueryOptions = {}
  ): Promise<Map<string, T>> {
    if (ids.length === 0) return new Map();
    
    const result = new Map<string, T>();
    const uncachedIds: string[] = [];
    
    // 캐시에서 먼저 조회
    if (options.useCache !== false) {
      for (const id of ids) {
        const cacheKey = `${this.cachePrefix}${table}:id:${id}`;
        const cached = await this.getCachedResult<T>(cacheKey);
        if (cached) {
          result.set(id, cached);
        } else {
          uncachedIds.push(id);
        }
      }
    } else {
      uncachedIds.push(...ids);
    }
    
    // 캐시에 없는 것들을 DB에서 조회
    if (uncachedIds.length > 0) {
      const placeholders = uncachedIds.map((_, index) => `$${index + 1}`).join(',');
      const queryText = `SELECT * FROM ${table} WHERE id IN (${placeholders})`;
      const dbResult = await query(queryText, uncachedIds);
      
      for (const row of dbResult.rows) {
        result.set(row.id, row);
        
        // 개별 캐시 저장
        if (options.useCache !== false) {
          const cacheKey = `${this.cachePrefix}${table}:id:${row.id}`;
          await this.setCachedResult(
            cacheKey,
            row,
            options.cacheTTL || this.defaultCacheTTL
          );
        }
      }
    }
    
    return result;
  }
  
  /**
   * 조건부 단일 조회 (WHERE field = $1 패턴)
   */
  async findByField<T>(
    table: string,
    field: string,
    value: unknown,
    options: QueryOptions = {}
  ): Promise<T | null> {
    const cacheKey = `${this.cachePrefix}${table}:${field}:${String(value)}`;
    
    // 캐시 확인
    if (options.useCache !== false) {
      const cached = await this.getCachedResult<T>(cacheKey);
      if (cached) return cached;
    }
    
    const queryText = `SELECT * FROM ${table} WHERE ${field} = $1 LIMIT 1`;
    const result = await query(queryText, [value]);
    
    const entity = result.rows[0] || null;
    
    // 캐시 저장
    if (entity && options.useCache !== false) {
      await this.setCachedResult(
        cacheKey,
        entity,
        options.cacheTTL || this.defaultCacheTTL
      );
    }
    
    return entity;
  }
  
  /**
   * 조건부 복수 조회 (WHERE field = $1 패턴)
   */
  async findByFieldMultiple<T>(
    table: string,
    field: string,
    value: unknown,
    orderBy?: OrderByOptions,
    pagination?: PaginationOptions,
    options: QueryOptions = {}
  ): Promise<T[]> {
    const cacheKey = `${this.cachePrefix}${table}:${field}:${String(value)}:multi:${JSON.stringify(orderBy)}:${JSON.stringify(pagination)}`;
    
    // 캐시 확인
    if (options.useCache !== false) {
      const cached = await this.getCachedResult<T[]>(cacheKey);
      if (cached) return cached;
    }
    
    let queryText = `SELECT * FROM ${table} WHERE ${field} = $1`;
    const params = [value];
    
    // ORDER BY 추가
    if (orderBy) {
      queryText += ` ORDER BY ${orderBy.column} ${orderBy.direction}`;
    }
    
    // LIMIT/OFFSET 추가
    if (pagination) {
      if (pagination.limit) {
        params.push(pagination.limit);
        queryText += ` LIMIT $${params.length}`;
      }
      if (pagination.offset) {
        params.push(pagination.offset);
        queryText += ` OFFSET $${params.length}`;
      }
    }
    
    const result = await query(queryText, params);
    const entities = result.rows;
    
    // 캐시 저장
    if (options.useCache !== false) {
      await this.setCachedResult(
        cacheKey,
        entities,
        options.cacheTTL || this.defaultCacheTTL
      );
    }
    
    return entities;
  }
  
  // =============================================================================
  // 2. COUNT 쿼리 패턴 통합
  // =============================================================================
  
  /**
   * 전체 카운트 조회 (SELECT COUNT(*) as count 패턴)
   */
  async countAll(
    table: string,
    options: QueryOptions = {}
  ): Promise<number> {
    const cacheKey = `${this.cachePrefix}${table}:count:all`;
    
    // 캐시 확인
    if (options.useCache !== false) {
      const cached = await this.getCachedResult<number>(cacheKey);
      if (cached !== null && cached !== undefined) return cached;
    }
    
    const queryText = `SELECT COUNT(*) as count FROM ${table}`;
    const result = await query(queryText);
    
    const count = parseInt(result.rows[0].count);
    
    // 캐시 저장
    if (options.useCache !== false) {
      await this.setCachedResult(
        cacheKey,
        count,
        options.cacheTTL || this.defaultCacheTTL
      );
    }
    
    return count;
  }
  
  /**
   * 조건부 카운트 조회 (SELECT COUNT(*) WHERE field = $1 패턴)
   */
  async countByField(
    table: string,
    field: string,
    value: unknown,
    options: QueryOptions = {}
  ): Promise<number> {
    const cacheKey = `${this.cachePrefix}${table}:count:${field}:${String(value)}`;
    
    // 캐시 확인
    if (options.useCache !== false) {
      const cached = await this.getCachedResult<number>(cacheKey);
      if (cached !== null && cached !== undefined) return cached;
    }
    
    const queryText = `SELECT COUNT(*) as count FROM ${table} WHERE ${field} = $1`;
    const result = await query(queryText, [value]);
    
    const count = parseInt(result.rows[0].count);
    
    // 캐시 저장
    if (options.useCache !== false) {
      await this.setCachedResult(
        cacheKey,
        count,
        options.cacheTTL || this.defaultCacheTTL
      );
    }
    
    return count;
  }
  
  /**
   * 복합 조건 카운트 조회
   */
  async countByConditions(
    table: string,
    conditions: WhereCondition[],
    options: QueryOptions = {}
  ): Promise<number> {
    const conditionsKey = JSON.stringify(conditions);
    const cacheKey = `${this.cachePrefix}${table}:count:conditions:${conditionsKey}`;
    
    // 캐시 확인
    if (options.useCache !== false) {
      const cached = await this.getCachedResult<number>(cacheKey);
      if (cached !== null && cached !== undefined) return cached;
    }
    
    const { whereClause, params } = this.buildWhereClause(conditions);
    const queryText = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;
    const result = await query(queryText, params);
    
    const count = parseInt(result.rows[0].count);
    
    // 캐시 저장
    if (options.useCache !== false) {
      await this.setCachedResult(
        cacheKey,
        count,
        options.cacheTTL || this.defaultCacheTTL
      );
    }
    
    return count;
  }
  
  // =============================================================================
  // 3. 업데이트 패턴 통합
  // =============================================================================
  
  /**
   * ID로 엔티티 업데이트
   */
  async updateById(
    table: string,
    id: string,
    updates: Record<string, unknown>,
    options: QueryOptions = {}
  ): Promise<boolean> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');
    
    const queryText = `
      UPDATE ${table} 
      SET ${setClause}, updated_at = NOW() 
      WHERE id = $1
    `;
    
    const params = [id, ...values];
    
    const executeUpdate = async () => {
      const result = await query(queryText, params);
      return result.rowCount > 0;
    };
    
    let updateResult: boolean;
    
    if (options.transaction) {
      updateResult = await transaction(async (client: any) => {
        const result = await client.query(queryText, params);
        return result.rowCount > 0;
      });
    } else {
      updateResult = await executeUpdate();
    }
    
    // 캐시 무효화
    if (updateResult) {
      await this.invalidateEntityCache(table, id);
    }
    
    return updateResult;
  }
  
  /**
   * 조건부 업데이트
   */
  async updateByField(
    table: string,
    field: string,
    value: unknown,
    updates: Record<string, unknown>,
    options: QueryOptions = {}
  ): Promise<number> {
    const fields = Object.keys(updates);
    const updateValues = Object.values(updates);
    
    const setClause = fields
      .map((field, index) => `${field} = $${index + 3}`)
      .join(', ');
    
    const queryText = `
      UPDATE ${table} 
      SET ${setClause}, updated_at = NOW() 
      WHERE ${field} = $1
      RETURNING id
    `;
    
    const params = [value, ...updateValues];
    
    const executeUpdate = async () => {
      const result = await query(queryText, params);
      return result.rows;
    };
    
    let updatedRows;
    
    if (options.transaction) {
      updatedRows = await transaction(async (client: any) => {
        const result = await client.query(queryText, params);
        return result.rows;
      });
    } else {
      updatedRows = await executeUpdate();
    }
    
    // 캐시 무효화
    for (const row of updatedRows) {
      await this.invalidateEntityCache(table, row.id);
    }
    
    // 필드 기반 캐시도 무효화
    const fieldCachePattern = `${this.cachePrefix}${table}:${field}:${String(value)}*`;
    await this.invalidateCachePattern(fieldCachePattern);
    
    return updatedRows.length;
  }
  
  // =============================================================================
  // 4. 삭제 패턴 통합
  // =============================================================================
  
  /**
   * ID로 엔티티 삭제
   */
  async deleteById(
    table: string,
    id: string,
    options: QueryOptions = {}
  ): Promise<boolean> {
    const queryText = `DELETE FROM ${table} WHERE id = $1`;
    
    const executeDelete = async () => {
      const result = await query(queryText, [id]);
      return result.rowCount > 0;
    };
    
    let deleteResult: boolean;
    
    if (options.transaction) {
      deleteResult = await transaction(async (client: any) => {
        const result = await client.query(queryText, [id]);
        return result.rowCount > 0;
      });
    } else {
      deleteResult = await executeDelete();
    }
    
    // 캐시 무효화
    if (deleteResult) {
      await this.invalidateEntityCache(table, id);
    }
    
    return deleteResult;
  }
  
  /**
   * 조건부 삭제
   */
  async deleteByField(
    table: string,
    field: string,
    value: unknown,
    options: QueryOptions = {}
  ): Promise<number> {
    const queryText = `DELETE FROM ${table} WHERE ${field} = $1 RETURNING id`;
    
    const executeDelete = async () => {
      const result = await query(queryText, [value]);
      return result.rows;
    };
    
    let deletedRows;
    
    if (options.transaction) {
      deletedRows = await transaction(async (client: any) => {
        const result = await client.query(queryText, [value]);
        return result.rows;
      });
    } else {
      deletedRows = await executeDelete();
    }
    
    // 캐시 무효화
    for (const row of deletedRows) {
      await this.invalidateEntityCache(table, row.id);
    }
    
    // 필드 기반 캐시도 무효화
    const fieldCachePattern = `${this.cachePrefix}${table}:${field}:${String(value)}*`;
    await this.invalidateCachePattern(fieldCachePattern);
    
    return deletedRows.length;
  }
  
  // =============================================================================
  // 5. 배치 처리 패턴
  // =============================================================================
  
  /**
   * 배치 삽입 (대량 INSERT 최적화)
   */
  async batchInsert<T>(
    table: string,
    items: T[],
    options: QueryOptions = {}
  ): Promise<boolean> {
    if (items.length === 0) return true;
    
    const firstItem = items[0] as Record<string, unknown>;
    const fields = Object.keys(firstItem);
    const placeholders = items
      .map((_, itemIndex) => 
        `(${fields.map((_, fieldIndex) => `$${itemIndex * fields.length + fieldIndex + 1}`).join(', ')})`
      )
      .join(', ');
    
    const queryText = `
      INSERT INTO ${table} (${fields.join(', ')})
      VALUES ${placeholders}
    `;
    
    const params = items.flatMap(item => 
      fields.map(field => (item as Record<string, unknown>)[field])
    );
    
    const executeBatch = async () => {
      const result = await query(queryText, params);
      return result.rowCount === items.length;
    };
    
    if (options.transaction) {
      return await transaction(async (client: any) => {
        const result = await client.query(queryText, params);
        return result.rowCount === items.length;
      });
    } else {
      return await executeBatch();
    }
  }
  
  /**
   * 배치 업데이트 (CASE WHEN 활용)
   */
  async batchUpdate(
    table: string,
    updates: Array<{ id: string; data: Record<string, unknown> }>,
    options: QueryOptions = {}
  ): Promise<number> {
    if (updates.length === 0) return 0;
    
    const allFields = new Set<string>();
    updates.forEach(update => {
      Object.keys(update.data).forEach(field => allFields.add(field));
    });
    
    const fields = Array.from(allFields);
    const ids = updates.map(update => update.id);
    
    // CASE WHEN 절 생성
    const setClauses = fields.map(field => {
      const caseWhen = updates
        .map((update, index) => {
          const value = update.data[field];
          return value !== undefined ? `WHEN id = $${index + 1} THEN $${ids.length + fields.indexOf(field) * updates.length + index + 1}` : null;
        })
        .filter(Boolean)
        .join(' ');
      
      return `${field} = CASE ${caseWhen} ELSE ${field} END`;
    });
    
    const queryText = `
      UPDATE ${table} 
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id IN (${ids.map((_, index) => `$${index + 1}`).join(', ')})
      RETURNING id
    `;
    
    // 매개변수 배열 구성
    const params = [...ids];
    fields.forEach(field => {
      updates.forEach(update => {
        const value = update.data[field];
        if (value !== undefined) {
          params.push(value);
        }
      });
    });
    
    const executeBatch = async () => {
      const result = await query(queryText, params);
      return result.rows;
    };
    
    let updatedRows;
    
    if (options.transaction) {
      updatedRows = await transaction(async (client: any) => {
        const result = await client.query(queryText, params);
        return result.rows;
      });
    } else {
      updatedRows = await executeBatch();
    }
    
    // 캐시 무효화
    for (const row of updatedRows) {
      await this.invalidateEntityCache(table, row.id);
    }
    
    return updatedRows.length;
  }
  
  // =============================================================================
  // 6. 복합 조건 쿼리
  // =============================================================================
  
  /**
   * 복합 조건으로 엔티티 조회
   */
  async findByConditions<T>(
    table: string,
    conditions: WhereCondition[],
    orderBy?: OrderByOptions,
    pagination?: PaginationOptions,
    options: QueryOptions = {}
  ): Promise<T[]> {
    const conditionsKey = JSON.stringify({ conditions, orderBy, pagination });
    const cacheKey = `${this.cachePrefix}${table}:conditions:${conditionsKey}`;
    
    // 캐시 확인
    if (options.useCache !== false) {
      const cached = await this.getCachedResult<T[]>(cacheKey);
      if (cached) return cached;
    }
    
    const { whereClause, params } = this.buildWhereClause(conditions);
    let queryText = `SELECT * FROM ${table} ${whereClause}`;
    
    // ORDER BY 추가
    if (orderBy) {
      queryText += ` ORDER BY ${orderBy.column} ${orderBy.direction}`;
    }
    
    // LIMIT/OFFSET 추가
    if (pagination) {
      if (pagination.limit) {
        params.push(pagination.limit);
        queryText += ` LIMIT $${params.length}`;
      }
      if (pagination.offset) {
        params.push(pagination.offset);
        queryText += ` OFFSET $${params.length}`;
      }
    }
    
    const result = await query(queryText, params);
    const entities = result.rows;
    
    // 캐시 저장
    if (options.useCache !== false) {
      await this.setCachedResult(
        cacheKey,
        entities,
        options.cacheTTL || this.defaultCacheTTL
      );
    }
    
    return entities;
  }
  
  // =============================================================================
  // 7. 유틸리티 메서드
  // =============================================================================
  
  /**
   * WHERE 절 조건 빌더
   */
  private buildWhereClause(conditions: WhereCondition[]): { whereClause: string; params: unknown[] } {
    if (conditions.length === 0) {
      return { whereClause: '', params: [] };
    }
    
    const whereParts: string[] = [];
    const params: unknown[] = [];
    
    for (const condition of conditions) {
      let paramIndex = params.length + 1;
      
      switch (condition.operator) {
        case '=':
        case '!=':
        case '>':
        case '<':
        case '>=':
        case '<=':
        case 'LIKE':
        case 'ILIKE':
          whereParts.push(`${condition.field} ${condition.operator} $${paramIndex}`);
          params.push(condition.value);
          break;
        
        case 'IN':
        case 'NOT IN':
          if (condition.values && condition.values.length > 0) {
            const placeholders = condition.values.map(() => `$${paramIndex++}`).join(', ');
            whereParts.push(`${condition.field} ${condition.operator} (${placeholders})`);
            params.push(...condition.values);
          }
          break;
        
        case 'IS NULL':
        case 'IS NOT NULL':
          whereParts.push(`${condition.field} ${condition.operator}`);
          break;
      }
    }
    
    return {
      whereClause: whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '',
      params
    };
  }
  
  /**
   * 캐시된 결과 조회
   */
  private async getCachedResult<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
      return null;
    }
  }
  
  /**
   * 캐시 결과 저장
   */
  private async setCachedResult(key: string, value: unknown, ttl: number): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  }
  
  /**
   * 엔티티 캐시 무효화
   */
  private async invalidateEntityCache(table: string, id: string): Promise<void> {
    try {
      // ID 기반 캐시 무효화
      await redis.del(`${this.cachePrefix}${table}:id:${id}`);
      
      // 패턴 매칭으로 관련 캐시들 무효화
      const pattern = `${this.cachePrefix}${table}:*`;
      await this.invalidateCachePattern(pattern);
    } catch (error) {
      console.warn('Cache invalidation failed:', error);
    }
  }
  
  /**
   * 패턴 매칭 캐시 무효화
   */
  private async invalidateCachePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.warn('Pattern cache invalidation failed:', error);
    }
  }
  
  /**
   * 테이블 전체 캐시 무효화
   */
  async invalidateTableCache(table: string): Promise<void> {
    const pattern = `${this.cachePrefix}${table}:*`;
    await this.invalidateCachePattern(pattern);
  }
  
  /**
   * 캐시 통계
   */
  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate?: number;
  }> {
    try {
      const info = await redis.info('memory');
      const keys = await redis.dbsize();
      
      return {
        totalKeys: keys,
        memoryUsage: info.match(/used_memory_human:(.+)/)?.[1] || 'Unknown'
      };
    } catch (error) {
      return {
        totalKeys: 0,
        memoryUsage: 'Unknown'
      };
    }
  }
  
  /**
   * 원시 쿼리 실행 (복잡한 쿼리용)
   */
  async executeRaw<T>(
    queryText: string,
    params?: unknown[],
    options: QueryOptions = {}
  ): Promise<T[]> {
    const cacheKey = options.useCache !== false ? 
      `${this.cachePrefix}raw:${Buffer.from(queryText).toString('base64')}:${JSON.stringify(params)}` : 
      null;
    
    // 캐시 확인
    if (cacheKey && options.useCache !== false) {
      const cached = await this.getCachedResult<T[]>(cacheKey);
      if (cached) return cached;
    }
    
    const executeQuery = async () => {
      const result = await query(queryText, params);
      return result.rows;
    };
    
    let rows: T[];
    
    if (options.transaction) {
      rows = await transaction(async (client: any) => {
        const result = await client.query(queryText, params);
        return result.rows;
      });
    } else {
      rows = await executeQuery();
    }
    
    // 캐시 저장
    if (cacheKey && options.useCache !== false) {
      await this.setCachedResult(
        cacheKey,
        rows,
        options.cacheTTL || this.defaultCacheTTL
      );
    }
    
    return rows;
  }
}

// 싱글톤 인스턴스 생성
export const unifiedQueryService = new UnifiedQueryService();

// 편의 함수들 export
export const findById = <T extends BaseEntity>(table: string, id: string, options?: QueryOptions) =>
  unifiedQueryService.findById<T>(table, id, options);

export const findByIds = <T extends BaseEntity>(table: string, ids: string[], options?: QueryOptions) =>
  unifiedQueryService.findByIds<T>(table, ids, options);

export const findByField = <T>(table: string, field: string, value: unknown, options?: QueryOptions) =>
  unifiedQueryService.findByField<T>(table, field, value, options);

export const countAll = (table: string, options?: QueryOptions) =>
  unifiedQueryService.countAll(table, options);

export const countByField = (table: string, field: string, value: unknown, options?: QueryOptions) =>
  unifiedQueryService.countByField(table, field, value, options);

export const updateById = (table: string, id: string, updates: Record<string, unknown>, options?: QueryOptions) =>
  unifiedQueryService.updateById(table, id, updates, options);

export const deleteById = (table: string, id: string, options?: QueryOptions) =>
  unifiedQueryService.deleteById(table, id, options);

// 캐시 TTL 상수 export
export { CACHE_TTL };