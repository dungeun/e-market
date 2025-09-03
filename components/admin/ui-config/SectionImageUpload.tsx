'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { toast } from 'sonner';

interface Language {
  code: string;
  name: string;
  native_name?: string;
  flag_emoji?: string;
}

interface SectionImageUploadProps {
  sectionKey: string;
  languages: Language[];
  images: { [key: string]: string };
  onUpdate: (images: { [key: string]: string }) => void;
  title?: string;
}

export function SectionImageUpload({ 
  sectionKey, 
  languages, 
  images, 
  onUpdate,
  title = '섹션 이미지'
}: SectionImageUploadProps) {
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [localImages, setLocalImages] = useState(images || {});

  useEffect(() => {
    setLocalImages(images || {});
  }, [images]);

  const handleImageUpload = async (file: File, langCode: string) => {
    if (!file) return;
    
    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 이미지 파일 체크
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setUploading(prev => ({ ...prev, [langCode]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('section', sectionKey);
      formData.append('language', langCode);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드 실패');
      }

      const data = await response.json();
      
      const newImages = {
        ...localImages,
        [langCode]: data.url
      };
      
      setLocalImages(newImages);
      onUpdate(newImages);
      toast.success(`${getLanguageName(langCode)} 이미지가 업로드되었습니다.`);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(prev => ({ ...prev, [langCode]: false }));
    }
  };

  const handleRemoveImage = (langCode: string) => {
    const newImages = { ...localImages };
    delete newImages[langCode];
    setLocalImages(newImages);
    onUpdate(newImages);
    toast.success(`${getLanguageName(langCode)} 이미지가 제거되었습니다.`);
  };

  const getLanguageName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang?.name || code.toUpperCase();
  };

  const getLanguageFlag = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang?.flag_emoji || '🌐';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Image className="w-5 h-5" />
        {title}
      </h3>
      
      <div className="grid gap-4">
        {languages.map((lang) => (
          <div key={lang.code} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium flex items-center gap-2">
                <span className="text-lg">{getLanguageFlag(lang.code)}</span>
                {lang.name}
              </span>
              {localImages[lang.code] && (
                <button
                  onClick={() => handleRemoveImage(lang.code)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="이미지 제거"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {localImages[lang.code] ? (
              <div className="relative group">
                <img 
                  src={localImages[lang.code]} 
                  alt={`${lang.name} 이미지`}
                  className="w-full h-48 object-cover rounded-md"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, lang.code);
                      }}
                      disabled={uploading[lang.code]}
                    />
                    <div className="bg-white text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                      이미지 변경
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, lang.code);
                  }}
                  disabled={uploading[lang.code]}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-md p-8 hover:border-blue-500 transition-colors">
                  <div className="text-center">
                    {uploading[lang.code] ? (
                      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          클릭하여 이미지 업로드
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          JPG, PNG, GIF (최대 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </label>
            )}
          </div>
        ))}
      </div>
      
      {languages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          활성화된 언어가 없습니다. 언어 설정을 먼저 확인해주세요.
        </div>
      )}
    </div>
  );
}