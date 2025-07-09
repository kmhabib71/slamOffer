import { ObjectId } from 'mongodb'

export type LeadSource = 'warm' | 'cold' | 'content' | 'paid' | 'referral'
export type LeadStatus = 'hot' | 'warm' | 'cold' | 'converted' | 'lost'
export type CampaignType =
  | 'warm-outreach'
  | 'cold-outreach'
  | 'content-marketing'
  | 'paid-ads'
  | 'referral'
export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft'
export type WorkflowStatus = 'running' | 'completed' | 'failed' | 'cancelled'

export interface Lead {
  _id?: ObjectId
  user_id: string
  email: string
  first_name?: string
  last_name?: string
  company?: string
  industry?: string
  job_title?: string
  phone?: string
  linkedin_url?: string
  website?: string
  source: LeadSource
  status: LeadStatus
  score: number
  tags: string[]
  notes?: string
  last_contacted?: Date
  last_activity?: Date
  conversion_date?: Date
  estimated_value?: number
  custom_fields?: Record<string, any>
  created_at: Date
  updated_at: Date
}

export interface Campaign {
  _id?: ObjectId
  user_id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  description?: string
  n8n_workflow_id?: string
  n8n_webhook_url?: string
  target_audience?: {
    industry?: string[]
    company_size?: string[]
    job_titles?: string[]
    location?: string[]
  }
  settings: {
    email_template?: string
    follow_up_sequence?: boolean
    follow_up_interval_days?: number
    max_follow_ups?: number
    personalization_level?: 'basic' | 'medium' | 'high'
    a_b_testing?: boolean
    custom_settings?: Record<string, any>
  }
  metrics: {
    total_contacts: number
    emails_sent: number
    emails_opened: number
    emails_clicked: number
    replies_received: number
    leads_generated: number
    conversions: number
    cost_per_lead?: number
    roi?: number
  }
  budget?: {
    total_budget: number
    spent_budget: number
    cost_per_contact: number
  }
  schedule?: {
    start_date: Date
    end_date?: Date
    send_times: string[] // e.g., ['09:00', '14:00']
    send_days: number[] // 0-6 (Sunday-Saturday)
    timezone: string
  }
  created_at: Date
  updated_at: Date
}

export interface WorkflowExecution {
  _id?: ObjectId
  user_id: string
  campaign_id?: ObjectId
  workflow_type: CampaignType
  n8n_execution_id: string
  n8n_workflow_id: string
  status: WorkflowStatus
  input_data: Record<string, any>
  output_data?: Record<string, any>
  error_message?: string
  started_at: Date
  completed_at?: Date
  duration_ms?: number
  retry_count: number
  created_at: Date
}

export interface LeadActivity {
  _id?: ObjectId
  lead_id: ObjectId
  user_id: string
  campaign_id?: ObjectId
  activity_type:
    | 'email_sent'
    | 'email_opened'
    | 'email_clicked'
    | 'email_replied'
    | 'linkedin_message'
    | 'phone_call'
    | 'meeting_scheduled'
    | 'note_added'
    | 'status_changed'
  description: string
  metadata?: Record<string, any>
  created_at: Date
}

export interface LeadScore {
  _id?: ObjectId
  lead_id: ObjectId
  user_id: string
  score_type: 'fit' | 'intent' | 'engagement' | 'total'
  score_value: number
  factors: {
    company_size?: number
    industry_match?: number
    job_title_relevance?: number
    email_engagement?: number
    website_activity?: number
    social_engagement?: number
  }
  calculated_at: Date
  ai_model_version?: string
}
