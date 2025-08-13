'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

interface AdminLoginButtonProps {
  callbackUrl: string
}

export default function AdminLoginButton({ callbackUrl }: AdminLoginButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleAdminLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await signIn('credentials', {
        email: 'admin@test.com',
        password: 'admin123',
        callbackUrl,
        redirect: true
      })

      if (result?.error) {
        setError('관리자 로그인에 실패했습니다.')
      }
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <p className="text-center text-sm text-gray-500 mb-4">
        개발 환경 전용
      </p>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <button
        onClick={handleAdminLogin}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            로그인 중...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            관리자로 임시 로그인 (admin@test.com)
          </>
        )}
      </button>
      <p className="text-center text-xs text-gray-500 mt-2">
        비밀번호: admin123
      </p>
    </div>
  )
}