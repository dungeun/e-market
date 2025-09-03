'use client';

import React from 'react';
import ImageUploadField from './ImageUploadField';

interface Language {
  code: string;
  name: string;
  native_name?: string;
}

interface MultiLanguageImageUploadProps {
  languages: Language[];
  values: { [key: string]: string };
  onChange: (langCode: string, url: string) => void;
  onDelete: (langCode: string) => void;
  fieldPrefix: string; // e.g., 'fullImageUrl', 'backgroundImage'
  label: string;
  disabled?: boolean;
  showPreview?: boolean;
}

const MultiLanguageImageUpload: React.FC<MultiLanguageImageUploadProps> = ({
  languages,
  values,
  onChange,
  onDelete,
  fieldPrefix,
  label,
  disabled = false,
  showPreview = true
}) => {
  const getFieldName = (langCode: string) => {
    if (langCode === 'ko') {
      return fieldPrefix; // 기본 필드명
    } else if (langCode === 'en') {
      return `${fieldPrefix}En`;
    } else if (langCode === 'ja' || langCode === 'jp') {
      return `${fieldPrefix}Jp`;
    } else {
      // 다른 언어들을 위한 동적 필드명
      const capitalizedLang = langCode.charAt(0).toUpperCase() + langCode.slice(1);
      return `${fieldPrefix}${capitalizedLang}`;
    }
  };

  const getLanguageDisplayName = (lang: Language) => {
    return lang.native_name || lang.name;
  };

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-800">{label}</h4>
      
      {languages.map((lang) => {
        const fieldName = getFieldName(lang.code);
        const currentValue = values[fieldName] || '';
        
        return (
          <ImageUploadField
            key={lang.code}
            value={currentValue}
            onChange={(url) => onChange(fieldName, url)}
            onDelete={() => onDelete(fieldName)}
            label={`${getLanguageDisplayName(lang)}:`}
            disabled={disabled}
            showPreview={showPreview}
            className="border-l-2 border-blue-200 pl-4"
          />
        );
      })}
    </div>
  );
};

export default MultiLanguageImageUpload;