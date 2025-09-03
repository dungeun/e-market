// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/products/[id] - 상품 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      'SELECT * FROM products WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {

    return NextResponse.json(
      { error: '상품 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - 상품 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, slug, description, price, image, category, stock } = body;

    const result = await query(
      `UPDATE products 
       SET name = $1, slug = $2, description = $3, price = $4, 
           image = $5, category = $6, stock = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, slug, description, price, image, category, stock, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {

    return NextResponse.json(
      { error: '상품 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - 상품 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '상품이 삭제되었습니다.' });
  } catch (error) {

    return NextResponse.json(
      { error: '상품 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}