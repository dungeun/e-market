/**
 * 자동 스케일링 서비스 - 동시접속 1만명 지원을 위한 자동 확장/축소
 */

import Redis from 'ioredis'
import { systemMonitor } from '../monitoring/system-monitor'
import { performanceTracker } from '../monitoring/performance-tracker'

const redis = new Redis(process.env.REDIS_URL!)

export interface ScalingConfig {
  minInstances: number
  maxInstances: number
  targetCpuUtilization: number
  targetMemoryUtilization: number
  targetResponseTime: number
  cooldownPeriod: number // 초
  scaleUpMultiplier: number
  scaleDownMultiplier: number
}

export interface ScalingDecision {
  action: 'scale_up' | 'scale_down' | 'no_action'
  currentInstances: number
  targetInstances: number
  reason: string
  confidence: number
  timestamp: number
  metrics: {
    cpu: number
    memory: number
    responseTime: number
    concurrentUsers: number
    errorRate: number
  }
}

export interface LoadBalancerConfig {
  algorithm: 'round_robin' | 'least_connections' | 'weighted' | 'ip_hash'
  healthCheckInterval: number
  healthCheckTimeout: number
  maxRetries: number
}

export class AutoScalerService {
  private readonly config: ScalingConfig = {
    minInstances: 2,
    maxInstances: 50,
    targetCpuUtilization: 70,
    targetMemoryUtilization: 80,
    targetResponseTime: 1000,
    cooldownPeriod: 300, // 5분
    scaleUpMultiplier: 1.5,
    scaleDownMultiplier: 0.8
  }

  private readonly loadBalancerConfig: LoadBalancerConfig = {
    algorithm: 'least_connections',
    healthCheckInterval: 30000, // 30초
    healthCheckTimeout: 5000, // 5초
    maxRetries: 3
  }

  /**
   * 스케일링 결정 로직
   */
  async evaluateScaling(): Promise<ScalingDecision> {
    // 현재 메트릭 수집
    const metrics = await systemMonitor.collectMetrics()
    const performanceData = await performanceTracker.getDashboardData()
    const currentInstances = await this.getCurrentInstanceCount()

    // 쿨다운 체크
    const lastScalingTime = await redis.get('last_scaling_time')
    if (lastScalingTime && Date.now() - parseInt(lastScalingTime) < this.config.cooldownPeriod * 1000) {
      return this.createDecision('no_action', currentInstances, currentInstances, 
        'Cooldown period active', 0, metrics, performanceData.concurrent_users || 0)
    }

    // 스케일링 점수 계산
    const scalingScore = this.calculateScalingScore(metrics, performanceData, currentInstances)
    
    let action: 'scale_up' | 'scale_down' | 'no_action' = 'no_action'
    let targetInstances = currentInstances
    let reason = 'Metrics within normal range'
    let confidence = scalingScore.confidence

    // 스케일 업 조건
    if (scalingScore.upScore > 0.7 && currentInstances < this.config.maxInstances) {
      action = 'scale_up'
      targetInstances = Math.min(
        Math.ceil(currentInstances * this.config.scaleUpMultiplier),
        this.config.maxInstances
      )
      reason = scalingScore.upReason
    }
    // 스케일 다운 조건
    else if (scalingScore.downScore > 0.7 && currentInstances > this.config.minInstances) {
      action = 'scale_down'
      targetInstances = Math.max(
        Math.floor(currentInstances * this.config.scaleDownMultiplier),
        this.config.minInstances
      )
      reason = scalingScore.downReason
    }

    const decision = this.createDecision(action, currentInstances, targetInstances, 
      reason, confidence, metrics, performanceData.concurrent_users || 0)

    // 결정 로그 저장
    await this.logScalingDecision(decision)

    // 실제 스케일링 실행
    if (action !== 'no_action') {
      await this.executeScaling(decision)
    }

    return decision
  }

  /**
   * 스케일링 점수 계산
   */
  private calculateScalingScore(metrics: any, performanceData: any, currentInstances: number) {
    const scores = {
      cpu: metrics.server.cpuUsage / 100,
      memory: metrics.server.memoryUsage / 100,
      responseTime: Math.min(metrics.application.responseTime / this.config.targetResponseTime, 2),
      concurrentUsers: Math.min((performanceData.concurrent_users || 0) / 8000, 1.5), // 8000명 기준
      errorRate: Math.min(metrics.application.errorRate / 5, 1), // 5% 기준
      instanceUtilization: currentInstances / this.config.maxInstances
    }

    // 스케일 업 점수 계산 (높을수록 스케일 업 필요)
    const upFactors = [
      { weight: 0.3, score: scores.cpu > 0.8 ? scores.cpu : 0 },
      { weight: 0.25, score: scores.memory > 0.85 ? scores.memory : 0 },
      { weight: 0.2, score: scores.responseTime > 1.5 ? scores.responseTime - 1 : 0 },
      { weight: 0.15, score: scores.concurrentUsers > 0.8 ? scores.concurrentUsers : 0 },
      { weight: 0.1, score: scores.errorRate > 0.02 ? scores.errorRate * 2 : 0 }
    ]

    const upScore = upFactors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0)
    
    // 스케일 다운 점수 계산 (높을수록 스케일 다운 가능)
    const downFactors = [
      { weight: 0.3, score: scores.cpu < 0.3 ? 1 - scores.cpu : 0 },
      { weight: 0.25, score: scores.memory < 0.4 ? 1 - scores.memory : 0 },
      { weight: 0.2, score: scores.responseTime < 0.5 ? 1 - scores.responseTime : 0 },
      { weight: 0.15, score: scores.concurrentUsers < 0.3 ? 1 - scores.concurrentUsers : 0 },
      { weight: 0.1, score: scores.errorRate < 0.01 ? 1 - scores.errorRate : 0 }
    ]

    const downScore = downFactors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0)

    // 신뢰도 계산
    const confidence = Math.min(Math.max(upScore, downScore) + 0.1, 1.0)

    return {
      upScore: Math.min(upScore, 1.0),
      downScore: Math.min(downScore, 1.0),
      confidence,
      upReason: this.getScaleUpReason(scores),
      downReason: this.getScaleDownReason(scores),
      scores
    }
  }

  private getScaleUpReason(scores: any): string {
    const reasons: string[] = []
    if (scores.cpu > 0.8) reasons.push(`High CPU usage (${Math.round(scores.cpu * 100)}%)`)
    if (scores.memory > 0.85) reasons.push(`High memory usage (${Math.round(scores.memory * 100)}%)`)
    if (scores.responseTime > 1.5) reasons.push(`Slow response time (${Math.round(scores.responseTime * 1000)}ms)`)
    if (scores.concurrentUsers > 0.8) reasons.push(`High concurrent users (${Math.round(scores.concurrentUsers * 8000)})`)
    if (scores.errorRate > 0.02) reasons.push(`High error rate (${Math.round(scores.errorRate * 100)}%)`)
    
    return reasons.length > 0 ? reasons.join(', ') : 'Multiple metrics above thresholds'
  }

  private getScaleDownReason(scores: any): string {
    const reasons: string[] = []
    if (scores.cpu < 0.3) reasons.push(`Low CPU usage (${Math.round(scores.cpu * 100)}%)`)
    if (scores.memory < 0.4) reasons.push(`Low memory usage (${Math.round(scores.memory * 100)}%)`)
    if (scores.responseTime < 0.5) reasons.push(`Fast response time (${Math.round(scores.responseTime * 1000)}ms)`)
    if (scores.concurrentUsers < 0.3) reasons.push(`Low concurrent users (${Math.round(scores.concurrentUsers * 8000)})`)
    
    return reasons.length > 0 ? reasons.join(', ') : 'All metrics below thresholds'
  }

  private createDecision(action: 'scale_up' | 'scale_down' | 'no_action', 
                        current: number, target: number, reason: string, 
                        confidence: number, metrics: any, concurrentUsers: number): ScalingDecision {
    return {
      action,
      currentInstances: current,
      targetInstances: target,
      reason,
      confidence: Math.round(confidence * 100) / 100,
      timestamp: Date.now(),
      metrics: {
        cpu: metrics.server.cpuUsage,
        memory: metrics.server.memoryUsage,
        responseTime: metrics.application.responseTime,
        concurrentUsers: concurrentUsers || 0,
        errorRate: metrics.application.errorRate
      }
    }
  }

  /**
   * 실제 스케일링 실행
   */
  private async executeScaling(decision: ScalingDecision) {
    console.log(`🔄 Scaling ${decision.action}: ${decision.currentInstances} → ${decision.targetInstances}`)
    console.log(`📊 Reason: ${decision.reason}`)
    console.log(`🎯 Confidence: ${decision.confidence}`)

    try {
      if (decision.action === 'scale_up') {
        await this.scaleUp(decision.targetInstances - decision.currentInstances)
      } else if (decision.action === 'scale_down') {
        await this.scaleDown(decision.currentInstances - decision.targetInstances)
      }

      // 스케일링 시간 기록
      await redis.set('last_scaling_time', Date.now().toString())

      // 성공 로그
      console.log(`✅ Scaling completed successfully`)
      
    } catch (error) {
      console.error(`❌ Scaling failed:`, error)
      // 실패 로그 저장
      await redis.lpush('scaling_errors', JSON.stringify({
        decision,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      }))
    }
  }

  /**
   * 스케일 업 실행
   */
  private async scaleUp(instancesToAdd: number) {
    // 실제 구현에서는 Kubernetes, Docker, AWS Auto Scaling 등을 사용
    console.log(`🚀 Starting ${instancesToAdd} new instances...`)
    
    for (let i = 0; i < instancesToAdd; i++) {
      const instanceId = `instance_${Date.now()}_${i}`
      
      // 인스턴스 시작 시뮬레이션
      await this.startInstance(instanceId)
      
      // 헬스 체크 대기
      await this.waitForHealthy(instanceId)
      
      // 로드 밸런서에 추가
      await this.addToLoadBalancer(instanceId)
      
      console.log(`📦 Instance ${instanceId} is now ready and serving traffic`)
    }

    // 인스턴스 수 업데이트
    await this.updateInstanceCount(instancesToAdd)
  }

  /**
   * 스케일 다운 실행
   */
  private async scaleDown(instancesToRemove: number) {
    console.log(`🛑 Stopping ${instancesToRemove} instances...`)
    
    // 가장 적게 사용되는 인스턴스부터 제거
    const instancesToStop = await this.selectInstancesForRemoval(instancesToRemove)
    
    for (const instanceId of instancesToStop) {
      // 로드 밸런서에서 제거 (드레인)
      await this.removeFromLoadBalancer(instanceId)
      
      // 기존 연결 드레인 대기
      await this.drainConnections(instanceId)
      
      // 인스턴스 중지
      await this.stopInstance(instanceId)
      
      console.log(`🗑️ Instance ${instanceId} has been stopped`)
    }

    // 인스턴스 수 업데이트
    await this.updateInstanceCount(-instancesToRemove)
  }

  /**
   * 인스턴스 시작 (시뮬레이션)
   */
  private async startInstance(instanceId: string) {
    // 실제로는 Docker 컨테이너 시작 또는 VM 생성
    await redis.hset('instances', instanceId, JSON.stringify({
      status: 'starting',
      createdAt: Date.now(),
      health: 'unknown'
    }))

    // 시작 시간 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 5000))

    await redis.hset('instances', instanceId, JSON.stringify({
      status: 'running',
      createdAt: Date.now(),
      health: 'healthy'
    }))
  }

  /**
   * 인스턴스 헬스 체크 대기
   */
  private async waitForHealthy(instanceId: string) {
    let attempts = 0
    const maxAttempts = 20

    while (attempts < maxAttempts) {
      const instanceData = await redis.hget('instances', instanceId)
      if (instanceData) {
        const instance = JSON.parse(instanceData)
        if (instance.health === 'healthy') {
          return true
        }
      }

      await new Promise(resolve => setTimeout(resolve, 3000))
      attempts++
    }

    throw new Error(`Instance ${instanceId} failed health check`)
  }

  /**
   * 로드 밸런서에 인스턴스 추가
   */
  private async addToLoadBalancer(instanceId: string) {
    await redis.sadd('lb_active_instances', instanceId)
    await redis.hset('lb_instance_weights', instanceId, '1.0')
    
    console.log(`🔀 Added ${instanceId} to load balancer`)
  }

  /**
   * 로드 밸런서에서 인스턴스 제거
   */
  private async removeFromLoadBalancer(instanceId: string) {
    await redis.srem('lb_active_instances', instanceId)
    await redis.hdel('lb_instance_weights', instanceId)
    
    console.log(`🚫 Removed ${instanceId} from load balancer`)
  }

  /**
   * 기존 연결 드레인
   */
  private async drainConnections(instanceId: string) {
    console.log(`⏳ Draining connections for ${instanceId}...`)
    
    // 새 연결 차단하고 기존 연결 완료 대기
    let attempts = 0
    const maxAttempts = 30 // 30초 대기

    while (attempts < maxAttempts) {
      const activeConnections = await redis.get(`connections:${instanceId}`) || '0'
      if (parseInt(activeConnections) === 0) {
        console.log(`✅ All connections drained for ${instanceId}`)
        return
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
    }

    console.log(`⚠️ Force draining ${instanceId} after timeout`)
  }

  /**
   * 인스턴스 중지
   */
  private async stopInstance(instanceId: string) {
    await redis.hdel('instances', instanceId)
    await redis.del(`connections:${instanceId}`)
    console.log(`🛑 Stopped instance ${instanceId}`)
  }

  /**
   * 제거할 인스턴스 선택
   */
  private async selectInstancesForRemoval(count: number): Promise<string[]> {
    const allInstances = await redis.smembers('lb_active_instances')
    
    // 연결 수가 적은 순으로 정렬
    const instanceConnections: any[] = []
    for (const instanceId of allInstances) {
      const connections = parseInt(await redis.get(`connections:${instanceId}`) || '0')
      instanceConnections.push({ instanceId, connections })
    }

    instanceConnections.sort((a, b) => a.connections - b.connections)
    
    return instanceConnections.slice(0, count).map(item => item.instanceId)
  }

  /**
   * 현재 인스턴스 수 조회
   */
  private async getCurrentInstanceCount(): Promise<number> {
    return await redis.scard('lb_active_instances')
  }

  /**
   * 인스턴스 수 업데이트
   */
  private async updateInstanceCount(delta: number) {
    const currentCount = await this.getCurrentInstanceCount()
    const newCount = Math.max(this.config.minInstances, currentCount + delta)
    
    await redis.set('current_instance_count', newCount)
    console.log(`📊 Instance count updated: ${currentCount} → ${newCount}`)
  }

  /**
   * 스케일링 결정 로그
   */
  private async logScalingDecision(decision: ScalingDecision) {
    await redis.lpush('scaling_decisions', JSON.stringify(decision))
    await redis.ltrim('scaling_decisions', 0, 999) // 최근 1000개만 유지
  }

  /**
   * 스케일링 히스토리 조회
   */
  async getScalingHistory(limit = 50) {
    const decisions = await redis.lrange('scaling_decisions', 0, limit - 1)
    return decisions.map(decision => JSON.parse(decision))
  }

  /**
   * 예측적 스케일링 (트래픽 패턴 기반)
   */
  async predictiveScaling() {
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay()
    
    // 과거 데이터 기반 패턴 분석
    const historicalPattern = await this.getTrafficPattern(hour, dayOfWeek)
    
    if (historicalPattern.expectedIncrease > 1.5) {
      console.log(`🔮 Predictive scaling: Expected ${historicalPattern.expectedIncrease}x traffic increase`)
      
      const currentInstances = await this.getCurrentInstanceCount()
      const recommendedInstances = Math.ceil(currentInstances * historicalPattern.expectedIncrease)
      
      if (recommendedInstances > currentInstances) {
        const decision: ScalingDecision = {
          action: 'scale_up',
          currentInstances,
          targetInstances: Math.min(recommendedInstances, this.config.maxInstances),
          reason: `Predictive scaling for expected traffic increase (${historicalPattern.expectedIncrease}x)`,
          confidence: historicalPattern.confidence,
          timestamp: Date.now(),
          metrics: {
            cpu: 0,
            memory: 0,
            responseTime: 0,
            concurrentUsers: 0,
            errorRate: 0
          }
        }

        await this.executeScaling(decision)
        return decision
      }
    }

    return null
  }

  /**
   * 트래픽 패턴 분석
   */
  private async getTrafficPattern(hour: number, dayOfWeek: number) {
    // 과거 30일간의 동일 시간대 트래픽 데이터 분석
    const patterns: number[] = []
    
    for (let i = 1; i <= 30; i++) {
      const key = `traffic_pattern:${dayOfWeek}:${hour}:${i}`
      const traffic = await redis.get(key)
      if (traffic) {
        patterns.push(parseFloat(traffic))
      }
    }

    if (patterns.length < 5) {
      return { expectedIncrease: 1.0, confidence: 0.1 }
    }

    const average = patterns.reduce((a, b) => a + b, 0) / patterns.length
    const currentBaseline = parseFloat(await redis.get('current_traffic_baseline') || '1.0')
    const expectedIncrease = average / currentBaseline

    // 신뢰도 계산 (데이터 포인트 수와 변동성 기반)
    const variance = patterns.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / patterns.length
    const confidence = Math.min(patterns.length / 30, 1.0) * (1 - Math.min(variance / average, 1.0))

    return {
      expectedIncrease: Math.max(expectedIncrease, 1.0),
      confidence: Math.round(confidence * 100) / 100
    }
  }

  /**
   * 로드 밸런서 상태 관리
   */
  async manageLoadBalancer() {
    const activeInstances = await redis.smembers('lb_active_instances')
    const healthyInstances: string[] = []

    // 모든 인스턴스 헬스 체크
    for (const instanceId of activeInstances) {
      const isHealthy = await this.checkInstanceHealth(instanceId)
      if (isHealthy) {
        healthyInstances.push(instanceId)
      } else {
        console.log(`🚨 Unhealthy instance detected: ${instanceId}`)
        await this.handleUnhealthyInstance(instanceId)
      }
    }

    // 헬시 인스턴스 가중치 업데이트
    await this.updateLoadBalancingWeights(healthyInstances)

    return {
      total: activeInstances.length,
      healthy: healthyInstances.length,
      unhealthy: activeInstances.length - healthyInstances.length
    }
  }

  private async checkInstanceHealth(instanceId: string): Promise<boolean> {
    // 실제 헬스 체크 구현
    const responseTime = Math.random() * 100 // 시뮬레이션
    const isResponding = Math.random() > 0.05 // 95% 정상

    return responseTime < 50 && isResponding
  }

  private async handleUnhealthyInstance(instanceId: string) {
    // 불건전한 인스턴스 처리
    await this.removeFromLoadBalancer(instanceId)
    
    // 재시작 시도
    try {
      await this.restartInstance(instanceId)
      await this.waitForHealthy(instanceId)
      await this.addToLoadBalancer(instanceId)
      console.log(`🔄 Successfully restarted ${instanceId}`)
    } catch (error) {
      console.error(`❌ Failed to restart ${instanceId}:`, error)
      await this.stopInstance(instanceId)
    }
  }

  private async restartInstance(instanceId: string) {
    await this.stopInstance(instanceId)
    await new Promise(resolve => setTimeout(resolve, 2000))
    await this.startInstance(instanceId)
  }

  private async updateLoadBalancingWeights(healthyInstances: string[]) {
    // 인스턴스별 현재 부하에 따라 가중치 조정
    for (const instanceId of healthyInstances) {
      const currentLoad = await this.getInstanceLoad(instanceId)
      const weight = Math.max(0.1, 1.0 - (currentLoad * 0.8)) // 부하가 높을수록 가중치 감소
      
      await redis.hset('lb_instance_weights', instanceId, weight.toString())
    }
  }

  private async getInstanceLoad(instanceId: string): Promise<number> {
    const connections = parseInt(await redis.get(`connections:${instanceId}`) || '0')
    const maxConnections = 1000 // 인스턴스당 최대 연결 수
    
    return Math.min(connections / maxConnections, 1.0)
  }
}

export const autoScaler = new AutoScalerService()