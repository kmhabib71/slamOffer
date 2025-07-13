'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Crown,
  Lock,
  ArrowRight,
  Zap,
  TrendingUp,
  Star,
  CheckCircle,
  Target,
  AlertTriangle,
  Lightbulb,
  Rocket,
  Layers,
  Package,
  Clock,
  Shield,
  DollarSign,
  Sparkles,
  Quote,
  FileText,
  Download,
  RefreshCw,
  Info,
} from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { CompleteGrandSlamOffer } from '@/types'
import { useAuth } from '@/app/providers/auth-provider'
import { PurchaseModal } from './purchase-modal'
import { RealTimePackingAnimation } from './real-time-packing-animation'
import { usePDFExport } from '@/hooks/use-pdf-export'

// Client-safe version for components
type ClientSafeOffer = Omit<CompleteGrandSlamOffer, '_id' | 'user_id'> & {
  _id: string
  user_id: string
}

interface OfferTextViewProps {
  offer: ClientSafeOffer
  onPurchaseClick: () => void
  isPurchased?: boolean
}

interface UserUsageData {
  can_generate: boolean
  remaining_credits: number
  subscription_tier: string
  daily_remaining?: number
}

const getComponentIcon = (componentId: number) => {
  const iconMap: Record<number, React.ComponentType<{ className?: string }>> = {
    1: Target,
    2: AlertTriangle,
    3: Lightbulb,
    4: Rocket,
    5: Layers,
    6: Package,
    7: Clock,
    8: Zap,
    9: Star,
    10: Shield,
    11: Sparkles,
  }
  return iconMap[componentId] || Target
}

const getComponentGradient = (componentId: number) => {
  const gradients: Record<number, string> = {
    1: 'from-pink-500 to-rose-600',
    2: 'from-orange-500 to-red-600',
    3: 'from-blue-500 to-blue-700',
    4: 'from-emerald-500 to-green-600',
    5: 'from-amber-500 to-yellow-600',
    6: 'from-purple-500 to-violet-600',
    7: 'from-red-500 to-rose-600',
    8: 'from-sky-500 to-blue-600',
    9: 'from-violet-500 to-purple-600',
    10: 'from-teal-500 to-emerald-600',
    11: 'from-cyan-500 to-blue-600',
  }
  return gradients[componentId] || 'from-violet-500 to-purple-600'
}

// Realistic item counts that make the offer feel comprehensive
const getRealisticItemCount = (componentId: number) => {
  const itemCounts: Record<number, number> = {
    1: 12, // Dream Outcome Identification
    2: 47, // Problems & Obstacles List (most comprehensive)
    3: 47, // Solutions List (matches problems)
    4: 17, // Solutions Delivery Vehicles
    5: 8, // Trim & Stack
    6: 12, // Ultimate High-Value Deliverable Bundle
    7: 6, // Scarcity
    8: 8, // Urgency
    9: 15, // Bonuses
    10: 8, // Guarantees
    11: 6, // Naming
  }
  return itemCounts[componentId] || 20
}

export function OfferTextView({ offer, onPurchaseClick, isPurchased }: OfferTextViewProps) {
  const { user } = useAuth()

  // Enhanced state management
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [purchasedOffer, setPurchasedOffer] = useState<ClientSafeOffer | null>(null)
  const [expandedComponents, setExpandedComponents] = useState<Set<number>>(new Set())
  const [isPDFGenerating, setIsPDFGenerating] = useState(false)
  const [usageData, setUsageData] = useState<UserUsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user usage data
  const fetchUsageData = useCallback(async () => {
    if (!user?.email) return

    try {
      const response = await fetch('/api/user/usage-check')
      if (response.ok) {
        const data = await response.json()
        setUsageData({
          can_generate: data.generation.can_generate,
          can_regenerate: data.generation.can_regenerate,
          remaining_credits: data.generation.remaining_credits,
          regenerations_remaining: data.generation.regenerations_remaining,
          subscription_tier: data.profile.subscription_tier,
          daily_remaining: data.generation.daily_remaining,
        })
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  // Load usage data on component mount and when user changes
  useEffect(() => {
    fetchUsageData()
  }, [fetchUsageData])

  // Determine user access level
  const isPro =
    user?.profile?.subscription_tier !== 'free' ||
    isPurchased ||
    usageData?.subscription_tier !== 'free'
  const isFullOffer = isPro

  const handlePurchaseClick = () => {
    setPurchaseModalOpen(true)
  }

  const toggleComponentExpansion = (componentId: number) => {
    setExpandedComponents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(componentId)) {
        newSet.delete(componentId)
      } else {
        newSet.add(componentId)
      }
      return newSet
    })
  }

  const handlePurchaseComplete = async () => {
    setIsGenerating(true)
    setPurchaseModalOpen(false)

    try {
      const requestBody = {
        offerId: offer._id,
        businessContext: offer.businessContext,
        generateComplete: true,
        userTier: 'pro',
      }

      const response = await fetch('/api/purchase-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to process purchase')
      }

      const data = await response.json()
      setPurchasedOffer(data.data)

      // Refresh usage data after purchase
      await fetchUsageData()
    } catch (error) {
      console.error('Purchase error:', error)
      setError(error instanceof Error ? error.message : 'Purchase failed')
    } finally {
      setIsGenerating(false)
    }
  }


  // Show generation animation while processing
  if (isGenerating) {
    return (
      <RealTimePackingAnimation
        businessContext={offer.businessContext}
        offerId={offer._id}
        onComplete={data => {
          setPurchasedOffer(data)
          setIsGenerating(false)
        }}
        onError={error => {
          console.error('Generation error:', error)
          setError(error)
          setIsGenerating(false)
        }}
      />
    )
  }

  // Show purchased offer if available
  const displayOffer = purchasedOffer || offer

  const handlePDFExport = async () => {
    if (!isPro) {
      // Show purchase modal for non-pro users
      setPurchaseModalOpen(true)
      return
    }

    setIsPDFGenerating(true)

    try {
      // Create a comprehensive PDF with proper styling and automatic download
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Grand Slam Offer - ${displayOffer.businessContext.businessDescription}</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                * { box-sizing: border-box; }
                body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  margin: 0; 
                  padding: 0; 
                  line-height: 1.6; 
                  color: #1e293b;
                  background: white;
                }
                
                /* Cover Page */
                .cover-page {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: url('/GrandSlamCover.svg') center/cover no-repeat;
                  background-size: cover;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  text-align: center;
                  page-break-after: always;
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                /* Simplified content for PDF */
                .content { padding: 40px; }
                .component { margin-bottom: 30px; }
                .component-title { font-size: 24px; font-weight: bold; margin-bottom: 15px; }
                .item { margin-bottom: 15px; padding: 10px; border-left: 4px solid #8b5cf6; }
                .item-title { font-weight: bold; margin-bottom: 5px; }
                .item-description { color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="cover-page">
                <h1 style="font-size: 48px; color: white; margin-bottom: 20px;">Grand Slam Offer</h1>
                <p style="font-size: 24px; color: white;">${displayOffer.businessContext.businessDescription}</p>
              </div>
              
              <div class="content">
                ${displayOffer.components
                  .map(
                    component => `
                  <div class="component">
                    <h2 class="component-title">${component.componentName}</h2>
                    ${component.items
                      .map(
                        item => `
                      <div class="item">
                        <div class="item-title">${item.title}</div>
                        <div class="item-description">${item.description}</div>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                `
                  )
                  .join('')}
              </div>
              
              <script>
                window.onload = function() {
                  setTimeout(() => {
                    window.print();
                    window.close();
                  }, 1000);
                }
              </script>
            </body>
          </html>
        `

        printWindow.document.write(htmlContent)
        printWindow.document.close()
      }
    } catch (error) {
      console.error('PDF export error:', error)
      setError('Failed to export PDF')
    } finally {
      setIsPDFGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4"></div>
          <div className="h-4 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">Error: {error}</span>
            </div>
          </motion.div>
        )}

        {/* User Status Bar */}
        {usageData && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-violet-600" />
                  <span className="font-medium text-violet-800">
                    {usageData.subscription_tier.charAt(0).toUpperCase() +
                      usageData.subscription_tier.slice(1).replace('_', ' ')}{' '}
                    Plan
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-violet-600">
                  <span>{usageData.remaining_credits} credits remaining</span>
                  {usageData.daily_remaining !== undefined && (
                    <span>• {usageData.daily_remaining} daily remaining</span>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Original Business Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-sky-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Quote className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Your Business Description
              </h3>
              <p className="text-slate-700 leading-relaxed text-base">
                {displayOffer.businessContext.businessDescription}
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center space-x-3">
              <button
                onClick={isPro ? handlePDFExport : () => setPurchaseModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isPro
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 hover:from-slate-200 hover:to-slate-300'
                }`}
                disabled={isPDFGenerating}
              >
                {isPDFGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Download className="h-4 w-4" />
                    </motion.div>
                    <span>Generating PDF...</span>
                  </>
                ) : isPro ? (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Export PDF</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Export PDF</span>
                  </>
                )}
              </button>

            </div>
          </div>
        </motion.div>

        {/* Components */}
        <div className="space-y-12">
          {displayOffer.components.map((component, index) => {
            const Icon = getComponentIcon(component.componentId)
            const gradient = getComponentGradient(component.componentId)
            const totalItemCount = getRealisticItemCount(component.componentId)
            const remainingItems = totalItemCount - 3 // Always show 3 as preview

            return (
              <motion.div
                key={component.componentId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="space-y-6"
              >
                {/* Component Header */}
                <div className={`bg-gradient-to-r ${gradient} rounded-xl p-6 text-white`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">
                        {component.componentId}. {component.componentName}
                      </h2>
                      <p className="text-white/90 mt-1">{component.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-90">
                        {isFullOffer || isPurchased ? component.items.length : 3} of{' '}
                        {totalItemCount}
                      </div>
                      <div className="text-xs opacity-75">strategies</div>
                    </div>
                  </div>
                </div>

                {/* Component Items - Clean List Format */}
                <div className="space-y-4 pl-0 sm:pl-4">
                  {component.items
                    .slice(
                      0,
                      isFullOffer || isPurchased
                        ? expandedComponents.has(component.componentId)
                          ? component.items.length
                          : 12
                        : 3
                    )
                    .map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + itemIndex * 0.1 }}
                        className="border-l-4 border-slate-200 pl-3 sm:pl-6 py-3 hover:border-violet-400 transition-colors group"
                      >
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <div
                            className={`w-6 h-6 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
                          >
                            <span className="text-white text-xs font-bold">{itemIndex + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-2">
                              {component.componentId !== 3 && (
                                <div className="flex flex-col justify-between sm:flex-row sm:items-center gap-2 sm:gap-3 pr-10">
                                  <h3 className="text-base font-semibold text-slate-800 group-hover:text-violet-700 transition-colors pr-1 break-words">
                                    {item.title}
                                  </h3>
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.value &&
                                      item.value !== '$0 value' &&
                                      item.value !== '$0' && (
                                        <Tooltip.Root>
                                          <Tooltip.Trigger asChild>
                                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap cursor-help">
                                              <TrendingUp className="h-3 w-3" />
                                              <span>{item.value}</span>
                                            </span>
                                          </Tooltip.Trigger>
                                          <Tooltip.Portal container={document.body}>
                                            <Tooltip.Content
                                              className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg animate-in fade-in-0 zoom-in-95 z-50"
                                              sideOffset={5}
                                            >
                                              Estimated value this strategy can add to your business
                                              <Tooltip.Arrow className="fill-slate-900" />
                                            </Tooltip.Content>
                                          </Tooltip.Portal>
                                        </Tooltip.Root>
                                      )}
                                    {item.priority === 'high' && (
                                      <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap cursor-help">
                                            <Star className="h-3 w-3" />
                                            <span>High Impact</span>
                                          </span>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal container={document.body}>
                                          <Tooltip.Content
                                            className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg animate-in fade-in-0 zoom-in-95 z-50"
                                            sideOffset={5}
                                          >
                                            This strategy has a significant impact on business
                                            success
                                            <Tooltip.Arrow className="fill-slate-900" />
                                          </Tooltip.Content>
                                        </Tooltip.Portal>
                                      </Tooltip.Root>
                                    )}
                                  </div>
                                </div>
                              )}
                              {component.componentId === 3 ? (
                                <div className="space-y-3">
                                  <div className="flex flex-col justify-between sm:flex-row sm:items-start gap-2 sm:gap-3 pr-10">
                                    <h3 className="text-base font-semibold text-slate-800 group-hover:text-violet-700 transition-colors pr-1 break-words">
                                      {item.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                      {item.value &&
                                        item.value !== '$0 value' &&
                                        item.value !== '$0' && (
                                          <Tooltip.Root>
                                            <Tooltip.Trigger asChild>
                                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap cursor-help">
                                                <TrendingUp className="h-3 w-3" />
                                                <span>{item.value}</span>
                                              </span>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal container={document.body}>
                                              <Tooltip.Content
                                                className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg animate-in fade-in-0 zoom-in-95 z-50"
                                                sideOffset={5}
                                              >
                                                Estimated value this strategy can add to your
                                                business
                                                <Tooltip.Arrow className="fill-slate-900" />
                                              </Tooltip.Content>
                                            </Tooltip.Portal>
                                          </Tooltip.Root>
                                        )}
                                      {item.priority === 'high' && (
                                        <Tooltip.Root>
                                          <Tooltip.Trigger asChild>
                                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap cursor-help">
                                              <Star className="h-3 w-3" />
                                              <span>High Impact</span>
                                            </span>
                                          </Tooltip.Trigger>
                                          <Tooltip.Portal container={document.body}>
                                            <Tooltip.Content
                                              className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg animate-in fade-in-0 zoom-in-95 z-50"
                                              sideOffset={5}
                                            >
                                              This strategy has a significant impact on business
                                              success
                                              <Tooltip.Arrow className="fill-slate-900" />
                                            </Tooltip.Content>
                                          </Tooltip.Portal>
                                        </Tooltip.Root>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex flex-col">
                                      <div className="flex items-start">
                                        <span className="text-sm font-medium text-red-600 mr-2 flex-shrink-0">
                                          Problem:
                                        </span>
                                        <span className="text-sm text-slate-700">
                                          {item.linkedProblem}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col">
                                      <div className="flex items-start">
                                        <span className="text-sm font-medium text-emerald-600 mr-2 flex-shrink-0">
                                          Solution:
                                        </span>
                                        <span className="text-sm text-slate-700">
                                          {item.solutionDetails}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>

                {/* See All Button for Full Offer Users */}
                {(isFullOffer || isPurchased) && component.items.length > 12 && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => toggleComponentExpansion(component.componentId)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 hover:text-slate-900 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      {expandedComponents.has(component.componentId) ? (
                        <>
                          <span>Show Less</span>
                          <ArrowRight className="h-4 w-4 rotate-90 transform transition-transform" />
                        </>
                      ) : (
                        <>
                          <span>See All {component.items.length} Strategies</span>
                          <ArrowRight className="h-4 w-4 transform transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Blurred Unlock Section for Free Users */}
                {!isFullOffer && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    className="relative"
                  >
                    {/* Blurred Preview Items */}
                    <div className="space-y-4 pl-0 sm:pl-4 relative">
                      {[...Array(2)].map((_, i) => {
                        const itemNumber = 4 + i
                        const opacity = Math.max(0.3, 0.5 - i * 0.1)
                        const blur = `blur(${0.5 + i * 0.2}px)`

                        return (
                          <div
                            key={i}
                            className="border-l-4 border-slate-200 pl-3 sm:pl-6 py-3"
                            style={{
                              opacity,
                              filter: blur,
                              transform: `translateY(${i * 2}px)`,
                            }}
                          >
                            <div className="flex items-start space-x-3 sm:space-x-4">
                              <div
                                className={`w-6 h-6 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
                              >
                                <span className="text-white text-xs font-bold">{itemNumber}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-2">
                                  <div className="flex flex-col justify-between sm:flex-row sm:items-center gap-2 sm:gap-3 pr-10">
                                    <div className="h-4 bg-slate-300 rounded w-full sm:w-40 max-w-[200px]" />
                                    <div className="flex flex-wrap gap-1.5">
                                      <div className="h-4 bg-emerald-200 rounded w-16" />
                                      {Math.random() > 0.5 && (
                                        <div className="h-4 bg-amber-200 rounded w-12" />
                                      )}
                                    </div>
                                  </div>
                                  <div
                                    className="h-3 bg-slate-200 rounded"
                                    style={{ width: '90%' }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {/* Overlay gradient - softer fade */}
                      <div
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10"
                        style={{ top: '20%' }}
                      />

                      {/* Simplified Two-Line Unlock Section */}
                      <div className="absolute inset-x-0 bottom-0 z-20 pb-3">
                        <div className="flex flex-col items-center text-center gap-2">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Lock className="h-4 w-4" />
                            <span className="font-medium">+{remainingItems} More Strategies</span>
                            <span className="text-sm text-slate-400">•</span>
                            <span className="text-sm text-slate-500">Complete Roadmap</span>
                          </div>

                          <button
                            onClick={() => handlePurchaseClick()}
                            className={`bg-gradient-to-r ${gradient} text-white px-5 py-1.5 rounded-full font-medium text-sm hover:shadow-lg transform hover:scale-102 transition-all duration-300 flex items-center gap-2`}
                          >
                            <Crown className="h-3.5 w-3.5" />
                            <span>Unlock All {totalItemCount}</span>
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Pro User Success Message */}
                {(isFullOffer || isPurchased) && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-4 ml-4">
                    <div className="flex items-center space-x-3">
                      <Crown className="h-5 w-5 text-emerald-600" />
                      <span className="text-emerald-800 font-semibold text-sm">
                        {isPurchased ? 'Purchased Access' : 'Pro Access'}: All{' '}
                        {component.items.length} strategies unlocked
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Grand Unlock Card for Free Users */}
        {!isFullOffer && !isPurchased && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 mb-8"
          >
            <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-violet-200 p-8 text-center shadow-xl">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  Unlock Your Complete Grand Slam Offer
                </h2>
                <p className="text-lg text-slate-600 mb-4">
                  Get access to all {displayOffer.components.reduce((sum, comp) => sum + getRealisticItemCount(comp.componentId), 0)} strategies across all components
                </p>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-4xl font-bold text-violet-600">$9</span>
                  <div className="text-left">
                    <div className="text-sm font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                      Launch Time Offer
                    </div>
                    <div className="text-sm text-slate-500 line-through">Regular Price $19</div>
                  </div>
                </div>
                <p className="text-sm text-slate-600">One-time payment • Instant access</p>
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-slate-800">Complete Offer System</div>
                    <div className="text-sm text-slate-600">All 11 components fully unlocked</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-slate-800">Premium PDF Export</div>
                    <div className="text-sm text-slate-600">Professional formatted document</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-slate-800">2 Regenerations</div>
                    <div className="text-sm text-slate-600">Get different variations</div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handlePurchaseClick()}
                className="bg-gradient-to-r from-violet-600 to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-violet-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
              >
                <Crown className="h-6 w-6" />
                <span>Unlock Complete Offer - $9</span>
                <ArrowRight className="h-5 w-5" />
              </button>

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-violet-200">
                <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>Instant Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-violet-500" />
                    <span>Alex Hormozi Method</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add Purchase Modal */}
        <PurchaseModal
          isOpen={purchaseModalOpen}
          onClose={() => setPurchaseModalOpen(false)}
          offerTitle={offer.businessContext.businessDescription}
          onPurchaseComplete={handlePurchaseComplete}
        />
      </div>
    </Tooltip.Provider>
  )
}
