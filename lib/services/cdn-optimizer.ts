/**
 * CDN 최적화 및 Edge Caching 전략
 */

interface CDNConfig {
  enabled: boolean;
  provider: 'cloudflare' | 'vercel' | 'aws-cloudfront' | 'local';
  cacheHeaders: {
    products: number;    // seconds
    uiConfig: number;
    images: number;
    static: number;
  };
  regions: string[];
}

export class CDNOptimizer {
  private config: CDNConfig = {
    enabled: true,
    provider: 'vercel', // Vercel Edge Network 사용
    cacheHeaders: {
      products: 300,     // 5분
      uiConfig: 3600,    // 1시간
      images: 86400,     // 1일
      static: 604800     // 1주일
    },
    regions: ['icn', 'nrt', 'sfo'] // 서울, 도쿄, 샌프란시스코
  };

  /**
   * Response에 적절한 캐시 헤더 추가
   */
  setCacheHeaders(response: Response, type: keyof CDNConfig['cacheHeaders']): Response {
    const maxAge = this.config.cacheHeaders[type];
    
    response.headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
    response.headers.set('CDN-Cache-Control', `max-age=${maxAge}`);
    response.headers.set('Vercel-CDN-Cache-Control', `max-age=${maxAge}`);
    
    // ETag 추가 (조건부 요청 지원)
    const etag = this.generateETag(response);
    response.headers.set('ETag', etag);
    
    return response;
  }

  /**
   * Edge에서 실행될 미들웨어 로직
   */
  async handleEdgeCache(request: Request): Promise<Response | null> {
    const url = new URL(request.url);
    
    // JSON 캐시 파일 요청인 경우
    if (url.pathname.startsWith('/cache/products/')) {
      const cachedResponse = await this.getFromEdgeCache(url.pathname);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    return null;
  }

  /**
   * Edge 캐시에서 데이터 조회
   */
  private async getFromEdgeCache(key: string): Promise<Response | null> {
    if (this.config.provider === 'vercel') {
      // Vercel Edge Config 사용
      try {
        const cache = await caches.open('products-v1');
        const cached = await cache.match(key);
        return cached || null;
      } catch {
        return null;
      }
    }
    
    return null;
  }

  /**
   * 프리로딩 전략
   */
  async preloadCriticalAssets(): Promise<void> {
    // 중요한 리소스를 미리 로딩
    const criticalPaths = [
      '/cache/products/products-ko-page-1.json',
      '/locales/ui-sections.json',
      '/api/language-packs'
    ];

    // Link 프리로드 헤더 추가
    criticalPaths.forEach(path => {
      if (typeof window !== 'undefined') {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = path;
        link.as = 'fetch';
        document.head.appendChild(link);
      }
    });
  }

  /**
   * ETag 생성
   */
  private generateETag(response: Response): string {
    const content = response.body;
    // 간단한 해시 생성 (실제로는 crypto 사용)
    return `W/"${Date.now()}-${Math.random().toString(36)}"`;
  }

  /**
   * 지역별 최적화 URL 생성
   */
  getOptimizedUrl(path: string, region?: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || '';
    
    if (!this.config.enabled || !baseUrl) {
      return path;
    }

    // 가장 가까운 엣지 서버 결정
    const targetRegion = region || this.getNearestRegion();
    
    return `${baseUrl}/${targetRegion}${path}`;
  }

  /**
   * 가장 가까운 리전 결정
   */
  private getNearestRegion(): string {
    // 실제로는 사용자 위치 기반으로 결정
    // 여기서는 기본값 반환
    return this.config.regions[0];
  }
}

export const cdnOptimizer = new CDNOptimizer();