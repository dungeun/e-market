'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, Search, ShoppingCart, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/stores/cart-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useCartStore()
  const { user } = useAuthStore()
  
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Commerce</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
              상품
            </Link>
            <Link href="/categories" className="text-sm font-medium transition-colors hover:text-primary">
              카테고리
            </Link>
            <Link href="/deals" className="text-sm font-medium transition-colors hover:text-primary">
              특가
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </Link>
          
          {user ? (
            <Link href="/account">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm">
                로그인
              </Button>
            </Link>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={cn(
        "absolute top-16 left-0 right-0 bg-background border-b md:hidden",
        isMenuOpen ? "block" : "hidden"
      )}>
        <nav className="flex flex-col p-4 space-y-3">
          <Link href="/products" className="text-sm font-medium">
            상품
          </Link>
          <Link href="/categories" className="text-sm font-medium">
            카테고리
          </Link>
          <Link href="/deals" className="text-sm font-medium">
            특가
          </Link>
        </nav>
      </div>
    </header>
  )
}