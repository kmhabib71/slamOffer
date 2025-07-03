'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export const AdminSetup: React.FC = () => {
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
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">🚀 Admin Panel Setup</h1>

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Current User Status</h2>
            {currentUser ? (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p>
                  ✅ Logged in as: <strong>{currentUser.email}</strong>
                </p>
                <p>
                  🆔 User ID: <code className="text-sm">{currentUser.id}</code>
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p>⚠️ Not logged in. Please log in first.</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Step 1: Create Admin User</h2>
            <p className="text-gray-600 mb-4">
              Grant yourself admin access to manage PDF templates.
            </p>
            <Button
              onClick={createAdminUser}
              disabled={isLoading || !currentUser}
              className="w-full"
            >
              {isLoading ? 'Creating...' : 'Make Me Admin'}
            </Button>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Step 2: Setup Default Templates</h2>
            <p className="text-gray-600 mb-4">Create some default PDF templates to get started.</p>
            <Button
              onClick={setupDefaultTemplates}
              disabled={isLoading || !currentUser}
              variant="outline"
              className="w-full"
            >
              {isLoading ? 'Creating...' : 'Create Default Templates'}
            </Button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Click "Make Me Admin" to get admin access</li>
              <li>Click "Create Default Templates" to setup templates</li>
              <li>
                Visit{' '}
                <a href="/admin" className="text-blue-600 hover:underline">
                  /admin
                </a>{' '}
                to access the admin panel
              </li>
              <li>Use the PDF Designer to create custom templates</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSetup
