'use client'

import { useAuth } from '@/app/providers/auth-provider'
import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  CheckCircle,
  CreditCard,
  Shield,
  Sparkles,
  ArrowLeft,
  Star,
  Zap,
  Crown,
  Target,
} from 'lucide-react'

const PRICING_PLANS = {
  'starter-spark': {
    name: 'Starter Spark',
    price: 9,
    period: 'one-time',
    description: 'Perfect for single offer creation',
    features: [
      '1 complete offer generation',
      '2 offer regenerations included',
      'Full offer components',
      'Premium PDF export',
      'Email support',
      'Offer editing capabilities',
    ],
    pricePerOffer: '$9 per offer',
    gradient: 'from-orange-500 to-red-500',
    icon: Zap,
    packageType: 'starter_spark',
  },
  'growth-engine': {
    name: 'Growth Engine',
    price: 47,
    period: 'package',
    description: 'For growing businesses',
    features: [
      '10 complete offer generations',
      'All premium features',
      'Advanced offer components',
      'Premium PDF export',
      'Priority support',
      'Offer editing & regeneration',
    ],
    pricePerOffer: '$4.70 per offer',
    gradient: 'from-violet-500 to-sky-500',
    icon: Star,
    packageType: 'growth_engine',
    badge: 'Best Value',
  },
  'agency-arsenal': {
    name: 'Agency Arsenal',
    price: 99,
    period: 'package',
    description: 'For agencies and teams',
    features: [
      '30 complete offer generations',
      'All premium features',
      'Advanced offer components',
      'Premium PDF export',
      'Priority support',
      'Bulk offer management',
    ],
    pricePerOffer: '$3.30 per offer',
    gradient: 'from-sky-500 to-yellow-500',
    icon: Crown,
    packageType: 'agency_arsenal',
    badge: 'Best Deal',
  },
}

export default function CheckoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get the plan from URL parameters
    const plan = searchParams.get('plan')
    if (plan && PRICING_PLANS[plan as keyof typeof PRICING_PLANS]) {
      setSelectedPlan(plan)
    } else {
      // Default to growth-engine if no plan specified
      setSelectedPlan('growth-engine')
    }
  }, [searchParams])

  const handlePurchase = async () => {
    if (!selectedPlan || !user) return

    setIsProcessing(true)
    setError(null)

    try {
      const plan = PRICING_PLANS[selectedPlan as keyof typeof PRICING_PLANS]
      const response = await fetch('/api/purchase-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageType: plan.packageType,
          paymentDetails: {
            method: 'stripe', // In a real app, this would be handled by Stripe
            amount: plan.price,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to dashboard with success message
        router.push('/dashboard?purchase=success')
      } else {
        setError(data.error || 'Purchase failed. Please try again.')
      }
    } catch (err) {
      setError('An error occurred during purchase. Please try again.')
      console.error('Purchase error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGoBack = () => {
    router.push('/')
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen relative bg-[#F9FAFB] dotted-bg">
        <DashboardNavigation />
        <div className="flex items-center justify-center min-h-[80vh] relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
        </div>
      </div>
    )
  }

  const plan = PRICING_PLANS[selectedPlan as keyof typeof PRICING_PLANS]

  return (
    <AuthGuard>
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <button
              onClick={handleGoBack}
              className="inline-flex items-center space-x-2 text-violet-600 hover:text-violet-700 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Pricing</span>
            </button>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Complete Your Purchase</h1>
            <p className="text-xl text-slate-600">
              You're about to unlock the power of AI-driven offer generation
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Plan Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}
                >
                  <plan.icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{plan.name}</h2>
                  {plan.badge && (
                    <span className="inline-block bg-gradient-to-r from-violet-100 to-sky-100 text-violet-700 px-3 py-1 rounded-full text-sm font-bold mt-1">
                      {plan.badge}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-4xl font-bold text-slate-800">${plan.price}</span>
                  <span className="text-slate-600">/{plan.period}</span>
                </div>
                <div className="text-violet-600 font-semibold bg-violet-50 px-3 py-1 rounded-full inline-block">
                  {plan.pricePerOffer}
                </div>
              </div>

              <p className="text-slate-600 mb-6 font-medium">{plan.description}</p>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-800">What's included:</h3>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Payment Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8"
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
                <CreditCard className="h-6 w-6 text-violet-600" />
                <span>Payment Details</span>
              </h3>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* User Info */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Account Information</h4>
                  <p className="text-slate-600">{user?.name || 'User'}</p>
                  <p className="text-slate-600">{user?.email}</p>
                </div>

                {/* Order Summary */}
                <div className="p-4 bg-gradient-to-r from-violet-50 to-sky-50 rounded-lg border border-violet-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Order Summary</h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">{plan.name}</span>
                    <span className="font-bold text-slate-800">${plan.price}</span>
                  </div>
                  <div className="border-t border-violet-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Total</span>
                      <span className="font-bold text-2xl text-violet-600">${plan.price}</span>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Your payment is secure and encrypted</span>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Complete Purchase</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center">
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
