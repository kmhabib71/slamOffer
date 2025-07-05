'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Eye, 
  Zap, 
  Star, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  TrendingUp,
  Target,
  Crown,
  Rocket
} from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'
import { CompleteOfferComponent } from '@/types'

interface OfferDisplayProps {
  components: CompleteOfferComponent[]
}

// Component-specific motivational messages
const getMotivationalMessage = (componentName: string, totalAvailable: number) => {
  const messages: Record<string, string> = {
    'Dream Outcome Identification': `🎯 Unlock ${totalAvailable - 3} more specific, measurable outcomes that will transform your business into the obvious choice customers can't refuse!`,
    'Problems & Obstacles List': `⚡ Discover ${totalAvailable - 3} more pain points your competitors are missing - the secret to creating offers customers desperately need!`,
    'Solutions List': `💡 Get ${totalAvailable - 3} more "How to" solutions that eliminate every excuse and objection, making your offer irresistible!`,
    'Solutions Delivery Vehicles': `🚀 Access ${totalAvailable - 3} more scalable delivery methods that maximize value while minimizing your effort!`,
    'Trim & Stack': `⚖️ Reveal ${totalAvailable - 3} more optimization strategies that increase perceived value by 300% without increasing costs!`,
    'Ultimate High-Value Deliverable Bundle': `💎 Unlock ${totalAvailable - 3} more value-stacking techniques that make competitors look like amateurs!`,
    'Scarcity': `⏰ Learn ${totalAvailable - 3} more honest scarcity tactics that create genuine urgency without being sleazy!`,
    'Urgency': `🔥 Master ${totalAvailable - 3} more time-pressure techniques that drive immediate action and eliminate hesitation!`,
    'Bonuses': `🎁 Discover ${totalAvailable - 3} more bonus strategies that eclipse your core offer value and break prospects' minds!`,
    'Guarantees': `🛡️ Access ${totalAvailable - 3} more risk-reversal strategies that eliminate purchase resistance completely!`,
    'Naming': `✨ Get ${totalAvailable - 3} more M.A.G.I.C. formula variations that make your offer names magnetically attractive!`,
  }
  return messages[componentName] || `Unlock ${totalAvailable - 3} more premium strategies!`
}

// Generate fake blurred items for conversion
const generateBlurredItems = (count: number, componentName: string) => {
  const templates = {
    'Dream Outcome': [
      'Transform your business into the industry authority that commands premium prices',
      'Build automated systems that generate consistent revenue while you sleep',
      'Create a magnetic brand that attracts ideal customers effortlessly',
      'Establish market dominance through strategic positioning and value delivery',
      'Develop scalable processes that multiply your impact and income'
    ],
    'Problems': [
      'Customers choosing cheaper competitors despite inferior quality',
      'Inconsistent revenue streams causing cash flow stress and uncertainty',
      'Overwhelming competition making differentiation nearly impossible',
      'Complex sales processes that confuse prospects and kill conversions',
      'Lack of systematic approach leading to unpredictable business results'
    ],
    'Solutions': [
      'How to position yourself as the premium choice customers gladly pay more for',
      'How to create predictable revenue streams that eliminate financial stress',
      'How to differentiate your offer so completely that competition becomes irrelevant',
      'How to simplify your sales process for maximum conversion rates',
      'How to systematize your business for consistent, scalable growth'
    ]
  }
  
  const baseTemplates = templates['Dream Outcome'] // Default templates
  return Array.from({ length: count }, (_, i) => ({
    id: `blurred-${i}`,
    title: baseTemplates[i % baseTemplates.length] || `Advanced ${componentName} Strategy #${i + 1}`,
    description: 'This powerful strategy is revealed in the complete version. Upgrade now to access all proven methods.',
    value: `$${(Math.random() * 5000 + 1000).toFixed(0)} value`,
    isBlurred: true
  }))
}

export function OfferDisplay({ components }: OfferDisplayProps) {
  const { user } = useAuth()
  const [expandedComponent, setExpandedComponent] = useState<number | null>(1) // Start with first component expanded
  const isPro = user?.subscription_tier === 'pro'

  const handleExpand = (index: number) => {
    setExpandedComponent(prev => prev === index ? null : index)
  }

  const handleUpgradeClick = () => {
    // Handle upgrade logic here
    console.log('Redirect to upgrade page')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Your Grand Slam Offer</h1>
                <p className="text-sm text-slate-600">Generated using Alex Hormozi's $100M methodology</p>
              </div>
            </div>
            
            {!isPro && (
              <button
                onClick={handleUpgradeClick}
                className="bg-gradient-to-r from-violet-500 to-sky-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-600 hover:to-sky-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Crown className="h-5 w-5" />
                <span>Upgrade to Pro</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Components */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {components.map((component, index) => {
            const isExpanded = expandedComponent === index
            const totalItems = component.totalAvailable || 12
            const blurredItemsCount = Math.max(0, totalItems - component.previewCount)
            const blurredItems = generateBlurredItems(Math.min(blurredItemsCount, 5), component.componentName)
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Component Header */}
                <div
                  className="flex items-center justify-between px-6 py-5 cursor-pointer bg-gradient-to-r from-violet-50 to-sky-50 hover:from-violet-100 hover:to-sky-100 transition-all duration-300"
                  onClick={() => handleExpand(index)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        {component.componentId}. {component.componentName}
                      </h2>
                      <p className="text-sm text-slate-600">
                        {component.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-violet-600">
                        {isPro ? `${component.items.length} items` : `${component.previewCount} of ${totalItems} items`}
                      </div>
                      {component.totalValue && (
                        <div className="text-xs text-emerald-600 font-medium">
                          {component.totalValue} total value
                        </div>
                      )}
                    </div>
                    <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <Eye className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Component Content */}
                <motion.div
                  initial={false}
                  animate={{
                    height: isExpanded ? 'auto' : 0,
                    opacity: isExpanded ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    {/* Real Items */}
                    <div className="space-y-3 mb-4">
                      {component.items.slice(0, component.previewCount).map((item, itemIndex) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: itemIndex * 0.1 }}
                          className="bg-gradient-to-r from-violet-50 to-sky-50 rounded-xl p-4 border border-violet-100 hover:border-violet-200 transition-all duration-300"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-sky-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">{itemIndex + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-slate-800 mb-2">
                                {item.title}
                              </h3>
                              <p className="text-slate-700 mb-3 leading-relaxed">
                                {item.description}
                              </p>
                              {item.value && (
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-sm px-3 py-1 rounded-full font-medium">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{item.value}</span>
                                  </span>
                                  {item.priority === 'high' && (
                                    <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                                      <Star className="h-3 w-3" />
                                      <span>High Impact</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Blurred Items for Free Users */}
                    {!isPro && blurredItemsCount > 0 && (
                      <div className="relative">
                        {/* Blur Overlay */}
                        <div className="relative">
                          <div className="space-y-3 filter blur-sm opacity-60">
                            {blurredItems.map((item, itemIndex) => (
                              <div
                                key={item.id}
                                className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl p-4 border border-slate-200"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="w-6 h-6 bg-slate-400 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs font-bold">{component.previewCount + itemIndex + 1}</span>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-600 mb-2">
                                      {item.title}
                                    </h3>
                                    <p className="text-slate-500 mb-3">
                                      {item.description}
                                    </p>
                                    <span className="inline-block bg-slate-200 text-slate-600 text-sm px-3 py-1 rounded-full">
                                      {item.value}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Upgrade Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                            <div className="text-center p-8 max-w-md">
                              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Lock className="h-8 w-8 text-white" />
                              </div>
                              <h3 className="text-xl font-bold text-slate-800 mb-3">
                                {blurredItemsCount} More Premium Strategies
                              </h3>
                              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                                {getMotivationalMessage(component.componentName, totalItems)}
                              </p>
                              <button
                                onClick={handleUpgradeClick}
                                className="bg-gradient-to-r from-violet-500 to-sky-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-600 hover:to-sky-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
                              >
                                <Rocket className="h-4 w-4" />
                                <span>Unlock All & Export to PDF</span>
                                <ArrowRight className="h-4 w-4" />
                              </button>
                              <p className="text-xs text-slate-500 mt-2">
                                One-time payment • 30-day guarantee • Instant access
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pro User Message */}
                    {isPro && (
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                        <div className="flex items-center space-x-3">
                          <Crown className="h-5 w-5 text-emerald-600" />
                          <span className="text-emerald-800 font-semibold">Pro Access: All {component.items.length} strategies unlocked</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA for Free Users */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-12 bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500 rounded-2xl p-8 text-center text-white shadow-2xl"
          >
            <div className="max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Ready to Unlock Your Complete $100M Offer?
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Get instant access to all {components.reduce((sum, comp) => sum + (comp.totalAvailable || 12), 0)} premium strategies, 
                plus professional PDF export for presentations and implementation.
              </p>
              <button
                onClick={handleUpgradeClick}
                className="bg-white text-violet-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-3"
              >
                <Crown className="h-6 w-6" />
                <span>Upgrade to Pro - $49.99</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <p className="text-sm opacity-75 mt-4">
                ✅ Lifetime access • ✅ All 11 components • ✅ PDF export • ✅ 30-day guarantee
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
