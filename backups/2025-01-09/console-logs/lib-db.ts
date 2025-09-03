import { Pool, Client, QueryResult } from 'pg';
import { promisify } from 'util';

interface DatabaseConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  max?: number;
}

class Database {
  private static instance: Database;
  private pool: Pool;
  private isConnected: boolean = false;

  private constructor() {
    // Use DATABASE_URL if available, otherwise fallback to individual env vars
    const config: DatabaseConfig = process.env.DATABASE_URL 
      ? {
          connectionString: process.env.DATABASE_URL,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
          max: 20, // 최대 연결 수
        }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME || 'commerce_plugin',
          user: process.env.DB_USER || 'admin',
          password: process.env.DB_PASSWORD || undefined,
          ssl: process.env.NODE_ENV === 'production',
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
          max: 20, // 최대 연결 수
        };

    this.pool = new Pool(config);
    this.setupEventHandlers();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private setupEventHandlers(): void {
    this.pool.on('connect', (client) => {
      console.log('✅ PostgreSQL 클라이언트 연결됨');
      this.isConnected = true;
    });

    this.pool.on('error', (err) => {
      console.error('❌ PostgreSQL 연결 오류:', err);
      this.isConnected = false;
    });

    this.pool.on('remove', () => {
      console.log('📤 PostgreSQL 클라이언트 제거됨');
    });
  }

  public async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isConnected = true;
      console.log('✅ PostgreSQL 데이터베이스 연결 성공');
    } catch (error) {
      console.error('❌ PostgreSQL 연결 실패:', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async query(text: string, params?: any[]): Promise<QueryResult> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 SQL Query:', {
          query: text,
          params,
          rows: result.rowCount,
          duration: `${duration}ms`
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ SQL Query 오류:', {
        query: text,
        params,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public async getClient() {
    return await this.pool.connect();
  }

  public async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public isHealthy(): boolean {
    return this.isConnected;
  }

  public async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      const result = await this.query('SELECT NOW() as current_time, version() as db_version');
      return {
        healthy: true,
        message: `PostgreSQL 연결 정상 - ${result.rows[0].current_time}`
      };
    } catch (error) {
      return {
        healthy: false,
        message: `PostgreSQL 연결 실패: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
    this.isConnected = false;
    console.log('📴 PostgreSQL 연결 종료');
  }
}

// 싱글톤 인스턴스 export
const db = Database.getInstance();

// 유틸리티 함수들
export const query = (text: string, params?: any[]) => db.query(text, params);
export const getClient = () => db.getClient();
export const transaction = <T>(callback: (client: any) => Promise<T>) => db.transaction(callback);
export const healthCheck = () => db.healthCheck();
export const connect = () => db.connect();
export const close = () => db.close();

// 데이터베이스 초기화
export const initializeDatabase = async (): Promise<void> => {
  try {
    await db.connect();
    console.log('🚀 데이터베이스 초기화 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    throw error;
  }
};

export default db;

// 타입 정의
export interface QueryOptions {
  params?: any[];
  timeout?: number;
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

// SQL 쿼리 빌더 유틸리티
export class QueryBuilder {
  private queryParts: {
    select?: string;
    from?: string;
    joins?: string[];
    where?: string[];
    groupBy?: string;
    having?: string;
    orderBy?: string[];
    limit?: string;
    offset?: string;
  } = {
    joins: [],
    where: [],
    orderBy: []
  };

  public select(columns: string): QueryBuilder {
    this.queryParts.select = columns;
    return this;
  }

  public from(table: string): QueryBuilder {
    this.queryParts.from = table;
    return this;
  }

  public join(joinClause: string): QueryBuilder {
    this.queryParts.joins?.push(joinClause);
    return this;
  }

  public where(condition: string): QueryBuilder {
    this.queryParts.where?.push(condition);
    return this;
  }

  public groupBy(columns: string): QueryBuilder {
    this.queryParts.groupBy = columns;
    return this;
  }

  public having(condition: string): QueryBuilder {
    this.queryParts.having = condition;
    return this;
  }

  public orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    this.queryParts.orderBy?.push(`${column} ${direction}`);
    return this;
  }

  public limit(count: number): QueryBuilder {
    this.queryParts.limit = `LIMIT ${count}`;
    return this;
  }

  public offset(count: number): QueryBuilder {
    this.queryParts.offset = `OFFSET ${count}`;
    return this;
  }

  public paginate(page: number, limit: number): QueryBuilder {
    const offset = (page - 1) * limit;
    this.limit(limit);
    this.offset(offset);
    return this;
  }

  public build(): string {
    const parts: string[] = [];

    if (this.queryParts.select) {
      parts.push(`SELECT ${this.queryParts.select}`);
    }

    if (this.queryParts.from) {
      parts.push(`FROM ${this.queryParts.from}`);
    }

    if (this.queryParts.joins && this.queryParts.joins.length > 0) {
      parts.push(...this.queryParts.joins);
    }

    if (this.queryParts.where && this.queryParts.where.length > 0) {
      parts.push(`WHERE ${this.queryParts.where.join(' AND ')}`);
    }

    if (this.queryParts.groupBy) {
      parts.push(`GROUP BY ${this.queryParts.groupBy}`);
    }

    if (this.queryParts.having) {
      parts.push(`HAVING ${this.queryParts.having}`);
    }

    if (this.queryParts.orderBy && this.queryParts.orderBy.length > 0) {
      parts.push(`ORDER BY ${this.queryParts.orderBy.join(', ')}`);
    }

    if (this.queryParts.limit) {
      parts.push(this.queryParts.limit);
    }

    if (this.queryParts.offset) {
      parts.push(this.queryParts.offset);
    }

    return parts.join(' ');
  }
}

// 헬퍼 함수
export const createQueryBuilder = (): QueryBuilder => new QueryBuilder();