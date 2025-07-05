'use client'

import React, { useState } from 'react'
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
import { CompleteGrandSlamOffer, CompleteOfferRequest } from '@/types'
import { GenerationAnimation } from '@/components/dashboard/generation-animation'
import { OfferResults } from '@/components/dashboard/offer-results'
import { PurchaseModal } from '@/components/dashboard/purchase-modal'
import { saveGrandSlamOffer } from '@/lib/offers'
import { AuthGuard } from '@/components/auth/auth-guard'

interface BusinessContext {
  businessDescription: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [businessContext, setBusinessContext] = useState<BusinessContext>({
    businessDescription: '',
  })

  const [currentStep, setCurrentStep] = useState<'input' | 'generating' | 'results'>('input')
  const [generatedOffer, setGeneratedOffer] = useState<CompleteGrandSlamOffer | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'mindmap' | 'text'>('text')
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

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

    try {
      const request: CompleteOfferRequest = {
        businessContext,
        userTier: user?.profile?.subscription_tier === 'pro' ? 'pro' : 'free',
        generateComplete: user?.profile?.subscription_tier === 'pro',
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
        setCurrentStep('results')

        // Save the offer to database
        try {
          const saveResult = await saveGrandSlamOffer(
            user!.id,
            data.data,
            user?.profile?.subscription_tier === 'pro' ? 'pro' : 'free'
          )

          if (!saveResult.success) {
            console.warn('Failed to save offer to database:', saveResult.error)
          }
        } catch (saveError) {
          console.warn('Error saving offer (table may not exist yet):', saveError)
          // Continue without saving - table will be created later
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

  const handlePurchaseClick = (componentName?: string) => {
    setSelectedComponent(componentName || null)
    setShowPurchaseModal(true)
  }

  const handleStartOver = () => {
    setCurrentStep('input')
    setGeneratedOffer(null)
    setError(null)
    setBusinessContext({
      businessDescription: '',
    })
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F9FAFB] dotted-bg">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
          <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-800">GrandSlamGenerator.ai</span>
                <div className="text-xs text-slate-600">Dashboard</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/previous-offers')}
                className="flex items-center space-x-2 px-4 py-2 bg-white/60 hover:bg-white/80 border border-slate-200 rounded-lg transition-all duration-200 hover:shadow-md text-slate-700 hover:text-slate-900"
              >
                <History className="h-4 w-4" />
                <span className="text-sm font-medium">Previous Offers</span>
              </button>

              <div className="flex items-center space-x-2 text-slate-700">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-100 to-sky-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-violet-700">
                    {user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold">{user?.email}</div>
                  <div className="text-xs text-slate-500 flex items-center space-x-1">
                    {user?.profile?.subscription_tier === 'pro' ? (
                      <>
                        <Crown className="h-3 w-3 text-amber-500" />
                        <span>Pro User</span>
                      </>
                    ) : (
                      <>
                        <Star className="h-3 w-3 text-slate-400" />
                        <span>Free ({user?.profile?.credits_remaining || 0} credits)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
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

                  {/* Generate Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-8 text-center"
                  >
                    <button
                      onClick={generateOffer}
                      disabled={!validateForm() || isGenerating}
                      className="bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white font-bold text-xl px-12 py-4 rounded-xl shadow-2xl shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto group"
                    >
                      <Zap className="h-6 w-6 group-hover:animate-pulse" />
                      <span>Generate My Grand Slam Offer</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-sm text-slate-500 mt-4">
                      ✨ Takes 30-60 seconds • 🎯 Powered by $100M methodology • 🚀 Instant results
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {currentStep === 'generating' && (
              <GenerationAnimation businessContext={businessContext} />
            )}

            {currentStep === 'results' && generatedOffer && (
              <OfferResults
                offer={generatedOffer}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onPurchaseClick={handlePurchaseClick}
                onStartOver={handleStartOver}
              />
            )}
          </AnimatePresence>
        </main>

        {showPurchaseModal && (
          <PurchaseModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            selectedComponent={selectedComponent}
          />
        )}
      </div>
    </AuthGuard>
  )
}
