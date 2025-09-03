"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { AuthService, User } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HomeSections } from "@/components/main/HomeSections";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOptimizedUILocalization } from "@/hooks/useOptimizedUILocalization";
import dynamic from "next/dynamic";
import Image from "next/image";
import { logger } from "@/lib/logger";
import { LanguageCode } from "@/types/global";

// Lucide icons
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

// Dynamic imports for heavy components
const RankingSection = dynamic(
  () => import("@/components/sections/RankingSection"),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
    ),
    ssr: false,
  }
);

const RecommendedSection = dynamic(
  () => import("@/components/sections/RecommendedSection"),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
    ),
    ssr: false,
  }
);

const CategorySection = dynamic(
  () => import("@/components/home/CategorySection"),
  {
    loading: () => (
      <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
    ),
    ssr: true,
  }
);

const ActiveProductsSection = dynamic(
  () => import("@/components/home/ActiveProductsSection"),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
    ),
    ssr: false,
  }
);

import { CriticalCSS } from "@/components/CriticalCSS";
import CampaignCard from "@/components/CampaignCard";

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
  new: boolean;
}

interface ProductCacheData {
  metadata: {
    language: string;
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    generated: string;
    cacheVersion: string;
    ttl: number;
    nextPage: number | null;
    prevPage: number | null;
  };
  products: Product[];
  filters?: {
    categories: Array<{ id: string; name: string; count: number }>;
    priceRange: { min: number; max: number };
    brands: Array<{ name: string; count: number }>;
  };
}

interface HomePageImprovedProps {
  initialLanguage?: LanguageCode;
  preloadedData?: any;
}

function HomePageImproved({
  initialLanguage = "ko",
  preloadedData,
}: HomePageImprovedProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [productPage, setProductPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [productMetadata, setProductMetadata] = useState<any>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // JSON 기반 UI 로컬라이제이션 훅 사용
  const { currentLanguage } = useLanguage();
  const { 
    sections, 
    sectionOrder,
    getSectionData, 
    isLoading: uiLoading 
  } = useOptimizedUILocalization({
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false
  });

  // Lucide 아이콘 맵핑
  const lucideIcons = useMemo(
    () => ({
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
      Shield,
      Tag,
      ShoppingCart,
      AlertTriangle,
      Smartphone,
      BookOpen,
      ThumbsUp,
      Users,
      Flower2,
      GraduationCap,
      Trophy,
      PlusCircle,
      BarChart3,
    }),
    []
  );

  // 카테고리별 기본 픽토그램
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
    []
  );

  // JSON 캐시에서 상품 데이터 로드
  const loadProductsFromCache = useCallback(async (page: number) => {
    setLoadingProducts(true);
    try {
      // 언어 코드 정규화
      const langCode = currentLanguage === "ja" ? "jp" : currentLanguage;
      const cacheUrl = `/cache/products/products-${langCode}-page-${page}.json`;
      
      const response = await fetch(cacheUrl, {
        headers: {
          'Cache-Control': 'max-age=300', // 5분 캐시
        }
      });

      if (!response.ok) {
        // 캐시가 없으면 API 폴백
        const apiResponse = await fetch(`/api/products?page=${page}&limit=30&lang=${langCode}`);
        const apiData = await apiResponse.json();
        setProducts(apiData.products || []);
        setProductMetadata(apiData.metadata || {});
        return;
      }

      const cacheData: ProductCacheData = await response.json();
      
      // 캐시 유효성 검사 (TTL)
      const generated = new Date(cacheData.metadata.generated);
      const age = Date.now() - generated.getTime();
      const ttl = (cacheData.metadata.ttl || 3600) * 1000; // 초를 밀리초로 변환
      
      if (age > ttl) {
        // 캐시가 만료됨 - 백그라운드에서 재생성 요청
        fetch('/api/admin/regenerate-cache', { 
          method: 'POST',
          body: JSON.stringify({ type: 'products', language: langCode, page })
        }).catch(err => logger.warn('Cache regeneration request failed:', err));
      }

      setProducts(cacheData.products);
      setProductMetadata(cacheData.metadata);

      // 다음 페이지 프리페치
      if (cacheData.metadata.nextPage) {
        const nextUrl = `/cache/products/products-${langCode}-page-${cacheData.metadata.nextPage}.json`;
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = nextUrl;
        link.as = 'fetch';
        document.head.appendChild(link);
      }
    } catch (error) {
      logger.error('Failed to load products from cache:', error);
      // API 폴백
      try {
        const langCode = currentLanguage === "ja" ? "jp" : currentLanguage;
        const apiResponse = await fetch(`/api/products?page=${page}&limit=30&lang=${langCode}`);
        const apiData = await apiResponse.json();
        setProducts(apiData.products || []);
        setProductMetadata(apiData.metadata || {});
      } catch (apiError) {
        logger.error('Failed to load products from API:', apiError);
      }
    } finally {
      setLoadingProducts(false);
    }
  }, [currentLanguage]);

  // 언어 변경 시 상품 재로드
  useEffect(() => {
    loadProductsFromCache(productPage);
  }, [currentLanguage, productPage, loadProductsFromCache]);

  // 로그인 상태 확인
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);

    if (currentUser && currentUser.type === "BUSINESS") {
      router.push("/business/dashboard");
    }
  }, [router]);

  // 히어로 슬라이드 자동 전환
  useEffect(() => {

    const heroData = getSectionData('hero');

    const slides = heroData?.slides;

    if (slides && slides.length > 1) {

      const interval = setInterval(() => {
        setCurrentSlide((prev) => {
          const next = (prev + 1) % slides.length;

          return next;
        });
      }, 5000);
      return () => {

        clearInterval(interval);
      };
    } else {

    }
  }, [currentLanguage, getSectionData, sectionOrder, uiLoading]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTerm.trim()) {
        router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
      }
    },
    [searchTerm, router]
  );

  // 카테고리 아이콘 렌더링
  const renderCategoryIcon = useCallback(
    (category: any, size: "small" | "large" = "small") => {
      const sizeClasses =
        size === "small" ? "w-6 h-6" : "w-7 h-7 lg:w-8 lg:h-8";

      if (category.icon && category.icon !== "") {
        if (category.icon.startsWith("http")) {
          return (
            <img
              src={category.icon}
              alt={category.name}
              className={`${sizeClasses} object-contain`}
            />
          );
        }

        const IconComponent = (lucideIcons as any)[category.icon];
        if (IconComponent) {
          return <IconComponent className={sizeClasses} />;
        }

        return (
          <span className={size === "small" ? "text-lg" : "text-xl lg:text-2xl"}>
            {category.icon}
          </span>
        );
      }

      return (
        (defaultCategoryIcons as any)[category.categoryId || ""] || (
          <svg className={sizeClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )
      );
    },
    [lucideIcons, defaultCategoryIcons]
  );

  // 섹션 렌더링 함수들
  const renderHeroSection = useMemo(() => {
    const heroData = getSectionData('hero');

    if (!heroData?.slides) {

      return null;
    }

    return (
      <div className="relative mb-8 hero-section">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {heroData.slides.map((slide: any, index: number) => {
              const secondSlide = heroData.slides[1]; // 두 번째 슬라이드
              return (
                <div key={slide.id || `slide-${index}`} className="min-w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* 첫 번째 그리드 - 현재 슬라이드 */}
                    <div className="w-full">
                      {slide.link ? (
                        <Link href={slide.link} className="block group">
                          <div className={`w-full h-64 md:h-80 text-white relative rounded-2xl overflow-hidden ${slide.bgColor || "bg-gradient-to-r from-purple-600 to-blue-600"}`}>
                            {slide.backgroundImage && slide.backgroundImage !== "" && (
                              <Image
                                src={slide.backgroundImage}
                                alt={slide.title || ""}
                                fill
                                className="object-cover"
                                priority={index === 0}
                                quality={85}
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center px-8">
                              <div className="text-center max-w-2xl">
                                {slide.tag && (
                                  <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium mb-3">
                                    {slide.tag}
                                  </span>
                                )}
                                <h1 className="text-3xl md:text-5xl font-bold mb-4 whitespace-pre-line">
                                  {slide.title}
                                </h1>
                                <p className="text-lg md:text-xl opacity-90">
                                  {slide.subtitle}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className={`w-full h-64 md:h-80 text-white relative rounded-2xl overflow-hidden ${slide.bgColor || "bg-gradient-to-r from-purple-600 to-blue-600"}`}>
                          {slide.backgroundImage && slide.backgroundImage !== "" && (
                            <Image
                              src={slide.backgroundImage}
                              alt={slide.title || ""}
                              fill
                              className="object-cover"
                              priority={index === 0}
                              quality={85}
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center px-8">
                            <div className="text-center max-w-2xl">
                              {slide.tag && (
                                <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium mb-3">
                                  {slide.tag}
                                </span>
                              )}
                              <h1 className="text-3xl md:text-5xl font-bold mb-4 whitespace-pre-line">
                                {slide.title}
                              </h1>
                              <p className="text-lg md:text-xl opacity-90">
                                {slide.subtitle}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* 두 번째 그리드 - 두 번째 슬라이드 (있을 경우) */}
                    <div className="w-full">
                      {secondSlide ? (
                        secondSlide.link ? (
                          <Link href={secondSlide.link} className="block group">
                            <div className={`w-full h-64 md:h-80 text-white relative rounded-2xl overflow-hidden ${secondSlide.bgColor || "bg-gradient-to-r from-green-600 to-blue-600"}`}>
                              {secondSlide.backgroundImage && secondSlide.backgroundImage !== "" && (
                                <Image
                                  src={secondSlide.backgroundImage}
                                  alt={secondSlide.title || ""}
                                  fill
                                  className="object-cover"
                                  quality={85}
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center px-8">
                                <div className="text-center max-w-2xl">
                                  {secondSlide.tag && (
                                    <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium mb-3">
                                      {secondSlide.tag}
                                    </span>
                                  )}
                                  <h2 className="text-2xl md:text-4xl font-bold mb-4 whitespace-pre-line">
                                    {secondSlide.title}
                                  </h2>
                                  <p className="text-base md:text-lg opacity-90">
                                    {secondSlide.subtitle}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div className={`w-full h-64 md:h-80 text-white relative rounded-2xl overflow-hidden ${secondSlide.bgColor || "bg-gradient-to-r from-green-600 to-blue-600"}`}>
                            {secondSlide.backgroundImage && secondSlide.backgroundImage !== "" && (
                              <Image
                                src={secondSlide.backgroundImage}
                                alt={secondSlide.title || ""}
                                fill
                                className="object-cover"
                                quality={85}
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center px-8">
                              <div className="text-center max-w-2xl">
                                {secondSlide.tag && (
                                  <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium mb-3">
                                    {secondSlide.tag}
                                  </span>
                                )}
                                <h2 className="text-2xl md:text-4xl font-bold mb-4 whitespace-pre-line">
                                  {secondSlide.title}
                                </h2>
                                <p className="text-base md:text-lg opacity-90">
                                  {secondSlide.subtitle}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        // 두 번째 슬라이드가 없을 경우 기본 콘텐츠
                        <div className="w-full h-64 md:h-80 bg-white/10 backdrop-blur rounded-2xl overflow-hidden flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-4xl mb-4">🛍️</div>
                            <h3 className="text-xl font-semibold mb-2">더 많은 상품</h3>
                            <p className="text-sm opacity-80">다양한 상품을 둘러보세요</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {heroData.slides.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {heroData.slides.map((slide: any, index: number) => (
              <button
                key={`indicator-${slide.id || index}`}
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
  }, [getSectionData, currentSlide, sections]);

  const renderCategorySection = useMemo(() => {
    const categoryData = getSectionData('category');
    if (!categoryData?.categories) return null;

    return (
      <div className="mb-12">
        <div className="px-4">
          <div className="overflow-x-auto">
            <div className="flex gap-3 lg:gap-2 pb-4 justify-center pt-4 pb-2 min-w-max">
              {categoryData.categories.map((category: any, index: number) => (
                <Link
                  key={`category-${index}`}
                  href={category.link || `/category/${category.slug || "all"}`}
                  className="flex flex-col items-center gap-2 min-w-[60px] lg:min-w-[70px] group"
                >
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gray-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition-colors relative">
                    {renderCategoryIcon(category, "large")}
                    {category.badge && (
                      <span className={`absolute -top-1.5 -right-1.5 text-[9px] lg:text-[10px] px-1.5 py-0.5 text-white rounded-full font-bold min-w-[16px] lg:min-w-[18px] text-center leading-none bg-${category.badgeColor || 'red'}-500`}>
                        {category.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 text-center">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }, [getSectionData, renderCategoryIcon, sections]);

  const renderQuicklinksSection = useMemo(() => {
    const quicklinksData = getSectionData('quicklinks');
    if (!quicklinksData?.links) return null;

    return (
      <div className="mb-12">
        {/* 데스크톱: 3단 그리드 */}
        <div className="hidden md:grid md:grid-cols-3 gap-4">
          {quicklinksData.links.map((link: any, index: number) => (
            <Link
              key={`quicklink-desktop-${index}`}
              href={link.url || "#"}
              className="bg-gray-100 rounded-xl p-5 flex items-center justify-center gap-3 hover:bg-blue-50 transition-colors group"
            >
              {link.icon && link.icon !== "" && (
                link.icon.startsWith("http") ? (
                  <Image
                    src={link.icon}
                    alt={link.title}
                    width={32}
                    height={32}
                    className="object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-2xl">{link.icon}</span>
                )
              )}
              <span className="font-medium text-gray-800 group-hover:text-blue-600">
                {link.title}
              </span>
            </Link>
          ))}
        </div>

        {/* 모바일: 슬라이드 */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 px-4">
            {quicklinksData.links.map((link: any, index: number) => (
              <Link
                key={`quicklink-mobile-${index}`}
                href={link.url || "#"}
                className="bg-gray-100 rounded-xl p-5 flex items-center justify-center gap-3 hover:bg-blue-50 transition-colors group w-[calc(100vw-2rem)] max-w-[320px] flex-shrink-0"
              >
                {link.icon && link.icon !== "" && (
                  link.icon.startsWith("http") ? (
                    <Image
                      src={link.icon}
                      alt={link.title}
                      width={32}
                      height={32}
                      className="object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-2xl">{link.icon}</span>
                  )
              )}
              <span className="font-medium text-gray-800 group-hover:text-blue-600">
                {link.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}, [getSectionData, sections]);

const renderPromoSection = useMemo(() => {
  const promoData = getSectionData('promo');
  if (!promoData?.banner) return null;

  const banner = promoData.banner;
  
  return (
    <div className="mb-12">
      {banner.link ? (
        <Link href={banner.link}>
          <div
            className="rounded-2xl p-6 cursor-pointer hover:opacity-95 transition-opacity relative overflow-hidden"
            style={{
              backgroundImage: banner.backgroundImage && banner.backgroundImage !== "" ? `url(${banner.backgroundImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: !banner.backgroundImage || banner.backgroundImage === "" ? banner.backgroundColor || "#FEF3C7" : undefined,
            }}
          >
            <div className={`flex items-center justify-between ${banner.backgroundImage ? "relative z-10" : ""}`}>
              {banner.backgroundImage && <div className="absolute inset-0 bg-black/20 -z-10" />}
              <div>
                <h3
                  className="text-xl font-bold mb-1"
                  style={{
                    color: banner.backgroundImage && banner.backgroundImage !== "" ? "#FFFFFF" : banner.textColor || "#000000",
                  }}
                >
                  {banner.title}
                </h3>
                <p
                  style={{
                    color: banner.backgroundImage && banner.backgroundImage !== "" ? "#FFFFFF" : banner.textColor || "#000000",
                    opacity: banner.backgroundImage && banner.backgroundImage !== "" ? 0.9 : 0.8,
                  }}
                >
                  {banner.subtitle}
                </p>
              </div>
              {banner.icon && (
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{banner.icon}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      ) : (
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            backgroundImage: banner.backgroundImage ? `url(${banner.backgroundImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: !banner.backgroundImage ? banner.backgroundColor || "#FEF3C7" : undefined,
          }}
        >
          <div className={`flex items-center justify-between ${banner.backgroundImage && banner.backgroundImage !== "" ? "relative z-10" : ""}`}>
            {banner.backgroundImage && banner.backgroundImage !== "" && <div className="absolute inset-0 bg-black/20 -z-10" />}
            <div>
              <h3
                className="text-xl font-bold mb-1"
                style={{
                  color: banner.backgroundImage ? "#FFFFFF" : banner.textColor || "#000000",
                }}
              >
                {banner.title}
              </h3>
              <p
                style={{
                  color: banner.backgroundImage ? "#FFFFFF" : banner.textColor || "#000000",
                  opacity: banner.backgroundImage ? 0.9 : 0.8,
                }}
              >
                {banner.subtitle}
              </p>
            </div>
            {banner.icon && (
              <div className="flex items-center gap-4">
                <span className="text-5xl">{banner.icon}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}, [getSectionData, sections]);

// 상품 섹션 - JSON 캐시 사용
const renderProductsSection = useMemo(() => {
  if (loadingProducts) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">추천 상품</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={`skeleton-${i}`} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">추천 상품</h2>
        {productMetadata && (
          <div className="text-sm text-gray-500">
            총 {productMetadata.totalItems}개 상품
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group"
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              <div className="relative aspect-square">
                {(() => {
                  const imageUrl = product.images?.[0]?.url || product.images?.[0];
                  return imageUrl && imageUrl !== "" ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  );
                })()}
                {product.new && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    NEW
                  </span>
                )}
                {product.discountPrice && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {Math.round((1 - product.discountPrice / product.price) * 100)}%
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  {product.discountPrice ? (
                    <>
                      <span className="text-lg font-bold text-red-600">
                        ₩{product.discountPrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ₩{product.price.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold">
                      ₩{product.price.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <span className="text-yellow-500">★</span>
                    <span>{product.rating.toFixed(1)}</span>
                    <span>({product.reviewCount})</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 페이지네이션 */}
      {productMetadata && productMetadata.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setProductPage(Math.max(1, productPage - 1))}
            disabled={productPage === 1}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-4 py-2">
            {productPage} / {productMetadata.totalPages}
          </span>
          <button
            onClick={() => setProductPage(Math.min(productMetadata.totalPages, productPage + 1))}
            disabled={productPage === productMetadata.totalPages}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}, [products, productMetadata, productPage, loadingProducts]);

if (uiLoading) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[1450px] mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-80 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
      <Footer />
    </div>
  );
}

return (
  <>
    <CriticalCSS />
    <Header />
    <div className="min-h-screen bg-white main-content">
      <main className="max-w-[1450px] mx-auto px-6 py-8">
        <HomeSections sectionOrder={sectionOrder}>
          {{
            hero: renderHeroSection,
            category: renderCategorySection,
            quicklinks: renderQuicklinksSection,
            promo: renderPromoSection,
            'active-campaigns': renderProductsSection,  // JSON에서는 active-campaigns로 저장됨
            products: renderProductsSection,
            ranking: uiLoading ? null : <RankingSection data={getSectionData('ranking')} />,
            recommended: uiLoading ? null : <RecommendedSection data={getSectionData('recommended')} />,
            activeCampaigns: renderProductsSection, // HomeSections에서 변환되는 형태도 추가
          }}
        </HomeSections>
      </main>
    </div>
    <Footer />
  </>
);
}

export default memo(HomePageImproved);