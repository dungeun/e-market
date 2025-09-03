'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { t } = useLanguage();

  // URL 파라미터에서 에러 메시지 확인
  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    
    if (error === 'admin_required' && message) {
      setErrorMessage(decodeURIComponent(message));
    }
  }, [searchParams]);

  // 테스트 계정으로 빠른 로그인
  const quickLogin = async (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await login({ email: testEmail, password: testPassword });
      
      if (result.success) {
        alert(t('login.welcome', `환영합니다!`));
        
        // 관리자인 경우 admin 페이지로 리다이렉트
        const user = result.user || JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.type === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        alert(result.error || t('login.failed', '로그인에 실패했습니다.'));
      }
    } catch (error) {

      alert(t('login.error', '로그인 중 오류가 발생했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        alert(t('login.welcome', `환영합니다!`));
        
        // 관리자인 경우 admin 페이지로 리다이렉트
        const user = result.user || JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.type === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        alert(result.error || t('login.failed', '로그인에 실패했습니다.'));
      }
    } catch (error) {

      alert(t('login.error', '로그인 중 오류가 발생했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* 로고 */}
        <Link href="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">{t('site.name', 'E-Market Korea')}</span>
        </Link>

        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          {t('login.title', '로그인')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('login.no_account', '계정이 없으신가요?')}{' '}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {t('login.signup_link', '회원가입')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 에러 메시지 표시 */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {t('login.access_denied', '접근 권한이 없습니다')}
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{errorMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 이메일 */}
            <div>
              <Label htmlFor="email">{t('login.email_label', '이메일 주소')}</Label>
              <div className="mt-1 relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder={t('login.email_placeholder', '이메일을 입력하세요')}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <Label htmlFor="password">{t('login.password_label', '비밀번호')}</Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder={t('login.password_placeholder', '비밀번호를 입력하세요')}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* 로그인 유지 & 비밀번호 찾기 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                  {t('login.remember_me', '로그인 상태 유지')}
                </Label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {t('login.forgot_password', '비밀번호를 잊으셨나요?')}
                </Link>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('login.loading', '로그인 중...') : t('login.submit', '로그인')}
              </Button>
            </div>

            {/* 테스트 계정 빠른 로그인 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-3">{t('login.test_accounts', '🧪 테스트 계정 빠른 로그인')}</h4>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 bg-white hover:bg-blue-100 border-blue-200"
                  onClick={() => quickLogin('admin@example.com', 'admin123')}
                  disabled={isLoading}
                >
                  {t('login.admin_login', '🔧 관리자로 로그인 (admin@example.com)')}
                </Button>
              </div>
            </div>

            {/* 소셜 로그인 */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => alert('Google 로그인 준비 중')}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => alert('Kakao 로그인 준비 중')}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#FEE500" d="M12 3c5.514 0 10 3.476 10 7.747 0 4.272-4.48 7.748-10 7.748-.62 0-1.227-.044-1.82-.128l-3.823 2.542c-.5.334-1.163-.052-1.163-.68v-3.512C2.846 15.48 1 13.19 1 10.747 1 6.476 5.487 3 12 3z"/>
                    <path fill="#000000" d="M10.5 12.5l-.9 2.4h-.7l2.4-6.3h.8l2.4 6.3h-.7l-.9-2.4h-2.4zm.3-.6h1.9l-.9-2.5h-.1l-.9 2.5z"/>
                  </svg>
                  Kakao
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}