'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: 실제 비밀번호 재설정 이메일 전송 API 호출

      // 임시 처리
      setTimeout(() => {
        setIsLoading(false);
        setIsSubmitted(true);
      }, 1000);
    } catch (error) {
      setIsLoading(false);

    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* 로고 */}
          <Link href="/" className="flex justify-center items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">ShopMall</span>
          </Link>

          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              이메일이 전송되었습니다
            </h2>
            
            <p className="text-gray-600 mb-6">
              <strong>{email}</strong>로 비밀번호 재설정 링크를 보내드렸습니다.
              이메일을 확인하신 후 링크를 클릭하여 비밀번호를 재설정해주세요.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                로그인 페이지로 돌아가기
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="w-full"
              >
                다른 이메일로 다시 시도
              </Button>
            </div>
            
            <p className="mt-6 text-sm text-gray-500">
              이메일이 도착하지 않았나요? 스팸 폴더도 확인해보세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* 뒤로가기 */}
        <div className="mb-6">
          <Link
            href="/auth/login"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="w-4 h-4" />
            로그인으로 돌아가기
          </Link>
        </div>

        {/* 로고 */}
        <Link href="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">ShopMall</span>
        </Link>

        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          비밀번호 찾기
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          가입하신 이메일 주소를 입력하시면<br />
          비밀번호 재설정 링크를 보내드립니다.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 이메일 */}
            <div>
              <Label htmlFor="email">이메일 주소</Label>
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
                  placeholder="가입하신 이메일을 입력하세요"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* 전송 버튼 */}
            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? '전송 중...' : '비밀번호 재설정 이메일 전송'}
              </Button>
            </div>
          </form>

          {/* 안내 문구 */}
          <div className="mt-6 text-sm text-gray-500">
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-medium text-gray-700 mb-2">안내사항</h4>
              <ul className="space-y-1">
                <li>• 이메일 전송까지 최대 5분이 소요될 수 있습니다.</li>
                <li>• 스팸 폴더도 함께 확인해주세요.</li>
                <li>• 이메일이 도착하지 않으면 고객센터로 문의해주세요.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 고객센터 링크 */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          도움이 필요하신가요?{' '}
          <Link href="/support" className="font-medium text-blue-600 hover:text-blue-500">
            고객센터 문의
          </Link>
        </p>
      </div>
    </div>
  );
}