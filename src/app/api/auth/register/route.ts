import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Check if user already exists - AI-FRIENDLY: Uses unified user_profiles collection
    const existingUser = await db.collection('user_profiles').findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create unified user (combines auth + profile data) - AI-FRIENDLY approach
    const now = new Date()
    const unifiedUser = {
      _id: new ObjectId(),
      // Authentication fields
      email,
      password: hashedPassword,
      name: name || null,
      image: null,
      role: 'user',
      emailVerified: null,
      // Subscription fields
      subscription_tier: 'free' as const,
      credits_remaining: 3,
      total_offers_generated: 0,
      daily_generation_count: 0,
      daily_limit: 1,
      generations_today: 0,
      purchased_offers_count: 0,
      // Timestamps (both formats for compatibility)
      created_at: now,
      updated_at: now,
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection('user_profiles').insertOne(unifiedUser)

    if (!result.acknowledged) {
      throw new Error('Failed to create user')
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: unifiedUser._id.toString(),
          email: unifiedUser.email,
          name: unifiedUser.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
