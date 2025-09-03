import React from 'react';
'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ChevronDown, User as UserIcon, LogOut, Settings, Menu, X, Bell } from 'lucide-react'
import { useUIConfigStore } from '@/lib/stores/ui-config.store'
import LanguageSelector from './LanguageSelector'
import PopupAlert from './PopupAlert'
import { useLanguage } from '@/hooks/useLanguage'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import Image from 'next/image'

interface HeaderProps {
  variant?: 'default' | 'transparent'
}

const Header = React.memo(function Header({ variant = 'default' }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const { config, loadSettingsFromAPI } = useUIConfigStore()
  const { user, isAuthenticated, logout } = useAuth()
  const { t, currentLanguage } = useLanguage()
  const { settings: siteSettings } = useSiteSettings()
  
  const isTransparent = variant === 'transparent'
  
  // 사용자 타입 확인
  const userType = user?.type?.toUpperCase()
  const isInfluencer = !user || userType === 'INFLUENCER' || userType === 'USER'
  const isBusiness = userType === 'BUSINESS'
  const isAdmin = userType === 'ADMIN'

  // 동적 메뉴 구성 (설정 기반)
  const navigationMenus = config?.header?.menus?.filter(menu => menu.visible) || []
  const brandText = siteSettings?.general?.siteName || config?.header?.logo?.text || 'THE ROW'
  const logoImage = siteSettings?.website?.logo !== '/logo.svg' ? siteSettings?.website?.logo : null

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    
    if (isTransparent) {
      window.addEventListener('scroll', handleScroll)
    }
    
    // 프로필 이미지 로드
    if (user) {
      // localStorage에서 프로필 이미지 가져오기
      const savedProfile = localStorage.getItem('userProfile')
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile)
          setProfileImage(profile.avatar || null)
        } catch (e) {
          console.error('Failed to parse profile:', e)
        }
      }
    }
    
    // UI 설정 로드
    console.log('Header: Loading UI settings with language:', currentLanguage);
    loadSettingsFromAPI(currentLanguage)
    
    return () => {
      if (isTransparent) {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [isTransparent, user, loadSettingsFromAPI, currentLanguage])

  // 언어 변경 시 UI 설정 재로드
  useEffect(() => {
    console.log('Header: Language changed to', currentLanguage, '- reloading UI config...');
    loadSettingsFromAPI(currentLanguage)
  }, [currentLanguage, loadSettingsFromAPI])

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 알림 데이터 로드 (예시)
  useEffect(() => {
    if (isAuthenticated) {
      // TODO: API에서 알림 데이터 로드
      setNotifications([
        { id: 1, message: '새로운 캠페인이 등록되었습니다', unread: true },
        { id: 2, message: '캠페인 신청이 승인되었습니다', unread: false },
      ])
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const isActive = (path: string) => pathname === path

  // 사용자 타입별 대시보드 링크
  const dashboardLink = isAdmin ? '/admin' : isBusiness ? '/business/dashboard' : '/mypage'

  return (
    <>
      {/* Popup Alert - Top Tier */}
      <PopupAlert maxWidth="max-w-[1450px]" />
      
      <header className="sticky top-0 z-50 bg-white">
        {/* THE ROW Style Header */}
        <div className="bg-white">
          <div className="max-w-[1450px] mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16 lg:h-20">
              
              {/* Left: Mobile menu + Brand */}
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden p-2 -ml-2 mr-3 hover:bg-gray-50 rounded-lg transition-all"
                  aria-label="메뉴 토글"
                >
                  {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                
                {/* Brand/Logo */}
                <Link href="/" className="flex items-center">
                  {logoImage ? (
                    <div className="relative h-8 lg:h-10 w-auto">
                      <Image
                        src={logoImage}
                        alt={brandText}
                        width={120}
                        height={40}
                        className="h-8 lg:h-10 w-auto object-contain"
                        priority
                      />
                    </div>
                  ) : (
                    <h1 className="text-2xl lg:text-3xl font-black tracking-wider text-black uppercase">
                      {brandText}
                    </h1>
                  )}
                </Link>
              </div>

              {/* Center: Search Bar (THE ROW Style) */}
              <div className="flex-1 max-w-md mx-8 hidden lg:block">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search.placeholder', '검색')}
                    className="w-full px-0 py-2 text-center text-black bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-black transition-colors placeholder-gray-400 text-sm font-medium"
                  />
                  <button 
                    type="submit"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 p-1"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-6">
                {/* User Authentication Area */}
                <div className="flex items-center space-x-4 text-sm">
                  {isAuthenticated && user ? (
                    <div className="flex items-center space-x-4">
                      <Link 
                        href={dashboardLink} 
                        className="text-black hover:opacity-60 transition-opacity font-medium hidden sm:block"
                      >
                        {t('menu.my', '마이페이지')}
                      </Link>
                      <Link 
                        href="/mypage" 
                        className="text-black hover:opacity-60 transition-opacity font-medium"
                      >
                        회원가입
                      </Link>
                      <div className="flex items-center space-x-1 text-black font-medium">
                        <span>+2,000P</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <Link href="/auth/login" className="text-black hover:opacity-60 transition-opacity font-medium">
                        로그인
                      </Link>
                      <Link href="/auth/register" className="text-black hover:opacity-60 transition-opacity font-medium">
                        회원가입
                      </Link>
                      <Link href="/cart" className="relative p-2">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                        </svg>
                        <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Language selector - hidden on mobile */}
                {!pathname.startsWith('/admin') && (
                  <div className="hidden lg:block">
                    <LanguageSelector />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* THE ROW Style Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1450px] mx-auto px-4 sm:px-6">
            <nav className="hidden lg:flex items-center justify-center space-x-8 py-4">
              <button className="text-black hover:opacity-60 transition-opacity font-medium uppercase text-sm tracking-wider">
                ALL
              </button>
              {navigationMenus.map((menu, index) => (
                <Link
                  key={menu.id || index}
                  href={menu.href}
                  className={`font-medium uppercase text-sm tracking-wider transition-opacity hover:opacity-60 ${
                    isActive(menu.href) ? 'text-black border-b border-black pb-1' : 'text-black'
                  }`}
                >
                  {t(menu.label, menu.label)}
                </Link>
              ))}
              <Link 
                href="/brands" 
                className="font-medium uppercase text-sm tracking-wider text-black hover:opacity-60 transition-opacity"
              >
                BRAND
              </Link>
              <Link 
                href="/community" 
                className="font-medium uppercase text-sm tracking-wider text-black hover:opacity-60 transition-opacity"
              >
                COMMUNITY
              </Link>
            </nav>

            {/* Mobile search bar */}
            <div className="lg:hidden py-4 border-t border-gray-200">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search.placeholder', '검색')}
                  className="w-full px-0 py-2 text-center text-black bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-black transition-colors placeholder-gray-400 text-sm font-medium"
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 p-1"
                >
                  <svg className="w-4 h-4 text-gray-400 hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>
        </div>
      </div>

        {/* THE ROW Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="lg:hidden fixed inset-0 z-50 bg-white">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-black tracking-wider text-black uppercase">MENU</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-all"
                  aria-label="메뉴 닫기"
                >
                  <X className="w-6 h-6 text-black" />
                </button>
              </div>

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-1">
                  {/* ALL 버튼 */}
                  <button 
                    className="block w-full px-4 py-4 text-left font-medium uppercase text-sm tracking-wider text-black hover:bg-gray-50 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    ALL
                  </button>
                  
                  {/* Dynamic Navigation Menus */}
                  {navigationMenus.map((menu, index) => (
                    <Link
                      key={menu.id || index}
                      href={menu.href}
                      className="block px-4 py-4 font-medium uppercase text-sm tracking-wider text-black hover:bg-gray-50 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {t(menu.label, menu.label)}
                    </Link>
                  ))}
                  
                  {/* Fixed Brand/Community Links */}
                  <Link 
                    href="/brands"
                    className="block px-4 py-4 font-medium uppercase text-sm tracking-wider text-black hover:bg-gray-50 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    BRAND
                  </Link>
                  <Link 
                    href="/community"
                    className="block px-4 py-4 font-medium uppercase text-sm tracking-wider text-black hover:bg-gray-50 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    COMMUNITY
                  </Link>
                  
                  {/* Divider */}
                  <div className="h-px bg-gray-200 my-6" />
                  
                  {/* User-specific menu items */}
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="block px-4 py-4 font-medium uppercase text-sm tracking-wider text-black hover:bg-gray-50 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      ADMIN
                    </Link>
                  )}
                  
                  {isAuthenticated && user && (
                    <Link 
                      href={dashboardLink} 
                      className="block px-4 py-4 font-medium uppercase text-sm tracking-wider text-black hover:bg-gray-50 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      MY PAGE
                    </Link>
                  )}
                </nav>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-gray-200">
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-black font-medium text-sm">{user.name}</p>
                          <p className="text-gray-500 text-xs">+2,000P</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="w-full px-4 py-3 bg-black text-white text-center font-medium uppercase text-sm tracking-wider transition-colors hover:bg-gray-800"
                    >
                      LOGOUT
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link 
                      href="/auth/login" 
                      className="block w-full px-4 py-3 border border-black text-black text-center font-medium uppercase text-sm tracking-wider transition-colors hover:bg-black hover:text-white"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      LOGIN
                    </Link>
                    <Link 
                      href="/auth/register" 
                      className="block w-full px-4 py-3 bg-black text-white text-center font-medium uppercase text-sm tracking-wider transition-colors hover:bg-gray-800"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      SIGN UP
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </header>
    </>
  )
})
export default Header;