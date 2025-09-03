"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, Heart, Eye } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price?: number;
  category_name?: string;
  image_url?: string;
  images?: any[];
  is_featured: boolean;
  is_new: boolean;
  is_sale: boolean;
  stock_quantity: number;
  rating: number;
  review_count: number;
}

interface ActiveProductsSectionProps {
  data: {
    title: {
      ko: string;
      en: string;
      jp: string;
    };
    subtitle: {
      ko: string;
      en: string;
      jp: string;
    };
    sectionName?: {
      ko: string;
      en: string;
      jp: string;
    };
    viewMore: {
      ko: string;
      en: string;
      jp: string;
    };
  };
}

export default function ActiveProductsSection({
  data,
}: ActiveProductsSectionProps) {
  const { currentLanguage } = useLanguage();
  // Map 'ja' to 'jp' for data indexing
  const dataLanguage =
    currentLanguage === "ja" ? "jp" : (currentLanguage as "ko" | "en" | "jp");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // data가 없거나 필수 필드가 없으면 기본값 사용
  const title = data?.title || {
    ko: '진행중인 캠페인',
    en: 'Active Campaigns',
    jp: '実施中のキャンペーン'
  };
  
  const subtitle = data?.subtitle || {
    ko: '현재 참여 가능한 캠페인',
    en: 'Currently Available Campaigns',
    jp: '現在参加可能なキャンペーン'
  };
  
  const viewMore = data?.viewMore || {
    ko: '더보기',
    en: 'View More',
    jp: 'もっと見る'
  };

  // 데이터베이스에서 실제 상품 데이터 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/home/products?filter=all&limit=8");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.products) {
          setProducts(result.products);
        } else {
          // 폴백: 빈 배열 사용
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err instanceof Error ? err.message : "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 가격 포맷팅
  const formatPrice = (price: number): string => {
    if (currentLanguage === "en") {
      return `$${(price / 1000).toFixed(2)}`;
    } else if (currentLanguage === "ja") {
      return `¥${Math.floor(price * 0.13).toLocaleString()}`;
    }
    return `${price.toLocaleString()}원`;
  };

  // 할인율 계산
  const getDiscountRate = (price: number, salePrice?: number): number => {
    if (!salePrice || salePrice >= price) return 0;
    return Math.round(((price - salePrice) / price) * 100);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {title[dataLanguage]}
            </h2>
            <p className="text-lg text-gray-600">
              {subtitle[dataLanguage]}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-500">상품을 불러올 수 없습니다.</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* 섹션 헤더 */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {title[dataLanguage]}
            </h2>
            <p className="text-lg text-gray-600">
              {subtitle[dataLanguage]}
            </p>
          </div>
          <Link
            href="/products"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            {viewMore[dataLanguage]}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const discountRate = getDiscountRate(product.price, product.sale_price);
            const finalPrice = product.sale_price || product.price;
            const imageUrl = (product.image_url && product.image_url !== "" ? product.image_url : null) || 
                           (product.images && product.images[0]?.url && product.images[0].url !== "" ? product.images[0].url : null) || 
                           '/placeholder-product.jpg';

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug || product.id}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  {/* 이미지 영역 */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    
                    {/* 뱃지들 */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.is_new && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          NEW
                        </span>
                      )}
                      {discountRate > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                          -{discountRate}%
                        </span>
                      )}
                      {product.is_featured && (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                          HOT
                        </span>
                      )}
                    </div>

                    {/* 호버 시 액션 버튼들 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors">
                        <Heart className="w-5 h-5 text-gray-700" />
                      </button>
                      <button className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors">
                        <Eye className="w-5 h-5 text-gray-700" />
                      </button>
                      <button className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors">
                        <ShoppingCart className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  {/* 상품 정보 */}
                  <div className="p-4">
                    {/* 카테고리 */}
                    {product.category_name && (
                      <p className="text-xs text-gray-500 mb-1">
                        {product.category_name}
                      </p>
                    )}

                    {/* 상품명 */}
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    {/* 평점 */}
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({product.review_count})
                        </span>
                      </div>
                    )}

                    {/* 가격 */}
                    <div className="flex items-center gap-2">
                      {product.sale_price && product.sale_price < product.price ? (
                        <>
                          <span className="text-lg font-bold text-red-500">
                            {formatPrice(product.sale_price)}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    {/* 재고 상태 */}
                    {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                      <p className="text-xs text-orange-500 mt-2">
                        {currentLanguage === "en"
                          ? `Only ${product.stock_quantity} left`
                          : currentLanguage === "ja"
                          ? `残り${product.stock_quantity}個`
                          : `재고 ${product.stock_quantity}개 남음`}
                      </p>
                    )}
                    {product.stock_quantity === 0 && (
                      <p className="text-xs text-red-500 mt-2">
                        {currentLanguage === "en"
                          ? "Out of stock"
                          : currentLanguage === "ja"
                          ? "在庫切れ"
                          : "품절"}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}