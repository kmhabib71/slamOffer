/**
 * 🚨 TESTING ONLY - REMOVE BEFORE PRODUCTION
 * Database cleanup component for testing purposes
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Database, Users, ShoppingCart, FileText, AlertTriangle } from 'lucide-react'

interface CleanupStats {
  user_profiles: number
  purchased_offers: number
  grand_slam_offers: number
  total: number
}

export function DatabaseCleanup() {
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<CleanupStats | null>(null)
  const [lastResult, setLastResult] = useState<string | null>(null)

  // Fetch current collection counts
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/database/clean-testing')
      const data = await response.json()
      if (data.success) {
        setStats(data.collections)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Cleanup function
  const performCleanup = async (action: string, confirmMessage: string) => {
    if (!confirm(`⚠️ ${confirmMessage}\n\nThis action cannot be undone. Continue?`)) {
      return
    }

    setIsLoading(true)
    setLastResult(null)

    try {
      const response = await fetch('/api/admin/database/clean-testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      const data = await response.json()
      
      if (data.success) {
        setLastResult(data.message)
        await fetchStats() // Refresh stats
      } else {
        setLastResult(`Error: ${data.error}`)
      }
    } catch (error) {
      setLastResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Load stats on component mount
  useState(() => {
    fetchStats()
  })

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
      {/* Warning Header */}
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <h3 className="text-lg font-semibold text-red-800">
          🚨 TESTING ONLY - Database Cleanup
        </h3>
      </div>

      <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
        <p className="text-sm text-red-700 font-medium">
          ⚠️ WARNING: This functionality must be REMOVED before production deployment!
        </p>
        <p className="text-xs text-red-600 mt-1">
          These buttons can permanently delete all data. Use only for testing.
        </p>
      </div>

      {/* Stats Display */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-4 text-sm">
          <div className="bg-white border rounded p-2 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <div className="font-semibold">{stats.user_profiles}</div>
            <div className="text-gray-600">Users</div>
          </div>
          <div className="bg-white border rounded p-2 text-center">
            <ShoppingCart className="h-4 w-4 mx-auto mb-1 text-green-600" />
            <div className="font-semibold">{stats.purchased_offers}</div>
            <div className="text-gray-600">Purchases</div>
          </div>
          <div className="bg-white border rounded p-2 text-center">
            <FileText className="h-4 w-4 mx-auto mb-1 text-purple-600" />
            <div className="font-semibold">{stats.grand_slam_offers}</div>
            <div className="text-gray-600">Offers</div>
          </div>
          <div className="bg-white border rounded p-2 text-center">
            <Database className="h-4 w-4 mx-auto mb-1 text-gray-600" />
            <div className="font-semibold">{stats.total}</div>
            <div className="text-gray-600">Total</div>
          </div>
        </div>
      )}

      {/* Cleanup Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <Button
          onClick={() => performCleanup('clean-all', 'Delete ALL data from all collections?')}
          disabled={isLoading}
          variant="destructive"
          size="sm"
          className="flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" />
          Clean All
        </Button>

        <Button
          onClick={() => performCleanup('clean-user-profiles', 'Delete ALL user profiles?')}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 border-red-300 text-red-700 hover:bg-red-50"
        >
          <Users className="h-3 w-3" />
          Users
        </Button>

        <Button
          onClick={() => performCleanup('clean-purchased-offers', 'Delete ALL purchased offers?')}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 border-red-300 text-red-700 hover:bg-red-50"
        >
          <ShoppingCart className="h-3 w-3" />
          Purchases
        </Button>

        <Button
          onClick={() => performCleanup('clean-grand-slam-offers', 'Delete ALL grand slam offers?')}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 border-red-300 text-red-700 hover:bg-red-50"
        >
          <FileText className="h-3 w-3" />
          Offers
        </Button>
      </div>

      {/* Refresh Stats Button */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={fetchStats}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <Database className="h-3 w-3" />
          Refresh Stats
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-2">
          <div className="text-sm text-gray-600">Processing cleanup...</div>
        </div>
      )}

      {/* Last Result */}
      {lastResult && (
        <div className="bg-white border rounded p-3">
          <div className="text-sm font-medium text-gray-700">Last Action:</div>
          <div className="text-sm text-gray-600 mt-1">{lastResult}</div>
        </div>
      )}
    </div>
  )
}