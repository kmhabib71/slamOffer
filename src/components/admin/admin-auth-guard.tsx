'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { authService } from '@/lib/auth'
import { AdminNavigation } from '@/components/admin/admin-navigation'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [adminUser, setAdminUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        console.log('Current user:', currentUser)

        if (!currentUser) {
          console.log('No current user, redirecting to login')
          router.push('/auth/login?redirect=/admin')
          return
        }

        setUser(currentUser)

        // Check if user is admin with better error handling
        console.log('Checking admin status for user:', currentUser.id)

        let adminUserData: any = null

        try {
          const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', currentUser.id)
            .single()

          adminUserData = data
          console.log('Admin query result:', { adminUserData, error })

          if (error) {
            console.error('Admin query error:', error)
            if (error.code === 'PGRST116') {
              // No rows returned - user is not admin
              console.log('User is not admin, redirecting to home')
              router.push('/')
              return
            }
            // Handle infinite recursion error specifically
            if (error.code === '42P17') {
              console.error('Infinite recursion in admin policy - need to fix RLS policies')
              console.log('Redirecting to home due to policy error')
              router.push('/')
              return
            }
            // Other errors
            throw error
          }

          if (!adminUserData) {
            console.log('No admin user data, redirecting to home')
            router.push('/')
            return
          }

          console.log('User is admin:', adminUserData)
          setAdminUser(adminUserData)
          setIsAdmin(true)
        } catch (policyError: any) {
          console.error('Policy error:', policyError)
          if (policyError.code === '42P17') {
            console.error('Infinite recursion detected - RLS policy needs fixing')
            router.push('/')
            return
          }
          throw policyError
        }

        if (!adminUserData) {
          console.log('No admin user data, redirecting to home')
          router.push('/')
          return
        }

        console.log('User is admin:', adminUserData)
        setAdminUser(adminUserData)
        setIsAdmin(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this area.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AdminNavigation user={user!} adminUser={adminUser} />
      <main className="flex-1">{children}</main>
    </>
  )
}
