import { ObjectId } from 'mongodb'
import clientPromise from './mongodb'
import {
  Affiliate,
  AffiliateCommission,
  AffiliateRecruitment,
  AffiliatePayoutBatch,
  AffiliatePerformanceReport,
  AffiliateMarketingMaterial,
  AffiliateStatus,
  AffiliateTier,
  CommissionStatus,
  PaymentMethod,
} from './models/affiliate'

export const affiliateDatabase = {
  // =======================
  // AFFILIATE OPERATIONS
  // =======================

  async createAffiliate(
    affiliate: Omit<Affiliate, '_id' | 'created_at' | 'updated_at'>
  ): Promise<Affiliate> {
    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const affiliateData = {
      ...affiliate,
      created_at: now,
      updated_at: now,
      performance_metrics: {
        total_referrals: 0,
        total_conversions: 0,
        total_sales_volume: 0,
        conversion_rate: 0,
        avg_order_value: 0,
        lifetime_commissions_earned: 0,
        current_month_commissions: 0,
        last_month_commissions: 0,
        best_month_commissions: 0,
        current_streak_days: 0,
        best_streak_days: 0,
        ...affiliate.performance_metrics,
      },
    }

    const result = await db.collection('affiliates').insertOne(affiliateData)
    return { ...affiliateData, _id: result.insertedId } as Affiliate
  },

  async getAffiliateById(affiliateId: string): Promise<Affiliate | null> {
    const client = await clientPromise
    const db = client.db()

    const affiliate = await db.collection('affiliates').findOne({ affiliate_id: affiliateId })
    return affiliate as Affiliate | null
  },

  async getAffiliatesByUser(
    userId: string,
    filters?: {
      status?: AffiliateStatus
      tier?: AffiliateTier
      sponsor_id?: string
      limit?: number
      skip?: number
    }
  ): Promise<Affiliate[]> {
    const client = await clientPromise
    const db = client.db()

    const query: any = { user_id: userId }
    if (filters?.status) query['program_details.status'] = filters.status
    if (filters?.tier) query['program_details.tier'] = filters.tier
    if (filters?.sponsor_id) query['hierarchy.sponsor_id'] = filters.sponsor_id

    const affiliates = await db
      .collection('affiliates')
      .find(query)
      .sort({ 'performance_metrics.lifetime_commissions_earned': -1 })
      .limit(filters?.limit || 100)
      .skip(filters?.skip || 0)
      .toArray()

    return affiliates as Affiliate[]
  },

  async updateAffiliate(affiliateId: string, updates: Partial<Affiliate>): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('affiliates').updateOne(
      { affiliate_id: affiliateId },
      {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      }
    )

    return result.modifiedCount > 0
  },

  async generateAffiliateCode(): Promise<string> {
    // Generate a unique 8-character affiliate code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'AFF'
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // Check if code already exists
    const existing = await this.getAffiliateByCode(code)
    if (existing) {
      return this.generateAffiliateCode() // Recursively generate new code
    }

    return code
  },

  async getAffiliateByCode(referralCode: string): Promise<Affiliate | null> {
    const client = await clientPromise
    const db = client.db()

    const affiliate = await db.collection('affiliates').findOne({
      'program_details.referral_code': referralCode,
    })
    return affiliate as Affiliate | null
  },

  async getTopPerformingAffiliates(userId: string, limit: number = 10): Promise<Affiliate[]> {
    const client = await clientPromise
    const db = client.db()

    const affiliates = await db
      .collection('affiliates')
      .find({
        user_id: userId,
        'program_details.status': 'active',
      })
      .sort({
        'performance_metrics.lifetime_commissions_earned': -1,
        'performance_metrics.total_sales_volume': -1,
      })
      .limit(limit)
      .toArray()

    return affiliates as Affiliate[]
  },

  // =======================
  // COMMISSION OPERATIONS
  // =======================

  async createCommission(
    commission: Omit<AffiliateCommission, '_id' | 'created_at' | 'updated_at'>
  ): Promise<AffiliateCommission> {
    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const commissionData = {
      ...commission,
      created_at: now,
      updated_at: now,
      status_history: [
        {
          status: commission.status,
          date: now,
          changed_by: 'system',
        },
      ],
    }

    const result = await db.collection('affiliate_commissions').insertOne(commissionData)

    // Update affiliate performance metrics
    await this.updateAffiliatePerformance(commission.affiliate_id, {
      commission_amount: commission.transaction_details.commission_amount,
      sale_amount: commission.transaction_details.sale_amount,
    })

    return { ...commissionData, _id: result.insertedId } as AffiliateCommission
  },

  async getCommissionsByAffiliate(
    affiliateId: string,
    filters?: {
      status?: CommissionStatus
      date_range?: { start: Date; end: Date }
      limit?: number
    }
  ): Promise<AffiliateCommission[]> {
    const client = await clientPromise
    const db = client.db()

    const query: any = { affiliate_id: affiliateId }
    if (filters?.status) query.status = filters.status
    if (filters?.date_range) {
      query.created_at = {
        $gte: filters.date_range.start,
        $lte: filters.date_range.end,
      }
    }

    const commissions = await db
      .collection('affiliate_commissions')
      .find(query)
      .sort({ created_at: -1 })
      .limit(filters?.limit || 100)
      .toArray()

    return commissions as AffiliateCommission[]
  },

  async updateCommissionStatus(
    commissionId: string,
    status: CommissionStatus,
    changedBy: string,
    reason?: string
  ): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('affiliate_commissions').updateOne(
      { commission_id: commissionId },
      {
        $set: {
          status,
          updated_at: new Date(),
          ...(status === 'approved' && { approved_at: new Date() }),
          ...(status === 'paid' && { paid_at: new Date() }),
        },
        $push: {
          status_history: {
            status,
            date: new Date(),
            changed_by: changedBy,
            reason,
          },
        },
      }
    )

    return result.modifiedCount > 0
  },

  async updateAffiliatePerformance(
    affiliateId: string,
    metrics: { commission_amount: number; sale_amount: number }
  ): Promise<void> {
    const client = await clientPromise
    const db = client.db()

    await db.collection('affiliates').updateOne(
      { affiliate_id: affiliateId },
      {
        $inc: {
          'performance_metrics.total_conversions': 1,
          'performance_metrics.total_sales_volume': metrics.sale_amount,
          'performance_metrics.lifetime_commissions_earned': metrics.commission_amount,
          'performance_metrics.current_month_commissions': metrics.commission_amount,
        },
        $set: {
          'performance_metrics.last_sale_date': new Date(),
          updated_at: new Date(),
        },
      }
    )

    // Recalculate conversion rate and average order value
    const affiliate = await this.getAffiliateById(affiliateId)
    if (affiliate) {
      const conversionRate =
        affiliate.performance_metrics.total_referrals > 0
          ? affiliate.performance_metrics.total_conversions /
            affiliate.performance_metrics.total_referrals
          : 0

      const avgOrderValue =
        affiliate.performance_metrics.total_conversions > 0
          ? affiliate.performance_metrics.total_sales_volume /
            affiliate.performance_metrics.total_conversions
          : 0

      await db.collection('affiliates').updateOne(
        { affiliate_id: affiliateId },
        {
          $set: {
            'performance_metrics.conversion_rate': conversionRate,
            'performance_metrics.avg_order_value': avgOrderValue,
          },
        }
      )
    }
  },

  // =======================
  // RECRUITMENT OPERATIONS
  // =======================

  async createRecruitment(
    recruitment: Omit<AffiliateRecruitment, '_id' | 'created_at' | 'updated_at'>
  ): Promise<AffiliateRecruitment> {
    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const recruitmentData = {
      ...recruitment,
      created_at: now,
      updated_at: now,
    }

    const result = await db.collection('affiliate_recruitments').insertOne(recruitmentData)

    // Update recruiter's downline count
    await db.collection('affiliates').updateOne(
      { affiliate_id: recruitment.recruiter_id },
      {
        $addToSet: { 'hierarchy.recruited_affiliates': recruitment.recruit_id },
        $inc: { 'hierarchy.total_downline_count': 1 },
      }
    )

    return { ...recruitmentData, _id: result.insertedId } as AffiliateRecruitment
  },

  async getRecruitmentsByRecruiter(recruiterId: string): Promise<AffiliateRecruitment[]> {
    const client = await clientPromise
    const db = client.db()

    const recruitments = await db
      .collection('affiliate_recruitments')
      .find({ recruiter_id: recruiterId })
      .sort({ created_at: -1 })
      .toArray()

    return recruitments as AffiliateRecruitment[]
  },

  async updateRecruitmentStatus(
    recruitmentId: string,
    status: AffiliateRecruitment['recruitment_status']
  ): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const updates: any = {
      recruitment_status: status,
      updated_at: new Date(),
    }

    if (status === 'approved') {
      updates.approved_at = new Date()
    }
    if (status === 'active') {
      updates.activated_at = new Date()
    }

    const result = await db
      .collection('affiliate_recruitments')
      .updateOne({ recruitment_id: recruitmentId }, { $set: updates })

    return result.modifiedCount > 0
  },

  // =======================
  // PAYOUT OPERATIONS
  // =======================

  async createPayoutBatch(
    batch: Omit<AffiliatePayoutBatch, '_id' | 'created_at' | 'updated_at'>
  ): Promise<AffiliatePayoutBatch> {
    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const batchData = {
      ...batch,
      created_at: now,
      updated_at: now,
    }

    const result = await db.collection('affiliate_payout_batches').insertOne(batchData)
    return { ...batchData, _id: result.insertedId } as AffiliatePayoutBatch
  },

  async generatePayoutBatch(
    userId: string,
    periodStart: Date,
    periodEnd: Date,
    periodType: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly'
  ): Promise<AffiliatePayoutBatch> {
    const client = await clientPromise
    const db = client.db()

    // Get all approved commissions in the period
    const commissions = await db
      .collection('affiliate_commissions')
      .find({
        user_id: userId,
        status: 'approved',
        created_at: {
          $gte: periodStart,
          $lte: periodEnd,
        },
      })
      .toArray()

    // Group by affiliate
    const payoutMap = new Map()
    let totalAmount = 0

    for (const commission of commissions) {
      const affiliateId = commission.affiliate_id
      if (!payoutMap.has(affiliateId)) {
        const affiliate = await this.getAffiliateById(affiliateId)
        payoutMap.set(affiliateId, {
          affiliate_id: affiliateId,
          affiliate_name: affiliate ? `${affiliate.first_name} ${affiliate.last_name}` : 'Unknown',
          commission_ids: [],
          gross_amount: 0,
          fees_deducted: 0,
          net_amount: 0,
          payment_method: affiliate?.payment_info.preferred_payment_method || 'paypal',
          payment_status: 'pending' as const,
        })
      }

      const payout = payoutMap.get(affiliateId)
      payout.commission_ids.push(commission.commission_id)
      payout.gross_amount += commission.transaction_details.commission_amount
      totalAmount += commission.transaction_details.commission_amount
    }

    // Calculate fees and net amounts
    const payouts = Array.from(payoutMap.values()).map(payout => {
      payout.fees_deducted = payout.gross_amount * 0.03 // 3% processing fee
      payout.net_amount = payout.gross_amount - payout.fees_deducted
      return payout
    })

    const batchId = `BATCH_${Date.now()}`
    const batch = await this.createPayoutBatch({
      user_id: userId,
      batch_id: batchId,
      payout_period: {
        start_date: periodStart,
        end_date: periodEnd,
        period_type: periodType,
      },
      batch_summary: {
        total_affiliates: payouts.length,
        total_commissions: commissions.length,
        total_payout_amount: totalAmount,
        total_fees: payouts.reduce((sum, p) => sum + p.fees_deducted, 0),
        net_payout_amount: payouts.reduce((sum, p) => sum + p.net_amount, 0),
        currency: 'USD',
      },
      payouts,
      batch_status: 'draft',
      approval_info: {},
      processing_info: {
        processing_fees: 0,
      },
    })

    return batch
  },

  // =======================
  // ANALYTICS OPERATIONS
  // =======================

  async getAffiliateStats(userId: string): Promise<{
    total_affiliates: number
    active_affiliates: number
    total_sales_volume: number
    total_commissions_paid: number
    avg_conversion_rate: number
    top_performers: Array<{
      affiliate_id: string
      name: string
      sales_volume: number
      commissions_earned: number
      conversion_rate: number
    }>
  }> {
    const client = await clientPromise
    const db = client.db()

    const affiliates = await this.getAffiliatesByUser(userId)
    const activeAffiliates = affiliates.filter(a => a.program_details.status === 'active')

    const totalSalesVolume = affiliates.reduce(
      (sum, a) => sum + a.performance_metrics.total_sales_volume,
      0
    )
    const totalCommissionsPaid = affiliates.reduce(
      (sum, a) => sum + a.performance_metrics.lifetime_commissions_earned,
      0
    )
    const avgConversionRate =
      affiliates.reduce((sum, a) => sum + a.performance_metrics.conversion_rate, 0) /
        affiliates.length || 0

    const topPerformers = affiliates
      .sort(
        (a, b) =>
          b.performance_metrics.total_sales_volume - a.performance_metrics.total_sales_volume
      )
      .slice(0, 5)
      .map(a => ({
        affiliate_id: a.affiliate_id,
        name: `${a.first_name} ${a.last_name}`,
        sales_volume: a.performance_metrics.total_sales_volume,
        commissions_earned: a.performance_metrics.lifetime_commissions_earned,
        conversion_rate: a.performance_metrics.conversion_rate,
      }))

    return {
      total_affiliates: affiliates.length,
      active_affiliates: activeAffiliates.length,
      total_sales_volume: totalSalesVolume,
      total_commissions_paid: totalCommissionsPaid,
      avg_conversion_rate: avgConversionRate,
      top_performers: topPerformers,
    }
  },

  async calculateTierUpgrades(userId: string): Promise<
    Array<{
      affiliate_id: string
      current_tier: AffiliateTier
      recommended_tier: AffiliateTier
      performance_score: number
    }>
  > {
    const affiliates = await this.getAffiliatesByUser(userId, { status: 'active' })
    const upgrades = []

    for (const affiliate of affiliates) {
      const performance = affiliate.performance_metrics
      let recommendedTier: AffiliateTier = affiliate.program_details.tier

      // Calculate performance score
      const performanceScore =
        performance.total_sales_volume * 0.4 +
        performance.conversion_rate * 100 * 0.3 +
        performance.lifetime_commissions_earned * 0.2 +
        affiliate.hierarchy.total_downline_count * 50 * 0.1

      // Determine recommended tier based on performance
      if (performanceScore >= 10000) recommendedTier = 'diamond'
      else if (performanceScore >= 7500) recommendedTier = 'platinum'
      else if (performanceScore >= 5000) recommendedTier = 'gold'
      else if (performanceScore >= 2500) recommendedTier = 'silver'
      else recommendedTier = 'bronze'

      if (recommendedTier !== affiliate.program_details.tier) {
        upgrades.push({
          affiliate_id: affiliate.affiliate_id,
          current_tier: affiliate.program_details.tier,
          recommended_tier: recommendedTier,
          performance_score: performanceScore,
        })
      }
    }

    return upgrades
  },

  // =======================
  // MARKETING MATERIAL OPERATIONS
  // =======================

  async createMarketingMaterial(
    material: Omit<AffiliateMarketingMaterial, '_id' | 'created_at' | 'updated_at'>
  ): Promise<AffiliateMarketingMaterial> {
    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const materialData = {
      ...material,
      created_at: now,
      updated_at: now,
      usage_stats: {
        total_downloads: 0,
        total_views: 0,
        affiliates_using: 0,
        performance_score: 0,
      },
      performance_metrics: {
        click_through_rate: 0,
        conversion_rate: 0,
        engagement_rate: 0,
        sales_attributed: 0,
        roi: 0,
      },
    }

    const result = await db.collection('affiliate_marketing_materials').insertOne(materialData)
    return { ...materialData, _id: result.insertedId } as AffiliateMarketingMaterial
  },

  async getMarketingMaterialsByUser(userId: string): Promise<AffiliateMarketingMaterial[]> {
    const client = await clientPromise
    const db = client.db()

    const materials = await db
      .collection('affiliate_marketing_materials')
      .find({
        user_id: userId,
        approval_status: 'approved',
      })
      .sort({ created_at: -1 })
      .toArray()

    return materials as AffiliateMarketingMaterial[]
  },

  // =======================
  // DATABASE MANAGEMENT
  // =======================

  async createIndexes(): Promise<void> {
    const client = await clientPromise
    const db = client.db()

    // Affiliate indexes
    await db.collection('affiliates').createIndex({ user_id: 1, affiliate_id: 1 }, { unique: true })
    await db.collection('affiliates').createIndex({ user_id: 1, 'program_details.status': 1 })
    await db
      .collection('affiliates')
      .createIndex({ 'program_details.referral_code': 1 }, { unique: true })
    await db.collection('affiliates').createIndex({ 'hierarchy.sponsor_id': 1 })
    await db
      .collection('affiliates')
      .createIndex({ 'performance_metrics.lifetime_commissions_earned': -1 })

    // Commission indexes
    await db.collection('affiliate_commissions').createIndex({ affiliate_id: 1, created_at: -1 })
    await db.collection('affiliate_commissions').createIndex({ user_id: 1, status: 1 })
    await db.collection('affiliate_commissions').createIndex({ commission_id: 1 }, { unique: true })

    // Recruitment indexes
    await db.collection('affiliate_recruitments').createIndex({ recruiter_id: 1, created_at: -1 })
    await db.collection('affiliate_recruitments').createIndex({ recruit_id: 1 })
    await db
      .collection('affiliate_recruitments')
      .createIndex({ recruitment_id: 1 }, { unique: true })

    // Payout batch indexes
    await db.collection('affiliate_payout_batches').createIndex({ user_id: 1, created_at: -1 })
    await db.collection('affiliate_payout_batches').createIndex({ batch_id: 1 }, { unique: true })

    // Marketing material indexes
    await db
      .collection('affiliate_marketing_materials')
      .createIndex({ user_id: 1, approval_status: 1 })
    await db
      .collection('affiliate_marketing_materials')
      .createIndex({ material_id: 1 }, { unique: true })

    console.log('Affiliate system indexes created successfully')
  },
}
