// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { query, healthCheck } from '@/lib/db';
import { getRedis } from '@/lib/db/redis';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const results = {
    status: 'checking',
    database: {
      connected: false,
      message: '',
      details: null as any
    },
    redis: {
      connected: false,
      message: ''
    },
    stats: {
      users: 0,
      products: 0
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'not configured',
      REDIS_URL: process.env.REDIS_URL ? 'configured' : 'not configured',
      port: process.env.PORT || 3000,
      vercel: process.env.VERCEL ? 'true' : 'false',
      region: process.env.VERCEL_REGION || 'unknown'
    }
  };

  try {
    // Test database connection with detailed health check
    const dbHealth = await healthCheck();
    results.database.connected = dbHealth.healthy;
    results.database.message = dbHealth.message;
    
    if (dbHealth.healthy) {
      // Get database version and connection info
      const dbInfo = await query('SELECT version() as version, current_database() as database, current_user as user');
      results.database.details = {
        version: dbInfo.rows[0].version,
        database: dbInfo.rows[0].database,
        user: dbInfo.rows[0].user
      };
      
      // Get stats
      try {
        const userCountResult = await query('SELECT COUNT(*) as count FROM users');
        const productCountResult = await query('SELECT COUNT(*) as count FROM products');
        
        results.stats.users = parseInt(userCountResult.rows[0].count);
        results.stats.products = parseInt(productCountResult.rows[0].count);
      } catch (statsError) {
        console.error('Failed to get stats:', statsError);
      }
    }
  } catch (dbError) {
    results.database.message = dbError instanceof Error ? dbError.message : 'Database connection failed';
    console.error('Database health check failed:', dbError);
  }

  // Test Redis connection
  try {
    const redis = getRedis();
    if (redis) {
      await redis.ping();
      results.redis.connected = true;
      results.redis.message = 'Redis connected and responding';
    } else {
      results.redis.message = 'Redis client not initialized';
    }
  } catch (redisError) {
    results.redis.message = redisError instanceof Error ? redisError.message : 'Redis connection failed';
    console.error('Redis health check failed:', redisError);
  }

  // Determine overall status
  results.status = results.database.connected ? 'ok' : 'degraded';
  
  const statusCode = results.status === 'ok' ? 200 : 503;
  
  return NextResponse.json(results, { status: statusCode });
}