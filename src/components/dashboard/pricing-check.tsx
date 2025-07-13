'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  Crown,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'
import { subscriptionHelpers } from '@/lib/subscription-helpers'

interface PricingCheckProps {
  onGenerateAllowed: () => void
  onUpgradeNeeded: () => void
  className?: string
}

interface UsageData {
  canGenerate: boolean
  reason?: string
  remainingCredits: number
  subscriptionTier: string
  dailyUsageCount: number
  packageDetails?: {
    price_per_offer?: number
    total_package_value?: number
    purchase_date?: Date
    regeneration_count?: number
  }
}

export function PricingCheck({
  onGenerateAllowed,
  onUpgradeNeeded,
  className = '',
}: PricingCheckProps) {
  const { user } = useAuth()
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkUsage = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/user/usage-check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to check usage')
        }

        const data = await response.json()
        
        // Transform the API response to match our expected interface
        const transformedData: UsageData = {
          canGenerate: data.generation.can_generate,
          reason: data.generation.generation_reason,
          remainingCredits: data.generation.remaining_credits,
          subscriptionTier: data.profile.subscription_tier,
          dailyUsageCount: data.usage.today.count || 0,
          packageDetails: data.profile.package_details,
        }
        
        setUsageData(transformedData)
      } catch (err) {
        console.error('Error checking usage:', err)
        setError(err instanceof Error ? err.message : 'Failed to check usage')
      } finally {
        setLoading(false)
      }
    }

    checkUsage()
  }, [user])

  const handleGenerateClick = () => {
    if (usageData?.canGenerate) {
      onGenerateAllowed()
    } else {
      onUpgradeNeeded()
    }
  }

  if (loading) {
    return (
      <div
        className={`bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 p-6 ${className}`}
      >
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600"></div>
          <span className="text-slate-600">Checking your plan...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-6 ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    )
  }

  if (!usageData) {
    return null
  }

  const {
    canGenerate,
    reason,
    remainingCredits,
    subscriptionTier,
    dailyUsageCount,
    packageDetails,
  } = usageData
  const tierDisplayName = subscriptionHelpers.getTierDisplayName(subscriptionTier as any)
  const pricePerOffer = subscriptionHelpers.getPricePerOffer(subscriptionTier as any)
  const isFree = subscriptionHelpers.isFreeTier(subscriptionTier as any)

  return (
    <div
      className={`bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg ${className}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isFree ? 'bg-slate-100' : 'bg-gradient-to-br from-violet-500 to-sky-500'
              }`}
            >
              {isFree ? (
                <Star className="h-5 w-5 text-slate-600" />
              ) : (
                <Crown className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{tierDisplayName} Plan</h3>
              {!isFree && packageDetails && (
                <p className="text-sm text-slate-600">${pricePerOffer} per offer</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-800">{remainingCredits}</div>
            <div className="text-sm text-slate-600">
              {remainingCredits === 1 ? 'credit left' : 'credits left'}
            </div>
          </div>
        </div>

        {/* Usage Info */}
        <div className="space-y-4 mb-6">
          {isFree && (
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Daily Usage</span>
              </div>
              <div className="text-sm text-slate-600">
                {dailyUsageCount} of 1 free generation used today
              </div>
              <div className="text-xs text-slate-500 mt-1">Resets at midnight</div>
            </div>
          )}

          {packageDetails && (
            <div className="bg-gradient-to-r from-violet-50 to-sky-50 rounded-lg p-4 border border-violet-100">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-medium text-violet-700">Package Details</span>
              </div>
              <div className="text-sm text-violet-600">
                Total Value: ${packageDetails.total_package_value}
              </div>
              {packageDetails.regeneration_count !== undefined &&
                packageDetails.regeneration_count > 0 && (
                  <div className="text-xs text-violet-500 mt-1">
                    + {packageDetails.regeneration_count} regenerations included
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="mb-6">
          {canGenerate ? (
            <div className="flex items-center space-x-2 text-green-700 bg-green-50 rounded-lg p-3">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Ready to generate!</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 rounded-lg p-3">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">{reason}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerateClick}
          disabled={!canGenerate && isFree}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
            canGenerate
              ? 'bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-700 hover:to-sky-700 shadow-lg hover:shadow-xl'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {canGenerate ? (
            <span className="flex items-center justify-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Generate Your Offer</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Upgrade to Continue</span>
            </span>
          )}
        </button>

        {/* Upgrade Benefits */}
        {isFree && (
          <div className="mt-4 p-4 bg-gradient-to-r from-violet-50 to-sky-50 rounded-lg border border-violet-100">
            <h4 className="text-sm font-semibold text-violet-700 mb-2">🚀 Upgrade Benefits</h4>
            <ul className="text-xs text-violet-600 space-y-1">
              <li>• More offers per package</li>
              <li>• Better price per offer</li>
              <li>• Offer regeneration features</li>
              <li>• Premium PDF exports</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
