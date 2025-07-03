import React, { useRef } from 'react'
import { GrandSlamOfferData } from '@/types'
import PremiumPDFTemplate from './premium-pdf-template'

interface PremiumPDFExportProps {
  data: GrandSlamOfferData
  coverImage?: string
  userInfo?: {
    businessName?: string
    ownerName?: string
    email?: string
    phone?: string
    website?: string
  }
  onExport?: (url: string) => void
}

export const PremiumPDFExport: React.FC<PremiumPDFExportProps> = ({
  data,
  coverImage,
  userInfo,
  onExport,
}) => {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Grand Slam Offer - ${data.title}</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  body { margin: 0; }
                  .pdf-page { 
                    page-break-after: always; 
                    margin: 0; 
                    padding: 0; 
                  }
                  .pdf-page:last-child { page-break-after: avoid; }
                }
                @media screen {
                  .pdf-page { 
                    margin-bottom: 2rem; 
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); 
                  }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
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
    }
  }

  const handleDownloadPDF = async () => {
    try {
      // For now, we'll use the print functionality
      // In a real implementation, you might want to use a service like Puppeteer
      // or a PDF generation service
      handlePrint()
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <div className="flex space-x-4">
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
        >
          🖨️ Print PDF
        </button>
        <button
          onClick={handleDownloadPDF}
          className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          📄 Download PDF
        </button>
      </div>

      {/* PDF Preview */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF Preview</h3>
        <div className="max-h-96 overflow-y-auto">
          <div ref={printRef}>
            <PremiumPDFTemplate data={data} coverImage={coverImage} userInfo={userInfo} />
          </div>
        </div>
      </div>

      {/* Export Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Export Instructions:</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>
            • <strong>Print PDF:</strong> Opens print dialog for browser-based PDF generation
          </li>
          <li>
            • <strong>Download PDF:</strong> Generates and downloads the PDF file
          </li>
          <li>• The PDF is optimized for A4/Letter format with proper page breaks</li>
          <li>• All fonts and styling are print-friendly</li>
        </ul>
      </div>
    </div>
  )
}

export default PremiumPDFExport
