'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { CompleteGrandSlamOffer } from '@/types'
import { useAuth } from '@/app/providers/auth-provider'
import { PurchaseModal } from './purchase-modal'
import { GenerationAnimation } from './generation-animation'

// Client-safe version for components
type ClientSafeOffer = Omit<CompleteGrandSlamOffer, '_id' | 'user_id'> & {
  _id: string
  user_id: string
}

interface OfferTextViewProps {
  offer: ClientSafeOffer
  onPurchaseClick: (componentName?: string) => void
  isPurchased?: boolean
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
  // isPurchased indicates if the offer owner has purchased the full version
  // This determines what content is available to view (for both owner and public viewers)
  const isPro = user?.profile?.subscription_tier === 'pro' || isPurchased
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [purchasedOffer, setPurchasedOffer] = useState<ClientSafeOffer | null>(null)
  const [expandedComponents, setExpandedComponents] = useState<Set<number>>(new Set())

  // Check if this is a full offer (pro user or purchased offer)
  // If the user has purchased the offer, always treat it as a full offer
  // regardless of the actual item count (in case AI generation didn't work properly)
  const isFullOffer = isPro

  const handlePurchaseClick = (componentName: string) => {
    setSelectedComponent(componentName)
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

      console.log('Sending purchase request:', requestBody)
      console.log('Offer object:', {
        _id: offer._id,
        businessContext: offer.businessContext,
        hasBusinessContext: !!offer.businessContext,
        businessDescription: offer.businessContext?.businessDescription,
      })

      const response = await fetch('/api/purchase-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const data = await response.json()
        console.error('Purchase API error:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          details: data.details,
        })
        throw new Error(data.error || 'Failed to process purchase')
      }

      const data = await response.json()
      setPurchasedOffer(data.data)
    } catch (error) {
      console.error('Purchase error:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsGenerating(false)
    }
  }

  // Show generation animation while processing
  if (isGenerating) {
    return <GenerationAnimation businessContext={offer.businessContext} />
  }

  // Show purchased offer if available
  const displayOffer = purchasedOffer || offer

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="max-w-5xl mx-auto p-6 space-y-8">
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
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Your Business Description
              </h3>
              <p className="text-slate-700 leading-relaxed text-base">
                {displayOffer.businessContext.businessDescription}
              </p>
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
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
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
                                          <Tooltip.Portal>
                                            <Tooltip.Content
                                              className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg animate-in fade-in-0 zoom-in-95"
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
                                        <Tooltip.Portal>
                                          <Tooltip.Content
                                            className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg animate-in fade-in-0 zoom-in-95"
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
                                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
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
                                            <Tooltip.Portal>
                                              <Tooltip.Content
                                                className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg animate-in fade-in-0 zoom-in-95"
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
                                          <Tooltip.Portal>
                                            <Tooltip.Content
                                              className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg animate-in fade-in-0 zoom-in-95"
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
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
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
                            onClick={() => handlePurchaseClick(component.componentName)}
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
