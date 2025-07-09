import { ObjectId } from 'mongodb'

// Referral Status Types
export type ReferralStatus =
  | 'pending' // Referral made, prospect not yet contacted
  | 'contacted' // Prospect has been contacted
  | 'qualified' // Prospect meets qualification criteria
  | 'converted' // Prospect became a customer
  | 'declined' // Prospect declined the offer
  | 'expired' // Referral expired without conversion

// Reward Status Types
export type RewardStatus =
  | 'pending' // Reward earned but not yet paid
  | 'processing' // Reward is being processed
  | 'paid' // Reward has been paid out
  | 'cancelled' // Reward was cancelled

// Referral Source Types
export type ReferralSource =
  | 'direct' // Direct customer referral
  | 'automated' // Automated referral request
  | 'incentivized' // Incentive-driven referral
  | 'word_of_mouth' // Natural word of mouth
  | 'social_share' // Social media sharing

// Core Referral Model
export interface Referral {
  _id: ObjectId

  // Referrer Information
  referrer_id: string // ID of customer making referral
  referrer_email: string // Email of referrer
  referrer_name: string // Name of referrer

  // Prospect Information
  prospect_email: string // Email of referred prospect
  prospect_name: string // Name of referred prospect
  prospect_phone?: string // Phone of referred prospect
  prospect_company?: string // Company of referred prospect

  // Referral Details
  referral_code: string // Unique referral tracking code
  referral_source: ReferralSource // How referral was generated
  referral_message?: string // Custom message from referrer
  status: ReferralStatus // Current referral status

  // Conversion Tracking
  lead_id?: string // ID when prospect becomes lead
  customer_id?: string // ID when prospect becomes customer
  converted_at?: Date // Date of conversion
  conversion_value?: number // Value of conversion

  // Reward Information
  reward_amount?: number // Reward amount for referrer
  reward_status?: RewardStatus // Status of reward payout
  reward_paid_at?: Date // Date reward was paid

  // Timestamps
  created_at: Date
  updated_at: Date
  expires_at?: Date // Referral expiration date

  // Metadata
  user_id: string // ID of business owner
  campaign_id?: string // Associated referral campaign
  notes?: string // Internal notes
  tags?: string[] // Referral tags
}

// Customer Success Tracking
export interface CustomerSuccess {
  _id: ObjectId

  // Customer Information
  customer_id: string // Customer identifier
  user_id: string // Business owner ID
  email: string // Customer email
  name: string // Customer name

  // Success Metrics
  satisfaction_score?: number // 1-10 satisfaction rating
  nps_score?: number // Net Promoter Score (-100 to 100)
  ltv: number // Customer Lifetime Value
  purchase_count: number // Number of purchases
  last_purchase_date?: Date // Date of last purchase

  // Engagement Metrics
  onboarding_completed: boolean // Completed onboarding process
  support_tickets: number // Number of support requests
  feature_adoption_score?: number // Product feature usage score

  // Referral Potential
  referral_likelihood?: number // Likelihood to refer (1-10)
  referrals_made: number // Number of referrals made
  successful_referrals: number // Number of converted referrals
  last_referral_date?: Date // Date of last referral

  // Communication Preferences
  email_preferences: {
    marketing: boolean
    referral_requests: boolean
    success_updates: boolean
  }

  // Timestamps
  created_at: Date
  updated_at: Date
  last_interaction_date?: Date

  // Metadata
  notes?: string
  tags?: string[]
  segment?: string // Customer segment
}

// Referral Campaign Model
export interface ReferralCampaign {
  _id: ObjectId

  // Campaign Details
  user_id: string // Business owner ID
  name: string // Campaign name
  description?: string // Campaign description
  status: 'active' | 'paused' | 'completed' | 'draft'

  // Campaign Settings
  reward_type: 'cash' | 'credit' | 'discount' | 'product' | 'custom'
  reward_amount: number // Reward amount
  reward_description?: string // Description of reward

  // Qualification Rules
  min_purchase_amount?: number // Minimum purchase for reward
  max_rewards_per_referrer?: number // Max rewards per customer
  time_limit_days?: number // Days until referral expires

  // Campaign Targeting
  target_segments?: string[] // Customer segments to target
  exclude_segments?: string[] // Segments to exclude
  min_customer_ltv?: number // Minimum LTV to participate

  // Automation Settings
  auto_request_enabled: boolean // Automatically request referrals
  auto_request_triggers: {
    after_purchase: boolean
    after_days: number
    after_satisfaction_score: number
  }

  // Templates
  referral_request_template?: string
  referral_landing_page?: string
  thank_you_template?: string

  // Performance Metrics
  metrics: {
    total_referrals: number
    successful_conversions: number
    total_reward_paid: number
    avg_conversion_rate: number
    roi: number
  }

  // Timestamps
  created_at: Date
  updated_at: Date
  start_date?: Date
  end_date?: Date
}

// Referral Activity/Event Log
export interface ReferralActivity {
  _id: ObjectId

  // Activity Details
  referral_id: string // Associated referral
  user_id: string // Business owner ID
  activity_type:
    | 'referral_created'
    | 'prospect_contacted'
    | 'prospect_qualified'
    | 'prospect_converted'
    | 'reward_earned'
    | 'reward_paid'
    | 'referral_expired'
    | 'follow_up_sent'

  // Activity Data
  description: string // Human readable description
  data?: any // Additional activity data
  performed_by?: string // Who performed the activity

  // Timestamps
  created_at: Date
}

// Referral Analytics Model
export interface ReferralAnalytics {
  _id: ObjectId

  // Period Information
  user_id: string
  period_start: Date
  period_end: Date
  period_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

  // Core Metrics
  total_referrals: number
  successful_conversions: number
  conversion_rate: number
  total_referral_revenue: number
  total_rewards_paid: number
  roi: number

  // Customer Metrics
  referring_customers: number
  avg_referrals_per_customer: number
  top_referrer_count: number

  // Lead Quality Metrics
  referral_lead_quality_score: number
  referral_vs_other_conversion_rate: number
  referral_customer_ltv: number

  // Source Breakdown
  source_breakdown: {
    [key in ReferralSource]: {
      count: number
      conversion_rate: number
      revenue: number
    }
  }

  // Campaign Performance
  campaign_performance: Array<{
    campaign_id: string
    campaign_name: string
    referrals: number
    conversions: number
    roi: number
  }>

  // Timestamps
  created_at: Date
  updated_at: Date
}

// Customer Referral Score (predictive model)
export interface CustomerReferralScore {
  _id: ObjectId

  // Customer Information
  customer_id: string
  user_id: string

  // Referral Propensity Score (0-100)
  referral_score: number
  score_factors: {
    satisfaction_level: number
    engagement_level: number
    purchase_frequency: number
    ltv_tier: number
    social_activity: number
  }

  // Recommendations
  recommended_actions: string[]
  best_time_to_ask: Date
  optimal_incentive: {
    type: string
    amount: number
  }

  // Timestamps
  calculated_at: Date
  expires_at: Date
}
