'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, CreditCard, CheckCircle, Shield, AlertTriangle, Loader2 } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
// Removed Supabase import - using MongoDB/NextAuth instead
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useAuth } from '@/app/providers/auth-provider'

// Initialize Stripe only when needed
let stripePromise: Promise<any> | null = null

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  offerTitle: string
  onPurchaseComplete: () => Promise<void>
  packageType?: 'starter_spark' | 'growth_engine' | 'agency_arsenal'
}

const DEMO_CARD = {
  number: '4242 4242 4242 4242',
  exp: '12/34',
  cvc: '123',
}

function CheckoutForm({
  offerTitle,
  onPurchaseComplete,
  onClose,
  packageType = 'starter_spark',
}: {
  offerTitle: string
  onPurchaseComplete: () => Promise<void>
  onClose: () => void
  packageType?: 'starter_spark' | 'growth_engine' | 'agency_arsenal'
}) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentSystem, setPaymentSystem] = useState<'2checkout' | 'stripe'>('2checkout')

  // Package pricing information
  const packageInfo = {
    starter_spark: {
      name: 'Starter Spark',
      price: 9,
      credits: 1,
      description: 'Perfect for single offer creation',
      features: [
        '1 complete offer generation',
        '2 offer regenerations included',
        'Full offer components',
        'Premium PDF export',
        'Email support',
        'Offer editing capabilities',
      ],
    },
    growth_engine: {
      name: 'Growth Engine',
      price: 47,
      credits: 10,
      description: 'For growing businesses',
      features: [
        '10 complete offer generations',
        'All premium features',
        'Advanced offer components',
        'Premium PDF export',
        'Priority support',
        'Offer editing & regeneration',
      ],
    },
    agency_arsenal: {
      name: 'Agency Arsenal',
      price: 99,
      credits: 30,
      description: 'For agencies and teams',
      features: [
        '30 complete offer generations',
        'All premium features',
        'Advanced offer components',
        'Premium PDF export',
        'Priority support',
        'Bulk offer management',
      ],
    },
  }

  const currentPackage = packageInfo[packageType]

  useEffect(() => {
    // Default to 2checkout payment system since we're not using Supabase anymore
    setPaymentSystem('2checkout')
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Call the package purchase API
      const response = await fetch('/api/purchase-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageType,
          paymentDetails: {
            // In a real app, this would contain payment processor details
            method: 'demo',
            amount: currentPackage.price,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Payment failed')
      }

      const data = await response.json()
      console.log('Package purchase successful:', data)

      setPaymentSuccess(true)
      setIsProcessing(false)

      // Wait a moment to show success state, then trigger complete offer generation
      setTimeout(async () => {
        let retryCount = 0
        const maxRetries = 3

        while (retryCount < maxRetries) {
          try {
            await onPurchaseComplete()
            break // Success - exit the retry loop
          } catch (error: any) {
            console.error('Error completing purchase:', error)
            retryCount++

            if (retryCount === maxRetries) {
              setPaymentError(error?.message || 'Failed to generate offer. Please try again.')
              setPaymentSuccess(false)
              onClose()
              return
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentError(error instanceof Error ? error.message : 'Payment failed. Please try again.')
      setIsProcessing(false)
    }
  }

  if (paymentSuccess) {
    return (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4"
        >
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </motion.div>
        <h3 className="text-lg font-semibold text-slate-800">Payment Successful!</h3>
        <p className="text-slate-600 mt-1">Generating your complete offer...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Package Features */}
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-6 border border-violet-100">
        <h4 className="text-lg font-semibold text-slate-900 mb-2">{currentPackage.name} Package</h4>
        <p className="text-slate-600 mb-4">{currentPackage.description}</p>
        <ul className="space-y-3">
          {currentPackage.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="w-5 h-5 text-violet-600 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-slate-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-lg font-semibold text-slate-900">{currentPackage.name} Package</h4>
            <p className="text-sm text-slate-600 mt-1">
              {currentPackage.credits} offer{currentPackage.credits > 1 ? 's' : ''} included
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">${currentPackage.price}</div>
            <div className="text-sm text-slate-500">One-time payment</div>
            <div className="text-xs text-violet-600 font-semibold">
              ${(currentPackage.price / currentPackage.credits).toFixed(2)} per offer
            </div>
          </div>
        </div>

        {paymentSystem === 'stripe' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Card Details</label>
              <div className="bg-slate-50 rounded-lg p-4">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#1e293b',
                        '::placeholder': {
                          color: '#94a3b8',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">2Checkout Secure Payment</label>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-slate-600">
                  You will be redirected to 2Checkout's secure payment page
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Demo Card Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center text-sm text-blue-700">
            <CreditCard className="w-4 h-4 mr-2" />
            <span>
              Demo Card: {DEMO_CARD.number} | Exp: {DEMO_CARD.exp} | CVC: {DEMO_CARD.cvc}
            </span>
          </div>
        </div>
      </div>

      {paymentError && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{paymentError}</div>
      )}

      {/* Security Badge */}
      <div className="flex items-center justify-center text-sm text-slate-500 space-x-2">
        <Shield className="w-4 h-4" />
        <span>Secure {paymentSystem === 'stripe' ? 'Stripe' : '2Checkout'} Payment</span>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Purchase ${currentPackage.name} Package`
        )}
      </button>
    </form>
  )
}

function StripeCheckoutForm(props: {
  offerTitle: string
  onPurchaseComplete: () => Promise<void>
  onClose: () => void
  packageType?: 'starter_spark' | 'growth_engine' | 'agency_arsenal'
}) {
  const stripe = useStripe()
  const elements = useElements()
  return <CheckoutForm {...props} />
}

export function PurchaseModal({
  isOpen,
  onClose,
  offerTitle,
  onPurchaseComplete,
  packageType = 'starter_spark',
}: PurchaseModalProps) {
  const [error, setError] = useState<string | null>(null)

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-500 p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Purchase {offerTitle}</h3>
                    <p className="text-slate-600 mt-1">
                      Get instant access to{' '}
                      {offerTitle.includes('Component') ? 'this component' : 'all premium features'}
                    </p>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200"
                  >
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                    {error.includes('session') || error.includes('token') ? (
                      <button
                        onClick={() => (window.location.href = '/auth/login')}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Click here to log in again
                      </button>
                    ) : null}
                  </motion.div>
                )}

                <CheckoutForm
                  offerTitle={offerTitle}
                  onPurchaseComplete={onPurchaseComplete}
                  onClose={onClose}
                  packageType={packageType}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
