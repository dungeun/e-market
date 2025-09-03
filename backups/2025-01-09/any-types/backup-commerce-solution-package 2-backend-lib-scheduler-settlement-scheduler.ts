// 자동 정산 스케줄러
// npm install node-cron @types/node-cron 필요

import { settlementService } from '@/lib/services/settlement.service';

// node-cron을 동적으로 import (설치 안 되어있을 경우 대비)
let cron: any;
try {
  cron = require('node-cron');
} catch (error) {

}

export class SettlementScheduler {
  private tasks: Map<string, any> = new Map();
  private isRunning: boolean = false;

  /**
   * 스케줄러 시작
   */
  start() {
    if (!cron) {

      return;
    }

    if (this.isRunning) {

      return;
    }

    this.isRunning = true;
    
    // 매일 자정에 실행 (00:00)
    this.scheduleDailySettlement();
    
    // 매주 월요일 오전 9시에 주간 정산
    this.scheduleWeeklySettlement();
    
    // 매월 1일 오전 10시에 월간 정산
    this.scheduleMonthlySettlement();

  }

  /**
   * 스케줄러 중지
   */
  stop() {
    if (!this.isRunning) {

      return;
    }

    // 모든 예약된 작업 중지
    this.tasks.forEach((task, name) => {
      if (task && task.stop) {
        task.stop();

      }
    });

    this.tasks.clear();
    this.isRunning = false;

  }

  /**
   * 일일 정산 스케줄
   * 매일 자정에 완료된 캠페인 정산 처리
   */
  private scheduleDailySettlement() {
    if (!cron) return;

    // 매일 자정 (00:00)
    const task = cron.schedule('0 0 * * *', async () => {

      try {
        const result = await settlementService.processAutoSettlements();

        // 정산 결과 로깅 (추후 DB 저장 가능)
        await this.logSettlementResult('daily', result);
      } catch (error) {

      }
    }, {
      scheduled: true,
      timezone: 'Asia/Seoul' // 한국 시간 기준
    });

    this.tasks.set('daily', task);
    
  }

  /**
   * 주간 정산 스케줄
   * 매주 월요일 오전 9시에 주간 정산 리포트 생성
   */
  private scheduleWeeklySettlement() {
    if (!cron) return;

    // 매주 월요일 오전 9시
    const task = cron.schedule('0 9 * * 1', async () => {

      try {
        // 지난 7일간의 정산 통계
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        const stats = await settlementService.getSettlementStatistics(startDate, endDate);
        
        }원
          - 완료 금액: ${stats.amounts.completed.toLocaleString()}원
          - 대기 금액: ${stats.amounts.pending.toLocaleString()}원
        `);
        
        // 관리자에게 알림 전송 (추후 구현)
        await this.notifyAdmins('weekly', stats);
      } catch (error) {

      }
    }, {
      scheduled: true,
      timezone: 'Asia/Seoul'
    });

    this.tasks.set('weekly', task);
    
  }

  /**
   * 월간 정산 스케줄
   * 매월 1일 오전 10시에 월간 정산 처리 및 리포트
   */
  private scheduleMonthlySettlement() {
    if (!cron) return;

    // 매월 1일 오전 10시
    const task = cron.schedule('0 10 1 * *', async () => {

      try {
        // 지난 달 전체 정산 처리
        const result = await settlementService.processAutoSettlements();
        
        // 지난 달 통계
        const endDate = new Date();
        endDate.setDate(0); // 지난 달 마지막 날
        const startDate = new Date(endDate);
        startDate.setDate(1); // 지난 달 첫 날
        
        const stats = await settlementService.getSettlementStatistics(startDate, endDate);
        
        }원
        `);
        
        // 월간 리포트 저장
        await this.saveMonthlyReport(stats, result);
      } catch (error) {

      }
    }, {
      scheduled: true,
      timezone: 'Asia/Seoul'
    });

    this.tasks.set('monthly', task);
    
  }

  /**
   * 수동 정산 실행
   * 관리자가 수동으로 정산을 실행할 때 사용
   */
  async runManualSettlement() {

    try {
      const result = await settlementService.processAutoSettlements();

      return result;
    } catch (error) {

      throw error;
    }
  }

  /**
   * 특정 인플루언서 정산 실행
   */
  async runInfluencerSettlement(influencerId: string) {

    try {
      const result = await settlementService.createSettlement(influencerId);
      
      if (result.success) {
        
      } else {

      }
      
      return result;
    } catch (error) {

      throw error;
    }
  }

  /**
   * 정산 결과 로깅
   */
  private async logSettlementResult(type: string, result: any) {
    // 추후 DB에 로그 저장 구현
    // 현재는 콘솔 로그만
    const logData = {
      type,
      timestamp: new Date(),
      processed: result.processed,
      failed: result.failed,
      details: result.results
    };

  }

  /**
   * 관리자 알림 전송
   */
  private async notifyAdmins(type: string, stats: any) {
    // 추후 이메일 또는 알림 시스템 구현
    
  }

  /**
   * 월간 리포트 저장
   */
  private async saveMonthlyReport(stats: any, result: any) {
    // 추후 DB에 월간 리포트 저장 구현
    const report = {
      period: new Date().toISOString().slice(0, 7), // YYYY-MM
      statistics: stats,
      settlementResult: result,
      createdAt: new Date()
    };

  }

  /**
   * 스케줄러 상태 확인
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      scheduledTasks: Array.from(this.tasks.keys()),
      tasksCount: this.tasks.size
    };
  }
}

// 싱글톤 인스턴스
export const settlementScheduler = new SettlementScheduler();

// Next.js 서버 시작 시 자동으로 스케줄러 시작
if (process.env.NODE_ENV === 'production') {
  // 프로덕션 환경에서만 자동 시작
  settlementScheduler.start();
}