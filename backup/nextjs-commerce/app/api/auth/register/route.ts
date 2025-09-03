import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/config/env';
import { prisma } from "@/lib/db"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
})

const JWT_SECRET = process.env.JWT_SECRET || env.jwt.secret

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = RegisterSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await query({
      where: { email: validatedData.email },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)
    
    // Create user
    const user = await query({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
      },
    })
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    return NextResponse.json({
      user,
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
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}