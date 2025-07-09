import { ObjectId } from 'mongodb'

// Agency Status Types
export type AgencyStatus =
  | 'active' // Currently active partnership
  | 'pending' // Partnership pending approval
  | 'suspended' // Temporarily suspended
  | 'terminated' // Partnership terminated
  | 'under_review' // Under performance review

// Agency Tier Types
export type AgencyTier =
  | 'bronze' // Basic tier
  | 'silver' // Mid-tier
  | 'gold' // High-tier
  | 'platinum' // Premium tier
  | 'diamond' // Highest tier

// Agency Specialization Types
export type AgencySpecialization =
  | 'lead_generation' // Specialized in lead generation
  | 'appointment_setting' // Specialized in appointment setting
  | 'cold_calling' // Specialized in cold calling
  | 'email_marketing' // Specialized in email marketing
  | 'social_media' // Specialized in social media
  | 'content_marketing' // Specialized in content marketing
  | 'paid_advertising' // Specialized in paid ads
  | 'full_service' // Full service marketing

// Agency Model
export interface Agency {
  _id: ObjectId

  // Basic Information
  user_id: string // Business owner ID
  agency_id: string // Unique agency identifier
  agency_name: string // Agency name
  contact_person: string // Primary contact person
  email: string // Agency email
  phone?: string // Agency phone number
  website?: string // Agency website

  // Business Details
  company_size: string // Small, Medium, Large, Enterprise
  years_in_business: number // Years in operation
  specializations: AgencySpecialization[] // What they specialize in
  geographic_coverage: string[] // Geographic areas they cover

  // Partnership Details
  status: AgencyStatus // Current partnership status
  tier: AgencyTier // Agency tier level
  partnership_start_date: Date // When partnership started
  partnership_end_date?: Date // When partnership ended

  // Performance Metrics
  performance_metrics: {
    total_leads_delivered: number
    total_qualified_leads: number
    total_conversions: number
    avg_lead_quality_score: number
    avg_response_time_hours: number
    on_time_delivery_rate: number
    client_satisfaction_score: number
    cost_per_lead: number
    cost_per_acquisition: number
  }

  // Contract & Pricing
  contract_terms: {
    contract_duration_months: number
    renewal_date?: Date
    pricing_model: 'per_lead' | 'retainer' | 'commission' | 'hybrid'
    base_rate?: number
    commission_rate?: number
    minimum_monthly_spend?: number
    maximum_monthly_spend?: number
  }

  // Service Configuration
  service_config: {
    lead_targets: {
      monthly_target: number
      weekly_target: number
      daily_target: number
    }
    quality_requirements: {
      minimum_lead_score: number
      required_lead_fields: string[]
      lead_verification_required: boolean
    }
    communication_preferences: {
      reporting_frequency: 'daily' | 'weekly' | 'monthly'
      preferred_contact_method: 'email' | 'phone' | 'slack' | 'teams'
      status_update_frequency: 'realtime' | 'daily' | 'weekly'
    }
  }

  // Financial Tracking
  financial_metrics: {
    total_amount_paid: number
    current_month_spend: number
    average_monthly_spend: number
    outstanding_balance: number
    last_payment_date?: Date
    next_payment_due_date?: Date
  }

  // Team Information
  team_info: {
    account_manager: string
    account_manager_email: string
    account_manager_phone?: string
    team_size: number
    team_lead_names: string[]
    time_zone: string
  }

  // Compliance & Certifications
  compliance_info: {
    certifications: string[]
    compliance_standards: string[]
    data_privacy_compliant: boolean
    gdpr_compliant: boolean
    industry_certifications: string[]
  }

  // Integration & Tools
  integration_config: {
    crm_integration: boolean
    api_access_enabled: boolean
    webhook_url?: string
    reporting_dashboard_access: boolean
    custom_integrations: string[]
  }

  // Timestamps
  created_at: Date
  updated_at: Date
  last_activity_date?: Date

  // Metadata
  notes?: string
  tags?: string[]
}

// Agency Lead Delivery
export interface AgencyLeadDelivery {
  _id: ObjectId

  // Delivery Details
  user_id: string // Business owner ID
  agency_id: string // Agency identifier
  delivery_batch_id: string // Batch identifier

  // Lead Information
  leads_delivered: Array<{
    lead_id: string
    prospect_name: string
    prospect_email: string
    prospect_phone?: string
    prospect_company?: string
    lead_score: number
    lead_source: string
    lead_method: string
    custom_fields?: Record<string, any>
  }>

  // Delivery Metrics
  delivery_stats: {
    total_leads_in_batch: number
    delivered_on_time: boolean
    delivery_timestamp: Date
    expected_delivery_date: Date
    quality_score: number
    rejection_rate: number
    acceptance_rate: number
  }

  // Validation Results
  validation_results: {
    leads_validated: number
    leads_rejected: number
    validation_timestamp: Date
    rejection_reasons: Array<{
      lead_id: string
      reason: string
      details: string
    }>
  }

  // Payment Information
  payment_info: {
    cost_per_lead: number
    total_cost: number
    payment_status: 'pending' | 'approved' | 'paid' | 'disputed'
    invoice_id?: string
    payment_date?: Date
  }

  // Timestamps
  created_at: Date
  updated_at: Date

  // Metadata
  notes?: string
}

// Agency Performance Report
export interface AgencyPerformanceReport {
  _id: ObjectId

  // Report Details
  user_id: string // Business owner ID
  agency_id: string // Agency identifier
  report_period: 'weekly' | 'monthly' | 'quarterly' | 'annual'
  period_start: Date
  period_end: Date

  // Lead Generation Metrics
  lead_metrics: {
    total_leads_delivered: number
    qualified_leads: number
    rejected_leads: number
    avg_lead_quality_score: number
    lead_acceptance_rate: number
    leads_by_source: Record<string, number>
    leads_by_method: Record<string, number>
  }

  // Conversion Metrics
  conversion_metrics: {
    total_conversions: number
    conversion_rate: number
    avg_time_to_conversion: number
    conversion_value: number
    roi: number
  }

  // Quality Metrics
  quality_metrics: {
    avg_lead_score: number
    data_accuracy_rate: number
    lead_verification_rate: number
    client_satisfaction_score: number
    complaint_count: number
  }

  // Delivery Metrics
  delivery_metrics: {
    on_time_delivery_rate: number
    avg_delivery_time_hours: number
    delivery_consistency_score: number
    communication_responsiveness: number
  }

  // Financial Metrics
  financial_metrics: {
    total_cost: number
    cost_per_lead: number
    cost_per_qualified_lead: number
    cost_per_conversion: number
    budget_utilization_rate: number
  }

  // Comparative Analysis
  comparative_analysis: {
    vs_previous_period: {
      lead_growth_rate: number
      quality_improvement: number
      cost_efficiency_change: number
    }
    vs_other_agencies: {
      performance_ranking: number
      total_agencies_compared: number
      performance_percentile: number
    }
  }

  // Recommendations
  recommendations: {
    improvement_areas: string[]
    optimization_suggestions: string[]
    contract_recommendations: string[]
    tier_change_suggestion?: AgencyTier
  }

  // Timestamps
  generated_at: Date

  // Metadata
  notes?: string
}

// Agency Communication Log
export interface AgencyCommunicationLog {
  _id: ObjectId

  // Communication Details
  user_id: string // Business owner ID
  agency_id: string // Agency identifier
  communication_type:
    | 'email'
    | 'phone_call'
    | 'meeting'
    | 'slack_message'
    | 'status_update'
    | 'issue_report'
    | 'feedback'

  // Message Information
  subject: string
  message_content: string
  sender: string
  recipient: string

  // Status and Priority
  status: 'sent' | 'received' | 'read' | 'replied' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'urgent'

  // Follow-up Information
  follow_up_required: boolean
  follow_up_date?: Date
  follow_up_completed?: boolean

  // Attachments
  attachments?: Array<{
    filename: string
    file_url: string
    file_type: string
    file_size: number
  }>

  // Timestamps
  created_at: Date
  updated_at: Date

  // Metadata
  tags?: string[]
}

// Agency Contract
export interface AgencyContract {
  _id: ObjectId

  // Contract Details
  user_id: string // Business owner ID
  agency_id: string // Agency identifier
  contract_id: string // Unique contract identifier
  contract_type: 'initial' | 'renewal' | 'amendment' | 'termination'

  // Contract Terms
  contract_terms: {
    start_date: Date
    end_date: Date
    duration_months: number
    auto_renewal: boolean
    termination_notice_days: number
  }

  // Service Level Agreement
  sla_terms: {
    minimum_leads_per_month: number
    maximum_leads_per_month: number
    lead_quality_threshold: number
    response_time_hours: number
    uptime_guarantee: number
    penalty_clauses: Array<{
      violation_type: string
      penalty_amount: number
      penalty_description: string
    }>
  }

  // Pricing Structure
  pricing_structure: {
    pricing_model: 'per_lead' | 'retainer' | 'commission' | 'hybrid'
    base_rate?: number
    commission_rate?: number
    volume_discounts?: Array<{
      threshold: number
      discount_rate: number
    }>
    additional_fees?: Array<{
      fee_type: string
      amount: number
      description: string
    }>
  }

  // Performance Metrics
  performance_requirements: {
    minimum_conversion_rate: number
    minimum_lead_quality_score: number
    maximum_cost_per_lead: number
    client_satisfaction_minimum: number
  }

  // Legal Terms
  legal_terms: {
    liability_limit: number
    confidentiality_agreement: boolean
    data_protection_terms: boolean
    intellectual_property_terms: boolean
    dispute_resolution_method: string
  }

  // Contract Status
  status: 'draft' | 'pending_approval' | 'active' | 'expired' | 'terminated'
  signed_by_client: boolean
  signed_by_agency: boolean
  client_signature_date?: Date
  agency_signature_date?: Date

  // Timestamps
  created_at: Date
  updated_at: Date

  // Metadata
  notes?: string
  attachments?: string[]
}

// Agency Invoice
export interface AgencyInvoice {
  _id: ObjectId

  // Invoice Details
  user_id: string // Business owner ID
  agency_id: string // Agency identifier
  invoice_id: string // Unique invoice identifier
  invoice_date: Date
  due_date: Date

  // Billing Period
  billing_period: {
    start_date: Date
    end_date: Date
    period_type: 'monthly' | 'quarterly' | 'annual'
  }

  // Line Items
  line_items: Array<{
    description: string
    quantity: number
    unit_price: number
    total_price: number
    lead_batch_id?: string
  }>

  // Financial Summary
  financial_summary: {
    subtotal: number
    taxes: number
    discounts: number
    total_amount: number
    currency: string
  }

  // Payment Information
  payment_info: {
    payment_status: 'pending' | 'paid' | 'overdue' | 'cancelled'
    payment_method?: string
    payment_date?: Date
    payment_reference?: string
    late_fees?: number
  }

  // Timestamps
  created_at: Date
  updated_at: Date

  // Metadata
  notes?: string
}
