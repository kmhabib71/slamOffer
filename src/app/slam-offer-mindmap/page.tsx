'use client'

import React from 'react'
import { SlamOfferMindmap } from '@/components/slam-offer-mindmap'

export default function SlamOfferMindmapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Grand Slam Offer Mindmap</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Interactive mindmap showing the complete structure of a Grand Slam Offer with 11 main
              components and their detailed sub-elements. Toggle between visual and text views.
            </p>
          </div>

          <SlamOfferMindmap />
        </div>
      </div>
    </div>
  )
}
