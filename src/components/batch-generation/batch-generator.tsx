'use client'

import React, { useState } from 'react'
import { ComponentId, COMPONENT_NAMES, PreviewResponse } from '@/types'

interface BatchGeneratorProps {
  className?: string
}

interface BusinessContext {
  businessType: string
  targetMarket: string
  mainProblem: string
  revenueGoal: string
}

export function BatchGenerator({ className }: BatchGeneratorProps) {
  const [businessContext, setBusinessContext] = useState<BusinessContext>({
    businessType: '',
    targetMarket: '',
    mainProblem: '',
    revenueGoal: ''
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<Record<ComponentId, PreviewResponse> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof BusinessContext, value: string) => {
    setBusinessContext(prev => ({ ...prev, [field]: value }))
  }

  const generateAllComponents = async () => {
    if (!businessContext.businessType || !businessContext.targetMarket || 
        !businessContext.mainProblem || !businessContext.revenueGoal) {
      setError('Please fill in all fields')
      return
    }

    setIsGenerating(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/generate-all-components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessContext }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Generation failed')
      }

      if (data.success && data.data) {
        setResults(data.data)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`w-full max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent mb-4">
          Grand Slam Offer Generator
        </h1>
        <p className="text-gray-300 text-lg">
          Generate all 11 components of your Grand Slam Offer in one optimized request
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Business Context</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Business Type
            </label>
            <input
              type="text"
              value={businessContext.businessType}
              onChange={(e) => handleInputChange('businessType', e.target.value)}
              placeholder="e.g., Online Fitness Coaching"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Market
            </label>
            <input
              type="text"
              value={businessContext.targetMarket}
              onChange={(e) => handleInputChange('targetMarket', e.target.value)}
              placeholder="e.g., Busy professionals wanting to lose weight"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Main Problem
            </label>
            <input
              type="text"
              value={businessContext.mainProblem}
              onChange={(e) => handleInputChange('mainProblem', e.target.value)}
              placeholder="e.g., No time for gym, complicated diet plans"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Revenue Goal
            </label>
            <input
              type="text"
              value={businessContext.revenueGoal}
              onChange={(e) => handleInputChange('revenueGoal', e.target.value)}
              placeholder="e.g., $10K/month"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <button
          onClick={generateAllComponents}
          disabled={isGenerating}
          className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating All Components...' : 'Generate Complete Grand Slam Offer'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-600 text-red-100 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            Your Complete Grand Slam Offer
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(Object.keys(results) as ComponentId[]).map((componentId) => {
              const component = results[componentId]
              
              return (
                <div key={componentId} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      {componentId}. {component.componentName}
                    </h3>
                    <span className="bg-cyan-500 text-xs px-2 py-1 rounded-full text-white font-medium">
                      {component.previewItems.length} of {component.totalItemsAvailable}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {component.previewItems.map((item, index) => (
                      <div key={index} className="bg-slate-700 rounded-md p-3">
                        <h4 className="font-medium text-cyan-300 mb-1">{item.title}</h4>
                        <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                        {item.value && (
                          <span className="inline-block bg-green-600 text-xs px-2 py-1 rounded text-white">
                            {item.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-600">
                    <p className="text-sm text-purple-300 font-medium">
                      {component.unlockCTA}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            <span className="text-gray-300">Generating your complete offer...</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            This may take 10-20 seconds as we create all 11 components
          </p>
        </div>
      )}
    </div>
  )
}
