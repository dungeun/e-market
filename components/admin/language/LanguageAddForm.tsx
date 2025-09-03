'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search } from 'lucide-react';

interface LanguageAddFormProps {
  onSuccess: () => void;
}

export default function LanguageAddForm({ onSuccess }: LanguageAddFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const koreanLanguageMap = {
    '스페인어': { code: 'es', name: 'Spanish', nativeName: 'Español', googleCode: 'es', flag: '🇪🇸' },
    '스페인': { code: 'es', name: 'Spanish', nativeName: 'Español', googleCode: 'es', flag: '🇪🇸' },
    '프랑스어': { code: 'fr', name: 'French', nativeName: 'Français', googleCode: 'fr', flag: '🇫🇷' },
    '프랑스': { code: 'fr', name: 'French', nativeName: 'Français', googleCode: 'fr', flag: '🇫🇷' },
    '독일어': { code: 'de', name: 'German', nativeName: 'Deutsch', googleCode: 'de', flag: '🇩🇪' },
    '독일': { code: 'de', name: 'German', nativeName: 'Deutsch', googleCode: 'de', flag: '🇩🇪' },
    '중국어': { code: 'zh', name: 'Chinese', nativeName: '中文', googleCode: 'zh', flag: '🇨🇳' },
    '중국': { code: 'zh', name: 'Chinese', nativeName: '中文', googleCode: 'zh', flag: '🇨🇳' },
    '러시아어': { code: 'ru', name: 'Russian', nativeName: 'Русский', googleCode: 'ru', flag: '🇷🇺' },
    '아랍어': { code: 'ar', name: 'Arabic', nativeName: 'العربية', googleCode: 'ar', flag: '🇸🇦', direction: 'rtl' }
  };

  const searchResults = Object.entries(koreanLanguageMap)
    .filter(([korean, _]) => korean.includes(searchTerm))
    .slice(0, 10);

  const handleLanguageAdd = async (korean: string, langData: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/i18n/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: langData.code,
          name: langData.name,
          nativeName: langData.nativeName,
          googleCode: langData.googleCode,
          flagEmoji: langData.flag,
          enabled: true,
          direction: langData.direction || 'ltr'
        })
      });

      if (response.ok) {
        toast.success(`${korean} 언어가 추가되었습니다.`);
        onSuccess();
        setSearchTerm('');
      } else {
        const error = await response.json();
        toast.error(error.error || '언어 추가에 실패했습니다.');
      }
    } catch (error) {
      toast.error('언어 추가에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium">추가할 언어를 한국어로 검색하세요</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="예: 스페인어, 프랑스어, 독일어..."
              className="pl-10"
            />
          </div>
        </div>

        {searchTerm && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">검색 결과</Label>
            <div className="grid gap-2">
              {searchResults.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  '{searchTerm}' 검색 결과가 없습니다.
                </div>
              ) : (
                searchResults.map(([korean, langData]) => (
                  <Button
                    key={langData.code}
                    type="button"
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => handleLanguageAdd(korean, langData)}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-lg">{langData.flag}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{korean}</div>
                        <div className="text-sm text-muted-foreground">
                          {langData.nativeName} ({langData.code.toUpperCase()})
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        추가하기
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {!searchTerm && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">인기 언어 빠른 추가</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['스페인어', koreanLanguageMap['스페인어']],
              ['프랑스어', koreanLanguageMap['프랑스어']],
              ['독일어', koreanLanguageMap['독일어']],
              ['중국어', koreanLanguageMap['중국어']],
              ['러시아어', koreanLanguageMap['러시아어']],
              ['아랍어', koreanLanguageMap['아랍어']]
            ].map(([korean, langData]: any) => (
              <Button
                key={langData.code}
                type="button"
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleLanguageAdd(korean, langData)}
                disabled={isSubmitting}
              >
                <span className="mr-2">{langData.flag}</span>
                {korean}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}