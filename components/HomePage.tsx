"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { AuthService, User } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HomeSections } from "@/components/main/HomeSections";
import { useLanguage } from "@/hooks/useLanguage";
import { logger } from "@/lib/logger";
// Note: StaticUITexts and translation functions now come from preloaded data
interface StaticUITexts {
  [key: string]: unknown;
}

// Simple translation function for static texts
const createTranslationFunction = (texts: StaticUITexts | null) => (key: string): string => {
  if (!texts) return key;
  return texts[key] || key;
};
import dynamic from "next/dynamic";
// Lucide 픽토그램 아이콘 import
import {
  Sparkles,
  Shirt,
  UtensilsCrossed,
  Plane,
  Laptop,
  Dumbbell,
  Home,
  Heart,
  Baby,
  Gamepad2,
  GraduationCap,
  Trophy,
  PlusCircle,
  BarChart3,
  Shield,
  Tag,
  ShoppingCart,
  AlertTriangle,
  Smartphone,
  BookOpen,
  ThumbsUp,
  Users,
  Flower2,
} from "lucide-react";

// Code splitting for heavy components
const RankingSection = dynamic(
  () => import("@/components/home/RankingSection"),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
    ),
    ssr: false,
  },
);

const RecommendedSection = dynamic(
  () => import("@/components/home/RecommendedSection"),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
    ),
    ssr: false,
  },
);

const CategorySection = dynamic(
  () => import("@/components/home/CategorySection"),
  {
    loading: () => (
      <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
    ),
    ssr: true,
  },
);

const ActiveProductsSection = dynamic(
  () => import("@/components/home/ActiveProductsSection"),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
    ),
    ssr: false,
  },
);

import { CriticalCSS } from "@/components/CriticalCSS";
import Image from "next/image";
import CampaignCard from "@/components/CampaignCard";

import {
  BaseCampaign,
  UISection,
  LanguagePack,
  LanguageCode,
  UISectionContent,
  HeroSlide,
  QuickLink,
  JsonValue,
} from "@/types/global";

interface Campaign
  extends Omit<
    BaseCampaign,
    "startDate" | "endDate" | "createdAt" | "updatedAt" | "budget"
  > {
  brand: string;
  applicants: number;
  maxApplicants: number;
  deadline: number;
  category: string;
  platforms: string[];
  description: string;
  createdAt: string;
  budget: string;
  campaignType?: string;
  reviewPrice?: number;
  imageUrl?: string;
}

interface HomePageProps {
  initialSections?: unknown[];
  initialLanguage?: LanguageCode;
  initialLanguagePacks?: Record<string, unknown>;
  initialCampaigns?: unknown[];
  initialCategoryStats?: Record<string, number>;
  staticUITexts?: StaticUITexts | null;
  preloadMetadata?: {
    loadTime: number;
    cached: boolean;
    source: string;
  };
  preloadedData?: unknown;
}

function HomePage({
  initialSections,
  initialLanguage = "ko",
  initialLanguagePacks = {},
  initialCampaigns = [],
  initialCategoryStats = {},
  staticUITexts = null,
  preloadMetadata,
  preloadedData,
}: HomePageProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const [sections] = useState(() => {
    // preloadedData가 있으면 우선 사용
    if (preloadedData?.sections && Array.isArray(preloadedData.sections)) {
      return preloadedData.sections;
    }
    
    // sectionsData를 배열로 변환
    if (preloadedData?.sectionsData) {
      const sectionsArray = Object.entries(preloadedData.sectionsData).map(([key, section]: [string, any]) => ({
        id: key,
        type: key === 'featured-products' ? 'featuredProducts' : key,
        data: section,
        ...section
      }));
      return sectionsArray;
    }
    
    return initialSections || [];
  });

  // 언어팩 사용
  const { t: contextT, currentLanguage } = useLanguage();

  // JSON 기반 정적 UI 텍스트 번역 함수
  const getStaticTexts = (lang: LanguageCode) => {
    if (!staticUITexts) return null;
    // StaticUITexts is already structured by category, not by language
    return staticUITexts;
  };

  // 통합 번역 함수 - JSON 정적 텍스트 우선, 동적 컨텐츠는 contextT 사용
  const t = (key: string, fallback?: string): string => {
    const currentLang = currentLanguage || initialLanguage;
    // 언어 코드 변환: 'ja' -> 'jp'
    const normalizedLang: LanguageCode =
      (currentLang as string) === "ja"
        ? "jp"
        : (currentLang as string) === "jp"
          ? "jp"
          : (currentLang as string) === "en"
            ? "en"
            : "ko";
    const staticTexts = getStaticTexts(normalizedLang);

    // 정적 UI 텍스트에서 먼저 찾기
    if (staticTexts) {
      const staticTranslation = createTranslationFunction(staticTexts)(key);
      if (staticTranslation !== key) {
        return staticTranslation;
      }
    }

    // contextT로 동적 컨텐츠 번역 시도
    if (contextT) {
      return contextT(key, fallback);
    }

    return fallback || key;
  };

  // JSON 섹션 데이터에서 다국어 텍스트 가져오기 - 현재 선택된 언어 우선
  const getLocalizedText = (textObj: unknown, fallback?: string): string => {
    if (!textObj) {
      return fallback || "";
    }
    if (typeof textObj === "string") {
      // 문자열이 번역 키처럼 보이면 (점(.)을 포함하면) contextT 함수 사용
      if (textObj.includes('.')) {
        return contextT(textObj, textObj);
      }
      return textObj;
    }

    // 현재 언어 확인
    const currentLang = currentLanguage || initialLanguage || "ko";
    const normalizedLang: LanguageCode =
      (currentLang as string) === "ja"
        ? "jp"
        : (currentLang as string) === "jp"
          ? "jp"
          : (currentLang as string) === "en"
            ? "en"
            : "ko";

    // 현재 선택된 언어로 먼저 시도
    if (textObj[normalizedLang]) {
      return textObj[normalizedLang];
    }

    // 없으면 한국어 → 영어 → 일본어 순으로 폴백
    return textObj.ko || textObj.en || textObj.jp || fallback || "";
  };


  // Lucide 아이콘 맵핑
  const lucideIcons = useMemo(
    () => ({
      Sparkles: Sparkles,
      Shirt: Shirt,
      UtensilsCrossed: UtensilsCrossed,
      Plane: Plane,
      Laptop: Laptop,
      Dumbbell: Dumbbell,
      Home: Home,
      Heart: Heart,
      Baby: Baby,
      Gamepad2: Gamepad2,
      Shield: Shield,
      Tag: Tag,
      ShoppingCart: ShoppingCart,
      AlertTriangle: AlertTriangle,
      Smartphone: Smartphone,
      BookOpen: BookOpen,
      ThumbsUp: ThumbsUp,
      Users: Users,
      Flower2: Flower2,
      GraduationCap: GraduationCap,
      Trophy: Trophy,
      PlusCircle: PlusCircle,
      BarChart3: BarChart3,
    }),
    [],
  );

  // 카테고리별 기본 픽토그램 - Lucide 아이콘 사용
  const defaultCategoryIcons = useMemo(
    () => ({
      beauty: <Sparkles className="w-8 h-8" />,
      fashion: <Shirt className="w-8 h-8" />,
      food: <UtensilsCrossed className="w-8 h-8" />,
      travel: <Plane className="w-8 h-8" />,
      tech: <Laptop className="w-8 h-8" />,
      fitness: <Dumbbell className="w-8 h-8" />,
      lifestyle: <Home className="w-8 h-8" />,
      pet: <Heart className="w-8 h-8" />,
      parenting: <Baby className="w-8 h-8" />,
      game: <Gamepad2 className="w-8 h-8" />,
      education: <GraduationCap className="w-8 h-8" />,
    }),
    [],
  );

  // Lucide 아이콘 렌더링 함수
  const renderCategoryIcon = useCallback(
    (category: unknown, size: "small" | "large" = "small") => {
      const sizeClasses =
        size === "small" ? "w-6 h-6" : "w-7 h-7 lg:w-8 lg:h-8";

      if (category.icon) {
        // HTTP URL인 경우 이미지로 렌더링
        if (category.icon.startsWith("http")) {
          return (
            <img
              src={category.icon}
              alt={getLocalizedText(category.name)}
              className={`${sizeClasses} object-contain`}
            />
          );
        }

        // Lucide 아이콘 이름인 경우 동적 렌더링
        const IconComponent = (lucideIcons as unknown)[category.icon];
        if (IconComponent) {
          return <IconComponent className={sizeClasses} />;
        }

        // 기타 텍스트/이모지인 경우
        return (
          <span
            className={size === "small" ? "text-lg" : "text-xl lg:text-2xl"}
          >
            {category.icon}
          </span>
        );
      }

      // 기본 아이콘 사용
      return (
        (defaultCategoryIcons as unknown)[category.categoryId || ""] || (
          <svg
            className={sizeClasses}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )
      );
    },
    [lucideIcons, defaultCategoryIcons],
  );


  useEffect(() => {
    // 로그인 상태 확인
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);

    // 업체 사용자는 비즈니스 대시보드로 리다이렉트
    if (currentUser && currentUser.type === "BUSINESS") {
      router.push("/business/dashboard");
    }
  }, [router]);

  // 히어로 슬라이드 자동 전환
  useEffect(() => {
    const heroSection = sections.find((s) => s.type === "hero");
    const slides = heroSection?.data?.content?.slides || heroSection?.data?.slides;
    if (slides && slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [sections]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTerm.trim()) {
        router.push(`/campaigns?search=${encodeURIComponent(searchTerm)}`);
      }
    },
    [searchTerm, router],
  );


  // 섹션별로 JSX 요소 생성 함수
  const renderHeroSection = useMemo(() => {
    const heroSection = sections.find((s) => s.type === "hero");
    
    // data.content.slides 또는 data.slides 확인
    const slides = heroSection?.data?.content?.slides || heroSection?.data?.slides;
    if (!slides) {
      return null;
    }

    return (
      <div className="relative mb-8 hero-section">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out hero-slide"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {slides.map(
              (slide: unknown, slideIndex: number) => (
                <div key={`hero-slide-${slideIndex}-${slide.id || slideIndex}`} className="min-w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* 현재 슬라이드 */}
                    <div className="w-full">
                      {slide.link ? (
                        <Link
                          href={slide.link}
                          className="block group"
                        >
                          <div className="relative">
                            <div
                              className={`w-full h-64 md:h-80 text-white relative rounded-2xl overflow-hidden ${slide.bgColor || "bg-gradient-to-r from-purple-600 to-blue-600"}`}
                            >
                              {slide.backgroundImage && (
                                <Image
                                  src={slide.backgroundImage}
                                  alt={
                                    getLocalizedText(
                                      slide.title,
                                    ) || ""
                                  }
                                  fill
                                  className="hero-image"
                                  priority={slideIndex === 0}
                                  quality={85}
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                />
                              )}
                              {!slide.backgroundImage && (
                                <div
                                  className={`absolute inset-0 ${slide.bgColor}`}
                                />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center px-8">
                                <div className="text-center max-w-2xl">
                                  {slide.tag && (
                                    <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium mb-3">
                                      {getLocalizedText(
                                        slide.tag,
                                      )}
                                    </span>
                                  )}
                                  <h1 className="text-3xl md:text-5xl font-bold mb-4 whitespace-pre-line">
                                    {getLocalizedText(
                                      slide.title,
                                    )}
                                  </h1>
                                  <p className="text-lg md:text-xl opacity-90">
                                    {getLocalizedText(
                                      slide.subtitle,
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="absolute bottom-4 right-4 opacity-60 group-hover:opacity-100 transition-opacity">
                                <svg
                                  className="w-8 h-8"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="relative">
                          <div
                            className={`w-full h-64 md:h-80 text-white relative rounded-2xl overflow-hidden ${slide.bgColor || "bg-gradient-to-r from-purple-600 to-blue-600"}`}
                            style={{
                              backgroundImage:
                                slide.backgroundImage
                                  ? `url(${slide.backgroundImage})`
                                  : undefined,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center px-8">
                              <div className="text-center max-w-2xl">
                                {slide.tag && (
                                  <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium mb-3">
                                    {getLocalizedText(slide.tag)}
                                  </span>
                                )}
                                <h1 className="text-3xl md:text-5xl font-bold mb-4 whitespace-pre-line">
                                  {getLocalizedText(slide.title)}
                                </h1>
                                <p className="text-lg md:text-xl opacity-90">
                                  {getLocalizedText(
                                    slide.subtitle,
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 다음 슬라이드 미리보기 */}
                    {slides &&
                      slides.length > 1 && (
                        <div className="hidden lg:block w-full">
                          {(() => {
                            const nextIndex =
                              (slideIndex + 1) % slides.length;
                            const nextSlide = slides[nextIndex];

                            return (
                              <div className="h-full">
                                <div
                                  className={`w-full h-64 md:h-80 text-white relative rounded-2xl overflow-hidden opacity-50 ${nextSlide.bgColor || "bg-gradient-to-r from-green-400 to-blue-400"}`}
                                  style={{
                                    backgroundImage:
                                      nextSlide.backgroundImage
                                        ? `url(${nextSlide.backgroundImage})`
                                        : undefined,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }}
                                >
                                  <div className="absolute inset-0 flex items-center justify-center px-8">
                                    <div className="text-center max-w-2xl">
                                      <h2 className="text-2xl md:text-3xl font-bold mb-2 whitespace-pre-line">
                                        {getLocalizedText(
                                          nextSlide.title,
                                        )}
                                      </h2>
                                      <p className="text-base md:text-lg opacity-90">
                                        {getLocalizedText(
                                          nextSlide.subtitle,
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* 슬라이드 인디케이터 */}
        {heroSection?.data?.slides?.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_: unknown, index: number) => (
              <button
                key={`slide-indicator-${index}`}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-gray-800"
                    : "bg-gray-400 hover:bg-gray-600"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }, [sections, currentSlide, getLocalizedText]);

  const renderCategorySection = useMemo(() => {
    const categorySection = sections.find((s) => s.type === "category");
    
    // data.content.categories 또는 data.categories 확인
    const categories = categorySection?.data?.content?.categories || categorySection?.data?.categories;
    if (!categories) {
      return null;
    }

    return (
      <div className="mb-12">
        {/* 가로 스크롤 카테고리 메뉴 (모든 화면 크기에서 사용) */}
        <div className="px-4">
          <div className="overflow-x-auto">
            <div className="flex gap-3 lg:gap-2 pb-4 justify-center pt-4 pb-2 min-w-max">
              {(categories as unknown[]).map(
                (category: unknown, categoryIndex: number) => (
                  <Link
                    key={`category-${category.id || category.categoryId || categoryIndex}`}
                    href={
                      category.link ||
                      category.url ||
                      `/category/${category.slug || category.categoryId || "all"}`
                    }
                    className="flex flex-col items-center gap-2 min-w-[60px] lg:min-w-[70px] group"
                  >
                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gray-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition-colors relative">
                      {renderCategoryIcon(category, "large")}
                      {category.badge && (
                        <span
                          className={`absolute -top-1.5 -right-1.5 text-[9px] lg:text-[10px] px-1.5 py-0.5 text-white rounded-full font-bold min-w-[16px] lg:min-w-[18px] text-center leading-none ${
                            category.badgeColor === "blue"
                              ? "bg-blue-500"
                              : category.badgeColor === "green"
                                ? "bg-green-500"
                                : category.badgeColor === "purple"
                                  ? "bg-purple-500"
                                  : category.badgeColor === "orange"
                                    ? "bg-orange-500"
                                    : category.badgeColor === "yellow"
                                      ? "bg-yellow-500"
                                      : category.badgeColor === "pink"
                                        ? "bg-pink-500"
                                        : "bg-red-500"
                          }`}
                        >
                          {getLocalizedText(category.badge)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 text-center">
                      {getLocalizedText(category.name)}
                    </span>
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }, [sections, renderCategoryIcon, getLocalizedText]);

  const renderQuicklinksSection = useMemo(() => {
    const quicklinksSection = sections.find((s) => s.type === "quicklinks");
    const links = quicklinksSection?.data?.content?.links || quicklinksSection?.data?.links;
    if (!links) return null;

    return (
      <div className="mb-12">
        {/* 데스크톱: 3단 그리드 */}
        <div className="hidden md:grid md:grid-cols-3 gap-4">
          {links.map((link: unknown, linkIndex: number) => (
            <Link
              key={`quicklink-desktop-${link.id || linkIndex}`}
              href={link.link || link.url || "#"}
              className="bg-gray-100 rounded-xl p-5 flex items-center justify-center gap-3 hover:bg-blue-50 transition-colors group"
            >
              {link.icon &&
                (link.icon.startsWith("http") ? (
                  <Image
                    src={link.icon}
                    alt={getLocalizedText(link.title)}
                    width={32}
                    height={32}
                    className="object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-2xl">{link.icon}</span>
                ))}
              <span className="font-medium text-gray-800 group-hover:text-blue-600">
                {getLocalizedText(link.title)}
              </span>
            </Link>
          ))}
        </div>

        {/* 모바일: 1개씩 슬라이드 */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 px-4">
            {links.map((link: unknown, linkIndex: number) => (
              <Link
                key={`quicklink-mobile-${link.id || linkIndex}`}
                href={link.link || link.url || "#"}
                className="bg-gray-100 rounded-xl p-5 flex items-center justify-center gap-3 hover:bg-blue-50 transition-colors group w-[calc(100vw-2rem)] max-w-[320px] flex-shrink-0"
              >
                {link.icon &&
                  (link.icon.startsWith("http") ? (
                    <Image
                      src={link.icon}
                      alt={getLocalizedText(link.title)}
                      width={32}
                      height={32}
                      className="object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-2xl">{link.icon}</span>
                  ))}
                <span className="font-medium text-gray-800 group-hover:text-blue-600">
                  {getLocalizedText(link.title)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }, [sections, getLocalizedText]);

  const renderPromoSection = useMemo(() => {
    const promoSection = sections.find((s) => s.type === "promo");
    const promoData = promoSection?.data?.content?.banner || promoSection?.data?.banner || 
                     promoSection?.data?.content || promoSection?.data;
    if (!promoData) return null;

    return (
      <div className="mb-12">
        {(promoData as unknown).link ? (
          <Link href={(promoData as unknown).link}>
            <div
              className="rounded-2xl p-6 cursor-pointer hover:opacity-95 transition-opacity relative overflow-hidden"
              style={{
                backgroundImage: (promoData as unknown).backgroundImage
                  ? `url(${(promoData as unknown).backgroundImage})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: !(promoData as unknown).backgroundImage
                  ? (promoData as unknown).backgroundColor || "#FEF3C7"
                  : undefined,
              }}
            >
              <div
                className={`flex items-center justify-between ${
                  (promoData as unknown).backgroundImage ? "relative z-10" : ""
                }`}
              >
                {(promoData as unknown).backgroundImage && (
                  <div className="absolute inset-0 bg-black/20 -z-10" />
                )}
                <div>
                  <h3
                    className={`text-xl font-bold mb-1`}
                    style={{
                      color: (promoData as unknown).backgroundImage
                        ? "#FFFFFF"
                        : (promoData as unknown).textColor || "#000000",
                    }}
                  >
                    {getLocalizedText((promoData as unknown).title)}
                  </h3>
                  <p
                    style={{
                      color: (promoData as unknown).backgroundImage
                        ? "#FFFFFF"
                        : (promoData as unknown).textColor || "#000000",
                      opacity: (promoData as unknown).backgroundImage ? 0.9 : 0.8,
                    }}
                  >
                    {getLocalizedText((promoData as unknown).subtitle)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {(promoData as unknown).icon && (
                    <span className="text-5xl">{(promoData as unknown).icon}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              backgroundImage: (promoData as unknown).backgroundImage
                ? `url(${(promoData as unknown).backgroundImage})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: !(promoData as unknown).backgroundImage
                ? (promoData as unknown).backgroundColor || "#FEF3C7"
                : undefined,
            }}
          >
            <div
              className={`flex items-center justify-between ${
                (promoData as unknown).backgroundImage ? "relative z-10" : ""
              }`}
            >
              {promoData.backgroundImage && (
                <div className="absolute inset-0 bg-black/20 -z-10" />
              )}
              <div>
                <h3
                  className={`text-xl font-bold mb-1`}
                  style={{
                    color: promoData.backgroundImage
                      ? "#FFFFFF"
                      : promoData.textColor || "#000000",
                  }}
                >
                  {getLocalizedText(promoData.title)}
                </h3>
                <p
                  style={{
                    color: promoData.backgroundImage
                      ? "#FFFFFF"
                      : promoData.textColor || "#000000",
                    opacity: promoData.backgroundImage ? 0.9 : 0.8,
                  }}
                >
                  {getLocalizedText(promoData.subtitle)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {promoData.icon && (
                  <span className="text-5xl">{promoData.icon}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [sections, getLocalizedText]);

  const renderRankingSection = useMemo(() => {
    const rankingSection = sections.find((s) => s.type === "ranking");
    if (!rankingSection?.data) return null;
    
    return <RankingSection data={rankingSection.data} />;
  }, [sections]);

  const renderRecommendedSection = useMemo(() => {
    const recommendedSection = sections.find((s) => s.type === "recommended");
    if (!recommendedSection?.data) return null;

    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          {getLocalizedText(recommendedSection.data?.title)}
        </h2>
        <RecommendedSection data={recommendedSection.data} />
      </div>
    );
  }, [sections, getLocalizedText]);

  const renderFeaturedProductsSection = useMemo(() => {
    const featuredProductsSection = sections.find(
      (s) => s.type === "featuredProducts" || 
             s.type === "featured" || 
             s.type === "featured-products" || 
             s.type === "products" || 
             s.type === "featured-items"
    );
    if (!activeCampaignsSection?.data) return null;

    return <ActiveProductsSection data={activeCampaignsSection.data} />;
  }, [sections]);

  return (
    <>
      <CriticalCSS />
      <Header />
      <div className="min-h-screen bg-white main-content">
        <main className="max-w-[1450px] mx-auto px-6 py-8">
          <HomeSections sectionOrder={preloadedData?.sectionOrder}>
            {{
              hero: renderHeroSection,
              category: renderCategorySection,
              quicklinks: renderQuicklinksSection,
              promo: renderPromoSection,
              ranking: renderRankingSection,
              recommended: renderRecommendedSection,
              activeCampaigns: renderActiveCampaignsSection,
            }}
          </HomeSections>
        </main>
      </div>
      <Footer />
    </>
  );
}

// React.memo로 성능 최적화
export default memo(HomePage);
