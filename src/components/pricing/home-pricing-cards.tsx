'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { homePricingPlans, HomePricingPlan } from '@/lib/home-pricing-plans'
import { useAuth } from '@/app/providers/auth-provider'

interface HomePricingCardsProps {
  currentPlan?: string
  showCurrentPlan?: boolean
  onUpgrade?: (planId: string) => void
}

export default function HomePricingCards({
  currentPlan = 'free',
  showCurrentPlan = true,
  onUpgrade,
}: HomePricingCardsProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleCTAClick = async (plan: HomePricingPlan) => {
    setLoading(plan.id)

    try {
      if (onUpgrade) {
        onUpgrade(plan.id)
        return
      }

      // Handle pricing plan selections (same logic as home page)
      if (plan.id === 'free') {
        // For free plan, just go to dashboard
        if (!user) {
          router.push('/auth/login')
        } else {
          router.push('/dashboard')
        }
      } else {
        // For paid plans, go to checkout
        const planMapping: { [key: string]: string } = {
          'starter-spark': 'starter-spark',
          'growth-engine': 'growth-engine',
          'agency-arsenal': 'agency-arsenal',
        }
        const checkoutPlan = planMapping[plan.id] || 'growth-engine'

        if (!user) {
          // Store the intended plan and redirect to auth
          sessionStorage.setItem('intended-plan', checkoutPlan)
          router.push('/auth/login')
        } else {
          router.push(`/checkout?plan=${checkoutPlan}`)
        }
      }
    } catch (error) {
      console.error('Error handling plan selection:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {homePricingPlans.map((plan, index) => {
        const isCurrentPlan = currentPlan === plan.id
        const isUpgrade = plan.id !== 'free' && currentPlan !== plan.id

        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`relative bg-white/60 backdrop-blur-md p-6 rounded-2xl border ${
              plan.popular
                ? 'border-violet-300 shadow-2xl'
                : isCurrentPlan && showCurrentPlan
                  ? 'border-green-300 shadow-2xl'
                  : 'border-slate-200 shadow-xl'
            } hover:shadow-2xl transition-all duration-300 group h-full flex flex-col`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-violet-500 to-sky-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
              </div>
            )}

            {/* Current Plan Badge */}
            {isCurrentPlan && showCurrentPlan && !plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Current Plan
                </div>
              </div>
            )}

            {/* Other Badges */}
            {plan.badge && !plan.popular && (!isCurrentPlan || !showCurrentPlan) && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div
                  className={`bg-gradient-to-r ${plan.gradient} text-white px-4 py-1 rounded-full text-sm font-bold`}
                >
                  {plan.badge}
                </div>
              </div>
            )}

            {/* Plan Content */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-black text-slate-800 mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center mb-2">
                <span className="text-3xl font-black text-slate-800">{plan.price}</span>
                {plan.period !== 'forever' && (
                  <span className="text-slate-600 font-semibold ml-1 text-sm">/{plan.period}</span>
                )}
              </div>
              <div className="text-center mb-2">
                <span className="text-xs text-violet-600 font-bold bg-violet-50 px-2 py-1 rounded-full">
                  {plan.pricePerOffer}
                </span>
              </div>
              <p className="text-slate-600 font-medium text-sm">{plan.description}</p>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-6 flex-grow">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 font-medium text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              onClick={() => handleCTAClick(plan)}
              disabled={loading === plan.id || (isCurrentPlan && showCurrentPlan)}
              className={`w-full py-2 px-4 rounded-lg font-bold text-sm transition-all duration-300 mt-auto ${
                isCurrentPlan && showCurrentPlan
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : plan.popular
                    ? 'bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-violet-50'
              } ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading === plan.id ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Processing...
                </div>
              ) : isCurrentPlan && showCurrentPlan ? (
                'Current Plan'
              ) : isUpgrade ? (
                `Upgrade to ${plan.name}`
              ) : (
                plan.cta
              )}
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}
