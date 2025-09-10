'use client';

import React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Minus, 
  Plus,
  Shield,
  Clock,
  User,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle,
  Calendar,
  Truck,
  RefreshCw,
  MessageCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatPrice } from '@/lib/utils';
import RelatedProducts from '@/components/RelatedProducts';
import { useCartStore } from '@/stores/cart-store';
import { useRouter } from 'next/navigation';

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  images: { url: string }[];
  rating: number;
  reviewCount: number;
}

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    original_price?: number;
    stock: number;
    
    // 중고 상품 관련 필드
    condition?: 'S' | 'A' | 'B' | 'C';  // 상품 상태 등급
    usage_period?: string;               // 사용 기간
    purchase_date?: string;              // 구매 시기
    defects?: string;                    // 하자 사항
    seller_name?: string;                // 판매자 이름
    seller_location?: string;            // 판매자 위치
    verified_seller?: boolean;           // 인증 판매자 여부
    delivery_method?: string;            // 배송 방법
    detailed_description?: string;       // 상세 설명 추가
    
    images: Array<{
      id: string;
      url?: string;
      imageUrl?: string;
      alt?: string;
      altText?: string;
      orderIndex?: number;
      order_index?: number;
    }>;
    category?: {
      id: string;
      name: string;
      slug: string;
    };
    rating?: number;
    review_count?: number;
    featured?: boolean;
    new?: boolean;
    reviews: unknown[];
  };
  relatedProducts: RelatedProduct[];
}

const ProductDetailClient = React.memo(function ProductDetailClient({ 
  product, 
  relatedProducts 
}: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('detail');
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const finalPrice = product.price;
  const originalPrice = product.original_price;
  const hasDiscount = originalPrice && originalPrice > finalPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  // 상품 상태 등급별 설정
  const getConditionInfo = (condition?: string) => {
    switch (condition) {
      case 'S':
      case 'LIKE_NEW':
        return { 
          label: 'S급 (새제품)', 
          color: 'text-green-600 bg-green-50 border-green-200',
          description: '미개봉 또는 사용하지 않은 새 제품'
        };
      case 'A':
      case 'GOOD':
        return { 
          label: 'A급 (사용감 적음)', 
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          description: '사용감이 거의 없고 외관이 깨끗한 상태'
        };
      case 'B':
      case 'FAIR':
        return { 
          label: 'B급 (사용감 있음)', 
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          description: '정상적인 사용감이 있으나 기능상 문제없음'
        };
      case 'C':
      case 'POOR':
        return { 
          label: 'C급 (사용감 많음)', 
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          description: '사용감이 많으나 작동에는 문제없음'
        };
      default:
        return { 
          label: '상태 미등록', 
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          description: '판매자가 상태를 등록하지 않음'
        };
    }
  };

  const conditionInfo = getConditionInfo(product.condition);
  
  // 디버깅용 로그
  console.log('Product condition:', product.condition);
  console.log('Condition info:', conditionInfo);

  const addToCart = () => {
    if (product.stock <= 0) {
      alert('재고가 부족합니다.');
      return;
    }
    
    if (quantity > product.stock) {
      alert(`재고가 부족합니다. 최대 ${product.stock}개까지 주문 가능합니다.`);
      return;
    }
    
    // Zustand store에 아이템 추가
    const firstImage = product.images && product.images.length > 0 
      ? (product.images[0].url || product.images[0].imageUrl || '/placeholder.jpg')
      : '/placeholder.jpg';
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: firstImage,
      variant: {
        condition: product.condition,
        seller: product.seller_name
      }
    });
    
    alert('장바구니에 추가되었습니다!');
  };

  const buyNow = async () => {
    if (product.stock <= 0) {
      alert('재고가 부족합니다.');
      return;
    }
    
    if (quantity > product.stock) {
      alert(`재고가 부족합니다. 최대 ${product.stock}개까지 주문 가능합니다.`);
      return;
    }
    
    // 바로 결제 페이지로 이동
    const checkoutData = {
      items: [{
        id: product.id,
        name: product.name,
        price: finalPrice,
        quantity: quantity,
        image: product.images[0]?.url || product.images[0]?.imageUrl || '/placeholder.jpg'
      }],
      total: finalPrice * quantity
    };
    
    // 결제 데이터를 세션 스토리지에 저장하고 결제 페이지로 이동
    sessionStorage.setItem('checkout-data', JSON.stringify(checkoutData));
    window.location.href = '/checkout';
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 뒤로가기 */}
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>상품 목록으로</span>
          </Link>

          {/* 메인 상품 정보 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* 상품 이미지 섹션 */}
              <div className="p-6 lg:p-8 bg-gray-50">
                <div className="space-y-4">
                  <div className="aspect-square bg-white rounded-lg overflow-hidden relative border border-gray-200">
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      {hasDiscount && (
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          -{discountPercentage}%
                        </div>
                      )}
                      {product.featured && (
                        <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          추천
                        </div>
                      )}
                      {product.new && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          NEW
                        </div>
                      )}
                    </div>
                    {product.images.length > 0 ? (
                      (() => {
                        const imageUrl = product.images[selectedImageIndex]?.url || 
                                        product.images[selectedImageIndex]?.imageUrl || 
                                        '/placeholder.jpg';
                        return imageUrl && imageUrl !== "" ? (
                          <Image
                            src={imageUrl}
                            alt={product.images[selectedImageIndex]?.alt || product.images[selectedImageIndex]?.altText || product.name}
                            width={600}
                            height={600}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <Package size={64} className="text-gray-300 mb-2" />
                            <span>이미지 준비중</span>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Package size={64} className="text-gray-300 mb-2" />
                        <span>이미지 준비중</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 썸네일 이미지들 */}
                  {product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {product.images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index 
                              ? 'border-blue-500 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {(() => {
                            const thumbUrl = image.url || image.imageUrl || '/placeholder.jpg';
                            return thumbUrl && thumbUrl !== "" ? (
                              <Image
                                src={thumbUrl}
                                alt={image.alt || image.altText || product.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Package size={20} className="text-gray-300" />
                              </div>
                            );
                          })()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 상품 정보 섹션 */}
              <div className="p-6 lg:p-8">
                <div className="space-y-6">
                  {/* 카테고리 */}
                  <div className="flex items-center gap-3">
                    {product.category && (
                      <Link 
                        href={`/products?category=${product.category.slug}`}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {product.category.name}
                      </Link>
                    )}
                  </div>

                  {/* 상품명 */}
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {product.name}
                    </h1>
                  </div>

                  {/* 판매자 정보 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User size={18} className="text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {product.seller_name || '개인판매자'}
                        </span>
                        {product.verified_seller && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={16} />
                            <span className="text-xs font-medium">인증판매자</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {product.seller_location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} />
                        <span>{product.seller_location}</span>
                      </div>
                    )}
                  </div>

                  {/* 가격 정보 */}
                  <div className="border-t border-b border-gray-200 py-4">
                    <div className="flex items-end gap-3 mb-3">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(finalPrice)}
                      </span>
                      {hasDiscount && (
                        <>
                          <span className="text-lg text-gray-400 line-through">
                            {formatPrice(originalPrice)}
                          </span>
                          <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
                            {discountPercentage}% 할인
                          </span>
                        </>
                      )}
                    </div>
                    {/* 배송 정보 */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Truck size={16} />
                        <span>배송비: 직거래 무료 / 택배 착불</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>직거래 지역: {product.seller_location || '서울/경기'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 상품 상세 정보 */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">상품 정보</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="text-gray-400" size={16} />
                        <span className="text-gray-600">사용기간:</span>
                        <span className="font-medium text-gray-900">
                          {product.usage_period || '6개월'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="text-gray-400" size={16} />
                        <span className="text-gray-600">구매시기:</span>
                        <span className="font-medium text-gray-900">
                          {product.purchase_date || '2024년 6월'}
                        </span>
                      </div>
                    </div>
                    
                    {/* 상품 상태 */}
                    <div className="flex items-center gap-2">
                      <Shield className="text-gray-400" size={16} />
                      <span className="text-gray-600">상품 상태:</span>
                      <span className={`font-bold ${conditionInfo.color.split(' ')[0]} text-base`}>
                        {conditionInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">{conditionInfo.description}</p>
                    
                    {/* 재고 상태 */}
                    <div className="flex items-center gap-2">
                      {product.stock <= 0 ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                          품절
                        </span>
                      ) : product.stock === 1 ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          재고 1개 (중고상품)
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          재고 {product.stock}개
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 상품 설명 */}
                  <div className="space-y-3">
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                    
                    {/* 하자 사항 */}
                    {product.defects && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                          <div>
                            <h4 className="font-medium text-yellow-900 mb-1">참고사항</h4>
                            <p className="text-sm text-yellow-700">{product.defects}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 수량 선택 */}
                  {product.stock > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">구매 수량</span>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button 
                            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                            disabled={quantity <= 1}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 min-w-[60px] text-center font-medium text-gray-900">
                            {quantity}
                          </span>
                          <button 
                            onClick={() => setQuantity(quantity + 1)}
                            disabled={quantity >= product.stock}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 총 가격 */}
                      <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                        <span className="text-gray-700">총 결제금액</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(finalPrice * quantity)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼들 */}
                  <div className="space-y-3">
                    {/* 바로 구매하기 버튼 */}
                    <button 
                      onClick={buyNow}
                      disabled={product.stock <= 0}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      {product.stock <= 0 ? '품절' : '바로 구매하기'}
                    </button>
                    
                    {/* 장바구니 담기 버튼 */}
                    <button 
                      onClick={addToCart}
                      disabled={loading || product.stock <= 0}
                      className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShoppingCart size={20} />
                      {loading ? '추가 중...' : product.stock <= 0 ? '품절' : '장바구니 담기'}
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        <Heart size={18} />
                        <span className="font-medium">찜하기</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: product.name,
                              text: product.description,
                              url: window.location.href,
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert('링크가 복사되었습니다!');
                          }
                        }}
                        className="flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Share2 size={18} />
                        <span className="font-medium">공유하기</span>
                      </button>
                    </div>
                  </div>

                  {/* 안전 거래 정보 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Shield className="text-green-600" size={20} />
                      <span className="font-medium">안전거래 보호</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 ml-7">
                      <li>• 직거래 시 안전한 장소에서 만나세요</li>
                      <li>• 결제 전 상품 상태를 꼭 확인하세요</li>
                      <li>• 의심스러운 거래는 신고해주세요</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 상품 상세 정보 탭 */}
          <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex gap-8">
                <button 
                  onClick={() => setActiveTab('detail')}
                  className={`pb-4 border-b-2 font-medium transition-colors ${
                    activeTab === 'detail' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  상세정보
                </button>
                <button 
                  onClick={() => setActiveTab('review')}
                  className={`pb-4 border-b-2 font-medium transition-colors ${
                    activeTab === 'review' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  거래후기 ({product.review_count || 0})
                </button>
                <button 
                  onClick={() => setActiveTab('inquiry')}
                  className={`pb-4 border-b-2 font-medium transition-colors ${
                    activeTab === 'inquiry' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  문의하기
                </button>
              </nav>
            </div>
            
            <div className="py-6">
              {activeTab === 'detail' && (
                <div className="prose prose-sm max-w-none text-gray-600">
                  <h3 className="font-semibold text-gray-900 mb-4">상품 상세 설명</h3>
                  <p>{product.description}</p>
                  
                  {/* 상세 설명 추가 */}
                  {product.detailed_description && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="text-blue-600" size={20} />
                        판매자 상세 설명
                      </h4>
                      <p className="text-gray-700 whitespace-pre-line">{product.detailed_description}</p>
                    </div>
                  )}
                  
                  <div className="mt-8 space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Package size={20} />
                        배송 안내
                      </h4>
                      <ul className="space-y-2">
                        <li>• 직거래 가능 지역: {product.seller_location || '서울/경기 지역'}</li>
                        <li>• 택배 발송: 착불 배송 (구매자 부담)</li>
                        <li>• 발송 예정일: 결제 후 1-2일 이내</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <RefreshCw size={20} />
                        교환/환불 안내
                      </h4>
                      <ul className="space-y-2">
                        <li>• 중고 상품 특성상 단순 변심 환불 불가</li>
                        <li>• 상품 설명과 다른 경우 환불 가능</li>
                        <li>• 직거래 시 현장 확인 후 구매 권장</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageCircle size={20} />
                        판매자 메시지
                      </h4>
                      <p className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900">
                        안녕하세요! 외국인 근로자분들을 위한 생활용품을 합리적인 가격에 판매하고 있습니다. 
                        직거래 시 추가 할인도 가능하니 편하게 문의주세요. 감사합니다!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'review' && (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>아직 등록된 거래후기가 없습니다.</p>
                  <p className="text-sm mt-2">첫 번째 후기를 남겨보세요!</p>
                </div>
              )}

              {activeTab === 'inquiry' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">문의 안내</h4>
                    <p className="text-sm text-blue-700">
                      상품에 대한 궁금한 점이 있으시면 판매자에게 직접 문의해보세요.
                    </p>
                  </div>
                  <button className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                    판매자에게 문의하기
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 연관 상품 */}
          <div className="mt-12">
            <RelatedProducts products={relatedProducts} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
});

export default ProductDetailClient;