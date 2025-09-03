import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/db"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = LoginSchema.parse(body)
    
    // Find user
    const user = await query({
      where: { email: validatedData.email },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(
      validatedData.password,
      user.password
    )
    
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // Return user without password
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json({
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}