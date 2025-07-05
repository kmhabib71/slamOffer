'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Crown, Lock, ArrowRight, Target, CheckCircle } from 'lucide-react'
import { CompleteGrandSlamOffer, GrandSlamOfferData, GrandSlamComponent, MindmapItem } from '@/types'
import { SlamOfferMindmap } from '@/components/slam-offer-mindmap'
import { useAuth } from '@/app/providers/auth-provider'

interface OfferMindmapViewProps {
  offer: CompleteGrandSlamOffer
  onPurchaseClick: (componentName?: string) => void
}

export function OfferMindmapView({ offer, onPurchaseClick }: OfferMindmapViewProps) {
  const { user } = useAuth()
  const isPro = user?.subscription_tier === 'pro'

  // Helper function to get component color based on componentId
  const getComponentColor = (componentId: number): string => {
    const colors: Record<number, string> = {
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
    return colors[componentId] || 'from-violet-500 to-purple-600'
  }

  // Transform the CompleteGrandSlamOffer to GrandSlamOfferData format for the mindmap
  const mindmapData: GrandSlamOfferData = useMemo(() => {
    const components: GrandSlamComponent[] = offer.components.map((component, index) => {
      // Transform items to MindmapItem format
      const items: MindmapItem[] = component.items.slice(0, component.previewCount).map((item, itemIndex) => ({
        id: item.id,
        title: item.title,
        content: item.description,
        isEditable: false, // Not editable in this context
        order: itemIndex + 1,
      }))

      return {
        id: `component-${component.componentId}`,
        title: component.componentName,
        description: component.description,
        items,
        isEditable: false,
        color: getComponentColor(component.componentId),
        order: index + 1,
      }
    })

    return {
      id: `offer-${offer.id}`,
      title: `Grand Slam Offer - ${offer.businessContext.businessDescription.substring(0, 50)}...`,
      components,
    }
  }, [offer, getComponentColor])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-16 h-16 bg-gradient-to-br from-violet-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
        >
          <Target className="h-8 w-8 text-white" />
        </motion.div>
        
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Your Grand Slam Offer Mindmap
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
          Explore your complete offer structure visually. Each component contains the strategies 
          needed to transform your <span className="text-violet-600 font-bold">business idea</span>.
        </p>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
          <div className="bg-white/60 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-violet-600">{offer.components.length}</div>
            <div className="text-sm text-slate-600">Components</div>
          </div>
          <div className="bg-white/60 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-sky-600">
              {offer.components.reduce((sum, comp) => sum + comp.previewCount, 0)}
            </div>
            <div className="text-sm text-slate-600">{isPro ? 'Total' : 'Preview'} Items</div>
          </div>
          <div className="bg-white/60 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-emerald-600">
              {offer.components.reduce((sum, comp) => sum + (comp.totalAvailable || 12), 0)}
            </div>
            <div className="text-sm text-slate-600">Total Available</div>
          </div>
          <div className="bg-white/60 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-amber-600">{offer.totalOfferValue}</div>
            <div className="text-sm text-slate-600">Estimated Value</div>
          </div>
        </div>
      </div>

      {/* Free User Notice */}
      {!isPro && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-800 mb-2">
                🗺️ Preview Mindmap Mode
              </h3>
              <p className="text-amber-700 mb-4">
                This mindmap shows your 3 preview items per component. The complete version includes all 
                <span className="font-bold"> {offer.components.reduce((sum, comp) => sum + (comp.totalAvailable || 12), 0)} strategies</span> 
                with detailed implementation plans and visual connections.
              </p>
              <button
                onClick={() => onPurchaseClick()}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Crown className="h-5 w-5" />
                <span>Unlock Complete Mindmap</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mindmap Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-violet-50 to-sky-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Interactive Mindmap View</h3>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span>Core Components</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
                <span>Strategy Items</span>
              </div>
              {!isPro && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span>Locked Content</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mindmap Display */}
        <div className="relative" style={{ height: '800px' }}>
          <SlamOfferMindmap data={mindmapData} />
          
          {/* Overlay for locked content (Free users) */}
          {!isPro && (
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-8 text-center max-w-md mx-4"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Complete Mindmap Available
                </h3>
                
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Unlock the full interactive mindmap with all {offer.components.reduce((sum, comp) => sum + (comp.totalAvailable || 12), 0)} strategies, 
                  detailed connections, and advanced visualization features.
                </p>
                
                <div className="space-y-3 text-sm text-left mb-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Complete strategy network visualization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Interactive component relationships</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Advanced editing and customization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Professional export capabilities</span>
                  </div>
                </div>
                
                <button
                  onClick={() => onPurchaseClick()}
                  className="bg-gradient-to-r from-violet-500 to-sky-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-3 w-full justify-center"
                >
                  <Crown className="h-6 w-6" />
                  <span>Unlock Full Mindmap</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                
                <p className="text-xs text-slate-500 mt-4">
                  ✨ Instant access • 🎯 All strategies included • 📊 Advanced visualizations
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Mindmap Instructions */}
      <div className="mt-8 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6">
        <h4 className="text-lg font-bold text-slate-800 mb-4">How to Use the Mindmap</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center mb-3">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <h5 className="font-semibold text-slate-800 mb-2">Explore Components</h5>
            <p className="text-slate-600">Click on any component to expand and view its strategies. Each component represents a crucial part of your offer.</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center mb-3">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <h5 className="font-semibold text-slate-800 mb-2">Navigate Relationships</h5>
            <p className="text-slate-600">Follow the connections between components to understand how each strategy builds upon the others.</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mb-3">
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <h5 className="font-semibold text-slate-800 mb-2">Zoom & Pan</h5>
            <p className="text-slate-600">Use mouse controls to zoom in/out and pan around the mindmap for detailed exploration of your offer structure.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
