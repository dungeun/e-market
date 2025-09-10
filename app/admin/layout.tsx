'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings, 
  BarChart3, 
  CreditCard,
  Bell,
  LogOut,
  Menu,
  Megaphone,
  FileText,
  Tag,
  User,
  Globe,
  Languages,
  Truck
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

interface SidebarItem {
  title: string;
  href: string;
  icon: any;
  exact?: boolean;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const sidebarItems: SidebarGroup[] = [
  {
    title: '메인',
    items: [
      {
        title: '대시보드',
        href: '/admin',
        icon: Home,
        exact: true,
      },
      {
        title: '판매 분석',
        href: '/admin/analytics',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'UI 관리',
    items: [
      {
        title: 'UI 섹션 설정',
        href: '/admin/ui-config',
        icon: Settings,
      },
      {
        title: '팝업 알림 관리',
        href: '/admin/popup-alerts',
        icon: Megaphone,
      },
      {
        title: '언어팩 관리',
        href: '/admin/language-packs',
        icon: Languages,
      },
    ],
  },
  {
    title: '상품 관리',
    items: [
      {
        title: '상품 목록',
        href: '/admin/products',
        icon: Package,
      },
      {
        title: '카테고리',
        href: '/admin/categories',
        icon: Tag,
      },
    ],
  },
  {
    title: 'B2B 관리',
    items: [
      {
        title: '입점업체 및 창고',
        href: '/admin/b2b',
        icon: Truck,
      },
    ],
  },
  {
    title: '주문 관리',
    items: [
      {
        title: '주문 목록',
        href: '/admin/orders',
        icon: ShoppingCart,
      },
      {
        title: '배송 관리',
        href: '/admin/delivery',
        icon: Truck,
      },
    ],
  },
  {
    title: '고객 관리',
    items: [
      {
        title: '고객 목록',
        href: '/admin/customers',
        icon: Users,
      },
      {
        title: '리뷰 관리',
        href: '/admin/reviews',
        icon: FileText,
      },
    ],
  },
  {
    title: '마케팅',
    items: [
      {
        title: '캠페인',
        href: '/admin/campaigns',
        icon: Megaphone,
      },
      {
        title: '쿠폰',
        href: '/admin/coupons',
        icon: Tag,
      },
    ],
  },
  {
    title: '설정',
    items: [
      {
        title: '일반 설정',
        href: '/admin/settings',
        icon: Settings,
      },
      {
        title: '알림 설정',
        href: '/admin/notifications',
        icon: Bell,
      },
    ],
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const handleLogout = () => {
    toast.success('로그아웃되었습니다.')
    // 실제 로그아웃 로직 구현
  }

  return (
    <>
      {/* Main Container using Flexbox for better separation */}
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header - Full width at top */}
        <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">Commerce Admin</h1>
            </div>
            <div className="text-sm text-gray-500">
              {pathname === '/admin' && '대시보드'}
              {pathname === '/admin/ui-config' && 'UI 섹션 설정'}
              {pathname === '/admin/popup-alerts' && '팝업 알림 관리'}
              {pathname === '/admin/language-packs' && '언어팩 관리'}
              {pathname === '/admin/site-settings' && '사이트 설정'}
              {pathname === '/admin/products' && '상품 관리'}
              {pathname === '/admin/products/create' && '중고상품 등록'}
              {pathname === '/admin/orders' && '주문 관리'}
              {pathname === '/admin/delivery' && '배송 관리'}
              {pathname === '/admin/customers' && '고객 관리'}
              {pathname === '/admin/campaigns' && '캠페인 관리'}
              {pathname === '/admin/analytics' && '판매 분석'}
              {pathname === '/admin/categories' && '카테고리 관리'}
              {pathname === '/admin/b2b' && 'B2B 관리'}
              {pathname === '/admin/reviews' && '리뷰 관리'}
              {pathname === '/admin/coupons' && '쿠폰 관리'}
              {pathname === '/admin/settings' && '일반 설정'}
              {pathname === '/admin/notifications' && '알림 설정'}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => toast.info('알림이 없습니다.')}>
              <Bell className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Admin User</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  프로필
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  설정
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Body Container - Sidebar and Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Fixed width */}
          <aside className="w-[250px] bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
            <nav className="p-4">
              {sidebarItems.map((group) => (
                <div key={group.title} className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {group.title}
                  </h3>
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = item.exact 
                        ? pathname === item.href 
                        : pathname.startsWith(item.href)
                      
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                              isActive
                                ? "bg-blue-100 text-blue-900 border-l-2 border-blue-600"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content - Takes remaining space */}
          <main className="flex-1 bg-white overflow-y-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}