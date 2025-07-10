export type SubscriptionTier = 'free' | 'starter_spark' | 'growth_engine' | 'agency_arsenal'

export interface UserProfile {
  _id: string
  userId: string
  subscription_tier: SubscriptionTier
  credits_remaining: number
  total_offers_generated?: number
  offers_this_month?: number
  credits_used?: number
  last_generation_date?: Date
  daily_generation_count?: number
  purchased_offers_count?: number
  // New pricing structure fields
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
  created_at: Date
  updated_at: Date
}

export interface AuthUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  profile?: UserProfile
}

export interface CanGenerateResult {
  canGenerate: boolean
  reason?: string
  remainingCredits?: number
}

export interface SubscriptionHelpers {
  getTierDisplayName: (tier: SubscriptionTier) => string
  getTierCredits: (tier: SubscriptionTier) => number
  getTierPrice: (tier: SubscriptionTier) => number
  getPricePerOffer: (tier: SubscriptionTier) => number
  isFreeTier: (tier: SubscriptionTier) => boolean
  isPaidTier: (tier: SubscriptionTier) => boolean
}
