import { supabase } from './supabase'
import { User, AuthError } from '@supabase/supabase-js'
import { Database } from './supabase'

type UserProfile = Database['public']['Tables']['users']['Row']
type SubscriptionTier = 'free' | 'one_time' | 'pro'

export interface AuthUser extends User {
  profile?: UserProfile
}

// Authentication functions
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) throw error
    return data
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Clear any local storage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()

      // Clear cookies for this domain
      document.cookie.split(';').forEach(function (c) {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
      })
    }
  },

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) throw error
    if (!user) return null

    // Get user profile
    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

    return {
      ...user,
      profile: profile || undefined,
    }
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Check if user can generate offers
  async canUserGenerate(userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('can_user_generate', { user_uuid: userId })

    if (error) {
      console.error('Error checking generation limits:', error)
      return false
    }

    return data || false
  },

  // Upgrade user subscription
  async upgradeSubscription(userId: string, tier: SubscriptionTier) {
    const updates: Partial<UserProfile> = {
      subscription_tier: tier,
      updated_at: new Date().toISOString(),
    }

    // Add credits for one-time purchase
    if (tier === 'one_time') {
      updates.credits_remaining = 999999 // Effectively unlimited
    }

    return this.updateUserProfile(userId, updates)
  },

  // Deduct user credits
  async deductCredits(userId: string, amount: number = 1) {
    const profile = await this.getUserProfile(userId)
    if (!profile) throw new Error('User profile not found')

    const newCredits = Math.max(0, profile.credits_remaining - amount)

    return this.updateUserProfile(userId, {
      credits_remaining: newCredits,
    })
  },

  // Reset password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    if (error) throw error
  },

  // Update password
  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) throw error
  },
}

// Subscription tier helpers
export const subscriptionHelpers = {
  isFreeTier: (tier?: SubscriptionTier) => tier === 'free' || !tier,
  isOneTimeTier: (tier?: SubscriptionTier) => tier === 'one_time',
  isProTier: (tier?: SubscriptionTier) => tier === 'pro',
  isPaidTier: (tier?: SubscriptionTier) => tier === 'one_time' || tier === 'pro',

  getTierDisplayName: (tier?: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return 'Free'
      case 'one_time':
        return 'One-Time Unlock'
      case 'pro':
        return 'Pro Monthly'
      default:
        return 'Free'
    }
  },

  getTierFeatures: (tier?: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return [
          '1 free offer generation',
          'Basic 3-section output',
          'Community access',
          'Mindmap preview (blurred)',
        ]
      case 'one_time':
        return [
          'Complete current offer',
          'Full PDF export',
          'Mindmap visualization',
          'No recurring billing',
        ]
      case 'pro':
        return [
          'Unlimited generations',
          'All premium features',
          'Priority support',
          'White-label exports',
          'Advanced analytics',
        ]
      default:
        return []
    }
  },
}

// Auth state management
export const useAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    let user: AuthUser | null = null

    if (session?.user) {
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      user = {
        ...session.user,
        profile: profile || undefined,
      }
    }

    callback(user)
  })
}
