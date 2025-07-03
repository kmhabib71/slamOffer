'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthUser, authService, useAuthStateChange } from '@/lib/auth'
import { identifyUser } from '@/lib/posthog'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)

      // Identify user in PostHog if they exist
      if (currentUser) {
        identifyUser(currentUser.id, {
          email: currentUser.email,
          subscription_tier: currentUser.profile?.subscription_tier,
          credits_remaining: currentUser.profile?.credits_remaining,
        })
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    // Initial user fetch
    refreshUser().finally(() => setLoading(false))

    // Listen for auth state changes
    const {
      data: { subscription },
    } = useAuthStateChange(authUser => {
      setUser(authUser)
      setLoading(false)

      // Identify user in PostHog
      if (authUser) {
        identifyUser(authUser.id, {
          email: authUser.email,
          subscription_tier: authUser.profile?.subscription_tier,
          credits_remaining: authUser.profile?.credits_remaining,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
