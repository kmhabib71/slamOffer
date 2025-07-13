import { MongoClient } from 'mongodb'
import clientPromise from './mongodb'

export interface AtomicUpdateResult {
  success: boolean
  modifiedCount: number
  upsertedCount: number
  matchedCount: number
  error?: string
}

export interface CreditDeductionResult {
  success: boolean
  newCreditsBalance: number
  oldCreditsBalance: number
  error?: string
}

export interface UserProfileData {
  userId: string
  email: string
  subscription_tier: string
  credits_remaining: number
  generation_history?: any[]
  daily_usage?: any[]
  package_details?: any
  last_generation_date?: Date
}

class DatabaseAtomicOperations {
  private client: MongoClient | null = null

  private async getClient(): Promise<MongoClient> {
    if (!this.client) {
      this.client = await clientPromise
    }
    return this.client
  }

  /**
   * Atomically deduct credits from user profile with race condition prevention
   */
  async deductCreditsAtomic(
    userId: string,
    amount: number,
    isRegeneration: boolean = false
  ): Promise<CreditDeductionResult> {
    const client = await this.getClient()
    const db = client.db()
    const session = client.startSession()

    try {
      let result: CreditDeductionResult = {
        success: false,
        newCreditsBalance: 0,
        oldCreditsBalance: 0,
      }

      await session.withTransaction(async () => {
        // Find user profile with session for atomic read
        const userProfile = await db
          .collection('user_profiles')
          .findOne({ $or: [{ userId }, { email: userId }] }, { session })

        if (!userProfile) {
          throw new Error('User profile not found')
        }

        result.oldCreditsBalance = userProfile.credits_remaining || 0

        // For regenerations, handle differently
        if (isRegeneration && userProfile.subscription_tier === 'starter_spark') {
          const regenerationsUsed = (userProfile.package_details?.regenerations_used || 0) + 1
          const maxRegenerations = userProfile.package_details?.regeneration_count || 2

          if (regenerationsUsed > maxRegenerations) {
            throw new Error('Maximum regenerations exceeded')
          }

          // Update regeneration count without deducting credits
          const updateResult = await db.collection('user_profiles').updateOne(
            { _id: userProfile._id },
            {
              $set: {
                'package_details.regenerations_used': regenerationsUsed,
                last_generation_date: new Date(),
                updated_at: new Date(),
              },
              $push: {
                generation_history: {
                  date: new Date(),
                  offer_id: 'regeneration',
                  type: 'regeneration',
                  credits_used: 0,
                },
              },
            },
            { session }
          )

          if (!updateResult.acknowledged) {
            throw new Error('Failed to update regeneration count')
          }

          result.success = true
          result.newCreditsBalance = result.oldCreditsBalance
          return
        }

        // For regular credit deduction
        const newCreditsBalance = Math.max(0, result.oldCreditsBalance - amount)

        // Check if user has sufficient credits
        if (result.oldCreditsBalance < amount) {
          throw new Error('Insufficient credits')
        }

        // Update daily usage
        const today = new Date().toISOString().split('T')[0]
        const dailyUsage = userProfile.daily_usage || []
        const todayUsageIndex = dailyUsage.findIndex((usage: any) => usage.date === today)

        if (todayUsageIndex >= 0) {
          dailyUsage[todayUsageIndex].count += amount
        } else {
          dailyUsage.push({ date: today, count: amount })
        }

        // Keep only last 30 days of usage data
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]
        const filteredUsage = dailyUsage.filter((usage: any) => usage.date >= thirtyDaysAgoStr)

        // Atomic update with optimistic locking
        const updateResult = await db.collection('user_profiles').updateOne(
          {
            _id: userProfile._id,
            credits_remaining: result.oldCreditsBalance, // Optimistic lock
          },
          {
            $set: {
              credits_remaining: newCreditsBalance,
              daily_usage: filteredUsage,
              last_generation_date: new Date(),
              updated_at: new Date(),
            },
            $push: {
              generation_history: {
                date: new Date(),
                offer_id: 'generation',
                type: 'new',
                credits_used: amount,
              },
            },
            $inc: {
              total_offers_generated: amount,
            },
          },
          { session }
        )

        if (updateResult.matchedCount === 0) {
          throw new Error('Credits balance changed during operation (race condition detected)')
        }

        if (!updateResult.acknowledged) {
          throw new Error('Failed to update user profile')
        }

        result.success = true
        result.newCreditsBalance = newCreditsBalance
      })

      return result
    } catch (error) {
      return {
        success: false,
        newCreditsBalance: 0,
        oldCreditsBalance: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    } finally {
      await session.endSession()
    }
  }

  /**
   * Atomically update user subscription with credit preservation
   */
  async upgradeSubscriptionAtomic(
    userId: string,
    newTier: string,
    newCredits: number,
    packageDetails: any
  ): Promise<AtomicUpdateResult> {
    const client = await this.getClient()
    const db = client.db()
    const session = client.startSession()

    try {
      let result: AtomicUpdateResult = {
        success: false,
        modifiedCount: 0,
        upsertedCount: 0,
        matchedCount: 0,
      }

      await session.withTransaction(async () => {
        // Find current user profile
        const userProfile = await db
          .collection('user_profiles')
          .findOne({ $or: [{ userId }, { email: userId }] }, { session })

        if (!userProfile) {
          throw new Error('User profile not found')
        }

        // Calculate final credits (preserve existing credits for upgrades)
        let finalCredits = newCredits
        if (userProfile.subscription_tier === 'free' && userProfile.credits_remaining > 0) {
          finalCredits = newCredits + userProfile.credits_remaining
        }

        // Atomic update
        const updateResult = await db.collection('user_profiles').updateOne(
          { _id: userProfile._id },
          {
            $set: {
              subscription_tier: newTier,
              credits_remaining: finalCredits,
              package_details: {
                ...packageDetails,
                purchase_date: new Date(),
              },
              updated_at: new Date(),
            },
          },
          { session }
        )

        if (!updateResult.acknowledged) {
          throw new Error('Failed to update subscription')
        }

        result.success = true
        result.modifiedCount = updateResult.modifiedCount
        result.matchedCount = updateResult.matchedCount
      })

      return result
    } catch (error) {
      return {
        success: false,
        modifiedCount: 0,
        upsertedCount: 0,
        matchedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    } finally {
      await session.endSession()
    }
  }

  /**
   * Atomically create user profile with duplicate prevention
   */
  async createUserProfileAtomic(
    userId: string,
    email: string,
    initialData: Partial<UserProfileData> = {}
  ): Promise<AtomicUpdateResult> {
    const client = await this.getClient()
    const db = client.db()

    try {
      const now = new Date()
      const profileData = {
        userId,
        email,
        subscription_tier: 'free',
        credits_remaining: 3,
        total_offers_generated: 0,
        daily_generation_count: 0,
        purchased_offers_count: 0,
        daily_usage: [],
        generation_history: [],
        created_at: now,
        updated_at: now,
        ...initialData,
      }

      // Use upsert to prevent duplicates
      const result = await db.collection('user_profiles').updateOne(
        { $or: [{ userId }, { email }] },
        {
          $setOnInsert: profileData,
          $set: { updated_at: now },
        },
        { upsert: true }
      )

      return {
        success: true,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount,
        matchedCount: result.matchedCount,
      }
    } catch (error) {
      return {
        success: false,
        modifiedCount: 0,
        upsertedCount: 0,
        matchedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Atomically check and update generation limits
   */
  async checkGenerationLimitsAtomic(
    userId: string,
    isRegeneration: boolean = false
  ): Promise<{
    canGenerate: boolean
    reason?: string
    remainingCredits: number
    dailyRemaining?: number
    regenerationsRemaining?: number
  }> {
    const client = await this.getClient()
    const db = client.db()

    try {
      const userProfile = await db.collection('user_profiles').findOne({
        $or: [{ userId }, { email: userId }],
      })

      if (!userProfile) {
        return {
          canGenerate: false,
          reason: 'User profile not found',
          remainingCredits: 0,
        }
      }

      // Handle regenerations for Starter Spark
      if (isRegeneration && userProfile.subscription_tier === 'starter_spark') {
        const regenerationsUsed = userProfile.package_details?.regenerations_used || 0
        const maxRegenerations = userProfile.package_details?.regeneration_count || 2
        const remaining = Math.max(0, maxRegenerations - regenerationsUsed)

        if (remaining <= 0) {
          return {
            canGenerate: false,
            reason: 'Maximum regenerations reached',
            remainingCredits: userProfile.credits_remaining,
            regenerationsRemaining: 0,
          }
        }

        return {
          canGenerate: true,
          remainingCredits: userProfile.credits_remaining,
          regenerationsRemaining: remaining,
        }
      }

      // Free users have limits: max 3 total offers, 1 per day
      if (userProfile.subscription_tier === 'free') {
        // Check total limit
        if (userProfile.credits_remaining <= 0) {
          return {
            canGenerate: false,
            reason: 'No more free offers available',
            remainingCredits: 0,
          }
        }

        // Check daily limit
        const today = new Date().toISOString().split('T')[0]
        const todayUsage = userProfile.daily_usage?.find((usage: any) => usage.date === today)
        const todayCount = todayUsage?.count || 0

        if (todayCount >= 1) {
          return {
            canGenerate: false,
            reason: 'Daily limit reached (1 per day)',
            remainingCredits: userProfile.credits_remaining,
            dailyRemaining: 0,
          }
        }

        return {
          canGenerate: true,
          remainingCredits: userProfile.credits_remaining,
          dailyRemaining: 1 - todayCount,
        }
      }

      // Paid users can generate if they have credits
      if (userProfile.credits_remaining > 0) {
        return {
          canGenerate: true,
          remainingCredits: userProfile.credits_remaining,
        }
      }

      return {
        canGenerate: false,
        reason: 'No credits remaining',
        remainingCredits: 0,
      }
    } catch (error) {
      return {
        canGenerate: false,
        reason: 'Error checking limits',
        remainingCredits: 0,
      }
    }
  }

  /**
   * Atomically save offer with user association
   */
  async saveOfferAtomic(
    userId: string,
    offerId: string,
    offerData: any,
    metadata: any = {}
  ): Promise<AtomicUpdateResult> {
    const client = await this.getClient()
    const db = client.db()
    const session = client.startSession()

    try {
      let result: AtomicUpdateResult = {
        success: false,
        modifiedCount: 0,
        upsertedCount: 0,
        matchedCount: 0,
      }

      await session.withTransaction(async () => {
        // Save to purchased_offers collection
        const purchaseResult = await db.collection('purchased_offers').updateOne(
          { user_id: userId, offer_id: offerId },
          {
            $set: {
              user_id: userId,
              offer_id: offerId,
              offer_data: offerData,
              metadata,
              created_at: new Date(),
              updated_at: new Date(),
            },
          },
          { upsert: true, session }
        )

        // Update user profile with purchase count
        const userResult = await db.collection('user_profiles').updateOne(
          { $or: [{ userId }, { email: userId }] },
          {
            $inc: { purchased_offers_count: 1 },
            $set: { updated_at: new Date() },
          },
          { session }
        )

        if (!purchaseResult.acknowledged || !userResult.acknowledged) {
          throw new Error('Failed to save offer')
        }

        result.success = true
        result.modifiedCount = purchaseResult.modifiedCount
        result.upsertedCount = purchaseResult.upsertedCount
        result.matchedCount = purchaseResult.matchedCount
      })

      return result
    } catch (error) {
      return {
        success: false,
        modifiedCount: 0,
        upsertedCount: 0,
        matchedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    } finally {
      await session.endSession()
    }
  }
}

// Export singleton instance
export const dbAtomic = new DatabaseAtomicOperations()

// Export specific functions for backward compatibility
export const {
  deductCreditsAtomic,
  upgradeSubscriptionAtomic,
  createUserProfileAtomic,
  checkGenerationLimitsAtomic,
  saveOfferAtomic,
} = dbAtomic
