'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar'
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
  Globe
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
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

const sidebarItems = [
  {
    title: '메인',
    items: [
      {
        title: '대시보드',
        href: '/admin',
        icon: Home,
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
        title: '사이트 설정',
        href: '/admin/site-settings',
        icon: Globe,
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
      {
        title: '재고 관리',
        href: '/admin/inventory',
        icon: Package,
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
        title: '결제 내역',
        href: '/admin/payments',
        icon: CreditCard,
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
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full">
          <Sidebar className="border-r">
            <SidebarHeader className="border-b px-6 py-4">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Package className="h-4 w-4" />
                </div>
                <span className="font-semibold">Commerce Admin</span>
              </Link>
            </SidebarHeader>
            
            <SidebarContent>
              {sidebarItems.map((group) => (
                <SidebarGroup key={group.title}>
                  <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton 
                            asChild
                            isActive={pathname === item.href}
                          >
                            <Link href={item.href}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>

            <SidebarFooter className="border-t p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col items-start text-xs">
                      <span className="font-medium">Admin User</span>
                      <span className="text-muted-foreground">admin@example.com</span>
                    </div>
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
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="flex flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
              <SidebarTrigger />
              <div className="flex flex-1 items-center justify-between">
                <h1 className="text-lg font-semibold">
                  {pathname === '/admin' && '대시보드'}
                  {pathname === '/admin/ui-config' && 'UI 섹션 설정'}
                  {pathname === '/admin/site-settings' && '사이트 설정'}
                  {pathname === '/admin/products' && '상품 관리'}
                  {pathname === '/admin/orders' && '주문 관리'}
                  {pathname === '/admin/customers' && '고객 관리'}
                  {pathname === '/admin/campaigns' && '캠페인 관리'}
                  {pathname === '/admin/analytics' && '판매 분석'}
                  {pathname === '/admin/categories' && '카테고리 관리'}
                  {pathname === '/admin/inventory' && '재고 관리'}
                  {pathname === '/admin/payments' && '결제 내역'}
                  {pathname === '/admin/reviews' && '리뷰 관리'}
                  {pathname === '/admin/coupons' && '쿠폰 관리'}
                  {pathname === '/admin/settings' && '일반 설정'}
                  {pathname === '/admin/notifications' && '알림 설정'}
                </h1>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toast.info('알림이 없습니다.')}>
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}