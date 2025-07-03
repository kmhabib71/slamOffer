'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/app/providers/auth-provider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/auth/logout-button'

export default function AdminDebugPage() {
  const { user, loading } = useAuth()
  const [adminCheck, setAdminCheck] = useState<any>(null)
  const [adminError, setAdminError] = useState<string | null>(null)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return

      try {
        console.log('🔍 Checking admin status for user:', user.id)

        const { data: adminUserData, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .single()

        console.log('Admin query result:', { adminUserData, error })

        if (error) {
          setAdminError(error.message)
          console.error('Admin query error:', error)
        } else {
          setAdminCheck(adminUserData)
          console.log('✅ Admin check successful:', adminUserData)
        }
      } catch (error) {
        console.error('Admin check failed:', error)
        setAdminError('Unexpected error occurred')
      }
    }

    if (user) {
      checkAdminStatus()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">🔍 Admin Debug Panel</h1>

        {/* Authentication Status */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Authentication Status</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            {user ? (
              <div>
                <p className="text-green-600 font-medium">✅ Authenticated</p>
                <p className="text-sm text-gray-600">Email: {user.email}</p>
                <p className="text-sm text-gray-600">User ID: {user.id}</p>
                <p className="text-sm text-gray-600">
                  Profile: {user.profile ? '✅ Loaded' : '❌ Missing'}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-red-600 font-medium">❌ Not Authenticated</p>
                <p className="text-sm text-gray-600">No user session found</p>
              </div>
            )}
          </div>
        </div>

        {/* Admin Status */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Admin Status</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            {adminError ? (
              <div>
                <p className="text-red-600 font-medium">❌ Admin Check Failed</p>
                <p className="text-sm text-gray-600">Error: {adminError}</p>
              </div>
            ) : adminCheck ? (
              <div>
                <p className="text-green-600 font-medium">✅ Admin Access Confirmed</p>
                <p className="text-sm text-gray-600">Role: {adminCheck.role}</p>
                <p className="text-sm text-gray-600">Admin ID: {adminCheck.id}</p>
                <p className="text-sm text-gray-600">
                  Created: {new Date(adminCheck.created_at).toLocaleString()}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-yellow-600 font-medium">⏳ Checking Admin Status...</p>
                <p className="text-sm text-gray-600">Please wait...</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Actions</h2>
          <div className="space-y-3">
            <Button onClick={() => (window.location.href = '/admin')} className="w-full">
              🚀 Go to Admin Panel
            </Button>

            <LogoutButton variant="outline" className="w-full" redirectTo="/">
              🔐 Logout & Clear Session
            </LogoutButton>

            <Button onClick={() => window.location.reload()} variant="ghost" className="w-full">
              🔄 Refresh Page
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Debug Information</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600">
              Loading State: {loading ? 'Loading...' : 'Complete'}
            </p>
            <p className="text-sm text-gray-600">User State: {user ? 'Present' : 'Null'}</p>
            <p className="text-sm text-gray-600">
              Admin Check: {adminCheck ? 'Success' : adminError ? 'Failed' : 'Pending'}
            </p>
            <p className="text-sm text-gray-600">Current URL: {window.location.href}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="text-md font-semibold text-blue-800 mb-2">💡 Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              • If you see "✅ Admin Access Confirmed", you should be able to access the admin panel
            </li>
            <li>
              • If you see "❌ Admin Check Failed", there's an issue with the admin user record
            </li>
            <li>• If you see "❌ Not Authenticated", you need to log in first</li>
            <li>• Use the "Logout & Clear Session" button to completely clear your session</li>
            <li>
              • After logout, log in again at <code>/auth/login</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
