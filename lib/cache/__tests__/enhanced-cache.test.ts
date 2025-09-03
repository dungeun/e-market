import { EnhancedCacheService, CACHE_TTL, CACHE_PREFIX } from '../enhanced-cache'
import { logger } from '@/lib/logger'

// Mock dependencies
const mockGet = jest.fn()
const mockSet = jest.fn()
const mockDel = jest.fn()
const mockKeys = jest.fn()
const mockFlushdb = jest.fn()

jest.mock('ioredis', () => ({
  default: jest.fn().mockImplementation(() => ({
    get: mockGet,
    set: mockSet,
    del: mockDel,
    keys: mockKeys,
    flushdb: mockFlushdb
  }))
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn()
  }
}))

describe('EnhancedCacheService', () => {
  let cacheService: EnhancedCacheService

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.REDIS_URL = 'redis://localhost:6379'
    // 캐시 서비스 재생성을 위해 모듈 리로드
    jest.resetModules()
    const { EnhancedCacheService } = require('../enhanced-cache')
    cacheService = EnhancedCacheService.getInstance()
  })

  describe('싱글톤 패턴', () => {
    it('항상 동일한 인스턴스를 반환해야 함', () => {
      const { EnhancedCacheService } = require('../enhanced-cache')
      const instance1 = EnhancedCacheService.getInstance()
      const instance2 = EnhancedCacheService.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })

  describe('get', () => {
    it('캐시에서 데이터를 가져와 파싱해야 함', async () => {
      const testData = { id: '1', name: 'Test' }
      mockGet.mockResolvedValue(JSON.stringify(testData))
      
      const result = await cacheService.get('test-key')
      
      expect(mockGet).toHaveBeenCalledWith('test-key')
      expect(result).toEqual(testData)
    })

    it('캐시 미스 시 null을 반환해야 함', async () => {
      mockGet.mockResolvedValue(null)
      
      const result = await cacheService.get('non-existent')
      
      expect(result).toBeNull()
    })

    it('에러 발생 시 null을 반환하고 로깅해야 함', async () => {
      mockGet.mockRejectedValue(new Error('Redis error'))
      
      const result = await cacheService.get('test-key')
      
      expect(result).toBeNull()
      expect(logger.error).toHaveBeenCalledWith('Cache get error:', expect.any(Error))
    })
  })

  describe('set', () => {
    it('데이터를 JSON으로 변환하여 저장해야 함', async () => {
      const testData = { id: '1', name: 'Test' }
      
      await cacheService.set('test-key', testData, CACHE_TTL.SHORT)
      
      expect(mockSet).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(testData),
        'EX',
        CACHE_TTL.SHORT
      )
    })

    it('기본 TTL을 사용해야 함', async () => {
      await cacheService.set('test-key', 'value')
      
      expect(mockSet).toHaveBeenCalledWith(
        'test-key',
        '"value"',
        'EX',
        CACHE_TTL.MEDIUM
      )
    })

    it('에러 발생 시 로깅해야 함', async () => {
      mockSet.mockRejectedValue(new Error('Redis error'))
      
      await cacheService.set('test-key', 'value')
      
      expect(logger.error).toHaveBeenCalledWith('Cache set error:', expect.any(Error))
    })
  })

  describe('delete', () => {
    it('패턴에 맞는 키들을 삭제해야 함', async () => {
      const keys = ['cache:1', 'cache:2', 'cache:3']
      mockKeys.mockResolvedValue(keys)
      
      await cacheService.delete('cache:*')
      
      expect(mockKeys).toHaveBeenCalledWith('cache:*')
      expect(mockDel).toHaveBeenCalledWith(...keys)
    })

    it('키가 없을 때는 삭제를 시도하지 않아야 함', async () => {
      mockKeys.mockResolvedValue([])
      
      await cacheService.delete('non-existent:*')
      
      expect(mockDel).not.toHaveBeenCalled()
    })

    it('에러 발생 시 로깅해야 함', async () => {
      mockKeys.mockRejectedValue(new Error('Redis error'))
      
      await cacheService.delete('test:*')
      
      expect(logger.error).toHaveBeenCalledWith('Cache delete error:', expect.any(Error))
    })
  })

  describe('withCache', () => {
    it('캐시 히트 시 캐시된 데이터를 반환해야 함', async () => {
      const cachedData = { id: '1', cached: true }
      mockGet.mockResolvedValue(JSON.stringify(cachedData))
      
      const fetcher = jest.fn()
      const result = await cacheService.withCache('test-key', fetcher)
      
      expect(result).toEqual(cachedData)
      expect(fetcher).not.toHaveBeenCalled()
      expect(logger.debug).toHaveBeenCalledWith('Cache hit: test-key')
    })

    it('캐시 미스 시 fetcher를 실행하고 결과를 캐시해야 함', async () => {
      const fetchedData = { id: '1', fresh: true }
      mockGet.mockResolvedValue(null)
      
      const fetcher = jest.fn().mockResolvedValue(fetchedData)
      const result = await cacheService.withCache('test-key', fetcher, CACHE_TTL.LONG)
      
      expect(result).toEqual(fetchedData)
      expect(fetcher).toHaveBeenCalled()
      expect(mockSet).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(fetchedData),
        'EX',
        CACHE_TTL.LONG
      )
      expect(logger.debug).toHaveBeenCalledWith('Cache miss: test-key')
    })
  })

  describe('getCampaigns', () => {
    it('캠페인 목록을 캐싱해야 함', async () => {
      const params = { status: 'active', page: 1 }
      const campaigns = [{ id: '1', title: 'Campaign' }]
      mockGet.mockResolvedValue(null)
      
      const fetcher = jest.fn().mockResolvedValue(campaigns)
      const result = await cacheService.getCampaigns(params, fetcher)
      
      expect(result).toEqual(campaigns)
      expect(mockSet).toHaveBeenCalledWith(
        `campaign:list:${JSON.stringify(params)}`,
        JSON.stringify(campaigns),
        'EX',
        CACHE_TTL.SHORT
      )
    })
  })

  describe('getUIConfig', () => {
    it('UI 설정을 캐싱해야 함', async () => {
      const config = { theme: 'dark' }
      mockGet.mockResolvedValue(null)
      
      const fetcher = jest.fn().mockResolvedValue(config)
      const result = await cacheService.getUIConfig('ko', fetcher)
      
      expect(result).toEqual(config)
      expect(mockSet).toHaveBeenCalledWith(
        'ui_config:ko',
        JSON.stringify(config),
        'EX',
        CACHE_TTL.LONG
      )
    })
  })

  describe('getStats', () => {
    it('통계 데이터를 캐싱해야 함', async () => {
      const stats = { total: 100, active: 50 }
      mockGet.mockResolvedValue(null)
      
      const fetcher = jest.fn().mockResolvedValue(stats)
      const result = await cacheService.getStats('dashboard', fetcher)
      
      expect(result).toEqual(stats)
      expect(mockSet).toHaveBeenCalledWith(
        'stats:dashboard',
        JSON.stringify(stats),
        'EX',
        CACHE_TTL.MEDIUM
      )
    })
  })

  describe('invalidate', () => {
    it('프리픽스에 해당하는 캐시를 무효화해야 함', async () => {
      const keys = ['campaign:1', 'campaign:2']
      mockKeys.mockResolvedValue(keys)
      
      await cacheService.invalidate('campaign:')
      
      expect(mockKeys).toHaveBeenCalledWith('campaign:*')
      expect(mockDel).toHaveBeenCalledWith(...keys)
    })
  })

  describe('flush', () => {
    it('전체 캐시를 초기화해야 함', async () => {
      await cacheService.flush()
      
      expect(mockFlushdb).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith('Cache flushed')
    })

    it('에러 발생 시 로깅해야 함', async () => {
      mockFlushdb.mockRejectedValue(new Error('Redis error'))
      
      await cacheService.flush()
      
      expect(logger.error).toHaveBeenCalledWith('Cache flush error:', expect.any(Error))
    })
  })

  describe('Redis 연결이 없을 때', () => {
    beforeEach(() => {
      delete process.env.REDIS_URL
      jest.resetModules()
      const { EnhancedCacheService } = require('../enhanced-cache')
      cacheService = EnhancedCacheService.getInstance()
    })

    it('get은 null을 반환해야 함', async () => {
      const result = await cacheService.get('test-key')
      expect(result).toBeNull()
    })

    it('set은 아무것도 하지 않아야 함', async () => {
      await cacheService.set('test-key', 'value')
      expect(mockSet).not.toHaveBeenCalled()
    })

    it('delete는 아무것도 하지 않아야 함', async () => {
      await cacheService.delete('test:*')
      expect(mockDel).not.toHaveBeenCalled()
    })

    it('flush는 아무것도 하지 않아야 함', async () => {
      await cacheService.flush()
      expect(mockFlushdb).not.toHaveBeenCalled()
    })
  })
})