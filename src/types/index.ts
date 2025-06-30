// User and Authentication Types
export interface User {
  id: string;
  email: string;
  subscription_tier: "free" | "one_time" | "pro";
  created_at: string;
  updated_at: string;
}

// Offer Generation Types
export interface OfferInput {
  businessType: string;
  targetAudience: string;
  currentProblems: string[];
  desiredOutcome: string;
  priceRange: string;
  timeframe: string;
  uniqueValue: string;
}

export interface OfferSection {
  id: string;
  title: string;
  content: string;
  score: number;
  explanation: string;
  suggestions: string[];
  isLocked: boolean;
}

export interface GeneratedOffer {
  id: string;
  user_id: string;
  title: string;
  overall_score: number;
  sections: {
    problem_analysis: OfferSection;
    dream_outcome: OfferSection;
    value_stack: OfferSection;
    scarcity_triggers: OfferSection;
    risk_reversal: OfferSection;
    offer_naming: OfferSection;
    bonus_section: OfferSection;
  };
  created_at: string;
  updated_at: string;
}

// AI Generation Types
export interface GenerationProgress {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  isComplete: boolean;
  error?: string;
}

export interface AIResponse {
  section: string;
  content: string;
  score: number;
  explanation: string;
  suggestions: string[];
  powerWords: string[];
}

// Mindmap Types
export interface MindmapNode {
  id: string;
  type: "problem" | "outcome" | "value" | "guarantee" | "scarcity" | "central";
  position: { x: number; y: number };
  data: {
    label: string;
    content: string;
    score?: number;
    color: string;
  };
}

export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
}

// Payment and Subscription Types
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billing: "one-time" | "monthly" | "annual";
  features: string[];
  popular?: boolean;
  cta: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

// Analytics and Tracking Types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  user_id?: string;
}

export interface ConversionFunnel {
  landing_view: number;
  generation_start: number;
  generation_complete: number;
  paywall_view: number;
  upgrade_click: number;
  purchase_complete: number;
}

// UI Component Types
export interface LoadingState {
  isLoading: boolean;
  message: string;
  progress?: number;
}

export interface ShareOptions {
  platform: "twitter" | "linkedin" | "facebook" | "copy";
  content: string;
  url: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerationApiResponse extends ApiResponse<GeneratedOffer> {
  progress?: GenerationProgress;
}

// Export Types
export interface ExportOptions {
  format: "pdf" | "mindmap" | "powerpoint" | "json";
  includeAnalysis: boolean;
  includeSuggestions: boolean;
  brandingEnabled: boolean;
}

export interface ExportResult {
  url: string;
  filename: string;
  size: number;
  expiresAt: Date;
}
