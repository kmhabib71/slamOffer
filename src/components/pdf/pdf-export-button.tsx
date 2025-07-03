'use client'

import React, { useState } from 'react'
import { Download, FileText, Settings, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { GrandSlamOfferData } from '@/types'
import { usePDFExport, createPDFFilename, validateUserInfo } from '@/hooks/use-pdf-export'

interface UserInfo {
  businessName?: string
  ownerName?: string
  email?: string
  phone?: string
  website?: string
}

interface PDFExportButtonProps {
  data: GrandSlamOfferData
  className?: string
  variant?: 'primary' | 'secondary' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  showSettings?: boolean
  defaultUserInfo?: UserInfo
  coverImageUrl?: string
}

interface PDFSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  userInfo: UserInfo
  onUserInfoChange: (userInfo: UserInfo) => void
  onExport: (userInfo: UserInfo) => void
  isGenerating: boolean
}

const PDFSettingsModal: React.FC<PDFSettingsModalProps> = ({
  isOpen,
  onClose,
  userInfo,
  onUserInfoChange,
  onExport,
  isGenerating,
}) => {
  const [localUserInfo, setLocalUserInfo] = useState<UserInfo>(userInfo)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateUserInfo(localUserInfo)

    if (validation.isValid) {
      onUserInfoChange(localUserInfo)
      onExport(localUserInfo)
      onClose()
    } else {
      setValidationErrors(validation.errors)
    }
  }

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setLocalUserInfo(prev => ({ ...prev, [field]: value }))
    setValidationErrors([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl light-content">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <span>PDF Export Settings</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
            <input
              type="text"
              value={localUserInfo.businessName || ''}
              onChange={e => handleInputChange('businessName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your business name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
            <input
              type="text"
              value={localUserInfo.ownerName || ''}
              onChange={e => handleInputChange('ownerName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={localUserInfo.email || ''}
              onChange={e => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={localUserInfo.website || ''}
              onChange={e => handleInputChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://your-website.com"
            />
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Please fix the following errors:</span>
              </div>
              <ul className="mt-2 text-sm text-red-600 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-center space-x-1">
                    <span>•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export PDF</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  data,
  className = '',
  variant = 'primary',
  size = 'md',
  showSettings = true,
  defaultUserInfo = {},
  coverImageUrl,
}) => {
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo)
  const [showModal, setShowModal] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const { exportPDF, isGenerating, error, clearError } = usePDFExport({
    data,
    userInfo,
    coverImageUrl,
  })

  const handleQuickExport = async () => {
    try {
      clearError()
      const filename = createPDFFilename(data, userInfo)
      await exportPDF(filename)
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const handleSettingsExport = async (newUserInfo: UserInfo) => {
    try {
      clearError()
      setUserInfo(newUserInfo)
      const filename = createPDFFilename(data, newUserInfo)
      await exportPDF(filename)
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const getButtonClasses = () => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm space-x-1',
      md: 'px-4 py-2 text-sm space-x-2',
      lg: 'px-6 py-3 text-base space-x-2',
    }

    const variantClasses = {
      primary:
        'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl',
      secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm',
      minimal: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50',
    }

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <button onClick={handleQuickExport} disabled={isGenerating} className={getButtonClasses()}>
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : exportSuccess ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>
            {isGenerating ? 'Generating...' : exportSuccess ? 'Downloaded!' : 'Export PDF'}
          </span>
        </button>

        {showSettings && (
          <button
            onClick={() => setShowModal(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="PDF Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <PDFSettingsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userInfo={userInfo}
        onUserInfoChange={setUserInfo}
        onExport={handleSettingsExport}
        isGenerating={isGenerating}
      />
    </>
  )
}
