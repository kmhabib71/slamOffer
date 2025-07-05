'use client'

import React from 'react'
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
  Quote
} from 'lucide-react'
import { CompleteGrandSlamOffer } from '@/types'
import { useAuth } from '@/app/providers/auth-provider'

interface OfferTextViewProps {
  offer: CompleteGrandSlamOffer
  onPurchaseClick: (componentName?: string) => void
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
    1: 12,  // Dream Outcome Identification
    2: 47,  // Problems & Obstacles List (most comprehensive)
    3: 47,  // Solutions List (matches problems)
    4: 17,  // Solutions Delivery Vehicles
    5: 8,   // Trim & Stack
    6: 12,  // Ultimate High-Value Deliverable Bundle
    7: 6,   // Scarcity
    8: 8,   // Urgency
    9: 15,  // Bonuses
    10: 8,  // Guarantees
    11: 6,  // Naming
  }
  return itemCounts[componentId] || 20
}

export function OfferTextView({ offer, onPurchaseClick }: OfferTextViewProps) {
  const { user } = useAuth()
  const isPro = user?.subscription_tier === 'pro'
  
  return (
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
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Your Business Description</h3>
            <p className="text-slate-700 leading-relaxed text-base">
              {offer.businessContext.businessDescription}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Components */}
      <div className="space-y-12">
        {offer.components.map((component, index) => {
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
                      {isPro ? totalItemCount : 3} of {totalItemCount}
                    </div>
                    <div className="text-xs opacity-75">strategies</div>
                  </div>
                </div>
              </div>

              {/* Component Items - Clean List Format */}
              <div className="space-y-4 pl-4">
                {component.items.slice(0, 3).map((item, itemIndex) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: (index * 0.1) + (itemIndex * 0.1) }}
                    className="border-l-4 border-slate-200 pl-6 py-3 hover:border-violet-400 transition-colors group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-6 h-6 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                        <span className="text-white text-xs font-bold">{itemIndex + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                            {item.title}
                          </h3>
                          {item.value && (
                            <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">
                              <TrendingUp className="h-3 w-3" />
                              <span>{item.value}</span>
                            </span>
                          )}
                          {item.priority === 'high' && (
                            <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                              <Star className="h-3 w-3" />
                              <span>High Impact</span>
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Blurred Unlock Section for Free Users */}
              {!isPro && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: (index * 0.1) + 0.3 }}
                  className="relative"
                >
                  {/* Blurred Preview Items - Show 6-8 blurred items to create illusion */}
                  <div className="space-y-4 pl-4 relative">
                    {/* Create realistic blurred items that gradually fade */}
                    {[...Array(8)].map((_, i) => {
                      const itemNumber = 4 + i
                      const opacity = Math.max(0.1, 0.5 - (i * 0.08)) // Gradual fade
                      const blur = `blur(${0.5 + (i * 0.3)}px)`
                      
                      return (
                        <div 
                          key={i} 
                          className="border-l-4 border-slate-200 pl-6 py-3"
                          style={{ 
                            opacity, 
                            filter: blur,
                            transform: `translateY(${i * 2}px)` 
                          }}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`w-6 h-6 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                              <span className="text-white text-xs font-bold">{itemNumber}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 bg-slate-300 rounded" style={{ width: `${120 + Math.random() * 100}px` }} />
                                <div className="h-4 bg-emerald-200 rounded w-16" />
                                {Math.random() > 0.5 && <div className="h-4 bg-amber-200 rounded w-12" />}
                              </div>
                              <div className="space-y-2">
                                <div className="h-3 bg-slate-200 rounded" style={{ width: `${80 + Math.random() * 20}%` }} />
                                <div className="h-3 bg-slate-200 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
                                {Math.random() > 0.6 && <div className="h-3 bg-slate-200 rounded" style={{ width: `${40 + Math.random() * 40}%` }} />}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Strong overlay that starts from item 4 */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10 rounded-lg" style={{ top: '0px' }} />
                    
                    {/* Unlock Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-20" style={{ top: '40px' }}>
                      <div className="text-center bg-white/98 backdrop-blur-md rounded-xl border border-slate-200 shadow-2xl p-6 max-w-sm">
                        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                          <Lock className="h-7 w-7 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">
                          +{remainingItems} More Strategies
                        </h4>
                        <p className="text-sm text-slate-600 mb-1">
                          Complete implementation roadmap
                        </p>
                        <p className="text-xs text-slate-500 mb-4">
                          Advanced tactics • Real examples • Step-by-step guides
                        </p>
                        <button
                          onClick={() => onPurchaseClick(component.componentName)}
                          className={`bg-gradient-to-r ${gradient} text-white px-8 py-3 rounded-lg font-bold text-sm hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2 w-full justify-center`}
                        >
                          <Crown className="h-4 w-4" />
                          <span>Unlock All {totalItemCount} Strategies</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                        <p className="text-xs text-slate-400 mt-3">
                          💎 Premium • 🚀 Instant Access • 📄 PDF Export
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Pro User Success Message */}
              {isPro && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-4 ml-4">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-5 w-5 text-emerald-600" />
                    <span className="text-emerald-800 font-semibold text-sm">
                      Pro Access: All {component.items.length} strategies unlocked
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
