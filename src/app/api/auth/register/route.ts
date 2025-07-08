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

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const now = new Date()
    const newUser = {
      _id: new ObjectId(),
      email,
      password: hashedPassword,
      name: name || null,
      image: null,
      role: 'user',
      emailVerified: null,
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection('users').insertOne(newUser)

    if (!result.acknowledged) {
      throw new Error('Failed to create user')
    }

    // Create user profile
    const userProfile = {
      _id: new ObjectId(),
      userId: newUser._id.toString(),
      subscription_tier: 'free' as const,
      credits_remaining: 3,
      created_at: now,
      updated_at: now,
    }

    await db.collection('user_profiles').insertOne(userProfile)

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
