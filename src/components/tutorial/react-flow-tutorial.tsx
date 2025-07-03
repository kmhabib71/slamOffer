'use client'

import React, { useState } from 'react'
import {
  Step1BasicFlow,
  Step2CustomNodes,
  Step3DynamicNodes,
  Step4Connectors,
  Step5InteractiveMindmap,
  Step6TextViewToggle,
} from './tutorial-steps'

const steps = [
  {
    id: 1,
    title: 'Step 1: Basic React Flow Setup',
    description: 'Learn the fundamentals - nodes, edges, and basic flow',
    component: Step1BasicFlow,
  },
  {
    id: 2,
    title: 'Step 2: Custom Nodes',
    description: 'Create beautiful custom nodes with styling',
    component: Step2CustomNodes,
  },
  {
    id: 3,
    title: 'Step 3: Dynamic Nodes',
    description: 'Add, edit, and delete nodes dynamically',
    component: Step3DynamicNodes,
  },
  {
    id: 4,
    title: 'Step 4: Smart Connectors',
    description: 'Connect nodes with intelligent edge handling',
    component: Step4Connectors,
  },
  {
    id: 5,
    title: 'Step 5: Interactive Mindmap',
    description: 'Build a full-featured interactive mindmap',
    component: Step5InteractiveMindmap,
  },
  {
    id: 6,
    title: 'Step 6: Text View Toggle',
    description: 'Add text view toggle and multiple view modes',
    component: Step6TextViewToggle,
  },
]

export const ReactFlowTutorial: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1)
  const [showCode, setShowCode] = useState(false)

  const currentStep = steps.find(step => step.id === activeStep)
  const CurrentComponent = currentStep?.component

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Tutorial Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map(step => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                activeStep === step.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="font-semibold text-sm">{step.title}</div>
              <div className="text-xs mt-1 opacity-75">{step.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Display */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{currentStep?.title}</h3>
              <p className="text-gray-600 mt-1">{currentStep?.description}</p>
            </div>
            <button
              onClick={() => setShowCode(!showCode)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              {showCode ? 'Hide Code' : 'Show Code'}
            </button>
          </div>
        </div>

        <div className="p-6">{CurrentComponent && <CurrentComponent showCode={showCode} />}</div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className={`px-6 py-3 rounded-lg font-semibold ${
            activeStep === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-800'
          }`}
        >
          Previous Step
        </button>

        <button
          onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
          disabled={activeStep === steps.length}
          className={`px-6 py-3 rounded-lg font-semibold ${
            activeStep === steps.length
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Next Step
        </button>
      </div>
    </div>
  )
}
