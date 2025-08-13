import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  email: string;
  type: 'ADMIN' | 'USER' | 'INFLUENCER' | 'BRAND';
}

export async function verifyAuth(req: NextRequest): Promise<{
  isAuthenticated: boolean;
  user?: AuthUser;
}> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return { isAuthenticated: false };
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return {
      isAuthenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        type: decoded.type,
      },
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
}