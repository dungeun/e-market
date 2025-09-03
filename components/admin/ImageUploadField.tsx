'use client';

import React, { useState } from 'react';
import { Upload, X, Eye, Trash2 } from 'lucide-react';

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  onDelete?: () => void;
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  onDelete,
  label,
  accept = 'image/*',
  maxSize = 10,
  className = '',
  disabled = false,
  showPreview = true
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증
    if (file.size > maxSize * 1024 * 1024) {
      alert(`파일 크기가 ${maxSize}MB를 초과합니다.`);
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'section-image');
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        onChange(data.url);
        
        // WebP 변환 성공 여부 알림
        if (data.webpConverted) {
          console.log(`이미지가 WebP로 변환되었습니다. 원본: ${data.originalSize}bytes → WebP: ${data.size}bytes`);
        }
      } else {
        const error = await response.json();
        alert(error.error || '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }

    // 파일 input 초기화
    event.target.value = '';
  };

  const handlePreviewClick = () => {
    if (value) {
      window.open(value, '_blank');
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    } else {
      onChange('');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="flex items-center gap-2">
        {/* 업로드 버튼 */}
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={handleFileUpload}
            disabled={disabled || uploading}
            className="sr-only"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label
            htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className={`
              inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium
              ${disabled || uploading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 cursor-pointer hover:bg-gray-50'
              }
            `}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? '업로드 중...' : '업로드'}
          </label>
        </div>

        {/* 미리보기 버튼 */}
        {value && showPreview && (
          <button
            type="button"
            onClick={handlePreviewClick}
            className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
            title="미리보기"
          >
            <Eye className="w-4 h-4 mr-2" />
            미리보기
          </button>
        )}

        {/* 삭제 버튼 */}
        {value && (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100"
            title="삭제"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            삭제
          </button>
        )}
      </div>

      {/* 현재 이미지 URL 표시 */}
      {value && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border break-all">
          {value}
        </div>
      )}

      {/* 이미지 미리보기 */}
      {value && showPreview && (
        <div className="mt-2">
          <img
            src={value}
            alt={`${label} 미리보기`}
            className="max-w-xs max-h-32 object-cover rounded border shadow-sm"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;