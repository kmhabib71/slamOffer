'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CheckCircle,
  Shield,
  Loader2,
  Crown,
  Zap,
  Star,
  Rocket,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  offerTitle: string
  onPurchaseComplete: (purchaseData?: any) => Promise<void>
  offerId?: string // For unlock functionality
  businessContext?: any // For unlock functionality
}

interface UserUsageData {
  subscription_tier: string
  credits_remaining: number
  can_generate: boolean
  daily_remaining?: number
}

const PLANS = [
  {
    id: 'starter_spark',
    name: 'Starter Spark',
    price: 9,
    credits: 0, // 0 credits for new offers (designed for unlock purchases)
    regenerations: 0,
    description: 'Perfect for unlocking this specific offer',
    icon: Zap,
    gradient: 'from-blue-500 to-purple-600',
    popular: true,
    bestFor: 'Solo entrepreneurs',
    features: [
      'Unlock this complete offer',
      'Full offer components (47+ strategies)',
      'Premium PDF export',
      'Email support',
    ],
    limitations: [
      'No additional credits for new offers',
      'Purchase additional credits separately',
    ],
  },
  {
    id: 'growth_engine',
    name: 'Growth Engine',
    price: 47,
    credits: 10,
    regenerations: 0,
    description: 'For growing businesses',
    icon: Star,
    gradient: 'from-purple-500 to-pink-600',
    popular: false,
    bestFor: 'Small businesses',
    features: [
      '10 complete offer generations',
      'All premium features',
      'Advanced offer components',
      'Premium PDF export',
      'Priority support',
      'Multiple business contexts',
    ],
    limitations: [],
  },
  {
    id: 'agency_arsenal',
    name: 'Agency Arsenal',
    price: 99,
    credits: 30,
    regenerations: 0,
    description: 'For agencies and teams',
    icon: Rocket,
    gradient: 'from-pink-500 to-red-600',
    popular: false,
    bestFor: 'Agencies & teams',
    features: [
      '30 complete offer generations',
      'All premium features',
      'Advanced offer components',
      'Premium PDF export',
      'Priority support',
      'Team collaboration features',
    ],
    limitations: [],
  },
]

export function PurchaseModal({
  isOpen,
  onClose,
  offerTitle,
  onPurchaseComplete,
  offerId,
  businessContext,
}: PurchaseModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('starter_spark')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [usageData, setUsageData] = useState<UserUsageData | null>(null)
  const [loading, setLoading] = useState(true)

  const currentPlan = PLANS.find(plan => plan.id === selectedPlan) || PLANS[0]

  // Fetch current user usage data
  useEffect(() => {
    const fetchUsageData = async () => {
      if (!isOpen) return

      try {
        const response = await fetch('/api/user/usage-check')
        if (response.ok) {
          const data = await response.json()
          setUsageData({
            subscription_tier: data.profile.subscription_tier,
            credits_remaining: data.profile.credits_remaining,
            can_generate: data.generation.can_generate,
            daily_remaining: data.generation.daily_remaining,
          })
        }
      } catch (error) {
        console.error('Error fetching usage data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsageData()
  }, [isOpen])

  const handlePurchase = async () => {
    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Call the enhanced purchase-package API
      const response = await fetch('/api/purchase-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageType: selectedPlan,
          paymentDetails: {
            method: 'demo',
            amount: currentPlan.price,
          },
          // Include unlock-specific data if available
          offerId: offerId,
          businessContext: businessContext,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Payment failed')
      }

      const data = await response.json()
      console.log('Purchase successful:', data)

      setPaymentSuccess(true)

      // Business context is now handled in the backend during unlock purchase

      // Wait a moment to show success state, then trigger complete offer generation
      setTimeout(async () => {
        try {
          console.log('🎯 PURCHASE MODAL - Calling onPurchaseComplete with purchase data')
          // Pass the purchase data (including generatedOffer if available) to the callback
          await onPurchaseComplete(data)
          onClose()
        } catch (error: any) {
          console.error('Error completing purchase:', error)
          setPaymentError(error?.message || 'Failed to generate offer. Please try again.')
          setPaymentSuccess(false)
        }
      }, 1500)
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentError(error instanceof Error ? error.message : 'Payment failed. Please try again.')
      setIsProcessing(false)
    }
  }

  const resetModal = () => {
    setIsProcessing(false)
    setPaymentSuccess(false)
    setPaymentError(null)
    setSelectedPlan('starter_spark')
    setUsageData(null)
    setLoading(true)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const isCurrentPlan = usageData?.subscription_tier === selectedPlan
  const isUpgrade = usageData?.subscription_tier === 'free' && selectedPlan !== 'free'

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-violet-600 to-purple-700 px-8 py-6 text-white">
                  <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                      <Crown className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      {isUpgrade ? 'Upgrade Your Plan' : 'Unlock Your Complete Offer'}
                    </h2>
                    <p className="text-white/90">
                      {isUpgrade
                        ? 'Choose the perfect plan for your business needs'
                        : 'Get access to all strategies and premium features'}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {paymentSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">
                        Payment Successful!
                      </h3>
                      <p className="text-slate-600 mb-4">
                        {isUpgrade
                          ? 'Your plan has been upgraded!'
                          : 'Generating your complete offer...'}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                        <span className="text-sm text-slate-500">This may take a moment...</span>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {/* Current Status */}
                      {usageData && !loading && (
                        <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Info className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">
                                  Current Plan:{' '}
                                  {usageData.subscription_tier.charAt(0).toUpperCase() +
                                    usageData.subscription_tier.slice(1).replace('_', ' ')}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {usageData.credits_remaining} credits remaining
                                  {usageData.daily_remaining !== undefined &&
                                    ` • ${usageData.daily_remaining} daily remaining`}
                                </p>
                              </div>
                            </div>
                            {!usageData.can_generate && (
                              <div className="flex items-center space-x-2 text-amber-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm font-medium">Upgrade needed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Plan Selection */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {PLANS.map(plan => {
                          const Icon = plan.icon
                          const isSelected = selectedPlan === plan.id
                          const isCurrent = usageData?.subscription_tier === plan.id

                          return (
                            <motion.div
                              key={plan.id}
                              whileHover={{ scale: 1.02 }}
                              className={`relative cursor-pointer rounded-xl border-2 transition-all ${
                                isSelected
                                  ? 'border-violet-500 bg-violet-50 shadow-lg'
                                  : 'border-slate-200 hover:border-violet-300 hover:shadow-md'
                              } ${isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => !isCurrent && setSelectedPlan(plan.id)}
                            >
                              {plan.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                  <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                    Most Popular
                                  </span>
                                </div>
                              )}

                              {isCurrent && (
                                <div className="absolute -top-3 right-4">
                                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                    Current Plan
                                  </span>
                                </div>
                              )}

                              <div className="p-6">
                                <div className="text-center mb-4">
                                  <div
                                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${plan.gradient} mb-4`}
                                  >
                                    <Icon className="h-6 w-6 text-white" />
                                  </div>

                                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                                    {plan.name}
                                  </h3>
                                  <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                                  <p className="text-xs text-slate-500 mb-4">
                                    Best for: {plan.bestFor}
                                  </p>

                                  <div className="mb-4">
                                    <span className="text-3xl font-bold text-slate-800">
                                      ${plan.price}
                                    </span>
                                    <span className="text-sm text-slate-500 ml-1">one-time</span>
                                  </div>

                                  <div className="flex items-center justify-center space-x-4 mb-4">
                                    <div className="text-center">
                                      <div className="font-bold text-violet-600">
                                        {plan.credits}
                                      </div>
                                      <div className="text-xs text-slate-500">Credits</div>
                                    </div>
                                  </div>
                                </div>

                                <ul className="space-y-2 mb-4">
                                  {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-slate-700">{feature}</span>
                                    </li>
                                  ))}
                                </ul>

                                {plan.limitations.length > 0 && (
                                  <div className="border-t pt-4">
                                    <p className="text-xs font-medium text-slate-600 mb-2">
                                      Limitations:
                                    </p>
                                    <ul className="space-y-1">
                                      {plan.limitations.map((limitation, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                          <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                          <span className="text-xs text-slate-600">
                                            {limitation}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>

                      {/* Payment Error */}
                      {paymentError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                        >
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span className="text-red-800 font-medium">{paymentError}</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Purchase Button */}
                      <div className="flex justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handlePurchase}
                          disabled={isProcessing || isCurrentPlan}
                          className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                            isCurrentPlan
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : isProcessing
                                ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                                : `bg-gradient-to-r ${currentPlan.gradient} text-white hover:shadow-lg`
                          }`}
                        >
                          {isProcessing ? (
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Processing...</span>
                            </div>
                          ) : isCurrentPlan ? (
                            'Current Plan'
                          ) : (
                            `${isUpgrade ? 'Upgrade' : 'Purchase'} ${currentPlan.name} - $${currentPlan.price}`
                          )}
                        </motion.button>
                      </div>


                      {/* Demo Notice */}
                      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-5 w-5 text-amber-600" />
                          <span className="text-sm text-amber-800">
                            Demo Mode: This is a demonstration. No real payment will be processed.
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
