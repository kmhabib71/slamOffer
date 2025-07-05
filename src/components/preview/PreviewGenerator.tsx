'use client'

import { useState } from 'react'
import { PreviewRequest, PreviewResponse, ComponentId, COMPONENT_NAMES } from '@/types'

interface PreviewGeneratorProps {
  businessContext: PreviewRequest['businessContext']
  onUnlock?: () => void
}

export default function PreviewGenerator({ businessContext, onUnlock }: PreviewGeneratorProps) {
  const [loading, setLoading] = useState<Record<ComponentId, boolean>>(
    {} as Record<ComponentId, boolean>
  )
  const [previews, setPreviews] = useState<Record<ComponentId, PreviewResponse>>(
    {} as Record<ComponentId, PreviewResponse>
  )
  const [error, setError] = useState<string | null>(null)

  const generatePreview = async (componentId: ComponentId) => {
    setLoading(prev => ({ ...prev, [componentId]: true }))
    setError(null)

    try {
      const response = await fetch('/api/preview-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessContext,
          componentId,
        } as PreviewRequest),
      })

      if (!response.ok) {
        throw new Error('Failed to generate preview')
      }

      const preview = await response.json()
      setPreviews(prev => ({ ...prev, [componentId]: preview }))
    } catch (err) {
      setError('Failed to generate preview. Please try again.')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, [componentId]: false }))
    }
  }

  return (
    <div className="space-y-8">
      {Object.entries(COMPONENT_NAMES).map(([id, name]) => {
        const componentId = Number(id) as ComponentId
        const preview = previews[componentId]
        const isLoading = loading[componentId]

        return (
          <div key={id} className="bg-white/5 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{name}</h3>
              {!preview && (
                <button
                  onClick={() => generatePreview(componentId)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : 'Generate Preview'}
                </button>
              )}
            </div>

            {preview && (
              <div className="space-y-4">
                {preview.previewItems.map((item, index) => (
                  <div key={index} className="bg-white/10 rounded-md p-4">
                    <h4 className="text-lg font-medium text-cyan-400">{item.title}</h4>
                    <p className="text-gray-300 mt-1">{item.description}</p>
                    {item.value && (
                      <p className="text-emerald-400 mt-2 font-medium">Value: {item.value}</p>
                    )}
                  </div>
                ))}

                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={onUnlock}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 rounded-md text-white font-medium"
                  >
                    {preview.unlockCTA}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
}
