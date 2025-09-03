// Authentication service
export interface User {
  id: string;
  email: string;
  name?: string;
  type: 'USER' | 'ADMIN' | 'INFLUENCER' | 'BRAND';
  profileImage?: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async getCurrentUser(): Promise<User | null> {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('auth-token') || localStorage.getItem('accessToken');
    if (!token) return null;

    if (this.currentUser) return this.currentUser;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.currentUser = data.user;
        return this.currentUser;
      }
    } catch (error) {

    }

    return null;
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth-token', data.token);
        this.currentUser = data.user;
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('auth-token') || localStorage.getItem('accessToken');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {

    } finally {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('accessToken');
      this.currentUser = null;
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(localStorage.getItem('auth-token') || localStorage.getItem('accessToken'));
  }
}

export { AuthService as default };