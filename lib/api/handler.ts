import type { AppError } from '@/lib/types/common';
import { env } from '@/lib/config/env';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

interface HandlerConfig {
  auth?: boolean;
  adminOnly?: boolean;
  roles?: string[];
  validate?: (body: unknown) => boolean | Promise<boolean>;
  cache?: {
    enabled: boolean;
    ttl?: number;
  };
}

interface HandlerContext {
  user?: unknown;
  isAdmin?: boolean;
  params?: unknown;
}

type ApiHandler = (
  req: NextRequest,
  ctx: HandlerContext
) => Promise<Response> | Response;

export function createApiHandler(config: HandlerConfig & { handler: ApiHandler }) {
  return async (request: NextRequest, params?: unknown) => {
    try {
      const context: HandlerContext = { params };

      // Authentication check
      if (config.auth || config.adminOnly) {
        const headerStore = await headers();
        const authHeader = headerStore.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'No token provided' },
            { status: 401 }
          );
        }

        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || env.jwt.secret) as any;
          context.user = decoded;
          // Check both role and type fields, case-insensitive
          const userRole = decoded.role?.toUpperCase();
          const userType = decoded.type?.toUpperCase();
          context.isAdmin = userRole === 'ADMIN' || userType === 'ADMIN';

          if (config.adminOnly && !context.isAdmin) {
            return NextResponse.json(
              { error: 'Forbidden', message: 'Admin access required' },
              { status: 403 }
            );
          }

          if (config.roles && !config.roles.includes((decoded as unknown).role)) {
            return NextResponse.json(
              { error: 'Forbidden', message: 'Insufficient permissions' },
              { status: 403 }
            );
          }
        } catch (error) {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Invalid token' },
            { status: 401 }
          );
        }
      }

      // Body validation
      if (config.validate && request.method !== 'GET' && request.method !== 'DELETE') {
        const body = await request.json();
        const isValid = await config.validate(body);
        if (!isValid) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Invalid request body' },
            { status: 400 }
          );
        }
      }

      // Execute handler
      const response = await config.handler(request, context);

      // Add cache headers if configured
      if (config.cache?.enabled && response instanceof NextResponse) {
        const ttl = config.cache.ttl || 60;
        response.headers.set('Cache-Control', `public, max-age=${ttl}, s-maxage=${ttl}`);
      }

      return response;
    } catch (error) {

      if (error instanceof Error) {
        return NextResponse.json(
          { 
            error: 'Internal Server Error', 
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Internal Server Error', message: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  };
}

// Helper functions for common responses
export const success = (data: unknown, status = 200) => 
  NextResponse.json({ success: true, ...data }, { status });

export const error = (message: string, status = 400, details?: unknown) =>
  NextResponse.json({ 
    success: false, 
    error: message,
    ...(details && { details })
  }, { status });

// Validation helpers
export const validators = {
  required: (fields: string[]) => (body: unknown) => {
    return fields.every(field => body[field] !== undefined && body[field] !== null);
  },
  
  email: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  phone: (phone: string) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone);
  },
  
  uuid: (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
};

// Common middleware patterns
export const middleware = {
  cors: (origin = '*') => (response: NextResponse) => {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  },
  
  rateLimit: (limit: number, window: number) => {
    const requests = new Map<string, number[]>();
    
    return (clientId: string): boolean => {
      const now = Date.now();
      const windowMs = window * 1000;
      const clientRequests = requests.get(clientId) || [];
      
      const recentRequests = clientRequests.filter(time => now - time < windowMs);
      
      if (recentRequests.length >= limit) {
        return false;
      }
      
      recentRequests.push(now);
      requests.set(clientId, recentRequests);
      return true;
    };
  }
};