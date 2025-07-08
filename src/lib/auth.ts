import { ObjectId } from 'mongodb'
import clientPromise from './mongodb'
import { User as NextAuthUser } from 'next-auth'

type SubscriptionTier = 'free' | 'one_time' | 'pro'

export interface UserProfile {
  _id: ObjectId
  userId: string
  subscription_tier: SubscriptionTier
  credits_remaining: number
  total_offers_generated?: number
  offers_this_month?: number
  credits_used?: number
  last_generation_date?: Date
  daily_generation_count?: number
  purchased_offers_count?: number
  created_at: Date
  updated_at: Date
}

export interface AuthUser extends NextAuthUser {
  profile?: UserProfile
}

// Authentication functions
export const authService = {
  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const client = await clientPromise
      const db = client.db()

      const profile = await db.collection('user_profiles').findOne({ userId })
      return profile as UserProfile | null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const client = await clientPromise
      const db = client.db()

      const result = await db.collection('user_profiles').updateOne(
        { userId },
        {
          $set: {
            ...updates,
            updated_at: new Date(),
          },
        },
        { upsert: true }
      )

      return result.acknowledged
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  },

  // Create user profile (called when user first signs up)
  async createUserProfile(userId: string, email: string): Promise<UserProfile> {
    try {
      const client = await clientPromise
      const db = client.db()

      const now = new Date()
      const profile: Omit<UserProfile, '_id'> = {
        userId,
        subscription_tier: 'free',
        credits_remaining: 3,
        total_offers_generated: 0,
        daily_generation_count: 0,
        purchased_offers_count: 0,
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

  // Check if user can generate offers
  async canUserGenerate(userId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId)

      if (!profile) return false

      // Pro users can always generate
      if (profile.subscription_tier === 'pro' || profile.subscription_tier === 'one_time') {
        return true
      }

      // Free users have limits: max 3 total offers, 1 per day
      // Get real count from database
      const client = await clientPromise
      const db = client.db()

      const totalGenerated = await db.collection('grand_slam_offers').countDocuments({
        user_id: userId,
      })

      if (totalGenerated >= 3) {
        return false
      }

      // Check daily limit - count offers created today
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

      const dailyCount = await db.collection('grand_slam_offers').countDocuments({
        user_id: userId,
        created_at: {
          $gte: startOfDay.toISOString(),
          $lt: endOfDay.toISOString(),
        },
      })

      if (dailyCount >= 1) {
        return false
      }

      return true
    } catch (error) {
      console.error('Error checking generation limits:', error)
      return false
    }
  },

  // Upgrade user subscription
  async upgradeSubscription(userId: string, tier: SubscriptionTier) {
    const updates: Partial<UserProfile> = {
      subscription_tier: tier,
    }

    // Add credits for one-time purchase
    if (tier === 'one_time') {
      updates.credits_remaining = 999999 // Effectively unlimited
    }

    return this.updateUserProfile(userId, updates)
  },

  // Deduct user credits
  async deductCredits(userId: string, amount: number = 1) {
    try {
      const profile = await this.getUserProfile(userId)
      if (!profile) throw new Error('User profile not found')

      const newCredits = Math.max(0, profile.credits_remaining - amount)

      return this.updateUserProfile(userId, {
        credits_remaining: newCredits,
      })
    } catch (error) {
      console.error('Error deducting credits:', error)
      throw error
    }
  },

  // Get user by ID
  async getUserById(userId: string) {
    try {
      const client = await clientPromise
      const db = client.db()

      const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
      return user
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  },

  // Get user by email
  async getUserByEmail(email: string) {
    try {
      const client = await clientPromise
      const db = client.db()

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
  isOneTimeTier: (tier?: SubscriptionTier) => tier === 'one_time',
  isProTier: (tier?: SubscriptionTier) => tier === 'pro',
  isPaidTier: (tier?: SubscriptionTier) => tier === 'one_time' || tier === 'pro',

  getTierDisplayName: (tier?: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return 'Free'
      case 'one_time':
        return 'One-Time Unlock'
      case 'pro':
        return 'Pro Monthly'
      default:
        return 'Free'
    }
  },

  getTierCredits: (tier?: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return 3
      case 'one_time':
        return 999999
      case 'pro':
        return 999999
      default:
        return 3
    }
  },

  canGenerateUnlimited: (tier?: SubscriptionTier) => {
    return tier === 'one_time' || tier === 'pro'
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
