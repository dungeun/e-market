'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, Database, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CacheStatus {
  isValid: boolean;
  timestamp: string;
}

interface CacheData {
  language: string;
  lastUpdated: string;
  sectionsCount: number;
  sections: any[];
}

export function CacheManager() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [clearing, setClearing] = useState(false);

  // 캐시 상태 조회
  const fetchCacheStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cache/ui-sections?action=status');
      const data = await response.json();
      
      if (data.success) {
        setCacheStatus(data);
      } else {
        toast.error('캐시 상태 조회 실패');
      }
    } catch (error) {
      console.error('Cache status fetch error:', error);
      toast.error('캐시 상태 조회 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  // 캐시 재생성
  const regenerateCache = async (force = false) => {
    try {
      setRegenerating(true);
      const response = await fetch(`/api/cache/ui-sections?force=${force}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`캐시 생성 완료: ${data.languages?.join(', ')} (${data.sectionsCount}개 섹션)`);
        await fetchCacheStatus(); // 상태 새로고침
      } else {
        toast.error('캐시 생성 실패');
      }
    } catch (error) {
      console.error('Cache regeneration error:', error);
      toast.error('캐시 생성 중 오류 발생');
    } finally {
      setRegenerating(false);
    }
  };

  // 캐시 삭제
  const clearCache = async () => {
    try {
      setClearing(true);
      const response = await fetch('/api/cache/ui-sections', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('캐시가 삭제되었습니다');
        await fetchCacheStatus(); // 상태 새로고침
      } else {
        toast.error('캐시 삭제 실패');
      }
    } catch (error) {
      console.error('Cache clear error:', error);
      toast.error('캐시 삭제 중 오류 발생');
    } finally {
      setClearing(false);
    }
  };

  // 캐시 데이터 미리보기
  const previewCache = async (language: string) => {
    try {
      const response = await fetch(`/api/cache/ui-sections?language=${language}`);
      const data = await response.json();
      
      if (data.success) {
        // 새 탭에서 JSON 데이터 보기
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>Cache Preview - ${language}</title></head>
              <body>
                <h1>UI Sections Cache - ${language}</h1>
                <pre>${JSON.stringify(data.data, null, 2)}</pre>
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      } else {
        toast.error(`${language} 캐시 데이터를 찾을 수 없습니다`);
      }
    } catch (error) {
      console.error('Cache preview error:', error);
      toast.error('캐시 미리보기 중 오류 발생');
    }
  };

  useEffect(() => {
    fetchCacheStatus();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              UI 섹션 캐시 관리
            </CardTitle>
            <CardDescription>
              UI 섹션 JSON 캐시 시스템 관리 및 모니터링
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchCacheStatus}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* 캐시 상태 */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {cacheStatus?.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-500" />
            )}
            <div>
              <p className="font-medium">
                캐시 상태: {cacheStatus?.isValid ? '유효함' : '무효함 또는 없음'}
              </p>
              {cacheStatus?.timestamp && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  마지막 확인: {new Date(cacheStatus.timestamp).toLocaleString('ko-KR')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={cacheStatus?.isValid ? "default" : "secondary"}>
              {cacheStatus?.isValid ? "사용 가능" : "재생성 필요"}
            </Badge>
          </div>
        </div>

        {/* 캐시 관리 작업 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-medium mb-2">캐시 생성/갱신</h3>
              <p className="text-sm text-muted-foreground mb-4">
                최신 데이터로 캐시를 생성하거나 갱신합니다.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => regenerateCache(false)}
                  disabled={regenerating}
                  className="w-full"
                  size="sm"
                >
                  {regenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  스마트 갱신
                </Button>
                <Button 
                  onClick={() => regenerateCache(true)}
                  disabled={regenerating}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  {regenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  강제 재생성
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <h3 className="font-medium mb-2">캐시 삭제</h3>
              <p className="text-sm text-muted-foreground mb-4">
                모든 캐시 파일을 삭제합니다.
              </p>
              <Button 
                onClick={clearCache}
                disabled={clearing}
                variant="destructive"
                className="w-full"
                size="sm"
              >
                {clearing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                캐시 삭제
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <h3 className="font-medium mb-2">캐시 미리보기</h3>
              <p className="text-sm text-muted-foreground mb-4">
                언어별 캐시 데이터를 확인합니다.
              </p>
              <div className="space-y-1">
                {['ko', 'en', 'fr'].map(lang => (
                  <Button 
                    key={lang}
                    onClick={() => previewCache(lang)}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    {lang.toUpperCase()} 캐시 보기
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 캐시 정보 */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-3">캐시 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>캐시 위치:</strong> /public/cache/ui-sections/
            </div>
            <div>
              <strong>지원 언어:</strong> 한국어(ko), 영어(en), 프랑스어(fr)
            </div>
            <div>
              <strong>캐시 유효 기간:</strong> 1시간
            </div>
            <div>
              <strong>자동 갱신:</strong> 프로덕션 환경에서 30분마다
            </div>
          </div>
        </div>

        {/* 도움말 */}
        <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 사용 팁</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>스마트 갱신:</strong> 캐시가 유효하면 건너뛰고, 무효하면 재생성</li>
            <li>• <strong>강제 재생성:</strong> 캐시 상태와 관계없이 항상 새로 생성</li>
            <li>• <strong>자동 무효화:</strong> 섹션 생성/수정/삭제 시 자동으로 캐시 삭제</li>
            <li>• <strong>언어팩 연동:</strong> 각 언어별로 번역된 콘텐츠 캐시</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}