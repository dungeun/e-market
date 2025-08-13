'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleOAuthSignUp = async (provider: string) => {
    try {
      setIsLoading(true)
      // OAuth 제공자를 통한 회원가입은 로그인과 동일한 프로세스
      await signIn(provider, { callbackUrl: '/onboarding' })
    } catch (error) {
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            소셜 계정으로 간편하게 시작하세요
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-4">
          {/* 네이버로 시작하기 */}
          <button
            onClick={() => handleOAuthSignUp('naver')}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M16.5 0h-13C1.57 0 0 1.57 0 3.5v13C0 18.43 1.57 20 3.5 20h13c1.93 0 3.5-1.57 3.5-3.5v-13C20 1.57 18.43 0 16.5 0zM13.78 10.7l-3.48 5.03c-.21.3-.54.47-.89.47H6.32c-.23 0-.42-.19-.42-.42V4.22c0-.23.19-.42.42-.42h3.08c.36 0 .68.17.89.47l3.48 5.03c.22.32.22.73.01 1.04z"/>
            </svg>
            네이버로 시작하기
          </button>

          {/* 카카오로 시작하기 */}
          <button
            onClick={() => handleOAuthSignUp('kakao')}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 4.584 0 10.235c0 3.67 2.256 6.89 5.656 8.696l-.94 3.42c-.09.328.213.602.52.471l4.247-2.449c.498.068 1.002.103 1.517.103 6.627 0 12-4.584 12-10.235S18.627 0 12 0z"/>
            </svg>
            카카오로 시작하기
          </button>

          {/* 구글로 시작하기 */}
          <button
            onClick={() => handleOAuthSignUp('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            구글로 시작하기
          </button>
        </div>

        <div className="mt-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                이용 약관
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-600">
            회원가입 시{' '}
            <Link href="/terms" className="underline">
              이용약관
            </Link>
            {' '}및{' '}
            <Link href="/privacy" className="underline">
              개인정보처리방침
            </Link>
            에 동의하게 됩니다.
          </p>
        </div>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}