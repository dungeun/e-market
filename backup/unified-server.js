const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '🇰🇷 한국 이커머스 플랫폼 통합 서버가 정상 작동 중입니다',
    timestamp: new Date().toISOString(),
    port: PORT,
    services: {
      api: 'active',
      frontend: 'proxied'
    }
  });
});

// API Routes
app.get('/api/v1/categories', (req, res) => {
  res.json([
    { id: 1, name: '패션', description: '의류, 신발, 액세서리' },
    { id: 2, name: '전자제품', description: '스마트폰, 노트북, 가전제품' },
    { id: 3, name: '뷰티', description: '화장품, 스킨케어, 향수' },
    { id: 4, name: '식품', description: '신선식품, 가공식품, 건강식품' },
    { id: 5, name: '생활용품', description: '주방용품, 청소용품, 수납용품' }
  ]);
});

app.get('/api/v1/products', (req, res) => {
  res.json([
    { 
      id: 1, 
      name: '프리미엄 한국 김치 1kg', 
      price: 25000, 
      category: '식품',
      description: '전통 방식으로 만든 프리미엄 김치',
      image: '/images/kimchi.jpg'
    },
    { 
      id: 2, 
      name: '한국산 고품질 쌀 10kg', 
      price: 45000, 
      category: '식품',
      description: '2024년 햅쌀, 친환경 재배',
      image: '/images/rice.jpg'
    },
    { 
      id: 3, 
      name: 'K-뷰티 스킨케어 세트', 
      price: 89000, 
      category: '뷰티',
      description: '한국 화장품 베스트셀러 세트',
      image: '/images/skincare.jpg'
    }
  ]);
});

// Dashboard API for admin
app.get('/api/v1/dashboard/metrics', (req, res) => {
  res.json({
    totalRevenue: 15750000,
    totalOrders: 1247,
    totalCustomers: 3891,
    totalProducts: 157,
    revenueChange: 12.5,
    ordersChange: 8.2,
    customersChange: 15.7,
    productsChange: 3.1
  });
});

// Admin design routes
app.get('/admin/design/product-display', (req, res) => {
  res.json({
    success: true,
    data: {
      layout: 'grid',
      columns: 4,
      showFilters: true,
      showSort: true,
      displayMode: 'card'
    }
  });
});

// Admin auth routes
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple admin login check
  if (email === 'admin@travel.com' && password === 'admin123') {
    res.json({
      success: true,
      data: {
        user: {
          id: 1,
          email: 'admin@travel.com',
          name: '관리자',
          role: 'admin',
          isAdmin: true
        },
        token: 'admin-token-123'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '로그인 정보가 올바르지 않습니다.'
    });
  }
});

app.get('/api/v1/auth/me', (req, res) => {
  // Check auth header
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token === 'admin-token-123') {
    res.json({
      success: true,
      data: {
        id: 1,
        email: 'admin@travel.com',
        name: '관리자',
        role: 'admin',
        isAdmin: true
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '인증이 필요합니다.'
    });
  }
});

// Proxy all other requests to Vite dev server (port 5173)
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying for HMR
  logLevel: 'silent'
}));

app.listen(PORT, () => {

🕐 시작 시간: ${new Date().toLocaleString('ko-KR')}

✅ Next.js 스타일 단일 포트 구성 완료!
  `);
});