'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useMemo } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';

interface ProvidersProps {
  children: ReactNode;
  initialLanguagePacks?: Record<string, any>;
}

let globalQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // 서버에서는 항상 새로운 클라이언트 생성
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  
  // 클라이언트에서는 싱글톤 사용
  if (!globalQueryClient) {
    globalQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  
  return globalQueryClient;
}

export function Providers({ children, initialLanguagePacks = {} }: ProvidersProps) {
  const queryClient = useMemo(() => getQueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider initialLanguagePacks={initialLanguagePacks}>
        {children}
      </LanguageProvider>
    </QueryClientProvider>
  );
}