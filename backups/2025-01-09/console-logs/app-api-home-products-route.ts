// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/business/product-service';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const search = searchParams.get('search') || undefined;
    
    const result = await productService.getPublicProducts({ 
      filter: filter as any,
      category,
      minPrice,
      maxPrice,
      search
    }, limit);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Failed to fetch products:', error);
    
    // 에러 발생 시 빈 배열 반환
    return NextResponse.json({
      success: true,
      products: [],
      total: 0,
      message: 'Failed to load products, showing empty results'
    });
  }
}