import { ObjectId } from 'mongodb'

export interface UserProfile {
  userId: string
  subscription_tier: 'free' | 'pro'
  credits_remaining: number
  created_at: Date
  updated_at: Date
}

export interface User {
  _id: ObjectId
  email: string
  name?: string
  image?: string
  role?: 'user' | 'admin'
  emailVerified?: Date
  profile?: UserProfile
}

export interface Session {
  user: {
    id: string
    email: string
    name?: string
    image?: string
    role?: string
    profile?: UserProfile
  }
  expires: string
}
