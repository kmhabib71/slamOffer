import React from 'react'
import { GrandSlamOfferData } from '@/types'

interface PremiumPDFTemplateProps {
  data: GrandSlamOfferData
  coverImage?: string
  userInfo?: {
    businessName?: string
    ownerName?: string
    email?: string
    phone?: string
    website?: string
  }
}

export const PremiumPDFTemplate: React.FC<PremiumPDFTemplateProps> = ({
  data,
  coverImage = '/images/cover.svg',
  userInfo = {},
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="pdf-container bg-white text-gray-900 font-sans antialiased">
      {/* Cover Page */}
      <div className="pdf-page min-h-[297mm] w-[210mm] mx-auto bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
        {/* Cover Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {coverImage && (
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url(${coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}
        </div>

        {/* Cover Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full px-16 text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">{data.title}</h1>
            <div className="w-24 h-1 bg-cyan-400 mx-auto mb-6"></div>
            <p className="text-xl text-slate-300 font-medium">Grand Slam Offer Report</p>
          </div>

          <div className="max-w-md space-y-4 text-slate-300">
            {userInfo.businessName && (
              <p className="text-lg">Created for: {userInfo.businessName}</p>
            )}
            {userInfo.ownerName && <p className="text-lg">By: {userInfo.ownerName}</p>}
            <p className="text-lg">Generated on: {currentDate}</p>
          </div>

          <div className="absolute bottom-16 left-0 right-0 text-center">
            <p className="text-cyan-400 font-semibold text-lg">GrandSlamGenerator.ai</p>
            <p className="text-slate-400 text-sm mt-1">
              Powered by Alex Hormozi's $100M Offers Methodology
            </p>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="pdf-page min-h-[297mm] w-[210mm] mx-auto bg-white px-12 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Table of Contents</h2>
          <p className="text-gray-600 text-lg">Your Grand Slam Offer Blueprint</p>
        </div>

        {/* Value Equation */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">The Value Equation</h3>
          <div className="bg-white rounded-md p-4 text-center">
            <p className="text-blue-700 font-mono text-lg">
              Value = (Dream Outcome × Likelihood) / (Time Delay × Effort & Sacrifice)
            </p>
          </div>
        </div>

        {/* TOC Items */}
        <div className="space-y-3">
          {data.components.map((component, index) => (
            <div
              key={component.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-cyan-500 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <span className="text-cyan-600 font-bold text-lg w-8 text-center">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-gray-900 font-medium">{component.title}</span>
              </div>
              <span className="text-gray-500 text-sm">Page {index + 4}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-12 right-12 text-center text-gray-500 text-sm border-t border-gray-200 pt-4">
          <p>
            This Grand Slam Offer was generated using proven methodologies from Alex Hormozi's $100M
            Offers
          </p>
        </div>
      </div>

      {/* Component Pages */}
      {data.components.map((component, componentIndex) => (
        <div
          key={component.id}
          className="pdf-page min-h-[297mm] w-[210mm] mx-auto bg-white px-12 py-16"
        >
          {/* Header */}
          <div className="mb-8 pb-6 border-b-2 border-cyan-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{data.title}</h2>
            <p className="text-gray-600">Component {componentIndex + 1} of 11</p>
          </div>

          {/* Component Content */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-cyan-500 text-white font-bold text-lg rounded-full w-10 h-10 flex items-center justify-center mr-4">
                {componentIndex + 1}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{component.title}</h3>
            </div>

            {component.description && (
              <p className="text-gray-600 text-lg italic mb-8 leading-relaxed">
                {component.description}
              </p>
            )}

            {/* Items */}
            {component.items && component.items.length > 0 && (
              <div className="space-y-6">
                {component.items.map((item, itemIndex) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-6 border-l-4 border-cyan-500 hover:shadow-md transition-shadow"
                  >
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      {itemIndex + 1}. {item.title}
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="absolute bottom-8 left-12 right-12 text-center text-gray-500 text-sm border-t border-gray-200 pt-4">
            <p>
              Page {componentIndex + 4} | {userInfo.businessName || 'Grand Slam Offer'} | Generated{' '}
              {currentDate}
            </p>
          </div>
        </div>
      ))}

      {/* Summary Page */}
      <div className="pdf-page min-h-[297mm] w-[210mm] mx-auto bg-white px-12 py-16">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-cyan-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Implementation Summary</h2>
          <p className="text-gray-600">Your Next Steps</p>
        </div>

        {/* Summary Content */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            🎯 Your Grand Slam Offer is Ready!
          </h3>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            You now have a complete offer built using Alex Hormozi's proven methodology. Here's how
            to implement it:
          </p>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-cyan-500">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">1. Review & Customize</h4>
              <p className="text-gray-700 leading-relaxed">
                Review each component and customize the details to match your specific business,
                audience, and market conditions.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-cyan-500">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">2. Test Your Messaging</h4>
              <p className="text-gray-700 leading-relaxed">
                Start with small tests to validate your offer messaging before rolling out to your
                entire audience.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-cyan-500">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                3. Create Your Sales Materials
              </h4>
              <p className="text-gray-700 leading-relaxed">
                Use this document as the foundation for your sales pages, presentations, and
                marketing materials.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-cyan-500">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">4. Launch & Optimize</h4>
              <p className="text-gray-700 leading-relaxed">
                Launch your offer and continuously optimize based on customer feedback and
                conversion data.
              </p>
            </div>
          </div>
        </div>

        {/* Final Reminder */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Remember: Make It So Good They Feel Stupid Saying No
          </h4>
          <p className="text-gray-700 text-center leading-relaxed">
            Your offer should be so compelling, so valuable, and so risk-free that your ideal
            customers can't help but say yes. If they're not saying yes, revisit the components and
            increase the value or reduce the risk.
          </p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-12 right-12 text-center text-gray-500 text-sm border-t border-gray-200 pt-4">
          <p>
            Final Page | Thank you for using GrandSlamGenerator.ai | Visit us at
            grandslamgenerator.ai
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .pdf-container {
            width: 100%;
            height: 100%;
          }

          .pdf-page {
            page-break-after: always;
            margin: 0;
            padding: 0;
          }

          .pdf-page:last-child {
            page-break-after: avoid;
          }
        }

        @media screen {
          .pdf-page {
            margin-bottom: 2rem;
            box-shadow:
              0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
        }
      `}</style>
    </div>
  )
}

export default PremiumPDFTemplate
