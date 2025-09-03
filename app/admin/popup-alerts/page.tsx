'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Calendar, Globe } from 'lucide-react';

interface PopupAlert {
  id: string;
  message_ko: string;
  message_en: string;
  message_jp: string;
  isActive: boolean;
  backgroundColor: string;
  textColor: string;
  template: string;
  showCloseButton: boolean;
  startDate: string | null;
  endDate: string | null;
  priority: number;
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
  const [activeTab, setActiveTab] = useState<'ko' | 'en' | 'jp'>('ko');
  const [formData, setFormData] = useState({
    message_ko: '',
    message_en: '',
    message_jp: '',
    template: 'info',
    backgroundColor: '',
    textColor: '',
    showCloseButton: true,
    isActive: true,
    startDate: '',
    endDate: '',
    priority: 0
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
      console.error('Error fetching alerts:', error);
      alert('팝업 알림을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 열기
  const openModal = (alert?: PopupAlert) => {
    if (alert) {
      setEditingAlert(alert);
      setFormData({
        message_ko: alert.message_ko,
        message_en: alert.message_en,
        message_jp: alert.message_jp,
        template: alert.template,
        backgroundColor: alert.backgroundColor,
        textColor: alert.textColor,
        showCloseButton: alert.showCloseButton,
        isActive: alert.isActive,
        startDate: alert.startDate ? new Date(alert.startDate).toISOString().slice(0, 16) : '',
        endDate: alert.endDate ? new Date(alert.endDate).toISOString().slice(0, 16) : '',
        priority: alert.priority
      });
    } else {
      setEditingAlert(null);
      setFormData({
        message_ko: '',
        message_en: '',
        message_jp: '',
        template: 'info',
        backgroundColor: '',
        textColor: '',
        showCloseButton: true,
        isActive: true,
        startDate: '',
        endDate: '',
        priority: 0
      });
    }
    setActiveTab('ko');
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
      // 모든 언어 메시지 필수 검증
      if (!formData.message_ko || !formData.message_en || !formData.message_jp) {
        alert('모든 언어의 메시지를 입력해주세요.');
        return;
      }

      const url = '/api/admin/popup-alerts';
      const method = editingAlert ? 'PUT' : 'POST';
      const body = editingAlert 
        ? { 
            ...formData, 
            id: editingAlert.id,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null
          }
        : {
            ...formData,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await fetchAlerts();
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`저장 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`저장 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
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
      } else {
        const errorData = await response.json();
        alert(`상태 변경 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Toggle error:', error);
      alert('상태 변경에 실패했습니다.');
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
      } else {
        const errorData = await response.json();
        alert(`삭제 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  // 날짜 포맷터
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR');
  };

  // 현재 활성 상태 확인
  const isCurrentlyActive = (alert: PopupAlert) => {
    if (!alert.isActive) return false;
    
    const now = new Date();
    const start = alert.startDate ? new Date(alert.startDate) : null;
    const end = alert.endDate ? new Date(alert.endDate) : null;
    
    if (start && now < start) return false;
    if (end && now > end) return false;
    
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">팝업 알림 관리</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          새 팝업 추가
        </button>
      </div>

      {/* 팝업 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">상태</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">우선순위</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">메시지</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">템플릿</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">표시 기간</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {alerts.map((alert) => {
                const currentlyActive = isCurrentlyActive(alert);
                
                return (
                  <tr key={alert.id} className={currentlyActive ? 'bg-green-50' : ''}>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(alert)}
                        className={`p-1 rounded ${
                          alert.isActive 
                            ? 'text-green-600 hover:bg-green-100' 
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={alert.isActive ? '활성' : '비활성'}
                      >
                        {alert.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">{alert.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-900 truncate" title={alert.message_ko}>
                          {alert.message_ko}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs text-gray-500">EN: {alert.message_en.substring(0, 30)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: alert.backgroundColor + '20', 
                          color: alert.backgroundColor 
                        }}
                      >
                        {templates[alert.template]?.name || alert.template}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600">
                        <div>시작: {formatDate(alert.startDate)}</div>
                        <div>종료: {formatDate(alert.endDate)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(alert)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(alert.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingAlert ? '팝업 수정' : '새 팝업 추가'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 언어 탭 */}
              <div className="flex gap-2 mb-4 border-b">
                {(['ko', 'en', 'jp'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`px-4 py-2 font-medium ${
                      activeTab === lang 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Globe className="w-4 h-4 inline-block mr-1" />
                    {lang === 'ko' ? '한국어' : lang === 'en' ? 'English' : '日本語'}
                  </button>
                ))}
              </div>

              {/* 메시지 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  메시지 ({activeTab === 'ko' ? '한국어' : activeTab === 'en' ? 'English' : '日本語'}) *
                </label>
                <textarea
                  value={formData[`message_${activeTab}`]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    [`message_${activeTab}`]: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={
                    activeTab === 'ko' ? '팝업에 표시될 메시지를 입력하세요' :
                    activeTab === 'en' ? 'Enter the message to display in the popup' :
                    'ポップアップに表示するメッセージを入力してください'
                  }
                />
              </div>

              {/* 템플릿 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">템플릿</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(templates).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => handleTemplateChange(key)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        formData.template === key 
                          ? 'ring-2 ring-offset-2 ring-blue-500' 
                          : ''
                      }`}
                      style={{ 
                        backgroundColor: template.backgroundColor, 
                        color: template.textColor 
                      }}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 색상 커스터마이징 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">배경색</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-12 h-10 border rounded"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">글자색</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-12 h-10 border rounded"
                    />
                    <input
                      type="text"
                      value={formData.textColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>

              {/* 표시 기간 설정 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Calendar className="w-4 h-4 inline-block mr-1" />
                    시작 날짜
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Calendar className="w-4 h-4 inline-block mr-1" />
                    종료 날짜
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* 우선순위 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">우선순위</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                  max="999"
                  placeholder="높을수록 먼저 표시됩니다"
                />
              </div>

              {/* 옵션 */}
              <div className="flex gap-4 mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showCloseButton}
                    onChange={(e) => setFormData(prev => ({ ...prev, showCloseButton: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm">닫기 버튼 표시</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm">활성화</span>
                </label>
              </div>

              {/* 미리보기 */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">미리보기</label>
                <div 
                  className="p-3 rounded-lg flex items-center justify-between"
                  style={{ 
                    backgroundColor: formData.backgroundColor, 
                    color: formData.textColor 
                  }}
                >
                  <span className="text-sm">
                    {formData[`message_${activeTab}`] || '메시지를 입력하세요'}
                  </span>
                  {formData.showCloseButton && (
                    <X className="w-4 h-4 opacity-70" />
                  )}
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {editingAlert ? '수정' : '추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}