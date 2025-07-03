'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { EnhancedPDFGenerator, PDFTemplateData } from '@/utils/enhanced-pdf-generator'
import { authService } from '@/lib/auth'

interface PDFTemplateSelectorProps {
  offerId?: string
  onTemplateSelected?: (templateId: string) => void
  showPreview?: boolean
}

export const PDFTemplateSelector: React.FC<PDFTemplateSelectorProps> = ({
  offerId,
  onTemplateSelected,
  showPreview = true,
}) => {
  const [templates, setTemplates] = useState<PDFTemplateData[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const availableTemplates = await EnhancedPDFGenerator.getAvailableTemplates()
      setTemplates(availableTemplates)

      // Get user's current selection
      const user = await authService.getCurrentUser()
      if (user) {
        const userTemplate = await EnhancedPDFGenerator.getUserTemplate(user.id, offerId)
        if (userTemplate) {
          setSelectedTemplate(userTemplate.id)
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId)
    setIsSaving(true)

    try {
      const user = await authService.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const success = await EnhancedPDFGenerator.saveUserTemplateSelection(
        user.id,
        templateId,
        offerId
      )

      if (success) {
        onTemplateSelected?.(templateId)
      }
    } catch (error) {
      console.error('Error saving template selection:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business':
        return '💼'
      case 'minimal':
        return '⚡'
      case 'corporate':
        return '🏢'
      case 'creative':
        return '🎨'
      case 'technical':
        return '⚙️'
      case 'luxury':
        return '💎'
      default:
        return '📄'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business':
        return 'bg-blue-100 text-blue-800'
      case 'minimal':
        return 'bg-gray-100 text-gray-800'
      case 'corporate':
        return 'bg-indigo-100 text-indigo-800'
      case 'creative':
        return 'bg-purple-100 text-purple-800'
      case 'technical':
        return 'bg-green-100 text-green-800'
      case 'luxury':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your PDF Design</h3>
        <p className="text-sm text-gray-600">
          Select a template that matches your brand and style preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <div
            key={template.id}
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleTemplateSelect(template.id)}
          >
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2">
                <div className="bg-blue-500 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Template Preview */}
            {showPreview && (
              <div className="mb-4">
                <div
                  className="w-full h-32 rounded border p-3 text-xs"
                  style={{
                    backgroundColor: template.styles.colors.background,
                    color: template.styles.colors.text,
                    borderColor: template.styles.colors.primary,
                  }}
                >
                  <div
                    className="font-bold mb-2 pb-1 border-b"
                    style={{
                      color: template.styles.colors.primary,
                      borderColor: template.styles.colors.primary,
                    }}
                  >
                    {template.name}
                  </div>
                  <div className="text-xs mb-1" style={{ color: template.styles.colors.secondary }}>
                    Section Header
                  </div>
                  <div className="text-xs leading-tight">
                    Sample content with your selected styling...
                  </div>
                  <div
                    className="mt-2 p-1 rounded text-xs"
                    style={{
                      backgroundColor: template.styles.colors.accent + '30',
                      borderLeft: `2px solid ${template.styles.colors.accent}`,
                    }}
                  >
                    Highlight
                  </div>
                </div>
              </div>
            )}

            {/* Template Info */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCategoryIcon(template.category)}</span>
                <span className="font-medium text-gray-900">{template.name}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(template.category)}`}
              >
                {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
              </span>

              {isSaving && selectedTemplate === template.id && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                  <span className="text-xs">Saving...</span>
                </div>
              )}
            </div>

            {/* Color Palette */}
            <div className="mt-3 flex items-center space-x-1">
              <span className="text-xs text-gray-500 mr-2">Colors:</span>
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: template.styles.colors.primary }}
                title="Primary"
              />
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: template.styles.colors.secondary }}
                title="Secondary"
              />
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: template.styles.colors.accent }}
                title="Accent"
              />
            </div>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-green-800">
              Template selected! Your PDF will use this design.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
