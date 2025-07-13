'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Eye,
  FileText,
  RotateCcw,
  Download,
  Crown,
  Lock,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Star,
  CheckCircle,
  Zap,
} from 'lucide-react'
import { CompleteGrandSlamOffer } from '@/types'
import { OfferTextView } from './offer-text-view'
import { OfferMindmapView } from './offer-mindmap-view'
import { useAuth } from '@/app/providers/auth-provider'

// Client-safe version for components
type ClientSafeOffer = Omit<CompleteGrandSlamOffer, '_id' | 'user_id'> & {
  _id: string
  user_id: string
}

interface OfferResultsProps {
  offer: ClientSafeOffer
  viewMode: 'mindmap' | 'text'
  onViewModeChange: (mode: 'mindmap' | 'text') => void
  onPurchaseClick: (componentName?: string, offerId?: string, businessContext?: any) => void
  onStartOver: () => void
  isPurchased?: boolean
}

export function OfferResults({
  offer,
  viewMode,
  onViewModeChange,
  onPurchaseClick,
  onStartOver,
  isPurchased,
}: OfferResultsProps) {
  const { user } = useAuth()
  const isOwner = user?.email === offer.user_id
  const isPro = user?.profile?.subscription_tier === 'pro' || isPurchased

  const totalItems = offer.components.reduce((sum, comp) => sum + (comp.totalAvailable || 12), 0)
  const totalPreviewItems = offer.components.reduce((sum, comp) => sum + comp.previewCount, 0)

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      {/* Success Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
        >
          <CheckCircle className="h-12 w-12 text-white" />
        </motion.div>

        <h1 className="text-4xl lg:text-5xl font-black text-slate-800 mb-4">
          🎉 Your
          <span className="bg-gradient-to-r from-violet-600 via-sky-500 to-yellow-500 bg-clip-text text-transparent">
            {' '}
            Grand Slam Offer{' '}
          </span>
          is Ready!
        </h1>

        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-6">
          We've generated a complete offer system based on
          <span className="text-sky-600 font-bold"> Alex Hormozi's $100M methodology</span> for your
          business.
        </p>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
          <div className="bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 p-4 shadow-lg">
            <div className="text-2xl font-bold text-violet-600">{offer.components.length}</div>
            <div className="text-sm text-slate-600">Components Generated</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 p-4 shadow-lg">
            <div className="text-2xl font-bold text-sky-600">
              {isPro ? totalItems : totalPreviewItems}
            </div>
            <div className="text-sm text-slate-600">
              {isPro ? 'Total Strategies' : 'Preview Items'}
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 p-4 shadow-lg">
            <div className="text-2xl font-bold text-emerald-600">{offer.totalOfferValue}</div>
            <div className="text-sm text-slate-600">Estimated Value</div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          {/* View Mode Toggle */}
          {/* <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => onViewModeChange('text')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'text'
                  ? 'bg-white text-violet-600 shadow-lg'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Text View
            </button>
            <button
              onClick={() => onViewModeChange('mindmap')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'mindmap'
                  ? 'bg-white text-violet-600 shadow-lg'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Target className="h-4 w-4 mr-2" />
              Mindmap
            </button>
          </div> */}

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {isOwner && !isPro && (
              <button
                onClick={() => onPurchaseClick(undefined, offer._id, offer.businessContext)}
                className="bg-gradient-to-r from-violet-500 to-sky-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-600 hover:to-sky-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Crown className="h-5 w-5" />
                <span>Unlock Full Offer</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {isPro && (
              <button className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Export PDF</span>
              </button>
            )}

            <button
              onClick={onStartOver}
              className="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-300 transition-all duration-300 flex items-center space-x-2"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Start Over</span>
            </button>
          </div>
        </div>
      </div>

      {/* Free User Notice */}
      {isOwner && !isPro && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-800 mb-2">
                🔥 You're viewing the preview version
              </h3>
              <p className="text-amber-700 mb-4">
                This preview shows 3 items per component ({totalPreviewItems} total). The complete
                version includes{' '}
                <span className="font-bold">
                  {totalItems - totalPreviewItems} additional premium strategies
                </span>{' '}
                that will transform your business.
              </p>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>47 Problems & Solutions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>17 Delivery Methods</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Professional PDF Export</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content Display */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* {viewMode === 'text' && ( */}
        <OfferTextView offer={offer} onPurchaseClick={onPurchaseClick} isPurchased={isPurchased} />
        {/* )} */}
        {/* {viewMode === 'mindmap' && (
          <OfferMindmapView
            offer={offer}
            onPurchaseClick={onPurchaseClick}
            isPurchased={isPurchased}
          />
        )} */}
      </div>

      {/* Bottom CTA for Free Users */}
      {isOwner && !isPro && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500 rounded-2xl p-8 text-center text-white shadow-2xl"
        >
          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
            <p className="text-xl opacity-90 mb-6">
              Unlock all {totalItems} premium strategies, get professional PDF export, and access
              the complete Grand Slam Offer system that could be worth millions to your business.
            </p>
            <button
              onClick={() => onPurchaseClick(undefined, offer._id, offer.businessContext)}
              className="bg-white text-violet-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-3"
            >
              <Crown className="h-6 w-6" />
              <span>Unlock Complete Offer - $49.99</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="text-sm opacity-75 mt-4">
              ✅ Lifetime access • ✅ All {totalItems} strategies • ✅ PDF export • ✅ 30-day
              guarantee
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
