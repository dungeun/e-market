# 📖 페이지 백과사전: /auth/register (회원가입 페이지)
*파일: /app/auth/register/page.tsx*

## 🎯 페이지 메타데이터
```yaml
파일경로: /app/auth/register/page.tsx
페이지경로: /auth/register
파일크기: 324줄
컴포넌트명: RegisterPage
렌더링모드: 'use client' (CSR)
최종수정: 현재 버전
```

## 📦 Import 의존성

### React/Next.js
```typescript
import { useState } from 'react'               // React 상태 관리
import Link from 'next/link'                  // Next.js 링크
import { useRouter } from 'next/navigation'    // 라우팅
```

### 아이콘 (lucide-react)
```typescript
import { 
  Eye,      // 비밀번호 표시
  EyeOff,   // 비밀번호 숨김
  Mail,     // 이메일 아이콘
  Lock,     // 비밀번호 아이콘
  User,     // 사용자 아이콘
  Phone     // 전화 아이콘
} from 'lucide-react'
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

### formData 객체
```typescript
const [formData, setFormData] = useState({
  name: '',              // 사용자 이름
  email: '',            // 이메일
  phone: '',            // 전화번호
  password: '',         // 비밀번호
  confirmPassword: '',  // 비밀번호 확인
})
```

### UI 상태
```typescript
const [showPassword, setShowPassword] = useState(false)              // 비밀번호 표시
const [showConfirmPassword, setShowConfirmPassword] = useState(false)  // 비밀번호 확인 표시
const [isLoading, setIsLoading] = useState(false)                    // 로딩 상태
```

### 약관 동의
```typescript
const [agreements, setAgreements] = useState({
  terms: false,      // 이용약관 동의
  privacy: false,    // 개인정보 동의
  marketing: false,  // 마케팅 동의
})
```

## 📌 하드코딩된 상수값

### 숫자 상수
```typescript
10   // 라인 89, 123, 142, 160, 178, 207: 아이콘 크기/위치 (w-10 h-10, pl-10)
3    // 라인 126, 145, 163, 181, 210, 184, 213: 아이콘 위치 (left-3, right-3)
4    // 라인 126, 145, 163, 181, 188, 190, 210, 217, 219: 아이콘 크기 (w-4 h-4)
1    // 라인 115, 133, 152, 170, 199: 마진 (mt-1)
2    // 라인 98, 233, 247, 261, 285, 289: 마진/패딩/그리드 (mt-2, ml-2, px-2, grid-cols-2)
5    // 라인 297, 312: SVG 크기 (w-5 h-5)
6    // 라인 88, 111, 226, 279, 289: 간격 (mb-6, space-y-6, mt-6)
8    // 라인 85, 109, 110: 패딩 (py-8, px-4, sm:px-10)
12   // 라인 85: 패딩 Y (py-12)
```

### 문자열 상수 (기본값)
```typescript
'S'                  // 라인 90: 로고 문자
'E-Market Korea'     // 라인 92: 사이트 이름 기본값
'/auth/login'        // 라인 72, 101: 로그인 페이지 경로
'/terms'             // 라인 235: 이용약관 경로
'/privacy'           // 라인 249: 개인정보정책 경로
```

## 🎨 CSS 클래스 (Tailwind)

### 레이아웃 클래스
```css
min-h-screen                       /* 전체 화면 높이 */
flex flex-col justify-center       /* 수직 중앙 정렬 */
sm:px-6 lg:px-8                   /* 반응형 패딩 */
sm:mx-auto sm:w-full sm:max-w-md  /* 반응형 중앙 정렬 */
grid grid-cols-2 gap-3            /* 2열 그리드 */
```

### 색상 클래스
```css
bg-gray-50              /* 배경색 */
bg-white                /* 흰색 배경 */
bg-blue-600             /* 파란 배경 */
text-gray-900           /* 진한 텍스트 */
text-gray-600           /* 중간 텍스트 */
text-gray-400           /* 연한 텍스트 */
text-gray-500           /* 회색 텍스트 */
text-blue-600 hover:text-blue-500  /* 파란 링크 */
text-red-500            /* 빨간 텍스트 (필수) */
```

### 컴포넌트 스타일
```css
rounded-lg              /* 둥근 모서리 */
shadow sm:rounded-lg    /* 그림자와 둥근 모서리 */
w-full                  /* 전체 너비 */
relative                /* 상대 위치 */
absolute                /* 절대 위치 */
transform -translate-y-1/2  /* 수직 중앙 변환 */
```

## 🎯 함수 목록

### handleInputChange (입력 처리)
```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target
  setFormData(prev => ({ ...prev, [name]: value }))
}
// 위치: 라인 34-37
// 역할: 폼 입력값 상태 업데이트
// 사용: 모든 input 필드의 onChange
```

### handleAgreementChange (약관 동의 처리)
```typescript
const handleAgreementChange = (key: string, checked: boolean) => {
  setAgreements(prev => ({ ...prev, [key]: checked }))
}
// 위치: 라인 39-41
// 매개변수: key (약관 종류), checked (체크 상태)
// 역할: 약관 동의 상태 업데이트
```

### handleSubmit (폼 제출)
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  // 필수 약관 확인
  // 비밀번호 일치 확인
  // 회원가입 API 호출
  // 성공시 리다이렉트
}
// 위치: 라인 43-82
// 역할: 회원가입 처리
// 검증 단계:
//   1. 필수 약관 동의 확인 (terms, privacy)
//   2. 비밀번호 일치 확인
//   3. register API 호출
//   4. 성공시 /auth/login으로 이동
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
      <form>
        {/* 입력 필드들 */}
        {/* 약관 동의 */}
        {/* 소셜 가입 */}
      </form>
    </div>
  </div>
</div>
```

### 입력 필드 구조 (반복 패턴)
```jsx
<div>
  <Label htmlFor="[id]">[라벨 텍스트]</Label>
  <div className="mt-1 relative">
    <Input
      id="[id]"
      name="[name]"
      type="[type]"
      required
      value={formData.[field]}
      onChange={handleInputChange}
      className="pl-10"
      placeholder="[placeholder]"
    />
    <[Icon] className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
  </div>
</div>
```

### 비밀번호 필드 (특수 구조)
```jsx
<div className="mt-1 relative">
  <Input
    type={showPassword ? 'text' : 'password'}
    className="pl-10 pr-10"
  />
  <Lock className="absolute left-3" />
  <button
    type="button"
    className="absolute right-3"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <EyeOff /> : <Eye />}
  </button>
</div>
```

### 약관 동의 섹션 (라인 226-265)
```jsx
<div className="space-y-3">
  {/* 이용약관 (필수) */}
  <div className="flex items-center">
    <Checkbox
      id="terms"
      checked={agreements.terms}
      onCheckedChange={(checked) => handleAgreementChange('terms', checked)}
    />
    <Label>
      <span className="text-red-500">*</span> 이용약관에 동의합니다.
      <Link href="/terms">보기</Link>
    </Label>
  </div>
  
  {/* 개인정보 (필수) */}
  {/* 마케팅 (선택) */}
</div>
```

### 소셜 가입 버튼 (라인 289-317)
```jsx
<div className="grid grid-cols-2 gap-3">
  <Button variant="outline" disabled>
    <svg>{/* Google SVG */}</svg>
    Google로 계속하기
  </Button>
  <Button variant="outline" disabled>
    <svg>{/* Facebook SVG */}</svg>
    Facebook으로 계속하기
  </Button>
</div>
```

## 🌐 다국어 키 (t 함수)

```typescript
// 페이지 텍스트
'site.name'                          // E-Market Korea
'register.title'                     // 회원가입
'register.have_account'              // 이미 계정이 있으신가요?
'register.login_link'                // 로그인

// 입력 필드
'register.name_label'                // 이름
'register.name_placeholder'          // 이름을 입력하세요
'register.email_label'               // 이메일 주소
'register.email_placeholder'         // 이메일을 입력하세요
'register.phone_label'               // 전화번호
'register.phone_placeholder'         // 전화번호를 입력하세요
'register.password_label'            // 비밀번호
'register.password_placeholder'      // 비밀번호를 입력하세요
'register.confirm_password_label'    // 비밀번호 확인
'register.confirm_password_placeholder'  // 비밀번호를 다시 입력하세요

// 약관
'register.agree_terms'               // 이용약관에 동의합니다
'register.agree_privacy'             // 개인정보 수집 및 이용에 동의합니다
'register.agree_marketing'           // 마케팅 정보 수신에 동의합니다 (선택)
'register.view'                      // 보기

// 버튼 및 메시지
'register.loading'                   // 가입 중...
'register.submit'                    // 회원가입
'register.or'                        // 또는
'register.continueWithGoogle'        // Google로 계속하기
'register.continueWithFacebook'      // Facebook으로 계속하기

// 에러 메시지
'register.agreement_required'        // 필수 약관에 동의해주세요
'register.password_mismatch'         // 비밀번호가 일치하지 않습니다
'register.success'                   // 회원가입이 완료되었습니다!
'register.failed'                    // 회원가입에 실패했습니다
'register.error'                     // 회원가입 중 오류가 발생했습니다
```

## 🔄 데이터 흐름

```
1. 사용자 입력
   ↓
2. handleInputChange로 formData 업데이트
   ↓
3. 약관 체크박스 선택
   ↓
4. handleAgreementChange로 agreements 업데이트
   ↓
5. 폼 제출 (handleSubmit)
   ↓
6. 검증 단계
   - 필수 약관 확인
   - 비밀번호 일치 확인
   ↓
7. register API 호출
   ↓
8. 성공시 /auth/login 리다이렉트
   실패시 에러 알림
```

## 📊 조건부 렌더링

### 비밀번호 표시/숨김
```typescript
type={showPassword ? 'text' : 'password'}
{showPassword ? <EyeOff /> : <Eye />}

type={showConfirmPassword ? 'text' : 'password'}
{showConfirmPassword ? <EyeOff /> : <Eye />}
```

### 로딩 상태
```typescript
disabled={isLoading}
{isLoading ? '가입 중...' : '회원가입'}
```

### 필수 표시
```typescript
<span className="text-red-500">*</span>  // 필수 항목 표시
```

## 🛡️ 보안 및 검증

### 필수 검증
```typescript
// HTML5 required 속성
required  // 모든 입력 필드

// JavaScript 검증
if (!agreements.terms || !agreements.privacy)  // 필수 약관
if (formData.password !== formData.confirmPassword)  // 비밀번호 일치
```

### 자동완성
```typescript
autoComplete="email"  // 이메일 필드만 설정
```

## 🔍 특이사항

1. **소셜 가입 비활성화**: Google, Facebook 버튼 disabled
2. **마케팅 동의는 선택**: 필수 아님
3. **전화번호 type="tel"**: 모바일 키보드 최적화
4. **별도 비밀번호 강도 체크 없음**
5. **이메일 중복 체크 미구현**
6. **약관 페이지 링크**: /terms, /privacy (실제 페이지 필요)

## 🔄 중복 제거 가능 항목

### 아이콘 위치 스타일
```css
absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400
/* 모든 입력 필드 아이콘에 반복 사용 */
```

### 입력 필드 구조
- 5개 입력 필드가 동일한 구조 반복
- 컴포넌트화 가능

### 소셜 로그인 SVG
- Google, Facebook SVG 코드 재사용 가능

---

*이 문서는 /auth/register/page.tsx의 완전한 역설계 매뉴얼입니다.*