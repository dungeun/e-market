import type { AppError } from '@/lib/types/common';
/**
 * 모니터링 & 스케일링 관리 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { systemMonitor } from '@/lib/monitoring/system-monitor'
import { performanceTracker } from '@/lib/monitoring/performance-tracker'
import { autoScaler } from '@/lib/scaling/auto-scaler'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // TODO: Implement proper auth check when User model includes role field
    // if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
    //   return NextResponse.json(
    //     { error: 'Admin access required' },
    //     { status: 403 }
    //   )
    // }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'dashboard'

    switch (action) {
      case 'dashboard':
        // 전체 대시보드 데이터
        const [systemMetrics, performanceData, systemStatus, scalingHistory] = await Promise.all([
          systemMonitor.collectMetrics(),
          performanceTracker.getDashboardData(),
          systemMonitor.getSystemStatus(),
          autoScaler.getScalingHistory(10)
        ])

        return NextResponse.json({
          success: true,
          data: {
            system: systemMetrics,
            performance: performanceData,
            status: systemStatus,
            scaling: scalingHistory.slice(0, 5),
            timestamp: new Date().toISOString()
          }
        })

      case 'system_metrics':
        const metrics = await systemMonitor.collectMetrics()
        return NextResponse.json({
          success: true,
          data: metrics
        })

      case 'performance_stats':
        const metricName = searchParams.get('metric') || 'api_response_time'
        const period = searchParams.get('period') || '1h'
        const stats = await performanceTracker.getPerformanceStats(metricName, period)
        
        return NextResponse.json({
          success: true,
          data: stats
        })

      case 'scaling_status':
        const decision = await autoScaler.evaluateScaling()
        return NextResponse.json({
          success: true,
          data: decision
        })

      case 'scaling_history':
        const limit = parseInt(searchParams.get('limit') || '50')
        const history = await autoScaler.getScalingHistory(limit)
        
        return NextResponse.json({
          success: true,
          data: history
        })

      case 'load_balancer_status':
        const lbStatus = await autoScaler.manageLoadBalancer()
        return NextResponse.json({
          success: true,
          data: lbStatus
        })

      case 'alerts':
        const performanceAlerts = await performanceTracker.checkPerformanceAlerts()
        return NextResponse.json({
          success: true,
          data: {
            performance: performanceAlerts,
            timestamp: new Date().toISOString()
          }
        })

      case 'metrics_history':
        const hours = parseInt(searchParams.get('hours') || '24')
        const metricsHistory = await systemMonitor.getMetricsHistory(hours)
        
        return NextResponse.json({
          success: true,
          data: metricsHistory
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: Error | unknown) {

    return NextResponse.json(
      { error: error.message || 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // TODO: Implement proper auth check when User model includes role field
    // if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
    //   return NextResponse.json(
    //     { error: 'Admin access required' },
    //     { status: 403 }
    //   )
    // }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'load_test':
        const { endpoint, concurrentUsers, duration, rampUpTime } = body
        
        if (!endpoint || !concurrentUsers || !duration) {
          return NextResponse.json(
            { error: 'endpoint, concurrentUsers, and duration are required' },
            { status: 400 }
          )
        }

        // 부하 테스트 실행
        const loadTestResult = await performanceTracker.simulateLoad({
          endpoint,
          concurrentUsers: parseInt(concurrentUsers),
          duration: parseInt(duration),
          rampUpTime: rampUpTime ? parseInt(rampUpTime) : undefined
        })

        return NextResponse.json({
          success: true,
          data: loadTestResult
        })

      case 'manual_scaling':
        const { targetInstances } = body
        
        if (!targetInstances) {
          return NextResponse.json(
            { error: 'targetInstances is required' },
            { status: 400 }
          )
        }

        // 수동 스케일링 (구현 필요)
        return NextResponse.json({
          success: true,
          message: `Manual scaling to ${targetInstances} instances initiated`,
          data: {
            targetInstances: parseInt(targetInstances),
            timestamp: new Date().toISOString()
          }
        })

      case 'predictive_scaling':
        const prediction = await autoScaler.predictiveScaling()
        
        return NextResponse.json({
          success: true,
          data: prediction || { message: 'No scaling needed based on predictions' }
        })

      case 'force_scaling_evaluation':
        const scalingDecision = await autoScaler.evaluateScaling()
        
        return NextResponse.json({
          success: true,
          data: scalingDecision
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: Error | unknown) {

    return NextResponse.json(
      { error: error.message || 'Failed to execute monitoring action' },
      { status: 500 }
    )
  }
}