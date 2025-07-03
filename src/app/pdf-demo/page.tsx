'use client'

import React from 'react'
import { PDFExportButton } from '@/components/pdf/pdf-export-button'
import { GrandSlamOfferData } from '@/types'

export default function PDFDemoPage() {
  const sampleData: GrandSlamOfferData = {
    id: 'demo-1',
    title: 'Demo Grand Slam Offer',
    components: [
      {
        id: 'comp-1',
        title: 'Dream Outcome',
        description: 'Sample description',
        color: 'from-purple-500 to-purple-600',
        isEditable: false,
        order: 1,
        items: [
          {
            id: 'item-1',
            title: 'Sample Item',
            content: 'Sample content',
            isEditable: true,
            order: 1,
          },
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">PDF Export Demo</h1>

      <PDFExportButton
        data={sampleData}
        defaultUserInfo={{
          businessName: 'Demo Business',
          ownerName: 'Demo User',
        }}
      />
    </div>
  )
}
