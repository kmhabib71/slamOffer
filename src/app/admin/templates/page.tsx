'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface PDFTemplate {
  id: string
  name: string
  description: string
  category: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  created_by: string
  is_default: boolean
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<PDFTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_design_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (templateId: string, newStatus: PDFTemplate['status']) => {
    try {
      const { error } = await supabase
        .from('pdf_design_templates')
        .update({ status: newStatus })
        .eq('id', templateId)

      if (error) throw error

      // Update local state
      setTemplates(prev =>
        prev.map(template =>
          template.id === templateId ? { ...template, status: newStatus } : template
        )
      )
    } catch (error) {
      console.error('Error updating template status:', error)
    }
  }

  const handleSetDefault = async (templateId: string) => {
    try {
      // First, remove default from all templates
      await supabase
        .from('pdf_design_templates')
        .update({ is_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000') // Match all

      // Then set the selected template as default
      const { error } = await supabase
        .from('pdf_design_templates')
        .update({ is_default: true })
        .eq('id', templateId)

      if (error) throw error

      // Update local state
      setTemplates(prev =>
        prev.map(template => ({
          ...template,
          is_default: template.id === templateId,
        }))
      )
    } catch (error) {
      console.error('Error setting default template:', error)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const { error } = await supabase.from('pdf_design_templates').delete().eq('id', templateId)

      if (error) throw error

      // Update local state
      setTemplates(prev => prev.filter(template => template.id !== templateId))
    } catch (error) {
      console.error('Error deleting template:', error)
    }
  }

  const filteredTemplates = templates.filter(template => {
    if (filter === 'all') return true
    return template.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PDF Templates</h1>
            <p className="mt-2 text-gray-600">Manage your PDF design templates</p>
          </div>
          <Link href="/admin/pdf-designer">
            <Button>
              <span className="mr-2">➕</span>
              Create New Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {(['all', 'published', 'draft', 'archived'] as const).map(filterOption => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterOption)}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              <span className="ml-2 text-xs">
                {filterOption === 'all'
                  ? templates.length
                  : templates.filter(t => t.status === filterOption).length}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                  <span className="text-sm text-gray-500 capitalize">{template.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(template.status)}`}
                  >
                    {template.status}
                  </span>
                  {template.is_default && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {template.description || 'No description provided'}
              </p>

              <div className="text-xs text-gray-500 mb-4">
                Created: {new Date(template.created_at).toLocaleDateString()}
                <br />
                Updated: {new Date(template.updated_at).toLocaleDateString()}
              </div>

              <div className="flex space-x-2">
                <Link href={`/admin/pdf-designer?template=${template.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Edit
                  </Button>
                </Link>

                <div className="flex space-x-1">
                  {template.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(template.id, 'published')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Publish
                    </Button>
                  )}

                  {template.status === 'published' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(template.id, 'archived')}
                    >
                      Archive
                    </Button>
                  )}

                  {!template.is_default && template.status === 'published' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetDefault(template.id)}
                      title="Set as default template"
                    >
                      ⭐
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete template"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? "You haven't created any templates yet."
              : `No ${filter} templates found.`}
          </p>
          <Link href="/admin/pdf-designer">
            <Button>Create Your First Template</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
