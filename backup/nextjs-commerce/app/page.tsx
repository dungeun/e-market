import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Package, Shield, Truck } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-gray-50 to-white py-20 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                최고의 쇼핑 경험을
                <span className="text-primary"> 제공합니다</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                다양한 상품과 빠른 배송, 안전한 결제로 편리한 온라인 쇼핑을 즐기세요.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/products">
                  <Button size="lg" className="w-full sm:w-auto">
                    쇼핑 시작하기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/deals">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    오늘의 특가 보기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                왜 우리를 선택해야 할까요?
              </h2>
              <p className="mt-4 text-muted-foreground sm:text-lg">
                고객님께 최고의 가치를 제공하기 위해 노력합니다.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">다양한 상품</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  수만 가지의 상품을 한 곳에서 만나보세요.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">빠른 배송</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  주문 후 24시간 이내 발송, 무료 배송 혜택.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">안전한 결제</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  다양한 결제 수단과 안전한 거래를 보장합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-gray-50 py-20 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                지금 바로 시작하세요
              </h2>
              <p className="mt-4 text-muted-foreground sm:text-lg">
                회원가입하고 첫 구매 시 10% 할인 혜택을 받으세요.
              </p>
              <div className="mt-8">
                <Link href="/signup">
                  <Button size="lg">
                    회원가입하기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}