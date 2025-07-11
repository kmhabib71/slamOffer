import { ObjectId } from 'mongodb'
import clientPromise from './mongodb'
import { UnifiedUserProfile, UNIFIED_USER_COLLECTION, mergeUserData } from './unified-user-schema'

/**
 * Unified User Service
 *
 * This service provides a single interface for user operations
 * while handling the migration from separate collections to unified collection
 */
export class UnifiedUserService {
  /**
   * Find user by email - works with both old and new schema
   */
  static async findByEmail(email: string): Promise<UnifiedUserProfile | null> {
    try {
      const client = await clientPromise
      const db = client.db()

      // First, try to find in unified user_profiles collection
      const unifiedUser = await db.collection(UNIFIED_USER_COLLECTION).findOne({ email })

      if (unifiedUser) {
        // User is already in unified format
        return unifiedUser as UnifiedUserProfile
      }

      // Fallback: Look in separate collections and merge
      const [userDoc, profileDoc] = await Promise.all([
        db.collection('users').findOne({ email }),
        db.collection('user_profiles').findOne({ userId: email }),
      ])

      if (!userDoc) {
        return null
      }

      // Merge and return unified data (but don't save it yet)
      const mergedData = mergeUserData(userDoc, profileDoc)
      return {
        _id: userDoc._id,
        ...mergedData,
      }
    } catch (error) {
      console.error('Error finding user by email:', error)
      return null
    }
  }

  /**
   * Find user by ID - works with both old and new schema
   */
  static async findById(userId: string): Promise<UnifiedUserProfile | null> {
    try {
      const client = await clientPromise
      const db = client.db()

      // First, try to find in unified user_profiles collection by _id
      try {
        const unifiedUser = await db.collection(UNIFIED_USER_COLLECTION).findOne({
          _id: new ObjectId(userId),
        })

        if (unifiedUser) {
          return unifiedUser as UnifiedUserProfile
        }
      } catch (e) {
        // Invalid ObjectId, continue to other methods
      }

      // Fallback: Look in separate collections
      const [userDoc, profileDoc] = await Promise.all([
        db.collection('users').findOne({ _id: new ObjectId(userId) }),
        db.collection('user_profiles').findOne({ userId }),
      ])

      if (!userDoc) {
        return null
      }

      // Merge and return unified data
      const mergedData = mergeUserData(userDoc, profileDoc)
      return {
        _id: userDoc._id,
        ...mergedData,
      }
    } catch (error) {
      console.error('Error finding user by ID:', error)
      return null
    }
  }

  /**
   * Create or update user - always saves to unified collection
   */
  static async upsert(
    userData: Partial<UnifiedUserProfile> & { email: string }
  ): Promise<UnifiedUserProfile> {
    try {
      const client = await clientPromise
      const db = client.db()

      const now = new Date()
      const updateData = {
        ...userData,
        updated_at: now,
        updatedAt: now,
      }

      // If no created_at, set it
      if (!updateData.created_at) {
        updateData.created_at = now
        updateData.createdAt = now
      }

      const result = await db.collection(UNIFIED_USER_COLLECTION).findOneAndUpdate(
        { email: userData.email },
        {
          $set: updateData,
          $setOnInsert: {
            created_at: now,
            createdAt: now,
            subscription_tier: userData.subscription_tier || 'free',
            credits_remaining: userData.credits_remaining || 3,
            role: userData.role || 'user',
          },
        },
        {
          upsert: true,
          returnDocument: 'after',
        }
      )

      return result as UnifiedUserProfile
    } catch (error) {
      console.error('Error upserting user:', error)
      throw error
    }
  }

  /**
   * Update user subscription data
   */
  static async updateSubscription(
    email: string,
    subscriptionData: {
      subscription_tier?: string
      credits_remaining?: number
      package_details?: any
    }
  ): Promise<boolean> {
    try {
      const client = await clientPromise
      const db = client.db()

      const result = await db.collection(UNIFIED_USER_COLLECTION).updateOne(
        { email },
        {
          $set: {
            ...subscriptionData,
            updated_at: new Date(),
            updatedAt: new Date(),
          },
        }
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error('Error updating subscription:', error)
      return false
    }
  }

  /**
   * Check if user exists
   */
  static async exists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email)
    return user !== null
  }

  /**
   * Deduct credits for generation (only for free users)
   */
  static async deductCredits(
    email: string,
    amount: number = 1
  ): Promise<{
    success: boolean
    creditsRemaining: number
    subscriptionTier: string
  }> {
    try {
      const client = await clientPromise
      const db = client.db()

      // Get current user
      const user = await this.findByEmail(email)
      if (!user) {
        return { success: false, creditsRemaining: 0, subscriptionTier: 'free' }
      }

      // For free users, deduct credits
      if (user.subscription_tier === 'free') {
        const newCredits = Math.max(0, user.credits_remaining - amount)

        const result = await db.collection(UNIFIED_USER_COLLECTION).updateOne(
          { email },
          {
            $set: {
              credits_remaining: newCredits,
              updated_at: new Date(),
              updatedAt: new Date(),
            },
          }
        )

        return {
          success: result.modifiedCount > 0,
          creditsRemaining: newCredits,
          subscriptionTier: user.subscription_tier,
        }
      }

      // For paid users, no credit deduction needed
      return {
        success: true,
        creditsRemaining: user.credits_remaining,
        subscriptionTier: user.subscription_tier,
      }
    } catch (error) {
      console.error('Error deducting credits:', error)
      return { success: false, creditsRemaining: 0, subscriptionTier: 'free' }
    }
  }

  /**
   * Migrate single user from old schema to new schema
   */
  static async migrateSingleUser(email: string): Promise<boolean> {
    try {
      const client = await clientPromise
      const db = client.db()

      // Check if already migrated
      const existingUnified = await db.collection(UNIFIED_USER_COLLECTION).findOne({ email })
      if (existingUnified && existingUnified.password) {
        // Already migrated and has auth data
        return true
      }

      // Get data from old collections
      const [userDoc, profileDoc] = await Promise.all([
        db.collection('users').findOne({ email }),
        db.collection('user_profiles').findOne({ userId: email }),
      ])

      if (!userDoc) {
        return false
      }

      // Merge data
      const mergedData = mergeUserData(userDoc, profileDoc)

      // Save to unified collection
      await db
        .collection(UNIFIED_USER_COLLECTION)
        .replaceOne({ email }, mergedData, { upsert: true })

      console.log(`✅ Migrated user: ${email}`)
      return true
    } catch (error) {
      console.error(`Error migrating user ${email}:`, error)
      return false
    }
  }
}

/**
 * Backward compatibility helpers
 * These functions maintain the same interface as the old auth service
 */
export const userHelpers = {
  async getUserByEmail(email: string) {
    return UnifiedUserService.findByEmail(email)
  },

  async getUserById(userId: string) {
    return UnifiedUserService.findById(userId)
  },

  async createOrUpdateUser(userData: any) {
    return UnifiedUserService.upsert(userData)
  },

  async updateUserSubscription(email: string, subscriptionData: any) {
    return UnifiedUserService.updateSubscription(email, subscriptionData)
  },
}
