import type { User, RequestContext } from '@/lib/types/common';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query, transaction } from '@/lib/db'
import { JWT_SECRET, REFRESH_SECRET } from '@/lib/auth/constants'
import { logger } from '@/lib/utils/logger'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  type: 'business' | 'influencer'
  phone?: string
  address?: string
  companyName?: string
  businessNumber?: string
  businessFileUrl?: string | null
  businessFileName?: string | null
  businessFileSize?: number | null
}

class AuthServiceClass {

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string; refreshToken: string }> {
    const { email, password } = credentials

    try {
      // Find user in database
      const userResult = await query(`
        SELECT 
          u.*,
          p.id as profile_id, p.phone, p.address, p.bio,
          bp.id as business_profile_id, bp.company_name, bp.business_number,
          bp.representative_name, bp.business_address, bp.business_category
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        LEFT JOIN business_profiles bp ON u.id = bp.user_id
        WHERE u.email = $1
      `, [email])

      const user = userResult.rows[0]
      if (!user) {
        throw new Error('Invalid credentials')
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      
      if (!isValidPassword) {
        throw new Error('Invalid credentials')
      }

      // Update last login
      await query(`
        UPDATE users 
        SET last_login_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [user.id])

      const token = jwt.sign(
        { userId: user.id, email: user.email, type: user.type },
        JWT_SECRET,
        { expiresIn: '1h' }
      )

      const refreshToken = jwt.sign(
        { userId: user.id },
        REFRESH_SECRET,
        { expiresIn: '7d' }
      )

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: user.type as 'BUSINESS' | 'INFLUENCER' | 'ADMIN'
        },
        token,
        refreshToken
      }
    } catch (error) {
      logger.error('Login error:', error)
      throw new Error('Invalid credentials')
    }
  }

  async register(data: RegisterData): Promise<{ user: User; token: string; refreshToken: string }> {
    const { 
      email, 
      password, 
      name, 
      type, 
      phone, 
      address, 
      companyName, 
      businessNumber,
      businessFileUrl,
      businessFileName,
      businessFileSize
    } = data

    try {
      // Check if user already exists
      const existingUserResult = await query(`
        SELECT id FROM users WHERE email = $1
      `, [email])

      if (existingUserResult.rows.length > 0) {
        throw new Error('이미 등록된 이메일입니다.')
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // Create user with profile using transaction
      const user = await transaction(async (client) => {
        // Create user
        const userResult = await client.query(`
          INSERT INTO users (email, password, name, type, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, 'ACTIVE', NOW(), NOW())
          RETURNING *
        `, [email, hashedPassword, name, type.toUpperCase()])
        
        const newUser = userResult.rows[0]
        
        // Create profile based on type
        if (type === 'influencer') {
          await client.query(`
            INSERT INTO user_profiles (user_id, phone, address, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
          `, [newUser.id, phone || null, address || null])
        } else if (type === 'business') {
          await client.query(`
            INSERT INTO business_profiles (
              user_id, company_name, business_number, representative_name,
              business_address, business_category, business_registration,
              business_file_name, business_file_size, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          `, [
            newUser.id, companyName || name, businessNumber || '',
            name, address || '', '', businessFileUrl || null,
            businessFileName || null, businessFileSize || null
          ])
        }
        
        return newUser
      })

      const token = jwt.sign(
        { userId: user.id, email: user.email, type: user.type },
        JWT_SECRET,
        { expiresIn: '1h' }
      )

      const refreshToken = jwt.sign(
        { userId: user.id },
        REFRESH_SECRET,
        { expiresIn: '7d' }
      )

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: user.type as 'BUSINESS' | 'INFLUENCER'
        },
        token,
        refreshToken
      }
    } catch (error) {
      logger.error('Registration error:', error)
      throw error
    }
  }

  async refreshToken(token: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(token, REFRESH_SECRET) as unknown
      
      const newToken = jwt.sign(
        { userId: decoded.userId },
        JWT_SECRET,
        { expiresIn: '1h' }
      )

      const newRefreshToken = jwt.sign(
        { userId: decoded.userId },
        REFRESH_SECRET,
        { expiresIn: '7d' }
      )

      return { token: newToken, refreshToken: newRefreshToken }
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  async verifyToken(token: string): Promise<unknown> {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  async getUser(userId: string): Promise<User | null> {
    // Mock user retrieval - in real app, this would fetch from database
    return {
      id: userId,
      email: 'user@example.com',
      name: 'Mock User',
      type: 'business'
    }
  }

  async logout(sessionId: string): Promise<void> {
    // Mock logout - in real app, this would clear session from database/redis
    logger.log('Logging out session:', sessionId)
  }

  async validateToken(token: string): Promise<unknown> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      return decoded
    } catch (error) {
      return null
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      logger.log('getUserById - Looking for user ID:', userId)
      
      const userResult = await query(`
        SELECT * FROM users WHERE id = $1
      `, [userId])
      
      logger.log('getUserById - Query result rows:', userResult.rows.length)
      
      const user = userResult.rows[0]
      if (!user) {
        logger.log('getUserById - No user found for ID:', userId)
        return null
      }
      
      logger.log('getUserById - User found:', user.email, 'Type:', user.type)
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type as 'BUSINESS' | 'INFLUENCER' | 'ADMIN',
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        postal_code: user.postal_code
      }
    } catch (error) {
      logger.error('Error fetching user:', error)
      return null
    }
  }

  async refreshSession(refreshToken: string): Promise<unknown> {
    const result = await this.refreshToken(refreshToken)
    return {
      accessToken: result.token,
      refreshToken: result.refreshToken,
      user: { id: '1', email: 'user@example.com', name: 'User', type: 'business' }
    }
  }
}

export const authService = new AuthServiceClass()