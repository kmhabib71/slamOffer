'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { authService } from '@/lib/auth'

export interface PDFDesignTemplate {
  id?: string
  name: string
  description: string
  category: 'business' | 'minimal' | 'corporate' | 'creative' | 'technical' | 'luxury'
  status: 'draft' | 'published' | 'archived'
  styles: {
    colors: {
      primary: string
      secondary: string
      accent: string
      background: string
      text: string
      muted: string
    }
    fonts: {
      primary: string
      secondary: string
      size: {
        small: number
        medium: number
        large: number
        xl: number
        xxl: number
      }
    }
    spacing: {
      xs: number
      sm: number
      md: number
      lg: number
      xl: number
    }
    borders: {
      width: number
      radius: number
      color: string
    }
  }
  components: Array<{
    id: string
    type: string
    name: string
    config: any
    order: number
  }>
}

const defaultTemplate: PDFDesignTemplate = {
  name: 'New Template',
  description: '',
  category: 'business',
  status: 'draft',
  styles: {
    colors: {
      primary: '#06B6D4',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      background: '#FFFFFF',
      text: '#0A0E1A',
      muted: '#64748B',
    },
    fonts: {
      primary: 'Helvetica',
      secondary: 'Helvetica-Bold',
      size: {
        small: 10,
        medium: 12,
        large: 16,
        xl: 20,
        xxl: 24,
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borders: {
      width: 1,
      radius: 8,
      color: '#E2E8F0',
    },
  },
  components: [],
}

export default function PDFDesignerPage() {
  const [template, setTemplate] = useState<PDFDesignTemplate>(defaultTemplate)
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  const handleSaveTemplate = async () => {
    setIsSaving(true)
    setSavedMessage('')

    try {
      const user = await authService.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data: savedTemplate, error: templateError } = await supabase
        .from('pdf_design_templates')
        .upsert({
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          status: template.status,
          created_by: user.id,
        })
        .select()
        .single()

      if (templateError) throw templateError

      const { error: stylesError } = await supabase.from('pdf_design_styles').upsert({
        template_id: savedTemplate.id,
        styles: template.styles,
      })

      if (stylesError) throw stylesError

      setTemplate(prev => ({ ...prev, id: savedTemplate.id }))
      setSavedMessage('Template saved successfully!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (error) {
      console.error('Error saving template:', error)
      setSavedMessage('Error saving template. Please try again.')
      setTimeout(() => setSavedMessage(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">PDF Template Designer</h1>
        <p className="mt-2 text-gray-600">Create and customize PDF templates for user exports</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Template Settings */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Template Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={template.name}
                  onChange={e => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={template.description}
                  onChange={e => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={template.category}
                  onChange={e =>
                    setTemplate(prev => ({
                      ...prev,
                      category: e.target.value as PDFDesignTemplate['category'],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="business">Business</option>
                  <option value="minimal">Minimal</option>
                  <option value="corporate">Corporate</option>
                  <option value="creative">Creative</option>
                  <option value="technical">Technical</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Color Scheme</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={template.styles.colors.primary}
                    onChange={e =>
                      setTemplate(prev => ({
                        ...prev,
                        styles: {
                          ...prev.styles,
                          colors: { ...prev.styles.colors, primary: e.target.value },
                        },
                      }))
                    }
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={template.styles.colors.secondary}
                    onChange={e =>
                      setTemplate(prev => ({
                        ...prev,
                        styles: {
                          ...prev.styles,
                          colors: { ...prev.styles.colors, secondary: e.target.value },
                        },
                      }))
                    }
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <input
                    type="color"
                    value={template.styles.colors.accent}
                    onChange={e =>
                      setTemplate(prev => ({
                        ...prev,
                        styles: {
                          ...prev.styles,
                          colors: { ...prev.styles.colors, accent: e.target.value },
                        },
                      }))
                    }
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <input
                    type="color"
                    value={template.styles.colors.text}
                    onChange={e =>
                      setTemplate(prev => ({
                        ...prev,
                        styles: {
                          ...prev.styles,
                          colors: { ...prev.styles.colors, text: e.target.value },
                        },
                      }))
                    }
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 min-h-96">
              <div
                className="w-full h-full p-6 rounded shadow-lg"
                style={{
                  backgroundColor: template.styles.colors.background,
                  color: template.styles.colors.text,
                }}
              >
                <div
                  className="text-2xl font-bold mb-4 pb-2 border-b-2"
                  style={{
                    color: template.styles.colors.primary,
                    borderColor: template.styles.colors.primary,
                  }}
                >
                  {template.name || 'Template Preview'}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: template.styles.colors.secondary }}
                    >
                      Section Header
                    </h3>
                    <p style={{ color: template.styles.colors.text }}>
                      This is how your content will look with the selected color scheme and styling.
                    </p>
                  </div>

                  <div
                    className="p-4 rounded"
                    style={{ backgroundColor: template.styles.colors.accent + '20' }}
                  >
                    <p style={{ color: template.styles.colors.text }}>
                      Highlighted content area with accent background
                    </p>
                  </div>

                  <div className="text-sm" style={{ color: template.styles.colors.muted }}>
                    Muted text for descriptions and secondary information
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div>
            {savedMessage && (
              <span
                className={`text-sm ${
                  savedMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {savedMessage}
              </span>
            )}
          </div>
          <div className="space-x-3">
            <Button
              variant="outline"
              onClick={() => setTemplate(prev => ({ ...prev, status: 'draft' }))}
              disabled={isSaving}
            >
              Save as Draft
            </Button>
            <Button onClick={handleSaveTemplate} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
            <Button
              onClick={() => {
                setTemplate(prev => ({ ...prev, status: 'published' }))
                handleSaveTemplate()
              }}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              Publish Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
