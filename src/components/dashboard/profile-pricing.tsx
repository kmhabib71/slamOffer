'use client'

import { CreditCard } from 'lucide-react'
import { getHomePlanStatus } from '@/lib/home-pricing-plans'
import HomePricingCards from '@/components/pricing/home-pricing-cards'
import Link from 'next/link'

interface ProfilePricingProps {
  subscriptionTier: string
  creditsRemaining: number
}

export default function ProfilePricing({
  subscriptionTier,
  creditsRemaining,
}: ProfilePricingProps) {
  const planStatus = getHomePlanStatus(subscriptionTier, creditsRemaining)

  return (
    <div className="mt-6">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Upgrade Your Plan</h2>
            <p className="text-slate-600 text-sm">Get more offers and unlock premium features</p>
          </div>
        </div>

        {/* Current Plan Status */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-violet-50 to-sky-50 rounded-lg p-4 border border-violet-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Current Plan: {planStatus.currentPlan.name}
                </h3>
                <p className="text-slate-600 text-xs">{planStatus.currentPlan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-violet-700">
                  {planStatus.creditsRemaining}
                </div>
                <div className="text-slate-600 text-xs">of {planStatus.maxCredits} remaining</div>
              </div>
            </div>

            {/* Usage Progress Bar */}
            <div className="w-full bg-white/60 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-violet-500 to-sky-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${planStatus.usagePercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>{planStatus.usedCredits} used</span>
              <span>{planStatus.usagePercentage.toFixed(1)}% used</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="w-full">
          <HomePricingCards currentPlan={subscriptionTier} showCurrentPlan={true} />
        </div>

        {/* Additional Actions */}
        <div className="mt-6 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white rounded-lg transition-all duration-200 text-sm font-medium"
          >
            <CreditCard className="h-4 w-4" />
            View All Plans & Features
          </Link>
        </div>
      </div>
    </div>
  )
}
