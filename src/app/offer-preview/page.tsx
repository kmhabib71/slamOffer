'use client'

import { useState } from 'react'
import PreviewGenerator from '@/components/preview/PreviewGenerator'
import { PreviewRequest } from '@/types'

export default function OfferPreviewPage() {
  const [businessContext, setBusinessContext] = useState<PreviewRequest['businessContext']>({
    businessType: '',
    targetMarket: '',
    mainProblem: '',
    revenueGoal: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form is already controlled by state, no need to do anything here
  }

  const handleUnlock = () => {
    // Handle premium upgrade here
    console.log('Unlock premium content')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Grand Slam Offer Preview Generator</h1>
          <p className="text-gray-400">
            Generate previews of your high-converting offer components
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Business Type</label>
              <input
                type="text"
                value={businessContext.businessType}
                onChange={e =>
                  setBusinessContext(prev => ({ ...prev, businessType: e.target.value }))
                }
                placeholder="e.g., Online Fitness Coaching"
                className="w-full bg-white/10 rounded-md px-4 py-2 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Market</label>
              <input
                type="text"
                value={businessContext.targetMarket}
                onChange={e =>
                  setBusinessContext(prev => ({ ...prev, targetMarket: e.target.value }))
                }
                placeholder="e.g., Busy professionals aged 30-45"
                className="w-full bg-white/10 rounded-md px-4 py-2 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Main Problem</label>
              <input
                type="text"
                value={businessContext.mainProblem}
                onChange={e =>
                  setBusinessContext(prev => ({ ...prev, mainProblem: e.target.value }))
                }
                placeholder="e.g., Can't lose weight despite trying multiple diets"
                className="w-full bg-white/10 rounded-md px-4 py-2 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Revenue Goal</label>
              <input
                type="text"
                value={businessContext.revenueGoal}
                onChange={e =>
                  setBusinessContext(prev => ({ ...prev, revenueGoal: e.target.value }))
                }
                placeholder="e.g., $100,000 in first 90 days"
                className="w-full bg-white/10 rounded-md px-4 py-2 text-white placeholder-gray-500"
              />
            </div>
          </div>
        </form>

        {businessContext.businessType &&
          businessContext.targetMarket &&
          businessContext.mainProblem &&
          businessContext.revenueGoal && (
            <PreviewGenerator businessContext={businessContext} onUnlock={handleUnlock} />
          )}
      </div>
    </div>
  )
}
