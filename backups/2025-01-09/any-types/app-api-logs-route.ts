// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// 로그 요청 스키마
const logSchema = z.object({
  level: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
  messages: z.array(z.any()),
  bindings: z.array(z.any()).optional(),
  msg: z.string().optional(),
  time: z.number().optional(),
  context: z.record(z.any()).optional(),
  userId: z.string().optional(),
  requestId: z.string().optional(),
  errorStack: z.string().optional(),
  component: z.string().optional(),
  operation: z.string().optional(),
  duration: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

// 클라이언트 IP 추출
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfIp = req.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  if (cfIp) {
    return cfIp;
  }
  
  return 'unknown';
}

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();

    // 배치 로깅 처리
    const logs = Array.isArray(body) ? body : [body];
    const validLogs = [];
    
    for (const log of logs) {
      try {
        const validated = logSchema.parse(log);
        
        // 메시지 구성
        const message = validated.msg || 
          (validated.messages && validated.messages.length > 0 
            ? validated.messages.join(' ') 
            : 'Client log');
        
        // 컨텍스트 병합
        const context = {
          ...validated.context,
          ...(validated.bindings && validated.bindings.length > 0 
            ? validated.bindings.reduce((acc, binding) => ({ ...acc, ...binding }), {})
            : {}),
        };
        
        validLogs.push({
          level: validated.level.toUpperCase(),
          message,
          context: context || undefined,
          userId: validated.userId || null,
          requestId: validated.requestId || null,
          errorStack: validated.errorStack || null,
          component: validated.component || 'client',
          operation: validated.operation || null,
          duration: validated.duration || null,
          metadata: validated.metadata || null,
          ipAddress: getClientIp(req),
          userAgent: req.headers.get('user-agent'),
        });
      } catch (error) {
        // 유효하지 않은 로그는 건너뛰기
        logger.warn({ error, log }, 'Invalid log entry from client');
      }
    }
    
    // 유효한 로그가 있으면 데이터베이스에 저장
    if (validLogs.length > 0) {

      try {
        await queryMany({
          data: validLogs,
          skipDuplicates: true,
        });

      } catch (dbError) {

        throw dbError;
      }
      
      // 서버 로거에도 기록 (개발 환경)
      if (process.env.NODE_ENV === 'development') {
        validLogs.forEach(log => {
          const level = log.level.toLowerCase() as keyof typeof logger;
          if (logger[level]) {
            logger[level]({
              ...log,
              source: 'client',
            }, `Client log: ${log.message}`);
          }
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      count: validLogs.length 
    });
  } catch (error) {
    logger.error(error, 'Failed to process client logs');
    
    // 에러가 발생해도 200 반환 (클라이언트 로깅 실패로 앱이 중단되면 안됨)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process logs' 
    });
  }
}

// GET 요청으로 최근 로그 조회 (개발용)
export async function GET(req: NextRequest) {
  // 개발 환경에서만 허용
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');
    const limit = parseInt(searchParams.get('limit') || '100');
    const userId = searchParams.get('userId');
    
    const where: any = {};
    if (level) where.level = level.toUpperCase();
    if (userId) where.userId = userId;
    
    const logs = await query({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json(logs);
  } catch (error) {
    logger.error(error, 'Failed to fetch logs');
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}