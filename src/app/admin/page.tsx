'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
        // Fetch user count
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })

        // Fetch offers count
        const { count: offerCount } = await supabase
          .from('offers')
          .select('*', { count: 'exact', head: true })

        // Fetch template counts
        const { count: templateCount } = await supabase
          .from('pdf_design_templates')
          .select('*', { count: 'exact', head: true })

        const { count: publishedCount } = await supabase
          .from('pdf_design_templates')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published')

        // Fetch recent activity
        const { data: recentOffers } = await supabase
          .from('offers')
          .select(
            `
            id,
            title,
            created_at,
            users!inner(email)
          `
          )
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          totalUsers: userCount || 0,
          totalOffers: offerCount || 0,
          totalTemplates: templateCount || 0,
          publishedTemplates: publishedCount || 0,
          recentActivity: recentOffers || [],
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
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <span className="mr-2">👥</span>
                Manage Users
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
  )
}
