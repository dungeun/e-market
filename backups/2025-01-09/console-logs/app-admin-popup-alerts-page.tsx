'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';

interface PopupAlert {
  id: string;
  message: string;
  isActive: boolean;
  backgroundColor: string;
  textColor: string;
  template: string;
  showCloseButton: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PopupTemplate {
  backgroundColor: string;
  textColor: string;
  name: string;
}

interface PopupTemplates {
  [key: string]: PopupTemplate;
}

export default function PopupAlertsPage() {
  const [alerts, setAlerts] = useState<PopupAlert[]>([]);
  const [templates, setTemplates] = useState<PopupTemplates>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PopupAlert | null>(null);
  const [formData, setFormData] = useState({
    message: '',
    template: 'info',
    backgroundColor: '',
    textColor: '',
    showCloseButton: true,
    isActive: true
  });

  // 데이터 fetch
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/admin/popup-alerts?admin=true');
      const data = await response.json();
      
      setAlerts(data.alerts || []);
      setTemplates(data.templates || {});
    } catch (error) {
      console.error('Failed to fetch popup alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 열기
  const openModal = (alert?: PopupAlert) => {
    if (alert) {
      setEditingAlert(alert);
      setFormData({
        message: alert.message,
        template: alert.template,
        backgroundColor: alert.backgroundColor,
        textColor: alert.textColor,
        showCloseButton: alert.showCloseButton,
        isActive: alert.isActive
      });
    } else {
      setEditingAlert(null);
      setFormData({
        message: '',
        template: 'info',
        backgroundColor: '',
        textColor: '',
        showCloseButton: true,
        isActive: true
      });
    }
    setShowModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
    setEditingAlert(null);
  };

  // 템플릿 변경 핸들러
  const handleTemplateChange = (template: string) => {
    setFormData(prev => ({
      ...prev,
      template,
      backgroundColor: templates[template]?.backgroundColor || '',
      textColor: templates[template]?.textColor || ''
    }));
  };

  // 팝업 저장
  const handleSave = async () => {
    try {
      const url = editingAlert 
        ? '/api/admin/popup-alerts' 
        : '/api/admin/popup-alerts';
      
      const method = editingAlert ? 'PUT' : 'POST';
      const body = editingAlert 
        ? { ...formData, id: editingAlert.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await fetchAlerts();
        closeModal();
      } else {
        const errorData = await response.text();
        console.error('Failed to save popup alert:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        alert(`저장 실패: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to save popup alert:', error);
      alert(`저장 실패: ${error}`);
    }
  };

  // 활성/비활성 토글
  const toggleActive = async (alert: PopupAlert) => {
    try {
      const response = await fetch('/api/admin/popup-alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: alert.id,
          isActive: !alert.isActive
        })
      });

      if (response.ok) {
        await fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to toggle alert status:', error);
    }
  };

  // 팝업 삭제
  const handleDelete = async (alertId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/popup-alerts?id=${alertId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  if (isLoading) {
    return <div className="p-6">로딩 중...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">팝업 알림 관리</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          새 팝업 만들기
        </button>
      </div>

      {/* 템플릿 프리뷰 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-3">템플릿 프리뷰</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(templates).map(([key, template]) => (
            <div key={key} className="text-center">
              <div 
                className="p-2 rounded text-sm font-medium mb-1"
                style={{ 
                  backgroundColor: template.backgroundColor,
                  color: template.textColor 
                }}
              >
                {template.name}
              </div>
              <span className="text-xs text-gray-500">{key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 팝업 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  메시지
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  템플릿
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  프리뷰
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(alert)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alert.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {alert.isActive ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          활성
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          비활성
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {alert.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {templates[alert.template]?.name || alert.template}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="px-2 py-1 rounded text-xs"
                      style={{ 
                        backgroundColor: alert.backgroundColor,
                        color: alert.textColor 
                      }}
                    >
                      미리보기
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(alert.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(alert)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {alerts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">등록된 팝업 알림이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 팝업 생성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingAlert ? '팝업 수정' : '새 팝업 만들기'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4">
              {/* 메시지 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메시지
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="팝업 메시지를 입력하세요"
                />
              </div>

              {/* 템플릿 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  템플릿
                </label>
                <select
                  value={formData.template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(templates).map(([key, template]) => (
                    <option key={key} value={key}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 커스텀 색상 */}
              {formData.template === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      배경색
                    </label>
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      글자색
                    </label>
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                </div>
              )}

              {/* 옵션들 */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showCloseButton}
                    onChange={(e) => setFormData(prev => ({ ...prev, showCloseButton: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">닫기 버튼 표시</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">즉시 활성화</span>
                </label>
              </div>

              {/* 미리보기 */}
              {formData.message && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    미리보기
                  </label>
                  <div 
                    className="p-2 rounded text-sm text-center"
                    style={{ 
                      backgroundColor: formData.backgroundColor || templates[formData.template]?.backgroundColor,
                      color: formData.textColor || templates[formData.template]?.textColor
                    }}
                  >
                    {formData.message}
                  </div>
                </div>
              )}

              {/* 버튼들 */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={!formData.message.trim()}
                >
                  {editingAlert ? '수정' : '생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}