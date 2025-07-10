'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { identifyUser } from '@/lib/posthog'
import { UserProfile } from '@/lib/auth-types'

interface User {
  _id: string
  email: string
  name?: string
  image?: string
  role?: 'user' | 'admin'
  profile?: UserProfile
}

interface AuthContextType {
  user: User | null
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
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const refreshUser = async () => {
    if (!session?.user?.email) return

    setLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const profile = data.profile

      if (session.user) {
        const sessionUser = session.user as any
        const currentUser: User = {
          _id: sessionUser.id || sessionUser.email, // Use email as fallback ID
          email: sessionUser.email!,
          name: sessionUser.name,
          image: sessionUser.image,
          role: sessionUser.role as 'user' | 'admin' | undefined,
          profile: profile || undefined,
        }

        setUser(currentUser)

        identifyUser(currentUser._id.toString(), {
          email: currentUser.email,
          subscription_tier: currentUser.profile?.subscription_tier,
          credits_remaining: currentUser.profile?.credits_remaining,
        })

        // Check if user was trying to access a specific plan
        const intendedPlan = sessionStorage.getItem('intended-plan')
        if (intendedPlan) {
          sessionStorage.removeItem('intended-plan')
          window.location.href = `/checkout?plan=${intendedPlan}`
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      // Don't set user to null on error, keep existing user if any
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await nextAuthSignOut({ callbackUrl: '/' })
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!session) {
      setUser(null)
      setLoading(false)
      setIsInitialized(true)
      return
    }

    const initializeAuth = async () => {
      try {
        await refreshUser()
      } catch (error) {
        console.error('Error during auth initialization:', error)
        setUser(null)
      } finally {
        setLoading(false)
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [session, status])

  const value = {
    user,
    loading,
    isInitialized,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
