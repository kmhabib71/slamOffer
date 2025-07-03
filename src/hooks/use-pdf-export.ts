import React, { useState, useCallback } from 'react'
import { GrandSlamOfferData } from '@/types'
import { downloadPDF, generatePDFDataUrl, validatePDFOptions } from '@/utils/pdf-generator'
import { GrandSlamOfferPDFTemplate } from '@/components/pdf/grand-slam-offer-template'

interface UserInfo {
  businessName?: string
  ownerName?: string
  email?: string
  phone?: string
  website?: string
}

interface UsePDFExportOptions {
  data: GrandSlamOfferData
  userInfo?: UserInfo
  coverImageUrl?: string
}

interface UsePDFExportResult {
  exportPDF: (filename?: string) => Promise<void>
  generatePreview: () => Promise<string>
  isGenerating: boolean
  error: string | null
  clearError: () => void
}

export const usePDFExport = (options: UsePDFExportOptions): UsePDFExportResult => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const exportPDF = useCallback(
    async (filename?: string) => {
      setIsGenerating(true)
      setError(null)

      try {
        validatePDFOptions(options)

        const pdfComponent = React.createElement(GrandSlamOfferPDFTemplate, {
          data: options.data,
          userInfo: options.userInfo,
          coverImageUrl: options.coverImageUrl,
        })

        await downloadPDF(pdfComponent, {
          ...options,
          filename,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to export PDF'
        setError(errorMessage)
        throw err
      } finally {
        setIsGenerating(false)
      }
    },
    [options]
  )

  const generatePreview = useCallback(async (): Promise<string> => {
    setIsGenerating(true)
    setError(null)

    try {
      validatePDFOptions(options)

      const pdfComponent = React.createElement(GrandSlamOfferPDFTemplate, {
        data: options.data,
        userInfo: options.userInfo,
        coverImageUrl: options.coverImageUrl,
      })

      const dataUrl = await generatePDFDataUrl(pdfComponent, options)
      return dataUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF preview'
      setError(errorMessage)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [options])

  return {
    exportPDF,
    generatePreview,
    isGenerating,
    error,
    clearError,
  }
}

// Utility function to create a standard filename
export const createPDFFilename = (data: GrandSlamOfferData, userInfo?: UserInfo): string => {
  const businessName = userInfo?.businessName || 'Business'
  const offerTitle = data.title || 'Grand_Slam_Offer'
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  return `${businessName}_${offerTitle}_${timestamp}.pdf`
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

// Utility function to validate user info
export const validateUserInfo = (userInfo: UserInfo): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!userInfo.businessName || userInfo.businessName.trim().length === 0) {
    errors.push('Business name is required')
  }

  if (userInfo.email && !isValidEmail(userInfo.email)) {
    errors.push('Invalid email address')
  }

  if (userInfo.website && !isValidURL(userInfo.website)) {
    errors.push('Invalid website URL')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Helper functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
