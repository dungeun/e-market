'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface PopupAlert {
  id: string;
  message_ko: string;
  message_en: string;
  message_jp: string;
  backgroundColor: string;
  textColor: string;
  template: string;
  showCloseButton: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
}

interface PopupAlertProps {
  maxWidth?: string;
}

interface ClosedAlert {
  id: string;
  closedAt: number;
}

// 24시간 후 자동으로 다시 표시 (밀리초)
const POPUP_EXPIRY_TIME = 24 * 60 * 60 * 1000;

const PopupAlert = React.memo(function PopupAlert({ maxWidth = "max-w-[1450px]" }: PopupAlertProps) {
  const [alert, setAlert] = useState<PopupAlert | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage } = useLanguage();

  // localStorage 정리 - 만료된 항목 제거
  const cleanupExpiredAlerts = () => {
    try {
      const closedAlerts: ClosedAlert[] = JSON.parse(localStorage.getItem('closedAlerts') || '[]');
      const now = Date.now();
      const activeAlerts = closedAlerts.filter(alert => 
        now - alert.closedAt < POPUP_EXPIRY_TIME
      );
      
      if (activeAlerts.length !== closedAlerts.length) {
        localStorage.setItem('closedAlerts', JSON.stringify(activeAlerts));
      }
      
      return activeAlerts.map(a => a.id);
    } catch (error) {
      console.error('Error cleaning up expired alerts:', error);
      return [];
    }
  };

  // 팝업 알림 기능을 임시로 비활성화 - 커뮤니티 게시판에 집중
  useEffect(() => {
    // 팝업 알림 기능 임시 비활성화
    setIsLoading(false);
    setAlert(null);
    setIsVisible(false);
  }, []);

  // 팝업 닫기 핸들러
  const handleClose = () => {
    if (!alert) return;

    setIsVisible(false);
    
    // localStorage에 닫힌 팝업 정보 저장 (타임스탬프 포함)
    try {
      const closedAlerts: ClosedAlert[] = JSON.parse(localStorage.getItem('closedAlerts') || '[]');
      const existingIndex = closedAlerts.findIndex(a => a.id === alert.id);
      
      if (existingIndex >= 0) {
        closedAlerts[existingIndex].closedAt = Date.now();
      } else {
        closedAlerts.push({
          id: alert.id,
          closedAt: Date.now()
        });
      }
      
      localStorage.setItem('closedAlerts', JSON.stringify(closedAlerts));
    } catch (error) {
      console.error('Error saving closed alert:', error);
    }

    // 애니메이션 후 완전히 제거
    setTimeout(() => {
      setAlert(null);
    }, 300);
  };

  // 메시지 가져오기 (언어별)
  const getMessage = () => {
    if (!alert) return '';
    
    switch (currentLanguage) {
      case 'en':
        return alert.message_en;
      case 'jp':
        return alert.message_jp;
      case 'ko':
      default:
        return alert.message_ko;
    }
  };

  // 로딩 중이거나 표시할 알림이 없으면 null 반환
  if (isLoading || !alert || !isVisible) {
    return null;
  }

  // 에러 발생 시 조용히 실패 (사용자에게 표시하지 않음)
  if (error) {
    console.error('PopupAlert error:', error);
    return null;
  }

  return (
    <div 
      className={`w-full transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      style={{ 
        backgroundColor: alert.backgroundColor,
        color: alert.textColor 
      }}
      role="alert"
      aria-live="polite"
    >
      <div className={`${maxWidth} mx-auto px-4 sm:px-6 py-3`}>
        <div className="flex items-center justify-between">
          {/* 메시지 */}
          <div className="flex-1 text-center">
            <p className="text-sm font-medium">
              {getMessage()}
            </p>
          </div>

          {/* 닫기 버튼 */}
          {alert.showCloseButton && (
            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
              aria-label={currentLanguage === 'ko' ? '알림 닫기' : 
                       currentLanguage === 'en' ? 'Close alert' : 
                       'アラートを閉じる'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default PopupAlert;