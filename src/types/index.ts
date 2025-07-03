// User and Authentication Types
export interface User {
  id: string
  email: string
  subscription_tier: 'free' | 'one_time' | 'pro'
  created_at: string
  updated_at: string
}

// Offer Generation Types
export interface OfferInput {
  businessType: string
  targetAudience: string
  currentProblems: string[]
  desiredOutcome: string
  priceRange: string
  timeframe: string
  uniqueValue: string
}

export interface OfferSection {
  id: string
  title: string
  content: string
  score: number
  explanation: string
  suggestions: string[]
  isLocked: boolean
}

export interface GeneratedOffer {
  id: string
  user_id: string
  title: string
  overall_score: number
  sections: {
    problem_analysis: OfferSection
    dream_outcome: OfferSection
    value_stack: OfferSection
    scarcity_triggers: OfferSection
    risk_reversal: OfferSection
    offer_naming: OfferSection
    bonus_section: OfferSection
  }
  created_at: string
  updated_at: string
}

// AI Generation Types
export interface GenerationProgress {
  currentStep: number
  totalSteps: number
  stepName: string
  isComplete: boolean
  error?: string
}

export interface AIResponse {
  section: string
  content: string
  score: number
  explanation: string
  suggestions: string[]
  powerWords: string[]
}

// Enhanced Mindmap Types for Grand Slam Offer Structure
export interface MindmapItem {
  id: string
  title: string
  content: string
  isEditable: boolean
  order: number
}

export interface GrandSlamComponent {
  id: string
  title: string
  description: string
  items: MindmapItem[]
  isEditable: boolean
  color: string
  order: number
}

export interface GrandSlamOfferData {
  id: string
  title: string
  components: GrandSlamComponent[]
}

// Legacy Mindmap Types (keeping for backward compatibility)
export interface MindmapNode {
  id: string
  type:
    | 'problem'
    | 'outcome'
    | 'value'
    | 'guarantee'
    | 'scarcity'
    | 'central'
    | 'parent'
    | 'component'
    | 'item'
  position: { x: number; y: number }
  data: {
    label: string
    content: string
    score?: number
    color: string
    isEditable?: boolean
    componentId?: string
    order?: number
  }
}

export interface MindmapEdge {
  id: string
  source: string
  target: string
  type: string
  animated: boolean
  style?: Record<string, any>
}

// Payment and Subscription Types
export interface PricingPlan {
  id: string
  name: string
  price: number
  billing: 'one-time' | 'monthly' | 'annual'
  features: string[]
  popular?: boolean
  cta: string
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
}

// Analytics and Tracking Types
export interface AnalyticsEvent {
  event: string
  properties: Record<string, any>
  timestamp: Date
  user_id?: string
}

export interface ConversionFunnel {
  landing_view: number
  generation_start: number
  generation_complete: number
  paywall_view: number
  upgrade_click: number
  purchase_complete: number
}

// UI Component Types
export interface LoadingState {
  isLoading: boolean
  message: string
  progress?: number
}

export interface ShareOptions {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'copy'
  content: string
  url: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface GenerationApiResponse extends ApiResponse<GeneratedOffer> {
  progress?: GenerationProgress
}

// PDF Template Types
export interface PDFTemplateData {
  id: string
  name: string
  category: 'business' | 'minimal' | 'corporate' | 'creative' | 'technical' | 'luxury'
  styles: {
    colors: {
      primary: string
      secondary: string
      accent: string
      background: string
      text: string
      muted: string
    }
    fonts: {
      primary: string
      secondary: string
      size: {
        small: number
        medium: number
        large: number
        xl: number
        xxl: number
      }
    }
    spacing: {
      xs: number
      sm: number
      md: number
      lg: number
      xl: number
    }
    borders: {
      width: number
      radius: number
      color: string
    }
  }
  components: Array<{
    id: string
    type: string
    name: string
    config: any
    order: number
  }>
}

export interface PDFTemplateSelection {
  id: string
  user_id: string
  template_id: string
  offer_id?: string
  selected_at: string
}

// Export Types
export interface ExportOptions {
  format: 'pdf' | 'mindmap' | 'powerpoint' | 'json'
  includeAnalysis: boolean
  includeSuggestions: boolean
  brandingEnabled: boolean
  templateId?: string
}

export interface ExportResult {
  url: string
  filename: string
  size: number
  expiresAt: Date
}
