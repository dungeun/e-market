import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 가격을 지역화된 통화 형식으로 포맷팅
 */
export function formatPrice(
  price: number | string, 
  locale: string = 'ko-KR', 
  currency: string = 'KRW'
): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) return '0';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice);
}