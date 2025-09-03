// 이 파일은 더 이상 사용되지 않습니다.
// 실제 인증은 /hooks/useAuth.ts를 사용하세요.
export interface User {
  id: string;
  email: string;
  name: string;
  type: 'ADMIN' | 'BUSINESS' | 'INFLUENCER';
  role?: 'ADMIN' | 'BUSINESS' | 'INFLUENCER'; // NextAuth 호환성
}

// NextAuth.js 호환을 위한 임시 authOptions
export const authOptions = {
  providers: [],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    session: async ({ session, token }: unknown) => {
      return session;
    },
    jwt: async ({ token, user }: unknown) => {
      return token;
    },
  },
};

// Deprecated: useAuth 훅을 사용하세요
export const AuthService = {
  login: () => {

  },
  logout: () => {

  },
  getCurrentUser: (): User | null => {

    return null;
  },
  isLoggedIn: (): boolean => {

    return false;
  }
};