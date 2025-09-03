'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Settings, Key, CheckCircle, XCircle, TestTube, Globe, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import LanguageAddForm from './LanguageAddForm';

interface Language {
  code: string;
  name: string;
  native_name?: string;
  enabled: boolean;
  is_default?: boolean;
  flag_emoji?: string;
}

interface SettingsTabProps {
  isActive: boolean;
  languagePacksCount: number;
  selectedLanguages: Language[];
  onLanguageUpdate: () => void;
}

export default function SettingsTab({ isActive, languagePacksCount, selectedLanguages, onLanguageUpdate }: SettingsTabProps) {
  const [apiSettings, setApiSettings] = useState({
    api_key: '',
    enabled: false,
    configured: false,
    masked_key: '',
    status: 'inactive'
  });
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string; sample_translation?: string; error_details?: string } | null>(null);

  useEffect(() => {
    if (isActive) {
      fetchApiSettings();
    }
  }, [isActive]);

  const fetchApiSettings = async () => {
    try {
      const response = await fetch('/api/admin/translate-settings');
      const data = await response.json();
      setApiSettings({
        api_key: '',
        enabled: data.settings.google_translate_enabled || false,
        configured: data.settings.google_translate_api_key_configured || false,
        masked_key: data.settings.google_translate_api_key_masked || '',
        status: data.status || 'inactive'
      });
    } catch (error) {
      // Handle error silently
    }
  };

  const handleApiSettingsSave = async () => {
    try {
      const response = await fetch('/api/admin/translate-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiSettings.api_key,
          enabled: apiSettings.enabled
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Google Translate API 설정이 저장되었습니다.');
        setApiTestResult(data.test_result);
        fetchApiSettings();
        setApiSettings(prev => ({ ...prev, api_key: '' }));
      } else {
        const error = await response.json();
        toast.error(error.error || 'API 설정 저장에 실패했습니다.');
      }
    } catch (error) {
      toast.error('API 설정 저장에 실패했습니다.');
    }
  };

  const handleApiTest = async () => {
    if (!apiSettings.api_key) {
      toast.error('테스트할 API 키를 입력하세요.');
      return;
    }

    try {
      const response = await fetch('/api/admin/translate-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_key: apiSettings.api_key
        })
      });

      const data = await response.json();
      setApiTestResult(data);
      
      if (data.success) {
        toast.success('API 키가 정상적으로 작동합니다.');
      } else {
        toast.error(data.message || 'API 키 테스트에 실패했습니다.');
      }
    } catch (error) {
      toast.error('API 키 테스트에 실패했습니다.');
    }
  };

  const handleApiDisable = async () => {
    try {
      const response = await fetch('/api/admin/translate-settings', {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Google Translate API가 비활성화되었습니다.');
        fetchApiSettings();
        setApiTestResult(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'API 비활성화에 실패했습니다.');
      }
    } catch (error) {
      toast.error('API 비활성화에 실패했습니다.');
    }
  };

  const handleLanguageDisable = async (code: string) => {
    if (!confirm('정말로 이 언어를 비활성화하시겠습니까?')) return;

    try {
      const response = await fetch('/api/admin/i18n/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          updates: { enabled: false }
        })
      });

      if (response.ok) {
        toast.success('언어가 비활성화되었습니다.');
        onLanguageUpdate();
      } else {
        const error = await response.json();
        toast.error(error.error || '언어 비활성화에 실패했습니다.');
      }
    } catch (error) {
      toast.error('언어 비활성화에 실패했습니다.');
    }
  };

  if (!isActive) return null;

  return (
    <div className="space-y-6 mt-6">
      {/* Google Translate API 설정 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Google Translate API 설정
              </CardTitle>
              <CardDescription>
                자동 번역을 위한 Google Translate API 키를 설정합니다.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={apiSettings.status === 'active' ? 'default' : 'secondary'}>
                {apiSettings.status === 'active' ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    활성
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    비활성
                  </>
                )}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="api_key">API 키</Label>
              <Input
                id="api_key"
                type="password"
                value={apiSettings.api_key}
                onChange={(e) => setApiSettings(prev => ({ ...prev, api_key: e.target.value }))}
                placeholder={apiSettings.configured ? `설정됨: ${apiSettings.masked_key}` : 'Google Translate API 키를 입력하세요'}
              />
            </div>
            <div className="space-y-2">
              <Label>상태</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="api_enabled"
                  checked={apiSettings.enabled}
                  onChange={(e) => setApiSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="api_enabled">
                  API 활성화
                </Label>
              </div>
            </div>
          </div>

          {apiTestResult && (
            <div className={`p-4 rounded-md ${apiTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                {apiTestResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={apiTestResult.success ? 'text-green-800' : 'text-red-800'}>
                  {apiTestResult.message}
                </span>
              </div>
              {apiTestResult.sample_translation && (
                <p className="mt-2 text-sm text-gray-600">
                  테스트 번역: "Hello World" → "{apiTestResult.sample_translation}"
                </p>
              )}
              {apiTestResult.error_details && (
                <p className="mt-2 text-sm text-red-600">
                  오류 세부사항: {apiTestResult.error_details}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleApiTest}
              disabled={!apiSettings.api_key}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              API 키 테스트
            </Button>
            <div className="flex gap-2">
              {apiSettings.configured && (
                <Button
                  variant="destructive"
                  onClick={handleApiDisable}
                  size="sm"
                >
                  비활성화
                </Button>
              )}
              <Button onClick={handleApiSettingsSave}>
                설정 저장
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 언어 관리 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                언어 추가 및 관리
              </CardTitle>
              <CardDescription>
                새로운 언어를 추가하거나 기존 언어를 관리합니다. 최대 3개의 언어까지 활성화할 수 있습니다.
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  언어 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>새 언어 추가</DialogTitle>
                  <DialogDescription>
                    새로운 언어를 시스템에 추가합니다. Google Translate API가 설정되어 있어야 자동 번역이 가능합니다.
                  </DialogDescription>
                </DialogHeader>
                <LanguageAddForm 
                  onSuccess={() => {
                    onLanguageUpdate();
                    toast.success('새 언어가 추가되었습니다.');
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-3">활성 언어</h3>
            <div className="space-y-2">
              {selectedLanguages.map((language) => (
                <div
                  key={language.code}
                  className={`flex items-center justify-between p-3 rounded border ${
                    language.is_default ? 'bg-blue-50' : 'bg-green-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{language.flag_emoji || '🌐'}</span>
                    <div>
                      <span className="font-medium">
                        {language.native_name || language.name} ({language.name})
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {language.code.toUpperCase()}
                        </Badge>
                        {language.is_default && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">기본 언어</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-medium text-sm">활성</span>
                    {!language.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLanguageDisable(language.code)}
                        className="text-red-600 hover:text-red-700"
                      >
                        비활성화
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 번역 통계 및 도구 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            번역 통계 및 도구
          </CardTitle>
          <CardDescription>
            번역 현황과 관리 도구
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">번역 통계</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{languagePacksCount}</div>
                <div className="text-sm text-blue-800">UI 언어팩</div>
                <div className="text-xs text-gray-600">등록된 UI 텍스트</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">-</div>
                <div className="text-sm text-green-800">번역된 상품</div>
                <div className="text-xs text-gray-600">다국어 지원 상품</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{selectedLanguages.length}</div>
                <div className="text-sm text-purple-800">활성 언어</div>
                <div className="text-xs text-gray-600">현재 사용 중인 언어</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">번역 관리 도구</h3>
            <div className="grid gap-3">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Google Translate API</div>
                    <div className="text-sm text-gray-600">자동 번역 서비스 설정</div>
                  </div>
                  <Badge variant={apiSettings.status === 'active' ? 'default' : 'secondary'}>
                    {apiSettings.status === 'active' ? '활성' : '비활성'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-medium">언어팩 내보내기/가져오기</div>
                  <div className="text-sm text-gray-600">언어팩을 JSON 파일로 내보내거나 가져올 수 있습니다</div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-medium">번역 완성도 분석</div>
                  <div className="text-sm text-gray-600">각 언어별 번역 완성도와 누락된 번역을 확인합니다</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}