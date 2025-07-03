import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Database Types (matching our actual schema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          subscription_tier: 'free' | 'one_time' | 'pro'
          credits_remaining: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          subscription_tier?: 'free' | 'one_time' | 'pro'
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscription_tier?: 'free' | 'one_time' | 'pro'
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          user_id: string
          title: string
          status: 'draft' | 'completed' | 'archived'
          input_data: any
          generated_content: any
          overall_score: number
          sections: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          status?: 'draft' | 'completed' | 'archived'
          input_data: any
          generated_content?: any
          overall_score?: number
          sections?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          status?: 'draft' | 'completed' | 'archived'
          input_data?: any
          generated_content?: any
          overall_score?: number
          sections?: any
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          event_name: string
          properties: any
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_name: string
          properties?: any
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_name?: string
          properties?: any
          session_id?: string | null
          created_at?: string
        }
      }
      user_generations: {
        Row: {
          id: string
          user_id: string
          offer_id: string
          generation_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          offer_id: string
          generation_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          offer_id?: string
          generation_type?: string
          created_at?: string
        }
      }
      shares: {
        Row: {
          id: string
          user_id: string
          offer_id: string | null
          platform: string
          shared_url: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          offer_id?: string | null
          platform: string
          shared_url: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          offer_id?: string | null
          platform?: string
          shared_url?: string
          created_at?: string
        }
      }
    }
    Functions: {
      can_user_generate: {
        Args: {
          user_uuid: string
        }
        Returns: boolean
      }
    }
  }
}
