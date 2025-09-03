import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'homepage') {
      // 홈페이지 관련 경로들 재검증
      revalidatePath('/');
      revalidatePath('/api/home/sections');
      revalidatePath('/api/ui-sections');
      
      return NextResponse.json({ 
        success: true,
        message: 'Homepage cache invalidated' 
      });
    }

    // 모든 캐시 무효화
    revalidatePath('/', 'layout');
    
    return NextResponse.json({ 
      success: true,
      message: 'All cache invalidated' 
    });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to invalidate cache' 
    }, { status: 500 });
  }
}