// 간단한 번역 서비스 (실제로는 Google Translate API 등을 사용)
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  // 실제 구현에서는 Google Translate API나 다른 번역 서비스를 사용
  // 여기서는 간단한 매핑만 제공
  
  const translations: { [key: string]: { [lang: string]: string } } = {
    '캠페인': { en: 'Campaigns', ja: 'キャンペーン' },
    '인플루언서': { en: 'Influencers', ja: 'インフルエンサー' },
    '커뮤니티': { en: 'Community', ja: 'コミュニティ' },
    '가격': { en: 'Pricing', ja: '価格' },
    '시작하기': { en: 'Get Started', ja: '始める' },
    '이벤트': { en: 'Events', ja: 'イベント' },
    '쿠폰': { en: 'Coupons', ja: 'クーポン' },
    '랭킹': { en: 'Ranking', ja: 'ランキング' },
  };

  if (sourceLanguage === targetLanguage) {
    return text;
  }

  // 간단한 매핑 번역
  if (sourceLanguage === 'ko') {
    const mapped = translations[text];
    if (mapped && mapped[targetLanguage === 'en' ? 'en' : 'ja']) {
      return mapped[targetLanguage === 'en' ? 'en' : 'ja'];
    }
  }

  // 매핑이 없으면 원본 텍스트 반환
  return text;
}