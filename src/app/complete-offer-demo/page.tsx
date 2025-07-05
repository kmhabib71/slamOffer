'use client'

import React, { useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import { CompleteGrandSlamOffer } from '@/types'
import { OfferDisplay } from '@/components/offer/offer-display'
import { fetchWithAuth } from '@/utils/fetchWithAuth'

export default function CompleteOfferDemoPage() {
  const [offer, setOffer] = useState<CompleteGrandSlamOffer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateOffer = async () => {
    setLoading(true)
    setOffer(null)
    setError(null)

    try {
      const response = await fetch('/api/generate-complete-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessContext: {
            businessType: 'Online Fitness Coaching',
            targetMarket: 'Busy professionals aged 30-45 who want to lose weight',
            mainProblem: "No time for gym, complicated diet plans, lack of accountability",
            revenueGoal: '$10,000/month',
          },
          userTier: 'free', // Show free tier experience
          generateComplete: false, // Free users get preview
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setOffer(data.data)
      } else {
        throw new Error(data.error || 'Failed to generate offer')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dotted-bg">
      {/* Header matching landing page style */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">GrandSlamGenerator.ai</span>
          </div>
          <div className="text-sm text-slate-600 font-semibold">
            Complete Offer Demo
          </div>
        </nav>
      </header>

      {/* Main Content */}
      {!offer ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-800 mb-4">
                See Your 
                <span className="bg-gradient-to-r from-violet-600 via-sky-500 to-yellow-500 bg-clip-text text-transparent">
                  Grand Slam Offer
                </span>
                <br />
                Come to Life
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Watch AI transform a simple fitness coaching idea into a comprehensive 
                <span className="text-sky-600 font-bold">$100M-style offer</span> using 
                Alex Hormozi's proven methodology.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl p-8 mb-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Demo Business Context</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="bg-violet-50 rounded-lg p-3">
                  <span className="text-sm font-semibold text-violet-800">Business Type:</span>
                  <p className="text-violet-700">Online Fitness Coaching</p>
                </div>
                <div className="bg-sky-50 rounded-lg p-3">
                  <span className="text-sm font-semibold text-sky-800">Target Market:</span>
                  <p className="text-sky-700">Busy professionals aged 30-45</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <span className="text-sm font-semibold text-amber-800">Main Problem:</span>
                  <p className="text-amber-700">No time for gym, complicated diets</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <span className="text-sm font-semibold text-emerald-800">Revenue Goal:</span>
                  <p className="text-emerald-700">$10,000/month</p>
                </div>
              </div>
            </div>

            <button
              onClick={generateOffer}
              disabled={loading}
              className="bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white font-bold text-xl px-12 py-4 rounded-xl shadow-2xl shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Generating Your Offer...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6" />
                  <span>Generate My Grand Slam Offer</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            {loading && (
              <div className="mt-8 bg-white/60 backdrop-blur-md rounded-xl p-6">
                <div className="space-y-3">
                  {[
                    'Analyzing business context using Hormozi methodology...',
                    'Generating dream outcomes and problem identification...',
                    'Creating solutions and delivery vehicles...',
                    'Building value stack and offer optimization...',
                    'Finalizing premium preview with conversion elements...'
                  ].map((step, index) => (
                    <div key={index} className="flex items-center space-x-3 text-left">
                      <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-sky-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <div>
                    <p className="font-semibold text-red-800">Generation Error</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <OfferDisplay components={offer.components} />
      )}
    </div>
  )
}

