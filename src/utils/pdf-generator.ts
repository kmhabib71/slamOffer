import { pdf } from '@react-pdf/renderer'
import { GrandSlamOfferData } from '@/types'

interface UserInfo {
  businessName?: string
  ownerName?: string
  email?: string
  phone?: string
  website?: string
}

interface PDFGenerationOptions {
  data: GrandSlamOfferData
  userInfo?: UserInfo
  coverImageUrl?: string
  filename?: string
}

export const generatePDFBlob = async (
  component: React.ReactElement<any>,
  options: PDFGenerationOptions
): Promise<Blob> => {
  try {
    const blob = await pdf(component).toBlob()
    return blob
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}

export const downloadPDF = async (
  component: React.ReactElement<any>,
  options: PDFGenerationOptions
): Promise<void> => {
  try {
    const blob = await generatePDFBlob(component, options)
    const url = URL.createObjectURL(blob)

    const filename =
      options.filename || `${options.data.title.replace(/[^a-zA-Z0-9]/g, '_')}_Grand_Slam_Offer.pdf`

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading PDF:', error)
    throw new Error('Failed to download PDF')
  }
}

export const generatePDFDataUrl = async (
  component: React.ReactElement<any>,
  options: PDFGenerationOptions
): Promise<string> => {
  try {
    const blob = await generatePDFBlob(component, options)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert blob to data URL'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error generating PDF data URL:', error)
    throw new Error('Failed to generate PDF data URL')
  }
}

export const formatBusinessName = (businessName: string): string => {
  return businessName.replace(/[^a-zA-Z0-9\s]/g, '').trim()
}

export const validatePDFOptions = (options: PDFGenerationOptions): boolean => {
  if (!options.data) {
    throw new Error('PDF data is required')
  }

  if (!options.data.title) {
    throw new Error('PDF title is required')
  }

  if (!options.data.components || options.data.components.length === 0) {
    throw new Error('PDF components are required')
  }

  return true
}
