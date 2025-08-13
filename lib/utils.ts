import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 가격 포맷 함수
export function formatPrice(price: number, currency: string = 'KRW'): string {
  if (currency === 'KRW') {
    return `₩${price.toLocaleString('ko-KR')}`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}
