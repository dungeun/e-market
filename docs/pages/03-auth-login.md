# 📖 페이지 백과사전: /auth/login (로그인 페이지)
*파일: /app/auth/login/page.tsx*

## 🎯 페이지 메타데이터
```yaml
파일경로: /app/auth/login/page.tsx
페이지경로: /auth/login
파일크기: 298줄
컴포넌트명: LoginPage (메인), LoginContent (내부)
렌더링모드: 'use client' (CSR)
최종수정: 현재 버전
```

## 📦 Import 의존성

### React/Next.js
```typescript
import { useState, useEffect, Suspense } from 'react'  // React 훅과 Suspense
import Link from 'next/link'                           // Next.js 링크
import { useRouter, useSearchParams } from 'next/navigation'  // 라우팅
```

### 아이콘 (lucide-react)
```typescript
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
// Eye: 비밀번호 표시 아이콘
// EyeOff: 비밀번호 숨김 아이콘
// Mail: 이메일 아이콘
// Lock: 비밀번호 아이콘
```

### UI 컴포넌트 (shadcn/ui)
```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
```

### 커스텀 훅
```typescript
import { useAuth } from '@/hooks/useAuth'        // 인증 훅
import { useLanguage } from '@/hooks/useLanguage'  // 다국어 훅
```

## 🔧 State 변수

```typescript
const [email, setEmail] = useState('')                    // 이메일 입력값
const [password, setPassword] = useState('')              // 비밀번호 입력값
const [showPassword, setShowPassword] = useState(false)   // 비밀번호 표시 여부
const [rememberMe, setRememberMe] = useState(false)       // 로그인 유지 체크
const [isLoading, setIsLoading] = useState(false)         // 로딩 상태
const [errorMessage, setErrorMessage] = useState('')      // 에러 메시지
```

## 📌 하드코딩된 상수값

### 테스트 계정 정보
```typescript
'admin@example.com'  // 라인 237: 관리자 이메일
'admin123'          // 라인 237: 관리자 비밀번호
```

### 역할 상수
```typescript
'ADMIN'       // 라인 51, 80: 관리자 역할
'SUPER_ADMIN' // 라인 51, 80: 슈퍼 관리자 역할
```

### URL 파라미터 키
```typescript
'error'       // 라인 28: 에러 파라미터
'message'     // 라인 29: 메시지 파라미터
'admin_required'  // 라인 31: 관리자 필요 에러
```

### 로컬스토리지 키
```typescript
'user'  // 라인 50, 79: 사용자 정보 키
```

### 숫자 상수
```typescript
10   // 라인 101, 157, 176: 아이콘 위치 (pl-10)
3    // 라인 160, 179, 182: 아이콘 위치 (left-3)
4    // 라인 160, 179, 186, 188: 아이콘 크기 (w-4 h-4)
5    // 라인 128, 263: SVG 크기 (w-5 h-5)
12   // 라인 97: 패딩 Y (py-12)
6    // 라인 97, 100, 144, 229, 246, 256: 간격/마진
8    // 라인 121, 122, 236: 패딩/높이
2    // 라인 110, 202, 231, 256, 263, 277: 마진/그리드
```

## 🎨 CSS 클래스 (Tailwind)

### 레이아웃 클래스
```css
min-h-screen                    /* 전체 화면 높이 */
flex flex-col justify-center    /* 수직 중앙 정렬 */
sm:px-6 lg:px-8                /* 반응형 패딩 */
sm:mx-auto sm:w-full sm:max-w-md  /* 반응형 중앙 정렬 */
grid grid-cols-2 gap-3          /* 2열 그리드 */
```

### 색상 클래스
```css
bg-gray-50                      /* 배경색 */
bg-white                        /* 흰색 배경 */
bg-blue-50                      /* 파란 배경 */
bg-red-50                       /* 빨간 배경 */
text-gray-900                   /* 진한 텍스트 */
text-gray-600                   /* 중간 텍스트 */
text-gray-400                   /* 연한 텍스트 */
text-blue-600 hover:text-blue-500  /* 파란 링크 */
text-red-800, text-red-700      /* 에러 텍스트 */
```

### 컴포넌트 스타일
```css
rounded-lg                      /* 둥근 모서리 */
shadow                          /* 그림자 */
border border-red-200           /* 빨간 테두리 */
w-full                          /* 전체 너비 */
```

## 🎯 함수 목록

### quickLogin (빠른 로그인)
```typescript
const quickLogin = async (testEmail: string, testPassword: string): Promise<void>
// 위치: 라인 37-65
// 매개변수: testEmail, testPassword
// 역할: 테스트 계정으로 빠른 로그인
// 프로세스:
//   1. 입력 필드 자동 채움
//   2. login 함수 호출
//   3. 결과에 따라 리다이렉트
//   4. 에러 처리 및 알림
```

### handleSubmit (폼 제출)
```typescript
const handleSubmit = async (e: React.FormEvent): Promise<void>
// 위치: 라인 67-94
// 매개변수: e (폼 이벤트)
// 역할: 일반 로그인 처리
// 프로세스:
//   1. 이벤트 방지
//   2. 로딩 상태 설정
//   3. login API 호출
//   4. 역할별 리다이렉트
```

### useEffect (URL 파라미터 처리)
```typescript
useEffect(() => {}, [searchParams])
// 위치: 라인 27-34
// 의존성: searchParams
// 역할: URL에서 에러 메시지 추출
// 조건: error === 'admin_required'
```

## 🏗️ JSX 구조

### 전체 레이아웃
```jsx
<div className="min-h-screen bg-gray-50">
  <div className="sm:mx-auto sm:w-full sm:max-w-md">
    {/* 로고 섹션 */}
    {/* 타이틀 섹션 */}
  </div>
  <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div className="bg-white py-8 px-4 shadow">
      {/* 에러 메시지 */}
      <form>
        {/* 입력 필드들 */}
        {/* 테스트 계정 */}
        {/* 소셜 로그인 */}
      </form>
    </div>
  </div>
</div>
```

### 로고 섹션 (라인 100-105)
```jsx
<Link href="/">
  <div className="w-10 h-10 bg-blue-600 rounded-lg">
    <span className="text-white font-bold text-xl">S</span>
  </div>
  <span className="text-2xl font-bold">E-Market Korea</span>
</Link>
```

### 이메일 입력 필드 (라인 146-162)
```jsx
<div>
  <Label htmlFor="email">이메일 주소</Label>
  <div className="mt-1 relative">
    <Input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="pl-10"
      placeholder="이메일을 입력하세요"
    />
    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2" />
  </div>
</div>
```

### 비밀번호 입력 필드 (라인 165-192)
```jsx
<div>
  <Label htmlFor="password">비밀번호</Label>
  <div className="mt-1 relative">
    <Input
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="pl-10 pr-10"
    />
    <Lock className="absolute left-3" />
    <button onClick={() => setShowPassword(!showPassword)}>
      {showPassword ? <EyeOff /> : <Eye />}
    </button>
  </div>
</div>
```

### 테스트 계정 섹션 (라인 229-243)
```jsx
<div className="mt-6 p-4 bg-blue-50 rounded-lg">
  <h4>🧪 테스트 계정 빠른 로그인</h4>
  <Button
    onClick={() => quickLogin('admin@example.com', 'admin123')}
    disabled={isLoading}
  >
    🔧 관리자로 로그인 (admin@example.com)
  </Button>
</div>
```

### 소셜 로그인 버튼 (라인 256-283)
```jsx
<div className="grid grid-cols-2 gap-3">
  <Button onClick={() => alert('Google 로그인 준비 중')}>
    <svg>{/* Google 로고 SVG */}</svg>
    Google
  </Button>
  <Button onClick={() => alert('Kakao 로그인 준비 중')}>
    <svg>{/* Kakao 로고 SVG */}</svg>
    Kakao
  </Button>
</div>
```

## 🔄 데이터 흐름

```
1. 페이지 로드
   ↓
2. URL 파라미터 체크 (에러 메시지)
   ↓
3. 사용자 입력 (이메일/비밀번호)
   ↓
4. 폼 제출 또는 빠른 로그인
   ↓
5. useAuth().login() 호출
   ↓
6. 성공/실패 처리
   ↓
7. 역할별 리다이렉트
   - ADMIN → /admin
   - USER → /
```

## 🌐 다국어 키 (t 함수)

```typescript
'login.welcome'           // 환영합니다!
'login.failed'           // 로그인에 실패했습니다
'login.error'            // 로그인 중 오류가 발생했습니다
'site.name'              // E-Market Korea
'login.title'            // 로그인
'login.no_account'       // 계정이 없으신가요?
'login.signup_link'      // 회원가입
'login.email_label'      // 이메일 주소
'login.email_placeholder' // 이메일을 입력하세요
'login.password_label'   // 비밀번호
'login.password_placeholder' // 비밀번호를 입력하세요
'login.remember_me'      // 로그인 상태 유지
'login.forgot_password'  // 비밀번호를 잊으셨나요?
'login.loading'          // 로그인 중...
'login.submit'           // 로그인
'login.test_accounts'    // 테스트 계정 빠른 로그인
'login.admin_login'      // 관리자로 로그인
'login.access_denied'    // 접근 권한이 없습니다
```

## 📊 조건부 렌더링

### 비밀번호 표시/숨김
```typescript
showPassword ? 'text' : 'password'  // input type
showPassword ? <EyeOff /> : <Eye />  // 아이콘
```

### 로딩 상태
```typescript
isLoading ? '로그인 중...' : '로그인'  // 버튼 텍스트
disabled={isLoading}  // 버튼 비활성화
```

### 에러 메시지
```typescript
{errorMessage && (<div>...</div>)}  // 조건부 표시
```

### 역할별 리다이렉트
```typescript
if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.type === 'ADMIN') {
  router.push('/admin')
} else {
  router.push('/')
}
```

## 🛡️ 보안 관련

### 자동 완성 속성
```typescript
autoComplete="email"           // 이메일 자동완성
autoComplete="current-password" // 현재 비밀번호
```

### 필수 입력
```typescript
required  // 모든 입력 필드에 적용
```

### 에러 처리
- try-catch 블록으로 모든 비동기 작업 보호
- 에러 메시지 사용자에게 표시
- console.error로 개발자 로그 (라인 60, 89)

## 🔍 특이사항

1. **Suspense 래핑**: LoginContent를 Suspense로 감싸서 서버 사이드 처리
2. **하드코딩된 테스트 계정**: admin@example.com / admin123
3. **소셜 로그인 미구현**: alert만 표시
4. **localStorage 직접 접근**: user 정보 저장
5. **이모지 사용**: 테스트 계정 섹션에 🧪, 🔧 이모지

---

*이 문서는 /auth/login/page.tsx의 완전한 역설계 매뉴얼입니다.*