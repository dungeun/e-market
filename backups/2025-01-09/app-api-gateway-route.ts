import { NextRequest, NextResponse } from 'next/server'

// API Gateway 라우터
export async function handler(req: NextRequest) {
  const { pathname } = new URL(req.url)
  
  // Rate limiting
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const rateLimit = await checkRateLimit(clientIp)
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }
  
  // Authentication
  const authHeader = req.headers.get('authorization')
  const isAuthenticated = await verifyAuth(authHeader)
  
  // Route to appropriate service
  const service = getServiceFromPath(pathname)
  
  switch (service) {
    case 'products':
      return handleProductService(req, isAuthenticated)
    case 'orders':
      return handleOrderService(req, isAuthenticated)
    case 'payments':
      return handlePaymentService(req, isAuthenticated)
    case 'inventory':
      return handleInventoryService(req, isAuthenticated)
    case 'cms':
      return handleCMSService(req, isAuthenticated)
    default:
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
  }
}

// Rate limiting
async function checkRateLimit(clientIp: string): Promise<{ allowed: boolean }> {
  // TODO: Implement Redis-based rate limiting
  return { allowed: true }
}

// Authentication verification
async function verifyAuth(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false
  
  try {
    const token = authHeader.replace('Bearer ', '')
    // TODO: Verify JWT token
    return true
  } catch {
    return false
  }
}

// Service routing
function getServiceFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length < 3) return ''
  return segments[2] // /api/gateway/[service]
}

// Service handlers
async function handleProductService(req: NextRequest, isAuthenticated: boolean) {
  const response = await fetch(`${process.env.PRODUCT_SERVICE_URL}${req.nextUrl.pathname}`, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Authenticated': isAuthenticated.toString()
    },
    body: req.body
  })
  
  return NextResponse.json(await response.json(), { status: response.status })
}

async function handleOrderService(req: NextRequest, isAuthenticated: boolean) {
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  
  const response = await fetch(`${process.env.ORDER_SERVICE_URL}${req.nextUrl.pathname}`, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Authenticated': 'true'
    },
    body: req.body
  })
  
  return NextResponse.json(await response.json(), { status: response.status })
}

async function handlePaymentService(req: NextRequest, isAuthenticated: boolean) {
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  
  const response = await fetch(`${process.env.PAYMENT_SERVICE_URL}${req.nextUrl.pathname}`, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Authenticated': 'true'
    },
    body: req.body
  })
  
  return NextResponse.json(await response.json(), { status: response.status })
}

async function handleInventoryService(req: NextRequest, isAuthenticated: boolean) {
  const response = await fetch(`${process.env.INVENTORY_SERVICE_URL}${req.nextUrl.pathname}`, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Authenticated': isAuthenticated.toString()
    },
    body: req.body
  })
  
  return NextResponse.json(await response.json(), { status: response.status })
}

async function handleCMSService(req: NextRequest, isAuthenticated: boolean) {
  const response = await fetch(`${process.env.CMS_SERVICE_URL}${req.nextUrl.pathname}`, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Authenticated': isAuthenticated.toString()
    },
    body: req.body
  })
  
  return NextResponse.json(await response.json(), { status: response.status })
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH }