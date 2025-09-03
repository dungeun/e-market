import { NextResponse } from 'next/server';
import { languageManager } from '@/lib/services/language-manager';

export async function GET() {
  try {
    // 데이터베이스에서 활성화된 언어 목록 가져오기
    const enabledLanguages = await languageManager.getEnabledLanguages();
    
    // LanguageSelector 컴포넌트 형식에 맞게 변환
    const availableLanguages = enabledLanguages.map(lang => ({
      code: lang.code,
      name: lang.native_name || lang.name,
      nativeName: lang.native_name || lang.name,
      flag: lang.flag_emoji || '🌐',
      shortName: lang.code.toUpperCase(),
      isDefault: lang.is_default || false
    }));
    
    return NextResponse.json(availableLanguages);
  } catch (error) {
    console.error('Failed to fetch available languages:', error);
    
    // 에러 발생 시 빈 배열 반환 (동적 동기화 유지)
    return NextResponse.json([]);
  }
}
