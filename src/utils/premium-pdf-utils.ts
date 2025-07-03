import { GrandSlamOfferData } from '@/types'

export interface PDFExportOptions {
  format: 'print' | 'download' | 'puppeteer'
  filename?: string
  includeMetadata?: boolean
  quality?: 'standard' | 'high' | 'premium'
}

export interface PDFMetadata {
  title: string
  author: string
  subject: string
  keywords: string[]
  creator: string
  producer: string
}

export const generatePDFMetadata = (
  data: GrandSlamOfferData,
  userInfo?: {
    businessName?: string
    ownerName?: string
  }
): PDFMetadata => {
  return {
    title: `${data.title} - Grand Slam Offer`,
    author: userInfo?.ownerName || 'GrandSlamGenerator.ai',
    subject: 'Business Offer Document',
    keywords: ['grand slam offer', 'business', 'marketing', 'sales', 'alex hormozi'],
    creator: 'GrandSlamGenerator.ai',
    producer: 'Premium PDF Template',
  }
}

export const generatePDFFilename = (data: GrandSlamOfferData): string => {
  const sanitizedTitle = data.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)

  const date = new Date().toISOString().split('T')[0]
  return `grand-slam-offer-${sanitizedTitle}-${date}.pdf`
}

export const exportToPDF = async (
  htmlContent: string,
  options: PDFExportOptions = { format: 'print' }
): Promise<string | void> => {
  const { format = 'print', filename, includeMetadata = true, quality = 'standard' } = options

  switch (format) {
    case 'print':
      return exportToPrint(htmlContent)

    case 'download':
      return exportToDownload(htmlContent, filename)

    case 'puppeteer':
      return exportWithPuppeteer(htmlContent, { filename, includeMetadata, quality })

    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

const exportToPrint = (htmlContent: string): void => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Failed to open print window')
  }

  const printStyles = `
    <style>
      @media print {
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .pdf-page { 
          page-break-after: always; 
          margin: 0; 
          padding: 0; 
          min-height: 297mm;
          width: 210mm;
        }
        .pdf-page:last-child { 
          page-break-after: avoid; 
        }
        @page {
          size: A4;
          margin: 0;
        }
      }
      @media screen {
        .pdf-page { 
          margin-bottom: 2rem; 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); 
        }
      }
    </style>
  `

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Grand Slam Offer PDF</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
        ${printStyles}
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `)

  printWindow.document.close()

  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.print()
    printWindow.close()
  }
}

const exportToDownload = async (htmlContent: string, filename?: string): Promise<void> => {
  // For browser-based download, we'll use the print functionality
  // In a real implementation, you might want to use a service like jsPDF or similar
  console.log('Download functionality would be implemented here')
  exportToPrint(htmlContent)
}

const exportWithPuppeteer = async (
  htmlContent: string,
  options: { filename?: string; includeMetadata?: boolean; quality?: string }
): Promise<string> => {
  // This would be implemented on the server side with Puppeteer
  // For now, we'll return a placeholder
  console.log('Puppeteer export would be implemented on the server side')

  // Example API call to server-side Puppeteer service
  try {
    const response = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        options,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate PDF')
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    // Trigger download
    const a = document.createElement('a')
    a.href = url
    a.download = options.filename || 'grand-slam-offer.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return url
  } catch (error) {
    console.error('Error generating PDF with Puppeteer:', error)
    throw error
  }
}

export const validatePDFContent = (data: GrandSlamOfferData): string[] => {
  const errors: string[] = []

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Offer title is required')
  }

  if (!data.components || data.components.length === 0) {
    errors.push('At least one component is required')
  }

  data.components?.forEach((component, index) => {
    if (!component.title || component.title.trim().length === 0) {
      errors.push(`Component ${index + 1} title is required`)
    }

    if (!component.items || component.items.length === 0) {
      errors.push(`Component "${component.title}" must have at least one item`)
    }
  })

  return errors
}

export const optimizeForPrint = (htmlContent: string): string => {
  // Add print-specific optimizations
  return htmlContent
    .replace(/<script[^>]*>.*?<\/script>/gs, '') // Remove scripts
    .replace(/<style[^>]*>.*?<\/style>/gs, '') // Remove inline styles (we'll add our own)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

export const getPrintStyles = (): string => {
  return `
    <style>
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
        }
        
        .pdf-page { 
          page-break-after: always; 
          margin: 0; 
          padding: 0; 
          min-height: 297mm;
          width: 210mm;
          box-sizing: border-box;
        }
        
        .pdf-page:last-child { 
          page-break-after: avoid; 
        }
        
        @page {
          size: A4;
          margin: 0;
        }
        
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid;
          page-break-inside: avoid;
        }
        
        .bg-gradient-to-br {
          background: linear-gradient(to bottom right, var(--tw-gradient-stops));
        }
        
        .from-slate-50 {
          --tw-gradient-from: #f8fafc;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(248, 250, 252, 0));
        }
        
        .to-white {
          --tw-gradient-to: #ffffff;
        }
      }
    </style>
  `
}
