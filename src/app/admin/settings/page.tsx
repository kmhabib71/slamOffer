'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AdminAuthGuard } from '@/components/admin/admin-auth-guard'
import { AdminNavigation } from '@/components/admin/admin-navigation'

interface AdminSettings {
  site_name: string
  contact_email: string
  maintenance_mode: boolean
  max_free_generations: number
  pro_price_monthly: number
  one_time_price: number
  payment_mode: 'demo' | 'live'
  ai_generation_mode: 'demo' | 'live'
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>({
    site_name: 'SlamOffer',
    contact_email: 'admin@slamoffer.com',
    maintenance_mode: false,
    max_free_generations: 3,
    pro_price_monthly: 47,
    one_time_price: 197,
    payment_mode: 'demo',
    ai_generation_mode: 'demo',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // For now, we'll use default settings since we're not using Supabase anymore
        // In a real implementation, you would fetch from MongoDB admin_settings collection

        // Check current AI generation mode from localStorage
        const storedTestMode = localStorage.getItem('slam_offer_test_mode')
        const aiGenerationMode = storedTestMode === 'true' ? 'demo' : 'live'

        setSettings({
          site_name: 'SlamOffer',
          contact_email: 'admin@slamoffer.com',
          maintenance_mode: false,
          max_free_generations: 3,
          pro_price_monthly: 47,
          one_time_price: 197,
          payment_mode: 'demo',
          ai_generation_mode: aiGenerationMode,
        })
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      // For now, we'll just log the settings since we're not using Supabase anymore
      // In a real implementation, you would save to MongoDB admin_settings collection

      console.log('Saving settings:', settings)

      // Save AI generation mode to localStorage
      localStorage.setItem(
        'slam_offer_test_mode',
        settings.ai_generation_mode === 'demo' ? 'true' : 'false'
      )

      setMessage('Settings saved successfully!')

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Error saving settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof AdminSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading) {
    return (
      <AdminAuthGuard>
        <AdminNavigation user={null} />
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminAuthGuard>
    )
  }

  return (
    <AdminAuthGuard>
      <AdminNavigation user={null} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="mt-2 text-gray-600">Manage platform settings and configuration</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-6">
            {/* Site Configuration */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Site Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={e => handleInputChange('site_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contact_email}
                    onChange={e => handleInputChange('contact_email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* User Limits */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Limits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Free Generations
                  </label>
                  <input
                    type="number"
                    value={settings.max_free_generations}
                    onChange={e =>
                      handleInputChange('max_free_generations', parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pro Monthly Price ($)
                  </label>
                  <input
                    type="number"
                    value={settings.pro_price_monthly}
                    onChange={e =>
                      handleInputChange('pro_price_monthly', parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    One-Time Price ($)
                  </label>
                  <input
                    type="number"
                    value={settings.one_time_price}
                    onChange={e => handleInputChange('one_time_price', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Mode
                  </label>
                  <select
                    value={settings.payment_mode}
                    onChange={e =>
                      handleInputChange('payment_mode', e.target.value as 'demo' | 'live')
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="demo">Demo Mode (Test Cards)</option>
                    <option value="live">Live Mode (Real Payments)</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {settings.payment_mode === 'demo'
                      ? 'Demo mode allows testing with fake card numbers. No real payments will be processed.'
                      : 'Live mode processes real payments through 2Checkout. Ensure your 2Checkout account is properly configured.'}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Generation Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Generation Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Generation Mode
                  </label>
                  <select
                    value={settings.ai_generation_mode}
                    onChange={e =>
                      handleInputChange('ai_generation_mode', e.target.value as 'demo' | 'live')
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="demo">Demo Mode (Fake AI Generation)</option>
                    <option value="live">Live Mode (Real AI Generation)</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {settings.ai_generation_mode === 'demo'
                      ? 'Demo mode uses mock data for faster testing and design purposes. No OpenAI API calls will be made.'
                      : 'Live mode uses real OpenAI API to generate offers. This will consume API credits and take longer.'}
                  </p>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">System Settings</h2>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenance_mode"
                  checked={settings.maintenance_mode}
                  onChange={e => handleInputChange('maintenance_mode', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenance_mode" className="ml-2 block text-sm text-gray-900">
                  Maintenance Mode (prevents new user registrations)
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-200">
              <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  )
}
