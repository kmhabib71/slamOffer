import { ObjectId } from 'mongodb'
import clientPromise from './mongodb'
import {
  Referral,
  CustomerSuccess,
  ReferralCampaign,
  ReferralActivity,
  ReferralAnalytics,
  CustomerReferralScore,
  ReferralStatus,
  RewardStatus,
  ReferralSource,
} from './models/referral'

export const referralDatabase = {
  // =======================
  // REFERRAL OPERATIONS
  // =======================

  async createReferral(
    referral: Omit<Referral, '_id' | 'created_at' | 'updated_at'>
  ): Promise<Referral> {
    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const referralData = {
      ...referral,
      created_at: now,
      updated_at: now,
    }

    const result = await db.collection('referrals').insertOne(referralData)
    return { ...referralData, _id: result.insertedId } as Referral
  },

  async getReferralById(referralId: string | ObjectId): Promise<Referral | null> {
    const client = await clientPromise
    const db = client.db()

    const referral = await db.collection('referrals').findOne({ _id: new ObjectId(referralId) })
    return referral as Referral | null
  },

  async getReferralsByUser(
    userId: string,
    filters?: {
      status?: ReferralStatus
      source?: ReferralSource
      campaign_id?: string
      date_range?: { start: Date; end: Date }
      limit?: number
      skip?: number
    }
  ): Promise<Referral[]> {
    const client = await clientPromise
    const db = client.db()

    const query: any = { user_id: userId }

    if (filters?.status) query.status = filters.status
    if (filters?.source) query.referral_source = filters.source
    if (filters?.campaign_id) query.campaign_id = filters.campaign_id
    if (filters?.date_range) {
      query.created_at = {
        $gte: filters.date_range.start,
        $lte: filters.date_range.end,
      }
    }

    const referrals = await db
      .collection('referrals')
      .find(query)
      .sort({ created_at: -1 })
      .limit(filters?.limit || 100)
      .skip(filters?.skip || 0)
      .toArray()

    return referrals as Referral[]
  },

  async updateReferral(
    referralId: string | ObjectId,
    updates: Partial<Referral>
  ): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('referrals').updateOne(
      { _id: new ObjectId(referralId) },
      {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      }
    )

    return result.modifiedCount > 0
  },

  async updateReferralStatus(
    referralId: string | ObjectId,
    status: ReferralStatus,
    additionalData?: any
  ): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const updates: any = {
      status,
      updated_at: new Date(),
      ...additionalData,
    }

    if (status === 'converted') {
      updates.converted_at = new Date()
    }

    const result = await db
      .collection('referrals')
      .updateOne({ _id: new ObjectId(referralId) }, { $set: updates })

    return result.modifiedCount > 0
  },

  async getReferralsByCode(referralCode: string): Promise<Referral | null> {
    const client = await clientPromise
    const db = client.db()

    const referral = await db.collection('referrals').findOne({ referral_code: referralCode })
    return referral as Referral | null
  },

  async getReferralsByReferrer(referrerId: string): Promise<Referral[]> {
    const client = await clientPromise
    const db = client.db()

    const referrals = await db
      .collection('referrals')
      .find({ referrer_id: referrerId })
      .sort({ created_at: -1 })
      .toArray()

    return referrals as Referral[]
  },

  // =======================
  // CUSTOMER SUCCESS OPERATIONS
  // =======================

  async createCustomerSuccess(
    customer: Omit<CustomerSuccess, '_id' | 'created_at' | 'updated_at'>
  ): Promise<CustomerSuccess> {
    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const customerData = {
      ...customer,
      created_at: now,
      updated_at: now,
    }

    const result = await db.collection('customer_success').insertOne(customerData)
    return { ...customerData, _id: result.insertedId } as CustomerSuccess
  },

  async getCustomerSuccessById(customerId: string): Promise<CustomerSuccess | null> {
    const client = await clientPromise
    const db = client.db()

    const customer = await db.collection('customer_success').findOne({ customer_id: customerId })
    return customer as CustomerSuccess | null
  },

  async updateCustomerSuccess(
    customerId: string,
    updates: Partial<CustomerSuccess>
  ): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('customer_success').updateOne(
      { customer_id: customerId },
      {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      },
      { upsert: true }
    )

    return result.acknowledged
  },

  async getHighValueCustomers(userId: string, minLtv?: number): Promise<CustomerSuccess[]> {
    const client = await clientPromise
    const db = client.db()

    const query: any = { user_id: userId }
    if (minLtv) query.ltv = { $gte: minLtv }

    const customers = await db
      .collection('customer_success')
      .find(query)
      .sort({ ltv: -1 })
      .limit(100)
      .toArray()

    return customers as CustomerSuccess[]
  },

  async getCustomersForReferralRequest(userId: string): Promise<CustomerSuccess[]> {
    const client = await clientPromise
    const db = client.db()

    const customers = await db
      .collection('customer_success')
      .find({
        user_id: userId,
        satisfaction_score: { $gte: 8 },
        'email_preferences.referral_requests': true,
        onboarding_completed: true,
      })
      .sort({ satisfaction_score: -1, ltv: -1 })
      .toArray()

    return customers as CustomerSuccess[]
  },

  // =======================
  // REFERRAL CAMPAIGN OPERATIONS
  // =======================

  async createReferralCampaign(
    campaign: Omit<ReferralCampaign, '_id' | 'created_at' | 'updated_at' | 'metrics'>
  ): Promise<ReferralCampaign> {
    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const campaignData = {
      ...campaign,
      created_at: now,
      updated_at: now,
      metrics: {
        total_referrals: 0,
        successful_conversions: 0,
        total_reward_paid: 0,
        avg_conversion_rate: 0,
        roi: 0,
      },
    }

    const result = await db.collection('referral_campaigns').insertOne(campaignData)
    return { ...campaignData, _id: result.insertedId } as ReferralCampaign
  },

  async getReferralCampaignsByUser(userId: string): Promise<ReferralCampaign[]> {
    const client = await clientPromise
    const db = client.db()

    const campaigns = await db
      .collection('referral_campaigns')
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .toArray()

    return campaigns as ReferralCampaign[]
  },

  async updateReferralCampaign(
    campaignId: string | ObjectId,
    updates: Partial<ReferralCampaign>
  ): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('referral_campaigns').updateOne(
      { _id: new ObjectId(campaignId) },
      {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      }
    )

    return result.modifiedCount > 0
  },

  async updateCampaignMetrics(campaignId: string | ObjectId): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    // Calculate metrics from referrals
    const referrals = await db
      .collection('referrals')
      .find({ campaign_id: campaignId.toString() })
      .toArray()
    const conversions = referrals.filter(r => r.status === 'converted')
    const totalRewardPaid = conversions.reduce((sum, r) => sum + (r.reward_amount || 0), 0)
    const totalRevenue = conversions.reduce((sum, r) => sum + (r.conversion_value || 0), 0)

    const metrics = {
      total_referrals: referrals.length,
      successful_conversions: conversions.length,
      total_reward_paid: totalRewardPaid,
      avg_conversion_rate: referrals.length > 0 ? conversions.length / referrals.length : 0,
      roi: totalRewardPaid > 0 ? (totalRevenue - totalRewardPaid) / totalRewardPaid : 0,
    }

    const result = await db.collection('referral_campaigns').updateOne(
      { _id: new ObjectId(campaignId) },
      {
        $set: {
          metrics,
          updated_at: new Date(),
        },
      }
    )

    return result.modifiedCount > 0
  },

  // =======================
  // REFERRAL ACTIVITY OPERATIONS
  // =======================

  async logReferralActivity(
    activity: Omit<ReferralActivity, '_id' | 'created_at'>
  ): Promise<ReferralActivity> {
    const client = await clientPromise
    const db = client.db()

    const activityData = {
      ...activity,
      created_at: new Date(),
    }

    const result = await db.collection('referral_activities').insertOne(activityData)
    return { ...activityData, _id: result.insertedId } as ReferralActivity
  },

  async getReferralActivities(referralId: string, limit: number = 50): Promise<ReferralActivity[]> {
    const client = await clientPromise
    const db = client.db()

    const activities = await db
      .collection('referral_activities')
      .find({ referral_id: referralId })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray()

    return activities as ReferralActivity[]
  },

  // =======================
  // ANALYTICS OPERATIONS
  // =======================

  async getReferralStats(userId: string): Promise<{
    total_referrals: number
    pending_referrals: number
    converted_referrals: number
    conversion_rate: number
    total_referral_revenue: number
    avg_referral_value: number
    top_referrers: Array<{
      referrer_name: string
      referrer_email: string
      referral_count: number
      conversion_count: number
    }>
  }> {
    const client = await clientPromise
    const db = client.db()

    const pipeline = [
      { $match: { user_id: userId } },
      {
        $group: {
          _id: null,
          total_referrals: { $sum: 1 },
          pending_referrals: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          converted_referrals: {
            $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] },
          },
          total_revenue: { $sum: '$conversion_value' },
          referrers: {
            $push: {
              referrer_name: '$referrer_name',
              referrer_email: '$referrer_email',
              status: '$status',
              conversion_value: '$conversion_value',
            },
          },
        },
      },
    ]

    const result = await db.collection('referrals').aggregate(pipeline).toArray()
    const stats = result[0] || {
      total_referrals: 0,
      pending_referrals: 0,
      converted_referrals: 0,
      total_revenue: 0,
      referrers: [],
    }

    // Calculate top referrers
    const referrerMap = new Map()
    stats.referrers.forEach((ref: any) => {
      const key = ref.referrer_email
      if (!referrerMap.has(key)) {
        referrerMap.set(key, {
          referrer_name: ref.referrer_name,
          referrer_email: ref.referrer_email,
          referral_count: 0,
          conversion_count: 0,
        })
      }
      const referrer = referrerMap.get(key)
      referrer.referral_count++
      if (ref.status === 'converted') {
        referrer.conversion_count++
      }
    })

    const top_referrers = Array.from(referrerMap.values())
      .sort((a, b) => b.conversion_count - a.conversion_count)
      .slice(0, 5)

    return {
      total_referrals: stats.total_referrals,
      pending_referrals: stats.pending_referrals,
      converted_referrals: stats.converted_referrals,
      conversion_rate:
        stats.total_referrals > 0 ? stats.converted_referrals / stats.total_referrals : 0,
      total_referral_revenue: stats.total_revenue || 0,
      avg_referral_value:
        stats.converted_referrals > 0 ? (stats.total_revenue || 0) / stats.converted_referrals : 0,
      top_referrers,
    }
  },

  async generateReferralCode(): Promise<string> {
    // Generate a unique 8-character referral code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // Check if code already exists
    const existing = await this.getReferralsByCode(code)
    if (existing) {
      return this.generateReferralCode() // Recursively generate new code
    }

    return code
  },

  // =======================
  // CUSTOMER REFERRAL SCORING
  // =======================

  async calculateCustomerReferralScore(customerId: string): Promise<CustomerReferralScore | null> {
    const customer = await this.getCustomerSuccessById(customerId)
    if (!customer) return null

    const client = await clientPromise
    const db = client.db()

    // Calculate score factors
    const satisfaction_level = (customer.satisfaction_score || 5) * 10 // 0-100
    const engagement_level = customer.onboarding_completed
      ? 50
      : 0 + (customer.feature_adoption_score || 0) * 50 // 0-100
    const purchase_frequency = Math.min(customer.purchase_count * 10, 100) // 0-100
    const ltv_tier = Math.min(customer.ltv / 100, 100) // Simplified LTV scoring
    const social_activity = customer.referrals_made * 20 // Previous referral activity

    // Overall referral score (weighted average)
    const referral_score = Math.round(
      satisfaction_level * 0.3 +
        engagement_level * 0.2 +
        purchase_frequency * 0.2 +
        ltv_tier * 0.2 +
        social_activity * 0.1
    )

    // Generate recommendations
    const recommended_actions = []
    if (satisfaction_level < 70) recommended_actions.push('Improve customer satisfaction first')
    if (engagement_level < 50) recommended_actions.push('Complete onboarding process')
    if (referral_score >= 70) recommended_actions.push('Send referral request immediately')
    if (referral_score >= 50 && referral_score < 70)
      recommended_actions.push('Nurture with value-add content first')

    // Calculate best time to ask (based on last interaction)
    const best_time_to_ask = new Date()
    if (customer.last_interaction_date) {
      best_time_to_ask.setTime(customer.last_interaction_date.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days after last interaction
    }

    const score: CustomerReferralScore = {
      _id: new ObjectId(),
      customer_id: customerId,
      user_id: customer.user_id,
      referral_score,
      score_factors: {
        satisfaction_level,
        engagement_level,
        purchase_frequency,
        ltv_tier,
        social_activity,
      },
      recommended_actions,
      best_time_to_ask,
      optimal_incentive: {
        type: referral_score >= 80 ? 'cash' : 'discount',
        amount: referral_score >= 80 ? 50 : 20,
      },
      calculated_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }

    // Store the score
    await db.collection('customer_referral_scores').insertOne(score)
    return score
  },

  // =======================
  // DATABASE MANAGEMENT
  // =======================

  async createIndexes(): Promise<void> {
    const client = await clientPromise
    const db = client.db()

    // Referrals indexes
    await db.collection('referrals').createIndex({ user_id: 1, created_at: -1 })
    await db.collection('referrals').createIndex({ user_id: 1, status: 1 })
    await db.collection('referrals').createIndex({ referral_code: 1 }, { unique: true })
    await db.collection('referrals').createIndex({ referrer_id: 1 })
    await db.collection('referrals').createIndex({ prospect_email: 1 })
    await db.collection('referrals').createIndex({ campaign_id: 1 })

    // Customer success indexes
    await db.collection('customer_success').createIndex({ customer_id: 1 }, { unique: true })
    await db.collection('customer_success').createIndex({ user_id: 1, ltv: -1 })
    await db.collection('customer_success').createIndex({ user_id: 1, satisfaction_score: -1 })

    // Referral campaigns indexes
    await db.collection('referral_campaigns').createIndex({ user_id: 1, created_at: -1 })
    await db.collection('referral_campaigns').createIndex({ user_id: 1, status: 1 })

    // Referral activities indexes
    await db.collection('referral_activities').createIndex({ referral_id: 1, created_at: -1 })
    await db.collection('referral_activities').createIndex({ user_id: 1, created_at: -1 })

    // Customer referral scores indexes
    await db.collection('customer_referral_scores').createIndex({ customer_id: 1 })
    await db.collection('customer_referral_scores').createIndex({ user_id: 1, referral_score: -1 })

    console.log('Referral system indexes created successfully')
  },
}
