import type { User, RequestContext } from '@/lib/types/common';
import { Pool, Client, QueryResult } from 'pg';
import { promisify } from 'util';
import { parseSupabaseConnectionString, logSSLConfig } from './ssl-config';

// Drizzle ORM imports
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as schema from '../drizzle/migrations/schema';
import * as relations from '../drizzle/migrations/relations';

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
  min?: number;
  acquireTimeoutMillis?: number;
  createTimeoutMillis?: number;
  destroyTimeoutMillis?: number;
  reapIntervalMillis?: number;
  createRetryIntervalMillis?: number;
}

class Database {
  private static instance: Database;
  private pool: Pool;
  private drizzle: NodePgDatabase<typeof schema>;
  private isConnected: boolean = false;

  private constructor() {
    // Parse DATABASE_URL if available
    const databaseUrl = process.env.DATABASE_URL;
    let config: DatabaseConfig;
    
    if (databaseUrl) {
      console.log('Database: Using DATABASE_URL connection string');
      
      // Supabase connection pooling requires special handling
      const isSupabase = databaseUrl.includes('supabase.co');
      
      if (isSupabase) {
        // Use enhanced SSL configuration for Supabase
        logSSLConfig();
        
        const { cleanConnectionString, ssl } = parseSupabaseConnectionString(databaseUrl);
        
        config = {
          connectionString: cleanConnectionString,
          ssl: ssl,
          connectionTimeoutMillis: 15000,
          idleTimeoutMillis: 30000,
          acquireTimeoutMillis: 10000,
          createTimeoutMillis: 10000,
          destroyTimeoutMillis: 5000,
          reapIntervalMillis: 1000,
          createRetryIntervalMillis: 200,
          max: 20,  // 최대 연결 수
          min: 2,   // 최소 연결 수 유지
          // Important: Supabase pooling requires these settings
          application_name: 'commerce-nextjs',
          // Add Node.js specific timeout handling
          query_timeout: 60000,
          statement_timeout: 60000
        };
      } else {
        // Parse connection string for non-Supabase databases
        const url = new URL(databaseUrl);
        config = {
          host: url.hostname,
          port: parseInt(url.port || '5432'),
          database: url.pathname.substring(1),
          user: url.username,
          password: url.password,
          ssl: url.searchParams.get('sslmode') === 'require' ? {
            rejectUnauthorized: false,
            ca: process.env.DATABASE_CA_CERT || undefined
          } : false,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
          acquireTimeoutMillis: 10000,
          createTimeoutMillis: 10000,
          destroyTimeoutMillis: 5000,
          reapIntervalMillis: 1000,
          createRetryIntervalMillis: 200,
          max: 20,  // 최대 연결 수
          min: 2,   // 최소 연결 수
        };
      }
    } else {
      // Fallback to individual env vars
      config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'commerce_plugin',
        user: process.env.DB_USER || 'admin',
        password: process.env.DB_PASSWORD || 'admin123',
        ssl: process.env.NODE_ENV === 'production',
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 10000,
        createTimeoutMillis: 10000,
        destroyTimeoutMillis: 5000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
        max: 20, // 최대 연결 수
        min: 2,  // 최소 연결 수
      };
      console.log('Database: Using individual env vars - Host:', config.host, 'Port:', config.port, 'Database:', config.database, 'User:', config.user);
    }

    this.pool = new Pool(config);
    this.drizzle = drizzle(this.pool, { schema: { ...schema, ...relations } });
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
      console.log('Database: Pool client connected');
      this.isConnected = true;
    });

    this.pool.on('error', (err) => {
      console.error('Database: Pool error occurred:', err);
      this.isConnected = false;
    });

    this.pool.on('remove', () => {
      console.log('Database: Pool client removed');
    });
  }

  public async connect(): Promise<void> {
    try {
      console.log('Database: Attempting to connect...');
      const client = await this.pool.connect();
      
      // Test basic connectivity
      const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
      console.log('Database: Connected to', result.rows[0].db_name, 'at', result.rows[0].current_time);
      
      client.release();
      this.isConnected = true;
      console.log('Database: Connection successful');
    } catch (error) {
      console.error('Database: Connection failed:', error);
      this.isConnected = false;
      
      // Provide more helpful error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('Tenant or user not found')) {
          console.error('Database: This appears to be a Supabase pooling issue. Please ensure:');
          console.error('1. You are using the correct DATABASE_URL from Supabase dashboard');
          console.error('2. The URL includes proper pooling parameters');
          console.error('3. Your Supabase project is active and not paused');
        } else if (error.message.includes('ECONNREFUSED')) {
          console.error('Database: Connection refused. Please check your database is running and accessible');
        } else if (error.message.includes('password authentication failed')) {
          console.error('Database: Authentication failed. Please check your database credentials');
        }
      }
      
      throw error;
    }
  }

  public async query(text: string, params?: unknown[]): Promise<QueryResult> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Database: Query executed in ${duration}ms:`, text.substring(0, 100) + '...');
      }
      
      return result;
    } catch (error) {
      console.error('Database: Query failed:', error, 'Query:', text);
      throw error;
    }
  }

  public async getClient() {
    return await this.pool.connect();
  }

  public getDrizzle(): NodePgDatabase<typeof schema> {
    return this.drizzle;
  }

  public async transaction<T>(callback: (client: unknown) => Promise<T>): Promise<T> {
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

  public async testDrizzleConnection(): Promise<{ success: boolean; message: string; tableCount?: number }> {
    try {
      const result = await this.drizzle.execute(sql`
        SELECT COUNT(*) as table_count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const tableCount = parseInt(result.rows[0].table_count as string);
      
      return {
        success: true,
        message: `Drizzle 연결 성공 - ${tableCount}개 테이블 확인됨`,
        tableCount
      };
    } catch (error) {
      return {
        success: false,
        message: `Drizzle 연결 실패: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
    this.isConnected = false;

  }
}

// 싱글톤 인스턴스 export
const db = Database.getInstance();

// 유틸리티 함수들
export const query = (text: string, params?: unknown[]) => db.query(text, params);
export const getClient = () => db.getClient();
export const getDrizzle = () => db.getDrizzle();
export const transaction = <T>(callback: (client: unknown) => Promise<T>) => db.transaction(callback);
export const healthCheck = () => db.healthCheck();
export const testDrizzleConnection = () => db.testDrizzleConnection();
export const connect = () => db.connect();
export const close = () => db.close();

// 데이터베이스 초기화
export const initializeDatabase = async (): Promise<void> => {
  try {
    await db.connect();

  } catch (error) {

    throw error;
  }
};

export default db;

// 타입 정의
export interface QueryOptions {
  params?: unknown[];
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