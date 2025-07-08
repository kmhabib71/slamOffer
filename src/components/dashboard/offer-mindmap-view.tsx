'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Crown, Lock, ArrowRight, Target, CheckCircle } from 'lucide-react'
import {
  CompleteGrandSlamOffer,
  GrandSlamOfferData,
  GrandSlamComponent,
  MindmapItem,
} from '@/types'
import { SlamOfferMindmap } from '@/components/slam-offer-mindmap'
import { useAuth } from '@/app/providers/auth-provider'

// Client-safe version for components
type ClientSafeOffer = Omit<CompleteGrandSlamOffer, '_id' | 'user_id'> & {
  _id: string
  user_id: string
}

interface OfferMindmapViewProps {
  offer: ClientSafeOffer
  onPurchaseClick: (componentName?: string) => void
  isPurchased?: boolean
}

export function OfferMindmapView({ offer, onPurchaseClick, isPurchased }: OfferMindmapViewProps) {
  const { user } = useAuth()
  const isPro = user?.profile?.subscription_tier === 'pro' || isPurchased

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
  const mindmapData: Omit<GrandSlamOfferData, '_id'> & { _id: string } = useMemo(() => {
    const components: GrandSlamComponent[] = offer.components.map((component, index) => {
      // For Solutions component, show both problems and solutions
      let items: MindmapItem[] = []

      if (component.componentName.toLowerCase().includes('solution')) {
        // For Solutions component, combine problems and solutions
        const itemsToShow = isPro
          ? component.items
          : component.items.slice(0, component.previewCount)
        items = itemsToShow.map((item, itemIndex) => ({
          id: item.id,
          title: item.title,
          content: item.description, // Show full description
          isEditable: false,
          order: itemIndex + 1,
        }))
      } else {
        // For other components, show items normally
        const itemsToShow = isPro
          ? component.items
          : component.items.slice(0, component.previewCount)
        items = itemsToShow.map((item, itemIndex) => ({
          id: item.id,
          title: item.title,
          content: item.description, // Show full description
          isEditable: false,
          order: itemIndex + 1,
        }))
      }

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
      _id: offer._id,
      title: `Grand Slam Offer - ${offer.businessContext.businessDescription.substring(0, 50)}...`,
      components,
    }
  }, [offer, getComponentColor, isPro])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-8">
        {/* <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-16 h-16 bg-gradient-to-br from-violet-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
        >
          <Target className="h-8 w-8 text-white" />
        </motion.div> */}

        {/* <h2 className="text-3xl font-bold text-slate-800 mb-4">Your Grand Slam Offer Mindmap</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
          Explore your complete offer structure visually. Each component contains the strategies
          needed to transform your <span className="text-violet-600 font-bold">business idea</span>.
        </p> */}

        {/* Stats */}
        {/* <div className="grid md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
          <div className="bg-white/60 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-violet-600">{offer.components.length}</div>
            <div className="text-sm text-slate-600">Components</div>
          </div>
          <div className="bg-white/60 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-sky-600">
              {offer.components.reduce(
                (sum, comp) => sum + (isPro ? comp.items.length : comp.previewCount),
                0
              )}
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
        </div> */}
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
              <h3 className="text-lg font-bold text-amber-800 mb-2">🗺️ Preview Mindmap Mode</h3>
              <p className="text-amber-700 mb-4">
                This mindmap shows your{' '}
                {offer.components.reduce((sum, comp) => sum + comp.previewCount, 0)} preview items.
                The complete version includes all
                <span className="font-bold">
                  {' '}
                  {offer.components.reduce(
                    (sum, comp) => sum + (comp.totalAvailable || 12),
                    0
                  )}{' '}
                  strategies
                </span>
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
                  <span>Preview Mode</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mindmap Display */}
        <div className="relative" style={{ height: '800px' }}>
          <SlamOfferMindmap data={mindmapData as any} />
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
            <p className="text-slate-600">
              Click on any component to expand and view its strategies. Each component represents a
              crucial part of your offer.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center mb-3">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <h5 className="font-semibold text-slate-800 mb-2">Navigate Relationships</h5>
            <p className="text-slate-600">
              Follow the connections between components to understand how each strategy builds upon
              the others.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mb-3">
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <h5 className="font-semibold text-slate-800 mb-2">Zoom & Pan</h5>
            <p className="text-slate-600">
              Use mouse controls to zoom in/out and pan around the mindmap for detailed exploration
              of your offer structure.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
