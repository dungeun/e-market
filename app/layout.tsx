import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from '@/providers/providers';
import { getCachedLanguagePacks } from '@/lib/cache/language-packs';
import { initializeCache, scheduleCacheUpdates } from '@/lib/startup/cache-initializer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Market Korea - 해외 노동자를 위한 중고 거래 플랫폼",
  description: "한국에서 생활하는 외국인 노동자들을 위한 필수품 중고 거래 플랫폼",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 서버 사이드에서 언어팩 미리 로드
  const languagePacks = await getCachedLanguagePacks();
  
  // UI 섹션 캐시 초기화 (백그라운드에서 실행)
  initializeCache().catch(error => {
    console.error('Cache initialization failed:', error);
  });
  
  // 캐시 업데이트 스케줄링 (프로덕션에서만)
  if (process.env.NODE_ENV === 'production') {
    scheduleCacheUpdates();
  }
  
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers initialLanguagePacks={languagePacks}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
