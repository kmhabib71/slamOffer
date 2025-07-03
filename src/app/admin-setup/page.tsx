'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function AdminSetupPage() {
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
    } catch (error: any) {
      console.error('Error creating admin user:', error)
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const setupDefaultTemplates = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const user = await checkCurrentUser()
      if (!user) {
        setMessage('❌ Please log in first')
        return
      }

      // Check if templates already exist
      const { data: existingTemplates } = await supabase
        .from('pdf_design_templates')
        .select('id')
        .limit(1)

      if (existingTemplates && existingTemplates.length > 0) {
        setMessage('✅ Templates already exist!')
        return
      }

      // Create default templates
      const defaultTemplates = [
        {
          name: 'Modern Business',
          description: 'Clean and professional design perfect for business offers',
          category: 'business',
          status: 'published',
          is_default: true,
          created_by: user.id,
        },
        {
          name: 'Minimalist',
          description: 'Clean and simple design with focus on content',
          category: 'minimal',
          status: 'published',
          is_default: false,
          created_by: user.id,
        },
      ]

      const { data: templates, error: templateError } = await supabase
        .from('pdf_design_templates')
        .insert(defaultTemplates)
        .select()

      if (templateError) throw templateError

      // Create default styles
      const defaultStyles = {
        colors: {
          primary: '#06B6D4',
          secondary: '#8B5CF6',
          accent: '#F59E0B',
          background: '#FFFFFF',
          text: '#0A0E1A',
          muted: '#64748B',
        },
        fonts: {
          primary: 'Helvetica',
          secondary: 'Helvetica-Bold',
          size: { small: 10, medium: 12, large: 16, xl: 20, xxl: 24 },
        },
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
        borders: { width: 1, radius: 8, color: '#E2E8F0' },
      }

      for (const template of templates) {
        await supabase.from('pdf_design_styles').insert({
          template_id: template.id,
          styles: defaultStyles,
        })
      }

      setMessage('🎨 Default templates created successfully!')
    } catch (error: any) {
      console.error('Error creating templates:', error)
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
              This one-time setup will create your admin account and default PDF templates.
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
              <h2 className="text-xl font-semibold mb-3">Step 1: Create Admin User</h2>
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

            <div>
              <h2 className="text-xl font-semibold mb-3">Step 2: Setup Default Templates</h2>
              <p className="text-gray-600 mb-4">
                Create default PDF templates (Business, Minimal) to get started with your template
                library.
              </p>
              <Button
                onClick={setupDefaultTemplates}
                disabled={isLoading || !currentUser}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Creating Templates...' : 'Create Default Templates'}
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

            <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• You only need to do this setup once</li>
                <li>• Make sure your Supabase database is running</li>
                <li>• Run the database migration if you haven't already</li>
                <li>• Keep this page open until setup is complete</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
