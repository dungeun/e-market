'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const footerNavigation = {
  services: [
    { name: '전체상품', href: '/products' },
    { name: '카테고리', href: '/categories' },
    { name: '특가할인', href: '/products?sale=true' },
    { name: '신상품', href: '/products?new=true' },
  ],
  support: [
    { name: '고객센터', href: '/support' },
    { name: '자주묻는질문', href: '/faq' },
    { name: '배송안내', href: '/shipping' },
    { name: '반품/교환', href: '/returns' },
  ],
  company: [
    { name: '회사소개', href: '/about' },
    { name: '채용정보', href: '/careers' },
    { name: '투자정보', href: '/investor' },
    { name: '보도자료', href: '/press' },
  ],
  legal: [
    { name: '이용약관', href: '/terms' },
    { name: '개인정보처리방침', href: '/privacy' },
    { name: '청소년보호정책', href: '/youth' },
    { name: '전자금융거래약관', href: '/finance' },
  ],
};

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'YouTube', icon: Youtube, href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 메인 푸터 콘텐츠 */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* 회사 정보 */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold text-gray-900">ShopMall</span>
              </Link>
              <p className="text-gray-600 mb-6 max-w-md">
                고객 만족을 최우선으로 하는 온라인 쇼핑몰입니다. 
                다양한 상품과 합리적인 가격으로 최고의 쇼핑 경험을 제공합니다.
              </p>
              
              {/* 연락처 정보 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>1588-0000</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>support@shopmall.com</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>서울특별시 강남구 테헤란로 123</span>
                </div>
              </div>

              {/* 소셜 미디어 */}
              <div className="flex gap-4 mt-6">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 서비스 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                서비스
              </h3>
              <ul className="space-y-3">
                {footerNavigation.services.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 고객지원 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                고객지원
              </h3>
              <ul className="space-y-3">
                {footerNavigation.support.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 회사정보 & 법적고지 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                회사정보
              </h3>
              <ul className="space-y-3 mb-6">
                {footerNavigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                법적고지
              </h3>
              <ul className="space-y-3">
                {footerNavigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 하단 회사 정보 */}
        <div className="border-t border-gray-200 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="text-sm text-gray-500">
              <p className="mb-1">
                <strong>주식회사 쇼핑몰</strong> | 대표이사: 김대표 | 사업자등록번호: 123-45-67890
              </p>
              <p className="mb-1">
                통신판매업신고번호: 2024-서울강남-1234 | 개인정보보호책임자: 홍길동
              </p>
              <p>
                주소: 서울특별시 강남구 테헤란로 123, 12층 | 고객센터: 1588-0000
              </p>
            </div>
            <div className="lg:text-right text-sm text-gray-500">
              <p className="mb-1">
                © {new Date().getFullYear()} ShopMall. All rights reserved.
              </p>
              <p>
                호스팅 서비스 제공자: Amazon Web Services Korea LLC
              </p>
            </div>
          </div>
        </div>

        {/* 인증 마크 (선택사항) */}
        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-wrap justify-center items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs">SSL</span>
              </div>
              <span>SSL 보안인증</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs">PG</span>
              </div>
              <span>안전한 결제시스템</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs">ISO</span>
              </div>
              <span>개인정보보호 인증</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}