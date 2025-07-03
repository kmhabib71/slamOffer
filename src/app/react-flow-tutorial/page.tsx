'use client'

import React from 'react'
import { ReactFlowTutorial } from '@/components/tutorial/react-flow-tutorial'

export default function ReactFlowTutorialPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">React Flow Tutorial</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn React Flow from scratch! This interactive tutorial will teach you how to create
              dynamic mindmaps, custom nodes, connectors, and toggle between different views.
            </p>
          </div>

          <ReactFlowTutorial />
        </div>
      </div>
    </div>
  )
}
