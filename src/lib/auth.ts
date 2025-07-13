import { ObjectId } from 'mongodb'
import clientPromise from './mongodb'
import { User as NextAuthUser } from 'next-auth'

export type SubscriptionTier = 'free' | 'starter_spark' | 'growth_engine' | 'agency_arsenal'

export interface UserProfile {
  _id: ObjectId
  userId: string
  email: string
  subscription_tier: SubscriptionTier
  credits_remaining: number
  total_offers_generated?: number
  offers_this_month?: number
  credits_used?: number
  last_generation_date?: Date
  daily_generation_count?: number
  purchased_offers_count?: number

  // Enhanced pricing structure fields
  package_details?: {
    price_per_offer?: number
    total_package_value?: number
    purchase_date?: Date
    regeneration_count?: number
    regenerations_used?: number
    original_business_context?: any // Store original context for regenerations
  }

  // Daily usage tracking for free users
  daily_usage?: {
    date: string
    count: number
  }[]

  // Generation tracking
  generation_history?: {
    date: Date
    offer_id: string
    type: 'new' | 'regeneration'
    credits_used: number
  }[]

  created_at: Date
  updated_at: Date
}

export interface AuthUser extends NextAuthUser {
  profile?: UserProfile
}

// Authentication functions
export const authService = {
  // Get user profile - enhanced with better error handling
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const client = await clientPromise
      const db = client.db()

      // Check both userId and email fields for compatibility
      const profile = await db.collection('user_profiles').findOne({
        $or: [{ userId }, { email: userId }],
      })
      return profile as UserProfile | null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  // Update user profile - enhanced with atomic operations
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const client = await clientPromise
      const db = client.db()

      // First check if the user exists - check both userId and email fields
      const existingUser = await db.collection('user_profiles').findOne({
        $or: [{ userId }, { email: userId }],
      })

      if (!existingUser) {
        throw new Error('User profile not found. Cannot update non-existent user.')
      }

      // Update using the same identifier that was found
      const updateQuery = existingUser.userId ? { userId } : { email: userId }

      const result = await db.collection('user_profiles').updateOne(updateQuery, {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      })

      return result.acknowledged
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  },

  // Create user profile - enhanced with proper initialization
  async createUserProfile(userId: string, email: string): Promise<UserProfile> {
    try {
      const client = await clientPromise
      const db = client.db()

      // Check if user already exists to prevent duplicates
      const existingUser = await db.collection('user_profiles').findOne({
        $or: [{ userId }, { email }],
      })

      if (existingUser) {
        console.log('User profile already exists, returning existing profile')
        return existingUser as UserProfile
      }

      const now = new Date()
      const profile: Omit<UserProfile, '_id'> = {
        userId,
        email,
        subscription_tier: 'free',
        credits_remaining: 3, // Free tier gets 3 total generations
        total_offers_generated: 0,
        daily_generation_count: 0,
        purchased_offers_count: 0,
        daily_usage: [],
        generation_history: [],
        created_at: now,
        updated_at: now,
      }

      const result = await db.collection('user_profiles').insertOne(profile)

      return {
        _id: result.insertedId,
        ...profile,
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  },

  // Enhanced generation checking with detailed limits
  async canUserGenerate(
    userId: string,
    isRegeneration: boolean = false
  ): Promise<{
    canGenerate: boolean
    reason?: string
    remainingCredits?: number
    dailyRemaining?: number
    regenerationsRemaining?: number
  }> {
    try {
      const profile = await this.getUserProfile(userId)

      if (!profile) return { canGenerate: false, reason: 'User profile not found' }

      // Handle regenerations for Starter Spark
      if (isRegeneration && profile.subscription_tier === 'starter_spark') {
        const regenerationsUsed = profile.package_details?.regenerations_used || 0
        const maxRegenerations = profile.package_details?.regeneration_count || 2

        if (regenerationsUsed >= maxRegenerations) {
          return {
            canGenerate: false,
            reason: 'Maximum regenerations reached',
            remainingCredits: profile.credits_remaining,
            regenerationsRemaining: 0,
          }
        }

        return {
          canGenerate: true,
          remainingCredits: profile.credits_remaining,
          regenerationsRemaining: maxRegenerations - regenerationsUsed,
        }
      }

      // Free users have limits: max 3 total offers, 1 per day
      if (profile.subscription_tier === 'free') {
        // Check total limit
        if (profile.credits_remaining <= 0) {
          return {
            canGenerate: false,
            reason: 'No more free offers available',
            remainingCredits: 0,
          }
        }

        // Check daily limit - get today's date
        const today = new Date().toISOString().split('T')[0]
        const todayUsage = profile.daily_usage?.find(usage => usage.date === today)
        const todayCount = todayUsage?.count || 0

        if (todayCount >= 1) {
          return {
            canGenerate: false,
            reason: 'Daily limit reached (1 per day)',
            remainingCredits: profile.credits_remaining,
            dailyRemaining: 0,
          }
        }

        return {
          canGenerate: true,
          remainingCredits: profile.credits_remaining,
          dailyRemaining: 1 - todayCount,
        }
      }

      // Paid users can generate if they have credits
      if (profile.credits_remaining > 0) {
        return { canGenerate: true, remainingCredits: profile.credits_remaining }
      }

      return { canGenerate: false, reason: 'No credits remaining', remainingCredits: 0 }
    } catch (error) {
      console.error('Error checking generation limits:', error)
      return { canGenerate: false, reason: 'Error checking limits' }
    }
  },

  // Enhanced subscription upgrade with proper credit management
  async upgradeSubscription(
    userId: string,
    tier: SubscriptionTier,
    packageDetails?: {
      price_per_offer?: number
      total_package_value?: number
      purchase_date?: Date
      regeneration_count?: number
      original_business_context?: any
    }
  ) {
    try {
      const client = await clientPromise
      const db = client.db()

      // Get current profile to maintain existing data
      const currentProfile = await this.getUserProfile(userId)
      if (!currentProfile) {
        throw new Error('User profile not found for upgrade')
      }

      const updates: Partial<UserProfile> = {
        subscription_tier: tier,
      }

      // Add credits based on package type
      if (tier === 'starter_spark') {
        updates.credits_remaining = 1 // 1 offer for $9
        updates.package_details = {
          price_per_offer: 9,
          total_package_value: 9,
          purchase_date: new Date(),
          regeneration_count: 2,
          regenerations_used: 0,
          ...packageDetails,
        }
      } else if (tier === 'growth_engine') {
        updates.credits_remaining = 10 // 10 offers for $47
        updates.package_details = {
          price_per_offer: 4.7,
          total_package_value: 47,
          purchase_date: new Date(),
          regeneration_count: 0,
          regenerations_used: 0,
          ...packageDetails,
        }
      } else if (tier === 'agency_arsenal') {
        updates.credits_remaining = 30 // 30 offers for $99
        updates.package_details = {
          price_per_offer: 3.3,
          total_package_value: 99,
          purchase_date: new Date(),
          regeneration_count: 0,
          regenerations_used: 0,
          ...packageDetails,
        }
      }

      // Use atomic update to prevent race conditions
      const updateQuery = currentProfile.userId ? { userId } : { email: userId }
      const result = await db.collection('user_profiles').updateOne(updateQuery, {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      })

      if (!result.acknowledged) {
        throw new Error('Failed to update subscription')
      }

      return true
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      throw error
    }
  },

  // Enhanced credit deduction with atomic operations
  async deductCredits(userId: string, amount: number = 1, isRegeneration: boolean = false) {
    try {
      const client = await clientPromise
      const db = client.db()

      const profile = await this.getUserProfile(userId)
      if (!profile) throw new Error('User profile not found')

      const today = new Date().toISOString().split('T')[0]
      const updateQuery = profile.userId ? { userId } : { email: userId }

      // For regenerations, don't deduct credits but track regeneration count
      if (isRegeneration && profile.subscription_tier === 'starter_spark') {
        const regenerationsUsed = (profile.package_details?.regenerations_used || 0) + 1

        // Add to generation history
        const currentHistory = profile.generation_history || []
        const newHistory = [
          ...currentHistory,
          {
            date: new Date(),
            offer_id: 'regeneration',
            type: 'regeneration' as const,
            credits_used: 0,
          },
        ]
        const trimmedHistory = newHistory.slice(-100)

        const result = await db.collection('user_profiles').updateOne(updateQuery, {
          $set: {
            'package_details.regenerations_used': regenerationsUsed,
            generation_history: trimmedHistory,
            updated_at: new Date(),
          },
        })

        return result.acknowledged
      }

      // For regular generations, deduct credits
      const newCredits = Math.max(0, profile.credits_remaining - amount)

      // Update daily usage for all users
      const dailyUsage = profile.daily_usage || []
      const todayUsageIndex = dailyUsage.findIndex(usage => usage.date === today)

      if (todayUsageIndex >= 0) {
        dailyUsage[todayUsageIndex].count += amount
      } else {
        dailyUsage.push({ date: today, count: amount })
      }

      // Keep only last 30 days of usage data
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]
      const filteredUsage = dailyUsage.filter(usage => usage.date >= thirtyDaysAgoStr)

      // Add to generation history
      const currentHistory = profile.generation_history || []
      const newHistory = [
        ...currentHistory,
        {
          date: new Date(),
          offer_id: 'generated',
          type: 'new' as const,
          credits_used: amount,
        },
      ]
      const trimmedHistory = newHistory.slice(-100)

      // Atomic update with all changes
      const result = await db.collection('user_profiles').updateOne(updateQuery, {
        $set: {
          credits_remaining: newCredits,
          daily_usage: filteredUsage,
          generation_history: trimmedHistory,
          last_generation_date: new Date(),
          updated_at: new Date(),
        },
      })

      return result.acknowledged
    } catch (error) {
      console.error('Error deducting credits:', error)
      throw error
    }
  },

  // Store original business context for regenerations
  async storeOriginalBusinessContext(userId: string, businessContext: any) {
    try {
      const profile = await this.getUserProfile(userId)
      if (!profile) throw new Error('User profile not found')

      const updateQuery = profile.userId ? { userId } : { email: userId }

      await this.updateUserProfile(userId, {
        package_details: {
          ...profile.package_details,
          original_business_context: businessContext,
        },
      })

      return true
    } catch (error) {
      console.error('Error storing business context:', error)
      throw error
    }
  },

  // Background generation management using generation_history
  async addGenerationRecord(
    userId: string,
    offerId: string,
    type: 'new' | 'regeneration',
    creditsUsed: number
  ) {
    try {
      const client = await clientPromise
      const db = client.db()

      const profile = await this.getUserProfile(userId)
      if (!profile) throw new Error('User profile not found')

      const updateQuery = profile.userId ? { userId } : { email: userId }

      // Add to generation history without MongoDB $push typing issues
      const currentHistory = profile.generation_history || []
      const newHistory = [
        ...currentHistory,
        {
          date: new Date(),
          offer_id: offerId,
          type,
          credits_used: creditsUsed,
        },
      ]

      // Keep only last 100 generations
      const trimmedHistory = newHistory.slice(-100)

      const result = await db.collection('user_profiles').updateOne(updateQuery, {
        $set: {
          generation_history: trimmedHistory,
          updated_at: new Date(),
        },
      })

      return result.acknowledged
    } catch (error) {
      console.error('Error adding generation record:', error)
      throw error
    }
  },

  // Get recent generation history
  async getGenerationHistory(userId: string, limit: number = 10) {
    try {
      const profile = await this.getUserProfile(userId)
      if (!profile) return []

      const history = profile.generation_history || []
      return history.slice(-limit).reverse() // Get most recent first
    } catch (error) {
      console.error('Error getting generation history:', error)
      return []
    }
  },

  // Check if user has regenerations available
  async getRegenerationStatus(userId: string) {
    try {
      const profile = await this.getUserProfile(userId)
      if (!profile) return { available: false, remaining: 0 }

      if (profile.subscription_tier === 'starter_spark') {
        const regenerationsUsed = profile.package_details?.regenerations_used || 0
        const maxRegenerations = profile.package_details?.regeneration_count || 2
        const remaining = Math.max(0, maxRegenerations - regenerationsUsed)

        return {
          available: remaining > 0,
          remaining,
          maxRegenerations,
          originalContext: profile.package_details?.original_business_context,
        }
      }

      return { available: false, remaining: 0 }
    } catch (error) {
      console.error('Error checking regeneration status:', error)
      return { available: false, remaining: 0 }
    }
  },

  // Get user by ID - AI-FRIENDLY: Uses unified user_profiles collection
  async getUserById(userId: string) {
    try {
      const client = await clientPromise
      const db = client.db()

      // First try unified collection (AI-friendly approach)
      const unifiedUser = await db.collection('user_profiles').findOne({
        $or: [
          { _id: new ObjectId(userId) },
          { email: userId }, // fallback if userId is actually email
        ],
      })

      if (unifiedUser) {
        return unifiedUser
      }

      // Fallback to old collection for backward compatibility
      const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
      return user
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  },

  // Get user by email - AI-FRIENDLY: Uses unified user_profiles collection
  async getUserByEmail(email: string) {
    try {
      const client = await clientPromise
      const db = client.db()

      // First try unified collection (AI-friendly approach)
      const unifiedUser = await db.collection('user_profiles').findOne({ email })

      if (unifiedUser) {
        // User is in unified format - return with profile included
        return {
          ...unifiedUser,
          profile: unifiedUser, // The user data IS the profile data
        }
      }

      // Fallback to old collections for backward compatibility
      const user = await db.collection('users').findOne({ email })
      if (!user) return null

      // Get user profile
      const profile = await this.getUserProfile(user._id.toString())

      return {
        ...user,
        profile,
      }
    } catch (error) {
      console.error('Error fetching user by email:', error)
      return null
    }
  },

  // Check if user is admin
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const client = await clientPromise
      const db = client.db()

      const adminUser = await db.collection('admin_users').findOne({ userId })
      return !!adminUser
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  },

  // Create admin user
  async createAdminUser(userId: string, role: string = 'admin') {
    try {
      const client = await clientPromise
      const db = client.db()

      const result = await db.collection('admin_users').insertOne({
        userId,
        role,
        created_at: new Date(),
      })

      return result.acknowledged
    } catch (error) {
      console.error('Error creating admin user:', error)
      throw error
    }
  },
}

// Subscription tier helpers
export const subscriptionHelpers = {
  isFreeTier: (tier?: SubscriptionTier) => tier === 'free' || !tier,
  isStarterSparkTier: (tier?: SubscriptionTier) => tier === 'starter_spark',
  isGrowthEngineTier: (tier?: SubscriptionTier) => tier === 'growth_engine',
  isAgencyArsenalTier: (tier?: SubscriptionTier) => tier === 'agency_arsenal',
  isPaidTier: (tier?: SubscriptionTier) =>
    tier === 'starter_spark' || tier === 'growth_engine' || tier === 'agency_arsenal',

  getTierDisplayName: (tier?: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return 'Free'
      case 'starter_spark':
        return 'Starter Spark'
      case 'growth_engine':
        return 'Growth Engine'
      case 'agency_arsenal':
        return 'Agency Arsenal'
      default:
        return 'Free'
    }
  },

  getTierCredits: (tier?: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return 3
      case 'starter_spark':
        return 1
      case 'growth_engine':
        return 10
      case 'agency_arsenal':
        return 30
      default:
        return 3
    }
  },

  getPricePerOffer: (tier?: SubscriptionTier) => {
    switch (tier) {
      case 'starter_spark':
        return 9
      case 'growth_engine':
        return 4.7
      case 'agency_arsenal':
        return 3.3
      default:
        return 0
    }
  },

  canGenerateUnlimited: (tier?: SubscriptionTier) => {
    return false // No unlimited tiers in new pricing
  },
}

// Database helpers for offers and purchases
export const dbHelpers = {
  // Save purchased offer
  async savePurchasedOffer(
    userId: string,
    offerId: string,
    offerData: any,
    componentName?: string
  ) {
    try {
      const client = await clientPromise
      const db = client.db()

      const purchase = {
        _id: new ObjectId(),
        userId,
        offerId,
        offerData,
        componentName: componentName || null,
        amount_paid: componentName ? 19.0 : 47.0,
        status: 'active',
        created_at: new Date(),
      }

      const result = await db.collection('purchased_offers').insertOne(purchase)
      return result.acknowledged
    } catch (error) {
      console.error('Error saving purchased offer:', error)
      throw error
    }
  },

  // Check if offer is already purchased
  async isPurchased(userId: string, offerId: string): Promise<boolean> {
    try {
      const client = await clientPromise
      const db = client.db()

      const purchase = await db.collection('purchased_offers').findOne({
        userId,
        offerId,
        status: 'active',
      })

      return !!purchase
    } catch (error) {
      console.error('Error checking purchase status:', error)
      return false
    }
  },

  // Get user's purchased offers
  async getUserPurchases(userId: string) {
    try {
      const client = await clientPromise
      const db = client.db()

      const purchases = await db
        .collection('purchased_offers')
        .find({ userId })
        .sort({ created_at: -1 })
        .toArray()

      return purchases
    } catch (error) {
      console.error('Error fetching purchases:', error)
      return []
    }
  },

  // Check if user has purchased a specific offer
  async isPurchasedByUser(userId: string, offerId: string): Promise<boolean> {
    try {
      const client = await clientPromise
      const db = client.db()

      const purchase = await db.collection('purchased_offers').findOne({
        userId,
        offerId,
        status: 'active',
      })

      return !!purchase
    } catch (error) {
      console.error('Error checking offer purchase status:', error)
      return false
    }
  },

  // Get user's purchased offer IDs
  async getUserPurchasedOfferIds(userId: string): Promise<string[]> {
    try {
      const client = await clientPromise
      const db = client.db()

      const purchases = await db
        .collection('purchased_offers')
        .find({ userId, status: 'active' })
        .project({ offerId: 1 })
        .toArray()

      return purchases.map(p => p.offerId)
    } catch (error) {
      console.error('Error fetching purchased offer IDs:', error)
      return []
    }
  },
}
