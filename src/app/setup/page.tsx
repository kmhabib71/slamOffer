'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  const checkCurrentUser = async () => {
    const user = await authService.getCurrentUser()
    setCurrentUser(user)
    return user
  }

  const createAdminUser = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const user = await checkCurrentUser()
      if (!user) {
        setMessage('❌ Please log in first')
        return
      }

      // Check if user is already admin
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (existingAdmin) {
        setMessage('✅ You are already an admin user!')
        return
      }

      // Create admin user
      const { error } = await supabase.from('admin_users').insert({
        user_id: user.id,
        role: 'super_admin',
        permissions: {},
      })

      if (error) throw error

      setMessage('🎉 Admin user created successfully! You can now access /admin')

      // Redirect to admin after 2 seconds
      setTimeout(() => {
        window.location.href = '/admin'
      }, 2000)
    } catch (error: any) {
      console.error('Error creating admin user:', error)
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    checkCurrentUser()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🚀 Admin Panel Setup</h1>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">Welcome to SlamOffer Admin Setup!</h2>
            <p className="text-blue-800 text-sm">
              This one-time setup will create your admin account.
            </p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                message.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-3">Current User Status</h2>
              {currentUser ? (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p>
                    ✅ Logged in as: <strong>{currentUser.email}</strong>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    User ID: <code>{currentUser.id}</code>
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p>⚠️ Not logged in</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Please{' '}
                    <a href="/auth/login" className="text-blue-600 hover:underline">
                      log in
                    </a>{' '}
                    first
                  </p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Create Admin User</h2>
              <p className="text-gray-600 mb-4">
                Grant yourself admin access to manage PDF templates and access the admin panel.
              </p>
              <Button
                onClick={createAdminUser}
                disabled={isLoading || !currentUser}
                className="w-full"
              >
                {isLoading ? 'Creating Admin User...' : 'Make Me Admin'}
              </Button>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">🎯 After Setup:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>
                  Visit{' '}
                  <a href="/admin" className="text-blue-600 hover:underline font-medium">
                    /admin
                  </a>{' '}
                  to access your admin dashboard
                </li>
                <li>Use the PDF Designer to create custom templates</li>
                <li>Manage template categories and styles</li>
                <li>Let users choose from your template designs</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
