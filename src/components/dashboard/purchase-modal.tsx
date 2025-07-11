'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Shield, Loader2, Crown, Zap, Star, Rocket } from 'lucide-react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  offerTitle: string
  onPurchaseComplete: () => Promise<void>
}

const PLANS = [
  {
    id: 'starter_spark',
    name: 'Starter Spark',
    price: 9,
    credits: 1,
    description: 'Perfect for single offer creation',
    icon: Zap,
    gradient: 'from-blue-500 to-purple-600',
    popular: true,
    features: [
      '1 complete offer generation',
      '2 offer regenerations included',
      'Full offer components',
      'Premium PDF export',
      'Email support',
    ],
  },
  {
    id: 'growth_engine',
    name: 'Growth Engine',
    price: 47,
    credits: 10,
    description: 'For growing businesses',
    icon: Star,
    gradient: 'from-purple-500 to-pink-600',
    popular: false,
    features: [
      '10 complete offer generations',
      'All premium features',
      'Advanced offer components',
      'Premium PDF export',
      'Priority support',
    ],
  },
  {
    id: 'agency_arsenal',
    name: 'Agency Arsenal',
    price: 99,
    credits: 30,
    description: 'For agencies and teams',
    icon: Rocket,
    gradient: 'from-pink-500 to-red-600',
    popular: false,
    features: [
      '30 complete offer generations',
      'All premium features',
      'Advanced offer components',
      'Premium PDF export',
      'Priority support',
    ],
  },
]

export function PurchaseModal({
  isOpen,
  onClose,
  offerTitle,
  onPurchaseComplete,
}: PurchaseModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('starter_spark')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const currentPlan = PLANS.find(plan => plan.id === selectedPlan) || PLANS[0]

  const handlePurchase = async () => {
    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Demo purchase - in real app this would integrate with payment processor
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
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Payment failed')
      }

      setPaymentSuccess(true)

      // Wait a moment to show success state, then trigger complete offer generation
      setTimeout(async () => {
        try {
          await onPurchaseComplete()
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
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
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
                    <h2 className="text-2xl font-bold mb-2">Unlock Your Complete Offer</h2>
                    <p className="text-white/90">
                      Get access to all strategies and premium features
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
                      <p className="text-slate-600 mb-4">Generating your complete offer...</p>
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                        <span className="text-sm text-slate-500">This may take a moment...</span>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {/* Plan Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {PLANS.map(plan => {
                          const Icon = plan.icon
                          const isSelected = selectedPlan === plan.id

                          return (
                            <motion.div
                              key={plan.id}
                              whileHover={{ scale: 1.02 }}
                              className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all ${
                                isSelected
                                  ? 'border-violet-500 bg-violet-50 shadow-lg'
                                  : 'border-slate-200 hover:border-violet-300 hover:shadow-md'
                              }`}
                              onClick={() => setSelectedPlan(plan.id)}
                            >
                              {plan.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                  <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                    Most Popular
                                  </span>
                                </div>
                              )}

                              <div className="text-center">
                                <div
                                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${plan.gradient} mb-4`}
                                >
                                  <Icon className="h-6 w-6 text-white" />
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mb-2">
                                  {plan.name}
                                </h3>
                                <p className="text-sm text-slate-600 mb-4">{plan.description}</p>

                                <div className="mb-4">
                                  <span className="text-3xl font-bold text-slate-800">
                                    ${plan.price}
                                  </span>
                                  <span className="text-sm text-slate-500 ml-1">one-time</span>
                                </div>

                                <div className="text-xs text-violet-600 font-semibold mb-4">
                                  ${(plan.price / plan.credits).toFixed(2)} per offer
                                </div>

                                <ul className="space-y-2 text-sm text-slate-600">
                                  {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                      <CheckCircle className="w-4 h-4 text-violet-500 mt-0.5 mr-2 flex-shrink-0" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {isSelected && (
                                <div className="absolute inset-0 rounded-xl border-2 border-violet-500 bg-violet-500/5 pointer-events-none" />
                              )}
                            </motion.div>
                          )
                        })}
                      </div>

                      {/* Demo Notice */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Demo Mode</p>
                            <p className="text-xs text-blue-600">
                              This is a demo purchase. In the real app, you'll be redirected to a
                              secure checkout page.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Error Message */}
                      {paymentError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                          <p className="text-sm text-red-800">{paymentError}</p>
                        </div>
                      )}

                      {/* Purchase Button */}
                      <div className="text-center">
                        <button
                          onClick={handlePurchase}
                          disabled={isProcessing}
                          className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                            isProcessing
                              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                              : `bg-gradient-to-r ${currentPlan.gradient} text-white hover:shadow-lg hover:scale-105`
                          }`}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <Crown className="w-5 h-5" />
                              <span>
                                Get {currentPlan.name} - ${currentPlan.price}
                              </span>
                            </>
                          )}
                        </button>

                        <p className="text-xs text-slate-500 mt-3">
                          Secure payment • 30-day money-back guarantee
                        </p>
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
