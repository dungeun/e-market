'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: any) => void;
        onclose?: (state: string) => void;
        width?: string;
        height?: string;
      }) => {
        embed: (element: HTMLElement) => void;
      }
    }
  }
}

interface KakaoAddressModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: { zonecode: string; address: string }) => void
}

export default function KakaoAddressModal({ isOpen, onClose, onComplete }: KakaoAddressModalProps) {
  const postcodeRef = useRef<HTMLDivElement>(null)
  const postcodeInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (isOpen && postcodeRef.current && typeof window !== 'undefined' && window.daum) {
      // 이전 인스턴스가 있다면 정리
      if (postcodeInstanceRef.current) {
        postcodeInstanceRef.current = null
      }

      // 새 인스턴스 생성
      postcodeInstanceRef.current = new window.daum.Postcode({
        oncomplete: function(data: any) {
          // 선택된 주소 데이터를 부모 컴포넌트에 전달
          onComplete({
            zonecode: data.zonecode,
            address: data.address
          })
          onClose()
        },
        onclose: function(state: string) {
          // 사용자가 X 버튼이나 ESC로 닫았을 때
          if (state === 'FORCE_CLOSE') {
            onClose()
          }
        },
        width: '100%',
        height: '100%'
      })

      // 모달 내부에 주소검색 위젯 삽입
      postcodeInstanceRef.current.embed(postcodeRef.current)
    }

    return () => {
      // 컴포넌트 언마운트시 정리
      if (postcodeInstanceRef.current) {
        postcodeInstanceRef.current = null
      }
    }
  }, [isOpen, onComplete, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">주소 검색</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Kakao 주소검색 위젯 영역 */}
        <div className="h-96">
          <div ref={postcodeRef} className="w-full h-full" />
        </div>
        
        {/* 푸터 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            주소를 선택하면 자동으로 입력됩니다
          </p>
        </div>
      </div>
    </div>
  )
}