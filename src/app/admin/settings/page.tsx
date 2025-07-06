'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { AdminAuthGuard } from '@/components/admin/admin-auth-guard'

export default function AdminSettings() {
  const [isTestMode, setIsTestMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Check localStorage first
        const storedMode = localStorage.getItem('slam_offer_test_mode')
        if (storedMode) {
          setIsTestMode(storedMode === 'true')
          return
        }

        // Fallback to database
        const { data, error } = await supabase.from('admin_settings').select('test_mode').single()

        if (error) {
          if (error.code === 'PGRST116') {
            // No settings found, create default
            await supabase.from('admin_settings').insert({ id: 1, test_mode: false }).single()
            setIsTestMode(false)
            return
          }
          throw error
        }

        if (data) {
          setIsTestMode(data.test_mode || false)
          localStorage.setItem('slam_offer_test_mode', (data.test_mode || false).toString())
        }
      } catch (err: any) {
        console.error('Error loading settings:', err)
        setError(err.message || 'Failed to load settings')
      }
    }

    loadSettings()
  }, [])

  const handleTestModeToggle = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const { error: upsertError } = await supabase.from('admin_settings').upsert({
        id: 1,
        test_mode: !isTestMode,
        updated_at: new Date().toISOString(),
      })

      if (upsertError) throw upsertError

      // Update local state
      setIsTestMode(!isTestMode)

      // Store in localStorage for easy access
      localStorage.setItem('slam_offer_test_mode', (!isTestMode).toString())
    } catch (err: any) {
      console.error('Error updating test mode:', err)
      setError(err.message || 'Failed to update settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="mt-2 text-gray-600">Configure system-wide settings and toggles</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border p-6">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Test Mode Toggle */}
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Test Mode</h3>
                <p className="text-sm text-gray-500">
                  Enable test mode to use mock data for offer generation. This will skip AI requests
                  and show instant results.
                </p>
              </div>
              <div className="flex items-center">
                <Switch
                  checked={isTestMode}
                  onCheckedChange={handleTestModeToggle}
                  disabled={isSaving}
                  className="ml-4"
                />
                <span className="ml-2 text-sm text-gray-500">
                  {isTestMode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2 text-sm">
              <div
                className={`w-2 h-2 rounded-full ${isTestMode ? 'bg-yellow-400' : 'bg-green-400'}`}
              />
              <span className="text-gray-600">
                {isTestMode
                  ? 'Test Mode Active - Using Mock Data'
                  : 'Live Mode - Using AI Generation'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
