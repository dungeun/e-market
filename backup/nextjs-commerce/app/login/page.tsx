'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/lib/stores/auth-store'
import toast from 'react-hot-toast'

const LoginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
})

type LoginFormData = z.infer<typeof LoginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '로그인에 실패했습니다')
      }
      
      const { user, token } = await response.json()
      
      setUser(user)
      setToken(token)
      
      toast.success('로그인 되었습니다!')
      router.push('/')
      
    } catch (error) {

      toast.error(error instanceof Error ? error.message : '로그인에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">로그인</CardTitle>
          <CardDescription className="text-center">
            계정에 로그인하여 쇼핑을 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="hong@example.com"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button">
              Google
            </Button>
            <Button variant="outline" type="button">
              Kakao
            </Button>
          </div>
          
          <div className="text-center text-sm">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              회원가입
            </Link>
          </div>
          
          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:underline">
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}