'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthUser, authService } from '@/lib/auth'
import { identifyUser } from '@/lib/posthog'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isInitialized: boolean
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
  const [isInitialized, setIsInitialized] = useState(false)

  const refreshUser = async () => {
    setLoading(true)
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)

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
    } finally {
      setLoading(false)
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
    let mounted = true

    // Initial session check
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (mounted) {
          if (session) {
            await refreshUser()
          } else {
            setUser(null)
            setLoading(false)
          }
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('Error during auth initialization:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
          setIsInitialized(true)
        }
      }
    }

    initializeAuth()

    // Set up auth state listener
    const subscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await refreshUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.data.subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,
    isInitialized,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
