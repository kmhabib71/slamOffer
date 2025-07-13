'use client'

import { useAuth } from '@/app/providers/auth-provider'
import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation'
import { subscriptionHelpers } from '@/lib/subscription-helpers'
import { motion } from 'framer-motion'
import ProfilePricing from '@/components/dashboard/profile-pricing'
import {
  User,
  Mail,
  Crown,
  Star,
  Calendar,
  Activity,
  Settings,
  CreditCard,
  Zap,
  TrendingUp,
  Target,
  ExternalLink,
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const [apiUsage, setApiUsage] = useState({
    totalOffers: 0,
    thisMonth: 0,
    creditsUsed: 0,
    creditsRemaining: 0,
    subscriptionTier: 'free' as const,
    memberSince: new Date().toISOString(),
    purchasedOffers: 0,
    dailyGenerationCount: 0,
    lastGenerationDate: null as Date | null,
  })
  const [profileLoading, setProfileLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch API usage data function
  const fetchApiUsage = async () => {
    try {
      setProfileLoading(true)
      setError('')
      // Add cache-busting parameter to prevent caching
      const response = await fetch(`/api/user/profile?t=${Date.now()}&r=${Math.random()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Debug: Log the actual API response
      console.log('Profile API Response:', data)

      // Handle the API response structure properly
      const stats = data.stats || {}
      
      setApiUsage({
        totalOffers: stats.totalOffers || 0,
        thisMonth: stats.thisMonth || 0,
        creditsUsed: stats.creditsUsed || 0,
        creditsRemaining: stats.creditsRemaining || user?.profile?.credits_remaining || 3,
        subscriptionTier: stats.subscriptionTier || 'free',
        memberSince: stats.memberSince || new Date().toISOString(),
        purchasedOffers: stats.purchasedOffers || 0,
        dailyGenerationCount: stats.dailyGenerationCount || 0,
        lastGenerationDate: stats.lastGenerationDate ? new Date(stats.lastGenerationDate) : null,
      })
    } catch (error) {
      console.error('Error fetching API usage:', error)
      setError('Failed to load profile data')
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchApiUsage()
    }
  }, [user])

  // Add a refresh function for manual refresh
  const refreshStats = async () => {
    if (user) {
      // Refresh both user data and stats
      await Promise.all([
        refreshUser(),
        fetchApiUsage()
      ])
    }
  }

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen relative bg-[#F9FAFB] dotted-bg">
        {/* Animated Connecting Lines */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-violet-300/30 to-transparent"
              style={{
                left: `${20 + i * 15}%`,
                height: '100vh',
              }}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatType: 'reverse' }}
            />
          ))}
        </div>
        <DashboardNavigation />
        <div className="flex items-center justify-center min-h-[80vh] relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen relative bg-[#F9FAFB] dotted-bg">
        {/* Animated Connecting Lines */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-violet-300/30 to-transparent"
              style={{
                left: `${20 + i * 15}%`,
                height: '100vh',
              }}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatType: 'reverse' }}
            />
          ))}
        </div>
        <DashboardNavigation />
        <div className="flex items-center justify-center min-h-[80vh] relative z-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Access Denied</h2>
            <p className="text-slate-600">Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    )
  }

  const isPro = user.profile?.subscription_tier !== 'free'
  const subscriptionTier = user.profile?.subscription_tier || 'free'

  return (
    <div className="min-h-screen relative bg-[#F9FAFB] dotted-bg">
      {/* Animated Connecting Lines */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-violet-300/30 to-transparent"
            style={{
              left: `${20 + i * 15}%`,
              height: '100vh',
            }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatType: 'reverse' }}
          />
        ))}
      </div>
      <DashboardNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Profile & Settings</h1>
            <p className="text-slate-600">
              Manage your account and view your offer generation activity
            </p>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            <div className="mt-4">
              <button
                onClick={refreshStats}
                className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                disabled={profileLoading}
              >
                {profileLoading ? 'Refreshing...' : 'Refresh Stats'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-10 w-10 text-white" />
                  </div>

                  <h2 className="text-xl font-bold text-slate-800 mb-1">{user.name || 'User'}</h2>

                  <div className="flex items-center justify-center space-x-2 text-slate-600 mb-4">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>

                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${
                        isPro
                          ? 'bg-gradient-to-r from-violet-100 to-sky-100 text-violet-700 border-violet-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isPro ? <Crown className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                      <span className="text-sm font-semibold">
                        {subscriptionHelpers.getTierDisplayName(subscriptionTier as any)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-slate-500 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {new Date(apiUsage.memberSince).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* API Usage & Stats */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Offer Generation Stats */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-sky-500 rounded-lg flex items-center justify-center">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Offer Generation</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Credits Remaining</span>
                      <span className="font-bold text-emerald-600 text-lg">
                        {apiUsage.creditsRemaining}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total Offers Generated</span>
                      <button
                        onClick={() => window.open('/previous-offers', '_blank')}
                        className="flex items-center space-x-1 font-bold text-violet-600 hover:text-violet-700 transition-colors"
                      >
                        <span>{apiUsage.totalOffers}</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>

                    {subscriptionTier === 'free' && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Today's Generations</span>
                        <span className="font-bold text-slate-800">
                          {apiUsage.dailyGenerationCount} / 1
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Premium Offers</span>
                      <button
                        onClick={() => window.open('/previous-offers', '_blank')}
                        className="flex items-center space-x-1 font-bold text-sky-600 hover:text-sky-700 transition-colors"
                      >
                        <span>{apiUsage.purchasedOffers}</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>

                    {user.profile?.package_details && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-violet-50 to-sky-50 rounded-lg border border-violet-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-violet-700 font-medium">Package Value</span>
                          <span className="text-sm font-bold text-violet-700">
                            ${user.profile.package_details.total_package_value}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-violet-600">Price per offer</span>
                          <span className="text-xs font-semibold text-violet-600">
                            ${user.profile.package_details.price_per_offer}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Generation Limits */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Generation Rules</h3>
                  </div>

                  <div className="space-y-4">
                    {subscriptionTier === 'free' && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Daily Limit</span>
                          <span className="font-bold text-slate-800">1 per day</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Total Free Limit</span>
                          <span className="font-bold text-slate-800">3 offers max</span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Current Plan</span>
                      <span className="font-bold text-slate-800">
                        {subscriptionHelpers.getTierDisplayName(subscriptionTier as any)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Last Generation</span>
                      <span className="font-bold text-slate-600">
                        {apiUsage.lastGenerationDate
                          ? new Date(apiUsage.lastGenerationDate).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </div>

                    <div className="mt-4 p-3 bg-gradient-to-r from-violet-50 to-sky-50 rounded-lg border border-violet-200">
                      {subscriptionTier === 'free' ? (
                        <p className="text-sm text-violet-700 font-medium">
                          💡 Upgrade to unlock more credits and better pricing per offer!
                        </p>
                      ) : (
                        <p className="text-sm text-violet-700 font-medium">
                          🎉 You have access to premium features and better pricing!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              {/* <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 mt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
                </div>

                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No recent activity to display</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Start generating offers to see your activity here
                  </p>
                </div>
              </div> */}
            </motion.div>
            {/* Pricing Section */}
          </div>
          <ProfilePricing
            subscriptionTier={subscriptionTier}
            creditsRemaining={apiUsage.creditsRemaining}
          />
        </motion.div>
      </main>
    </div>
  )
}
