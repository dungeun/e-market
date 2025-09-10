import { NextResponse } from 'next/server'

export async function GET() {
  // 임시 빈 응답 - 404 에러 방지용
  return NextResponse.json({
    success: true,
    templates: []
  })
}