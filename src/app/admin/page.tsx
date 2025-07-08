'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AdminAuthGuard } from '@/components/admin/admin-auth-guard'
import { AdminNavigation } from '@/components/admin/admin-navigation'

interface DashboardStats {
  totalUsers: number
  totalOffers: number
  totalTemplates: number
  publishedTemplates: number
  recentActivity: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOffers: 0,
    totalTemplates: 0,
    publishedTemplates: 0,
    recentActivity: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // For now, we'll use placeholder data since we're not using Supabase anymore
        // In a real implementation, you would fetch from MongoDB

        setStats({
          totalUsers: 0, // Would fetch from MongoDB users collection
          totalOffers: 0, // Would fetch from MongoDB offers collection
          totalTemplates: 1, // We have the default template
          publishedTemplates: 1, // The default template is published
          recentActivity: [], // Would fetch recent offers from MongoDB
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AdminAuthGuard>
      <AdminNavigation user={null} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your SlamOffer platform and PDF templates</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Offers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOffers}</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">PDF Templates</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTemplates}</p>
              </div>
              <div className="text-3xl">🎨</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-3xl font-bold text-gray-900">{stats.publishedTemplates}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/admin/pdf-designer">
                <Button className="w-full justify-start">
                  <span className="mr-2">🎨</span>
                  Create New PDF Template
                </Button>
              </Link>
              <Link href="/admin/templates">
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">📋</span>
                  Manage Templates
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">⚙️</span>
                  System Settings
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-600">by {activity.users?.email}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  )
}
