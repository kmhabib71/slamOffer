import { ObjectId } from 'mongodb'

/**
 * Unified User Schema - Combines users and user_profiles collections
 * This replaces the need for two separate collections
 */
export interface UnifiedUserProfile {
  _id: ObjectId

  // Authentication fields (from users collection)
  email: string
  password?: string // Optional for OAuth users
  name?: string | null
  image?: string | null
  role: 'user' | 'admin' | 'super_admin'
  emailVerified?: Date | null

  // Subscription fields (from user_profiles collection)
  subscription_tier: 'free' | 'starter_spark' | 'growth_engine' | 'agency_arsenal'
  credits_remaining: number
  total_offers_generated?: number
  offers_this_month?: number
  credits_used?: number
  last_generation_date?: Date
  daily_generation_count?: number
  purchased_offers_count?: number

  // Package details
  package_details?: {
    price_per_offer?: number
    total_package_value?: number
    purchase_date?: Date
    regeneration_count?: number
  }

  // Daily usage tracking for free users
  daily_usage?: {
    date: string
    count: number
  }[]

  // Timestamps
  created_at: Date
  updated_at: Date
  createdAt?: Date // For NextAuth compatibility
  updatedAt?: Date // For NextAuth compatibility
}

/**
 * Migration strategy:
 * 1. Create new documents in user_profiles with combined data
 * 2. Update all collection references to use user_profiles
 * 3. Use email as the primary lookup field (consistent across both collections)
 * 4. Maintain backward compatibility during transition
 */

export const UNIFIED_USER_COLLECTION = 'user_profiles'

/**
 * Helper function to convert old users + user_profiles data to unified schema
 */
export function mergeUserData(userDoc: any, profileDoc: any): Omit<UnifiedUserProfile, '_id'> {
  return {
    // Authentication data from users collection
    email: userDoc.email,
    password: userDoc.password,
    name: userDoc.name,
    image: userDoc.image,
    role: userDoc.role || 'user',
    emailVerified: userDoc.emailVerified,

    // Subscription data from user_profiles collection
    subscription_tier: profileDoc?.subscription_tier || 'free',
    credits_remaining: profileDoc?.credits_remaining || 3,
    total_offers_generated: profileDoc?.total_offers_generated || 0,
    offers_this_month: profileDoc?.offers_this_month || 0,
    credits_used: profileDoc?.credits_used || 0,
    last_generation_date: profileDoc?.last_generation_date,
    daily_generation_count: profileDoc?.daily_generation_count || 0,
    purchased_offers_count: profileDoc?.purchased_offers_count || 0,
    package_details: profileDoc?.package_details,
    daily_usage: profileDoc?.daily_usage || [],

    // Timestamps (prefer user_profiles timestamps, fallback to users)
    created_at: profileDoc?.created_at || userDoc?.createdAt || new Date(),
    updated_at: profileDoc?.updated_at || userDoc?.updatedAt || new Date(),
    createdAt: userDoc?.createdAt || profileDoc?.created_at || new Date(),
    updatedAt: userDoc?.updatedAt || profileDoc?.updated_at || new Date(),
  }
}
