import React from 'react';
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PopupAlert {
  id: string;
  message: string;
  backgroundColor: string;
  textColor: string;
  template: string;
  showCloseButton: boolean;
}

interface PopupAlertProps {
  maxWidth?: string;
}

const PopupAlert = React.memo(function PopupAlert({ maxWidth = "max-w-[1450px]" }: PopupAlertProps) {
  const [alert, setAlert] = useState<PopupAlert | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 팝업 알림 데이터 fetch
  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const response = await fetch('/api/admin/popup-alerts');
        const data = await response.json();
        
        if (data.alert) {
          // localStorage에서 닫힌 팝업 확인
          const closedAlerts = JSON.parse(localStorage.getItem('closedAlerts') || '[]');
          
          if (!closedAlerts.includes(data.alert.id)) {
            setAlert(data.alert);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch popup alert:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlert();
  }, []);

  // 팝업 닫기 핸들러
  const handleClose = () => {
    if (!alert) return;

    setIsVisible(false);
    
    // localStorage에 닫힌 팝업 ID 저장
    const closedAlerts = JSON.parse(localStorage.getItem('closedAlerts') || '[]');
    if (!closedAlerts.includes(alert.id)) {
      closedAlerts.push(alert.id);
      localStorage.setItem('closedAlerts', JSON.stringify(closedAlerts));
    }

    // 애니메이션 후 완전히 제거
    setTimeout(() => {
      setAlert(null);
    }, 300);
  };

  if (isLoading || !alert || !isVisible) {
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
    >
      <div className={`${maxWidth} mx-auto px-4 sm:px-6 py-3`}>
        <div className="flex items-center justify-between">
          {/* 메시지 */}
          <div className="flex-1 text-center">
            <p className="text-sm font-medium">
              {alert.message}
            </p>
          </div>

          {/* 닫기 버튼 */}
          {alert.showCloseButton && (
            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
              aria-label="알림 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
})
export default PopupAlert;