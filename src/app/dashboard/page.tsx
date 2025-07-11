'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  AlertTriangle,
  DollarSign,
  Loader,
  Zap,
  Star,
  Target,
  Brain,
  CheckCircle,
  Eye,
  FileText,
  Download,
  Crown,
  History,
} from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { CompleteGrandSlamOffer, CompleteOfferRequest, CompleteOfferComponent } from '@/types'
import { GenerationAnimation } from '@/components/dashboard/generation-animation'
import { PackingAnimation } from '@/components/dashboard/packing-animation'
import { RealTimePackingAnimation } from '@/components/dashboard/real-time-packing-animation'
import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation'
import { OfferResults } from '@/components/dashboard/offer-results'
import { PurchaseModal } from '@/components/dashboard/purchase-modal'
import { PricingCheck } from '@/components/dashboard/pricing-check'

import { AuthGuard } from '@/components/auth/auth-guard'
import { useTestMode } from '@/hooks/use-test-mode'
import Link from 'next/link'

interface BusinessContext {
  businessDescription: string
}

// Client-safe version of CompleteGrandSlamOffer without ObjectId
type ClientCompleteGrandSlamOffer = Omit<CompleteGrandSlamOffer, '_id' | 'user_id'> & {
  _id: string
  user_id: string
}

export default function DashboardPage() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const { isTestMode } = useTestMode()
  const [isAdmin, setIsAdmin] = useState(false)

  const [businessContext, setBusinessContext] = useState<BusinessContext>({
    businessDescription: '',
  })

  const [currentStep, setCurrentStep] = useState<'input' | 'generating' | 'packing' | 'results'>(
    'input'
  )
  const [generatedOffer, setGeneratedOffer] = useState<ClientCompleteGrandSlamOffer | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPacking, setIsPacking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'mindmap' | 'text'>('text')
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<string | undefined>(undefined)
  const [isPurchased, setIsPurchased] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    // Check if user has admin role
    if (user?.role === 'admin') {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [user?.role])

  const handleInputChange = (value: string) => {
    setBusinessContext({ businessDescription: value })
  }

  const validateForm = () => {
    return businessContext.businessDescription.trim().length > 10
  }

  const generateOffer = async () => {
    if (!validateForm()) {
      setError('Please provide a detailed description of your business (at least 10 characters)')
      return
    }

    setIsGenerating(true)
    setCurrentStep('generating')
    setError(null)

    if (isTestMode) {
      // Use mock data for testing
      const mockData = {
        success: true,
        data: {
          _id: 'mock-offer-id-' + Date.now(),
          user_id: user!._id,
          businessContext: businessContext,
          components: [
            {
              componentId: 1,
              componentName: 'Dream Outcome Identification',
              description: "Your customer's perfect transformation story",
              items: [
                {
                  id: '1',
                  title: 'Sample Dream Outcome 1',
                  description: 'Description of the outcome',
                  value: '$1,000 value',
                  priority: 'high' as 'high' | 'medium' | 'low',
                  order: 1,
                },
                {
                  id: '2',
                  title: 'Sample Dream Outcome 2',
                  description: 'Description of another outcome',
                  value: '$500 value',
                  priority: 'medium' as 'high' | 'medium' | 'low',
                  order: 2,
                },
              ],
              isLocked: false,
              previewCount: 2,
            },
            {
              componentId: 2,
              componentName: 'Problems & Obstacles List',
              description: 'Key challenges your customers face',
              items: [
                {
                  id: '3',
                  title: 'Sample Problem 1',
                  description: 'Description of the problem',
                  value: '$800 value',
                  priority: 'high' as 'high' | 'medium' | 'low',
                  order: 1,
                },
              ],
              isLocked: true,
              previewCount: 1,
            },
            {
              componentId: 3,
              componentName: 'Solutions List',
              description: 'Your unique solution approach',
              items: [
                {
                  id: '4',
                  title: 'Sample Solution 1',
                  description: 'Description of the solution',
                  value: '$1,200 value',
                  priority: 'high' as 'high' | 'medium' | 'low',
                  order: 1,
                },
              ],
              isLocked: true,
              previewCount: 1,
            },
          ] as CompleteOfferComponent[],
          totalOfferValue: '$10,000',
          createdAt: new Date(),
          metadata: {
            tokenUsage: 0,
            generationTime: 0,
            model: 'test',
          },
        },
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 33000))

      try {
        const data = mockData

        if (data.success && data.data) {
          setGeneratedOffer(data.data)
          setIsPurchased(false) // Initial generation is not purchased
          setCurrentStep('results')

          // Save the offer to database with enhanced error handling
          try {
            if (!user?.email) {
              console.error('Cannot save offer: User email is missing')
              setError('Failed to save offer: User not authenticated')
              return
            }

            const saveResponse = await fetch('/api/offers/save', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                offerData: data.data,
                userTier: user?.profile?.subscription_tier !== 'free' ? 'pro' : 'free',
              }),
            })

            const saveResult = await saveResponse.json()

            if (!saveResponse.ok || !saveResult.success) {
              console.error('Failed to save offer to database:', saveResult.error)
              if (saveResult.error && !saveResult.error.includes('duplicate')) {
                setError(`Failed to save offer: ${saveResult.error}`)
              }
            }

            // Deduct credits after successful generation and save (Test Mode)
            try {
              const creditResponse = await fetch('/api/user/deduct-credit', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: 1 }),
              })

              const creditResult = await creditResponse.json()

              if (creditResponse.ok && creditResult.success) {
                console.log('Credits updated (Test Mode):', creditResult.message)
                // Refresh user data to update credit count in UI
                await refreshUser()
              } else {
                console.error('Failed to update credits (Test Mode):', creditResult.error)
              }
            } catch (creditError) {
              console.error('Error updating credits (Test Mode):', creditError)
            }
          } catch (saveError) {
            console.error('Unexpected error saving offer:', saveError)
            setError('An unexpected error occurred while saving your offer')
          }
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.error('Generation error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        setCurrentStep('input')
      } finally {
        setIsGenerating(false)
      }
    } else {
      // Use real API for generation
      try {
        const request: CompleteOfferRequest = {
          businessContext,
          userTier: user?.profile?.subscription_tier !== 'free' ? 'pro' : 'free',
          generateComplete: user?.profile?.subscription_tier !== 'free',
        }

        const response = await fetch('/api/generate-complete-offer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || data.details || 'Failed to generate offer')
        }

        if (data.success && data.data) {
          setGeneratedOffer(data.data)
          setIsPurchased(false) // Initial generation is not purchased
          setCurrentStep('results')

          // Save the offer to database with enhanced error handling
          try {
            if (!user?.email) {
              console.error('Cannot save offer: User email is missing')
              setError('Failed to save offer: User not authenticated')
              return
            }

            const saveResponse = await fetch('/api/offers/save', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                offerData: data.data,
                userTier: user?.profile?.subscription_tier !== 'free' ? 'pro' : 'free',
              }),
            })

            const saveResult = await saveResponse.json()

            if (!saveResponse.ok || !saveResult.success) {
              console.error('Failed to save offer to database:', saveResult.error)
              if (saveResult.error && !saveResult.error.includes('duplicate')) {
                setError(`Failed to save offer: ${saveResult.error}`)
              }
            }

            // Deduct credits after successful generation and save (Real API)
            try {
              const creditResponse = await fetch('/api/user/deduct-credit', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: 1 }),
              })

              const creditResult = await creditResponse.json()

              if (creditResponse.ok && creditResult.success) {
                console.log('Credits updated (Real API):', creditResult.message)
                // Refresh user data to update credit count in UI
                await refreshUser()
              } else {
                console.error('Failed to update credits (Real API):', creditResult.error)
              }
            } catch (creditError) {
              console.error('Error updating credits (Real API):', creditError)
            }
          } catch (saveError) {
            console.error('Unexpected error saving offer:', saveError)
            setError('An unexpected error occurred while saving your offer')
          }
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.error('Generation error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        setCurrentStep('input')
      } finally {
        setIsGenerating(false)
      }
    }
  }

  const handlePurchaseClick = (componentName?: string) => {
    setSelectedComponent(componentName)
    setShowPurchaseModal(true)
  }

  const handlePurchaseComplete = async () => {
    setShowPurchaseModal(false)
    setIsPacking(true)
    setCurrentStep('packing')
  }

  const handleRealTimePackingComplete = (data: any) => {
    console.log('Real-time packing complete:', data)
    console.log('Components in response:', data?.components?.length)

    // Convert the server response to client-safe format
    const fullOffer: ClientCompleteGrandSlamOffer = {
      ...data,
      _id: data._id.toString(),
      user_id: data.user_id.toString(),
    }

    console.log('Full offer after conversion:', fullOffer)
    console.log('Components after conversion:', fullOffer.components?.length)

    // Update the current offer with the full version
    setGeneratedOffer(fullOffer)
    setIsPurchased(true)
    setIsPacking(false)
    setCurrentStep('results')
  }

  const handleRealTimePackingError = (error: string) => {
    console.error('Real-time packing error:', error)
    setError(error)
    setIsPacking(false)
    setCurrentStep('results')
  }

  const handleStartOver = () => {
    setCurrentStep('input')
    setGeneratedOffer(null)
    setError(null)
    setIsPurchased(false)
    setBusinessContext({
      businessDescription: '',
    })
  }

  const handleGenerateAllowed = () => {
    generateOffer()
  }

  const handleUpgradeNeeded = () => {
    setShowUpgradeModal(true)
  }

  const handlePackagePurchase = async () => {
    setShowUpgradeModal(false)
    // After successful purchase, refresh the user's auth context
    // This will update their credits and subscription tier
    if (user?.email) {
      // In a real app, you might want to refresh the user's profile here
      console.log('Package purchased successfully')
    }
  }

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
        {/* Header */}
        <DashboardNavigation excludeItems={['Generate Offer']} />

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {/* Test Mode Indicator for Admins */}
          {isAdmin && (
            <div className="mb-6 flex items-center space-x-2 bg-white p-4 rounded-lg shadow-sm border">
              <div
                className={`w-2 h-2 rounded-full ${isTestMode ? 'bg-yellow-400' : 'bg-green-400'}`}
              />
              <span className="text-sm font-medium text-gray-600">
                {isTestMode ? 'Test Mode - Using Mock Data' : 'Live Mode - Using AI Generation'}
              </span>
              {isTestMode && (
                <Link
                  href="/admin/settings"
                  className="ml-auto text-sm text-violet-600 hover:text-violet-700"
                >
                  Configure Test Mode
                </Link>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                {/* Welcome Section */}
                <div className="text-center mb-12">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="w-20 h-20 bg-gradient-to-br from-violet-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                  >
                    <Brain className="h-10 w-10 text-white" />
                  </motion.div>

                  <h1 className="text-4xl lg:text-5xl font-black text-slate-800 mb-4">
                    Tell Us About Your
                    <span className="bg-gradient-to-r from-violet-600 via-sky-500 to-yellow-500 bg-clip-text text-transparent">
                      {' '}
                      Business Idea
                    </span>
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                    Our AI will transform your concept into a complete Grand Slam Offer using
                    <span className="text-sky-600 font-bold">
                      {' '}
                      Alex Hormozi's proven $100M methodology
                    </span>
                  </p>
                </div>

                {/* Input Form */}
                <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-violet-500" />
                      <span>Describe Your Business Idea</span>
                    </label>
                    <p className="text-sm text-slate-600 mb-4">
                      Tell us about your business concept. Include details like:
                      <span className="block mt-1 text-slate-500">
                        • What type of business you want to create • Who your target customers are •
                        What problems you're solving • Your revenue goals or aspirations
                      </span>
                    </p>
                    <textarea
                      value={businessContext.businessDescription}
                      onChange={e => handleInputChange(e.target.value)}
                      placeholder="e.g., I want to create an online fitness coaching business targeting busy professionals aged 30-45 who struggle to find time for the gym and want to lose 20+ pounds. They're frustrated with generic workout plans that don't fit their schedule. My goal is to reach $10,000/month by providing personalized 20-minute home workouts with accountability coaching..."
                      rows={8}
                      className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all duration-300 resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-slate-500">
                        {businessContext.businessDescription.length} characters
                      </span>
                      <span className="text-xs text-slate-400">Minimum 10 characters required</span>
                    </div>
                  </motion.div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <p className="text-red-700 font-medium">{error}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Pricing Check Component */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-8"
                  >
                    {validateForm() ? (
                      <PricingCheck
                        onGenerateAllowed={handleGenerateAllowed}
                        onUpgradeNeeded={handleUpgradeNeeded}
                        className="max-w-md mx-auto"
                      />
                    ) : (
                      <div className="text-center">
                        <button
                          disabled
                          className="bg-gray-400 text-white font-bold text-xl px-12 py-4 rounded-xl cursor-not-allowed flex items-center space-x-3 mx-auto"
                        >
                          <Zap className="h-6 w-6" />
                          <span>Complete Description First</span>
                        </button>
                        <p className="text-sm text-slate-500 mt-4">
                          Please provide at least 10 characters in your business description
                        </p>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {currentStep === 'generating' && (
              <GenerationAnimation businessContext={businessContext} />
            )}

            {currentStep === 'packing' && generatedOffer && (
              <RealTimePackingAnimation
                businessContext={generatedOffer.businessContext}
                offerId={generatedOffer._id}
                onComplete={handleRealTimePackingComplete}
                onError={handleRealTimePackingError}
              />
            )}

            {currentStep === 'results' && generatedOffer && (
              <OfferResults
                offer={generatedOffer}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onPurchaseClick={handlePurchaseClick}
                onStartOver={handleStartOver}
                isPurchased={isPurchased}
              />
            )}
          </AnimatePresence>
        </main>

        {showPurchaseModal && (
          <PurchaseModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            offerTitle={selectedComponent || 'Complete Offer'}
            onPurchaseComplete={handlePurchaseComplete}
          />
        )}

        {showUpgradeModal && (
          <PurchaseModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            offerTitle="Choose Your Package"
            onPurchaseComplete={handlePackagePurchase}
          />
        )}
      </div>
    </AuthGuard>
  )
}
