"use client";

import { useState, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { AuthService, User } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import { LanguageCode } from "@/types/global";

// Import DynamicSectionRenderer for complete 24-section support
const DynamicSectionRenderer = dynamic(
  () => import("@/components/DynamicSectionRenderer"),
  {
    loading: () => (
      <div className="space-y-12">
        <div className="h-80 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    ),
    ssr: false,
  }
);

// Import CriticalCSS for performance optimization
const CriticalCSS = dynamic(() => import("@/components/CriticalCSS"), { ssr: false });

interface HomePageImprovedProps {
  initialLanguage?: LanguageCode;
  preloadedData?: unknown;
}

function HomePageImproved({
  initialLanguage = "ko",
  preloadedData,
}: HomePageImprovedProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // 로그인 상태 확인
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);

    if (currentUser && currentUser.type === "BUSINESS") {
      router.push("/business/dashboard");
    }
  }, [router]);

  // All individual render functions removed - DynamicSectionRenderer handles all 24 sections with lazy loading

  return (
    <>
      <CriticalCSS />
      <Header />
      <div className="min-h-screen bg-white main-content">
        <main className="max-w-[1450px] mx-auto px-6 py-8">
          <DynamicSectionRenderer className="space-y-12" />
        </main>
      </div>
      <Footer />
    </>
  );
}

export default memo(HomePageImproved);