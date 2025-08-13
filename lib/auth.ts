import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// 카카오 Provider 커스텀 구현
const KakaoProvider = {
  id: 'kakao',
  name: 'Kakao',
  type: 'oauth' as const,
  authorization: {
    url: 'https://kauth.kakao.com/oauth/authorize',
    params: {
      response_type: 'code',
      client_id: process.env.KAKAO_CLIENT_ID!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/kakao`,
    },
  },
  token: 'https://kauth.kakao.com/oauth/token',
  userinfo: 'https://kapi.kakao.com/v2/user/me',
  client: {
    id: process.env.KAKAO_CLIENT_ID!,
    secret: process.env.KAKAO_CLIENT_SECRET!,
  },
  profile(profile: any) {
    return {
      id: String(profile.id),
      name: profile.properties?.nickname || profile.kakao_account?.profile?.nickname,
      email: profile.kakao_account?.email,
      image: profile.properties?.profile_image || profile.kakao_account?.profile?.profile_image_url,
    }
  },
}

// 네이버 Provider 커스텀 구현
const NaverProvider = {
  id: 'naver',
  name: 'Naver',
  type: 'oauth' as const,
  authorization: {
    url: 'https://nid.naver.com/oauth2.0/authorize',
    params: {
      response_type: 'code',
      client_id: process.env.NAVER_CLIENT_ID!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/naver`,
      state: Math.random().toString(36).substring(7),
    },
  },
  token: 'https://nid.naver.com/oauth2.0/token',
  userinfo: 'https://openapi.naver.com/v1/nid/me',
  client: {
    id: process.env.NAVER_CLIENT_ID!,
    secret: process.env.NAVER_CLIENT_SECRET!,
  },
  profile(profile: any) {
    return {
      id: profile.response.id,
      name: profile.response.name || profile.response.nickname,
      email: profile.response.email,
      image: profile.response.profile_image,
    }
  },
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    KakaoProvider as any,
    NaverProvider as any,
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || 'USER'
      }
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.provider = token.provider as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // 소셜 로그인 시 추가 정보 저장
      if (account?.provider && account.provider !== 'credentials') {
        const email = user.email || profile?.email
        if (email) {
          await prisma.user.upsert({
            where: { email },
            update: {
              name: user.name || profile?.name,
              image: user.image || (profile as any)?.picture,
              provider: account.provider,
              providerId: account.providerAccountId,
            },
            create: {
              email,
              name: user.name || profile?.name,
              image: user.image || (profile as any)?.picture,
              provider: account.provider,
              providerId: account.providerAccountId,
              role: 'USER',
            },
          })
        }
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
}