// DEPRECATED: Use /api/admin/i18n/settings instead
import { NextRequest, NextResponse } from 'next/server'

// Redirect to new API endpoint
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.pathname = '/api/admin/i18n/settings'
  return NextResponse.redirect(url, { status: 301 })
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  url.pathname = '/api/admin/i18n/settings'
  return NextResponse.redirect(url, { status: 301 })
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url)
  url.pathname = '/api/admin/i18n/settings'
  return NextResponse.redirect(url, { status: 301 })
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url)
  url.pathname = '/api/admin/i18n/settings'
  return NextResponse.redirect(url, { status: 301 })
}