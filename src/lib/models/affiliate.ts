import { ObjectId } from 'mongodb'

// Affiliate Status Types
export type AffiliateStatus =
  | 'active' // Active affiliate
  | 'pending' // Pending approval
  | 'suspended' // Temporarily suspended
  | 'terminated' // Terminated from program
  | 'inactive' // Inactive (no recent activity)

// Affiliate Tier Types
export type AffiliateTier =
  | 'bronze' // Basic tier (5% commission)
  | 'silver' // Mid-tier (7% commission)
  | 'gold' // High-tier (10% commission)
  | 'platinum' // Premium tier (12% commission)
  | 'diamond' // Elite tier (15% commission)

// Commission Status Types
export type CommissionStatus =
  | 'pending' // Commission earned but not yet approved
  | 'approved' // Commission approved for payment
  | 'paid' // Commission paid out
  | 'cancelled' // Commission cancelled
  | 'disputed' // Commission under dispute

// Payment Method Types
export type PaymentMethod =
  | 'paypal' // PayPal payment
  | 'bank_transfer' // Bank wire transfer
  | 'stripe' // Stripe payment
  | 'crypto' // Cryptocurrency payment
  | 'check' // Physical check

// Affiliate Model
export interface Affiliate {
  _id: ObjectId

  // Basic Information
  user_id: string // Business owner ID
  affiliate_id: string // Unique affiliate identifier
  first_name: string // Affiliate first name
  last_name: string // Affiliate last name
  email: string // Affiliate email
  phone?: string // Affiliate phone number

  // Profile Information
  profile: {
    company_name?: string // Company/brand name
    website?: string // Personal/company website
    bio?: string // Affiliate bio/description
    profile_image_url?: string // Profile image
    social_media: {
      twitter?: string
      linkedin?: string
      facebook?: string
      instagram?: string
      tiktok?: string
      youtube?: string
    }
    specialties: string[] // Areas of expertise
    target_audience: string // Target audience description
  }

  // Affiliate Program Details
  program_details: {
    status: AffiliateStatus // Current status
    tier: AffiliateTier // Current tier level
    join_date: Date // Date joined program
    approval_date?: Date // Date approved
    termination_date?: Date // Date terminated
    referral_code: string // Unique referral code
    custom_landing_page?: string // Custom landing page URL
  }

  // Hierarchy & Recruitment
  hierarchy: {
    sponsor_id?: string // Who recruited this affiliate
    recruitment_level: number // Level in hierarchy (1=direct, 2=sub-affiliate, etc.)
    recruited_affiliates: string[] // Affiliates they recruited
    total_downline_count: number // Total affiliates in their downline
  }

  // Commission Structure
  commission_structure: {
    base_commission_rate: number // Base commission percentage
    tier_bonus_rate: number // Additional rate based on tier
    recruitment_bonus: number // Bonus for recruiting new affiliates
    volume_bonuses: Array<{
      threshold: number // Sales volume threshold
      bonus_rate: number // Additional commission rate
    }>
    override_commissions: Array<{
      level: number // Downline level (1, 2, 3, etc.)
      commission_rate: number // Override commission rate
    }>
  }

  // Performance Metrics
  performance_metrics: {
    total_referrals: number
    total_conversions: number
    total_sales_volume: number
    conversion_rate: number
    avg_order_value: number
    lifetime_commissions_earned: number
    current_month_commissions: number
    last_month_commissions: number
    best_month_commissions: number
    current_streak_days: number
    best_streak_days: number
    last_sale_date?: Date
  }

  // Marketing Resources
  marketing_resources: {
    approved_email_templates: string[]
    approved_social_posts: string[]
    banner_ads_used: string[]
    video_testimonials: string[]
    case_studies_created: string[]
    custom_content_approved: boolean
  }

  // Payment Information
  payment_info: {
    preferred_payment_method: PaymentMethod
    payment_threshold: number // Minimum amount before payout
    payment_schedule: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly'
    payment_details: {
      paypal_email?: string
      bank_account?: string
      stripe_account_id?: string
      crypto_wallet?: string
      mailing_address?: string
    }
    tax_information: {
      tax_id?: string
      tax_form_submitted: boolean
      tax_exempt: boolean
      country: string
    }
  }

  // Agreement & Compliance
  compliance: {
    agreement_signed: boolean
    agreement_signed_date?: Date
    agreement_version: string
    compliance_training_completed: boolean
    policy_violations: number
    last_policy_review_date?: Date
    gdpr_consent: boolean
    marketing_consent: boolean
  }

  // Activity Tracking
  activity_tracking: {
    last_login_date?: Date
    total_logins: number
    emails_sent: number
    social_posts_made: number
    content_pieces_created: number
    webinars_attended: number
    training_modules_completed: string[]
  }

  // Timestamps
  created_at: Date
  updated_at: Date

  // Metadata
  notes?: string
  tags?: string[]
}

// Affiliate Commission
export interface AffiliateCommission {
  _id: ObjectId

  // Commission Details
  user_id: string // Business owner ID
  affiliate_id: string // Affiliate who earned commission
  commission_id: string // Unique commission identifier

  // Transaction Information
  transaction_details: {
    order_id: string // Related order/sale ID
    customer_email: string // Customer who made purchase
    product_name: string // Product/service purchased
    sale_amount: number // Total sale amount
    commission_rate: number // Commission rate applied
    commission_amount: number // Commission amount earned
    currency: string // Currency code
  }

  // Commission Type
  commission_type:
    | 'direct_sale' // Direct referral sale
    | 'recruitment_bonus' // Bonus for recruiting affiliate
    | 'override_commission' // Commission from downline sales
    | 'tier_bonus' // Bonus for tier achievement
    | 'volume_bonus' // Bonus for volume threshold

  // Commission Status
  status: CommissionStatus
  status_history: Array<{
    status: CommissionStatus
    date: Date
    reason?: string
    changed_by: string
  }>

  // Hierarchy Information
  hierarchy_info?: {
    sponsor_id: string // Affiliate's sponsor
    downline_level: number // Level in downline (1=direct, 2=sub, etc.)
    override_recipient: string // Who gets override commission
  }

  // Payment Information
  payment_info: {
    payment_batch_id?: string // Batch ID when paid
    payment_date?: Date // Date commission was paid
    payment_method?: PaymentMethod
    payment_reference?: string // Payment reference number
    fees_deducted?: number // Processing fees deducted
    net_payment_amount?: number // Final amount paid to affiliate
  }

  // Timestamps
  created_at: Date
  updated_at: Date
  approved_at?: Date
  paid_at?: Date

  // Metadata
  notes?: string
}

// Affiliate Recruitment
export interface AffiliateRecruitment {
  _id: ObjectId

  // Recruitment Details
  user_id: string // Business owner ID
  recruiter_id: string // Affiliate who made recruitment
  recruit_id: string // New affiliate recruited
  recruitment_id: string // Unique recruitment identifier

  // Recruitment Information
  recruitment_details: {
    recruitment_method:
      | 'email'
      | 'social_media'
      | 'personal_contact'
      | 'webinar'
      | 'content'
      | 'referral_link'
    recruitment_source: string // Where recruitment came from
    recruitment_message?: string // Custom recruitment message
    incentive_offered?: string // Incentive offered to recruit
  }

  // Status Tracking
  recruitment_status:
    | 'invited' // Invitation sent
    | 'registered' // Recruit registered
    | 'approved' // Recruit approved
    | 'active' // Recruit is active
    | 'declined' // Recruit declined
    | 'expired' // Invitation expired

  // Bonus Information
  recruitment_bonus: {
    bonus_amount: number
    bonus_paid: boolean
    bonus_payment_date?: Date
    bonus_conditions_met: boolean
    bonus_conditions: string[]
  }

  // Performance Tracking
  recruit_performance: {
    first_sale_date?: Date
    total_sales_generated: number
    commissions_earned: number
    is_active_performer: boolean
  }

  // Timestamps
  created_at: Date
  updated_at: Date
  approved_at?: Date
  activated_at?: Date

  // Metadata
  notes?: string
}

// Affiliate Payout Batch
export interface AffiliatePayoutBatch {
  _id: ObjectId

  // Batch Details
  user_id: string // Business owner ID
  batch_id: string // Unique batch identifier
  payout_period: {
    start_date: Date
    end_date: Date
    period_type: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly'
  }

  // Batch Summary
  batch_summary: {
    total_affiliates: number
    total_commissions: number
    total_payout_amount: number
    total_fees: number
    net_payout_amount: number
    currency: string
  }

  // Individual Payouts
  payouts: Array<{
    affiliate_id: string
    affiliate_name: string
    commission_ids: string[]
    gross_amount: number
    fees_deducted: number
    net_amount: number
    payment_method: PaymentMethod
    payment_status: 'pending' | 'processing' | 'completed' | 'failed'
    payment_reference?: string
    failure_reason?: string
  }>

  // Batch Status
  batch_status: 'draft' | 'approved' | 'processing' | 'completed' | 'failed'
  approval_info: {
    approved_by?: string
    approved_at?: Date
    approval_notes?: string
  }

  // Processing Information
  processing_info: {
    started_at?: Date
    completed_at?: Date
    processing_provider?: string
    processing_reference?: string
    processing_fees: number
  }

  // Timestamps
  created_at: Date
  updated_at: Date

  // Metadata
  notes?: string
}

// Affiliate Performance Report
export interface AffiliatePerformanceReport {
  _id: ObjectId

  // Report Details
  user_id: string // Business owner ID
  affiliate_id?: string // Specific affiliate (null for all)
  report_period: 'weekly' | 'monthly' | 'quarterly' | 'annual'
  period_start: Date
  period_end: Date

  // Performance Metrics
  performance_metrics: {
    total_affiliates: number
    active_affiliates: number
    new_affiliates: number
    total_referrals: number
    total_conversions: number
    total_sales_volume: number
    total_commissions_paid: number
    avg_conversion_rate: number
    avg_order_value: number
    top_performing_affiliates: Array<{
      affiliate_id: string
      name: string
      sales_volume: number
      commissions_earned: number
      conversion_rate: number
    }>
  }

  // Tier Analysis
  tier_analysis: {
    [key in AffiliateTier]: {
      affiliate_count: number
      total_sales: number
      avg_commission_rate: number
      performance_score: number
    }
  }

  // Recruitment Analysis
  recruitment_analysis: {
    new_recruitments: number
    recruitment_conversion_rate: number
    avg_downline_depth: number
    most_successful_recruiters: Array<{
      affiliate_id: string
      name: string
      recruitments_made: number
      downline_performance: number
    }>
  }

  // Financial Analysis
  financial_analysis: {
    total_program_cost: number
    revenue_generated: number
    program_roi: number
    avg_commission_per_affiliate: number
    commission_to_revenue_ratio: number
  }

  // Trends & Insights
  trends: {
    growth_rate: number
    churn_rate: number
    avg_affiliate_lifespan: number
    seasonal_patterns: Record<string, number>
    performance_trends: Record<string, number>
  }

  // Recommendations
  recommendations: {
    optimization_opportunities: string[]
    tier_advancement_candidates: string[]
    at_risk_affiliates: string[]
    recruitment_strategies: string[]
  }

  // Timestamps
  generated_at: Date

  // Metadata
  notes?: string
}

// Affiliate Marketing Material
export interface AffiliateMarketingMaterial {
  _id: ObjectId

  // Material Details
  user_id: string // Business owner ID
  material_id: string // Unique material identifier
  title: string // Material title
  description: string // Material description
  material_type:
    | 'email_template'
    | 'social_post'
    | 'banner_ad'
    | 'video'
    | 'landing_page'
    | 'case_study'
    | 'testimonial'
    | 'presentation'
    | 'infographic'

  // Content Information
  content: {
    html_content?: string // HTML content
    text_content?: string // Plain text content
    image_urls?: string[] // Associated images
    video_url?: string // Video URL
    download_url?: string // Download link
    preview_url?: string // Preview link
  }

  // Usage Tracking
  usage_stats: {
    total_downloads: number
    total_views: number
    affiliates_using: number
    performance_score: number
    last_used_date?: Date
  }

  // Approval & Compliance
  approval_status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'needs_revision'
  approval_history: Array<{
    status: string
    date: Date
    reviewer: string
    comments?: string
  }>

  // Targeting
  targeting: {
    target_tiers: AffiliateTier[]
    target_specialties: string[]
    geographic_restrictions?: string[]
    usage_restrictions?: string[]
  }

  // Performance Metrics
  performance_metrics: {
    click_through_rate?: number
    conversion_rate?: number
    engagement_rate?: number
    sales_attributed: number
    roi: number
  }

  // Timestamps
  created_at: Date
  updated_at: Date
  published_at?: Date

  // Metadata
  tags?: string[]
  notes?: string
}
