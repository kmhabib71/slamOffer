'use client'

import { useState } from 'react'
import { Check, Crown, Zap, Star } from 'lucide-react'
import { pricingPlans, getColorClasses, PricingPlan } from '@/lib/pricing-plans'
import { useRouter } from 'next/navigation'

interface PricingCardsProps {
  currentPlan?: string
  showCurrentPlan?: boolean
  onUpgrade?: (planId: string) => void
}

export default function PricingCards({
  currentPlan = 'free',
  showCurrentPlan = true,
  onUpgrade,
}: PricingCardsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (plan: PricingPlan) => {
    if (plan.id === 'free') return

    setLoading(plan.id)

    try {
      if (onUpgrade) {
        onUpgrade(plan.id)
      } else {
        // Default behavior - redirect to checkout
        router.push(`/checkout?plan=${plan.id}`)
      }
    } catch (error) {
      console.error('Error upgrading plan:', error)
    } finally {
      setLoading(null)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Star className="h-6 w-6" />
      case 'pro':
        return <Zap className="h-6 w-6" />
      case 'premium':
        return <Crown className="h-6 w-6" />
      default:
        return <Star className="h-6 w-6" />
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {pricingPlans.map(plan => {
        const colors = getColorClasses(plan.color)
        const isCurrentPlan = currentPlan === plan.id
        const isUpgrade = plan.id !== 'free' && currentPlan !== plan.id

        return (
          <div
            key={plan.id}
            className={`relative rounded-2xl p-6 border-2 transition-all duration-300 ${
              plan.popular
                ? 'border-blue-500 bg-blue-50 scale-105 shadow-xl'
                : isCurrentPlan
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            {/* Current Plan Badge */}
            {isCurrentPlan && showCurrentPlan && (
              <div className="absolute -top-3 right-4">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Current
                </span>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${colors.bg}`}
              >
                <div className={colors.accent}>{getPlanIcon(plan.id)}</div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm">{plan.description}</p>
            </div>

            {/* Pricing */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                {plan.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">${plan.originalPrice}</span>
                )}
              </div>

              <div className="text-sm text-gray-600 mb-4">
                {plan.credits} Grand Slam Offers included
              </div>

              {plan.originalPrice && (
                <div className="text-sm font-medium text-green-600">
                  Save ${plan.originalPrice - plan.price}!
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleUpgrade(plan)}
              disabled={loading === plan.id || (isCurrentPlan && showCurrentPlan)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isCurrentPlan && showCurrentPlan
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : plan.id === 'free'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
              } ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading === plan.id ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : isCurrentPlan && showCurrentPlan ? (
                'Current Plan'
              ) : plan.id === 'free' ? (
                'Get Started Free'
              ) : isUpgrade ? (
                `Upgrade to ${plan.name}`
              ) : (
                `Choose ${plan.name}`
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
