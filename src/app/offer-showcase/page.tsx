'use client'

import React, { useState, useEffect } from 'react'
import {
  Star,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  Users,
  Award,
  Target,
  TrendingUp,
  Gift,
  ArrowRight,
  Sparkles,
  Crown,
  Heart,
  Rocket,
  ChevronRight,
} from 'lucide-react'

// Demo data for the Grand Slam Offer with expanded problems and solutions
const offerData = {
  title: 'GRAND SLAM OFFER',
  subtitle: 'YOUR UNFAIR ADVANTAGE',
  tagline: 'STAY TUNED',
  components: [
    {
      id: 1,
      title: 'Dream Outcome Identification',
      icon: Target,
      color: 'from-blue-600 to-blue-500',
      description: "Identify your prospect's ultimate destination and dream outcomes",
      items: [
        'Build a thriving 7-figure business working just 20 hours per week',
        'Generate consistent $50K+ monthly revenue through multiple passive income streams',
        'Achieve complete location independence while running your business from anywhere',
        'Scale your impact to help thousands of clients while maintaining work-life balance',
        'Create a sustainable business model that runs efficiently without your constant presence',
        'Establish yourself as a recognized authority in your industry within 12 months',
        'Build a high-performing team that delivers exceptional results consistently',
        'Develop systems that allow for predictable growth and scalability',
      ],
    },
    {
      id: 2,
      title: 'Problems & Obstacles List',
      icon: Shield,
      color: 'from-red-600 to-red-500',
      description: 'Comprehensive list of everything that could prevent success',
      items: [
        'Struggling to generate consistent leads and convert them into high-ticket clients',
        'Overwhelmed by day-to-day operations with no time for strategic growth',
        'Unable to scale beyond trading time for money due to service delivery constraints',
        'Lack of systematic processes leading to inconsistent client results',
        'Fear of increasing prices and potentially losing existing clients',
        'Difficulty finding and retaining qualified team members',
        'Inconsistent cash flow making it hard to invest in growth',
        'No clear differentiation from competitors in a crowded market',
      ],
    },
    {
      id: 3,
      title: 'Solutions List',
      icon: CheckCircle,
      color: 'from-emerald-600 to-emerald-500',
      description: 'Transform every problem into a concrete solution',
      items: [
        'Problem: Struggling with lead generation\nSolution: Automated lead generation system with 24/7 client acquisition',
        'Problem: Overwhelmed by operations\nSolution: Complete business automation blueprint and delegation matrix',
        'Problem: Unable to scale services\nSolution: Service productization framework for scalable delivery',
        'Problem: Lack of systems\nSolution: Done-for-you process templates and SOPs for consistent results',
        'Problem: Price increase fears\nSolution: Value-based pricing strategy with proven client communication scripts',
        'Problem: Team building challenges\nSolution: A-player recruitment and retention system',
        'Problem: Cash flow issues\nSolution: Predictable revenue generation model with multiple income streams',
        'Problem: Market differentiation\nSolution: Unique market positioning strategy and brand authority system',
      ],
    },
    {
      id: 4,
      title: 'Solutions Delivery Vehicles',
      icon: Rocket,
      color: 'from-purple-600 to-purple-500',
      description: 'Multiple ways to deliver each solution effectively',
      items: [
        'Weekly 1-on-1 strategic coaching calls with direct access to experts',
        'Done-for-you tech setup and automation implementation',
        'Live group coaching and implementation workshops',
        'Private community for peer support and networking',
        '24/7 access to comprehensive training library',
        'Monthly live Q&A sessions for ongoing support',
        'Direct feedback on your implementation progress',
        'Emergency support channel for critical issues',
      ],
    },
    {
      id: 5,
      title: 'Trim & Stack Optimization',
      icon: TrendingUp,
      color: 'from-amber-600 to-amber-500',
      description: 'Maximize value while minimizing delivery costs',
      items: [
        'High-impact group coaching replacing costly 1-on-1 sessions',
        'Automated onboarding and client success tracking',
        'Scalable training delivery through recorded modules',
        'Self-serve resource library for common questions',
        'Templated solutions for recurring challenges',
        'Streamlined support through tiered access levels',
        'Batch processing for implementation reviews',
        'Community-driven support and accountability',
      ],
    },
    {
      id: 6,
      title: 'Ultimate Value Bundle',
      icon: Gift,
      color: 'from-rose-600 to-rose-500',
      description: 'Your complete transformation package',
      items: [
        'Complete Business Automation Blueprint ($5,000 value)',
        'Client Acquisition System Setup ($3,000 value)',
        'Team Building & Management Framework ($2,500 value)',
        'Service Productization Toolkit ($2,000 value)',
        'Marketing & Sales Templates Library ($1,500 value)',
        'Process Documentation System ($1,000 value)',
        'Tech Stack Integration Guide ($750 value)',
        'ROI Tracking Dashboard ($500 value)',
      ],
    },
    {
      id: 7,
      title: 'Scarcity Elements',
      icon: Clock,
      color: 'from-indigo-600 to-indigo-500',
      description: 'Limited availability to ensure quality delivery',
      items: [
        'Only 50 spots available for this quarter',
        'Limited to 10 clients per industry vertical',
        'Beta pricing available for founding members only',
        'One-time offer for early adopters',
        'Exclusive access to future updates',
        'Priority booking for strategy sessions',
        'Limited bonus package availability',
        'Grandfathered pricing for early members',
      ],
    },
    {
      id: 8,
      title: 'Urgency Triggers',
      icon: Zap,
      color: 'from-cyan-600 to-cyan-500',
      description: 'Time-sensitive opportunities driving action',
      items: [
        'Price increases by $1,000 after this week',
        'Next cohort starts in 7 days - limited spots',
        'Early bird bonus expires in 48 hours',
        'Last chance for founding member benefits',
        'Special pricing ends this month',
        'Bonus package available for first 20 only',
        'Implementation support closes soon',
        'Current offer expires at midnight',
      ],
    },
    {
      id: 9,
      title: 'Strategic Bonuses',
      icon: Crown,
      color: 'from-teal-600 to-teal-500',
      description: 'Value-packed extras that overcome objections',
      items: [
        'Private VIP Strategy Day ($2,000 value)',
        'Done-for-You Tech Setup ($1,500 value)',
        'Sales Script Templates ($1,000 value)',
        'Email Marketing Swipe File ($750 value)',
        'Social Media Content Calendar ($500 value)',
        'Lead Magnet Creation Guide ($400 value)',
        'Automation Workflow Library ($300 value)',
        'ROI Calculator Suite ($250 value)',
      ],
    },
    {
      id: 10,
      title: 'Risk-Reversal Guarantees',
      icon: Shield,
      color: 'from-orange-600 to-orange-500',
      description: 'Multiple guarantees ensuring your success',
      items: [
        '30-day "Love It or Leave It" money-back guarantee',
        '90-day implementation support guarantee',
        'Results-based satisfaction promise',
        'Double your money back if no ROI in 6 months',
        'Lifetime access to all materials',
        'Free updates for life',
        'No-questions-asked refund policy',
        'Success or 100% money back guarantee',
      ],
    },
    {
      id: 11,
      title: 'M.A.G.I.C. Naming Framework',
      icon: Sparkles,
      color: 'from-violet-600 to-violet-500',
      description: 'Create magnetic offer names that convert',
      items: [
        'Magnetic Reason Why: Compelling hook that grabs attention',
        'Avatar: Specific target audience identification',
        'Goal: Clear and achievable outcome statement',
        'Interval: Defined timeframe for results',
        'Container: Program structure and delivery format',
        'Example: "7-Figure Freedom Formula: 90-Day Business Transformation System"',
        'Example: "Elite Agency Accelerator: 6-Week Scale-Up Blueprint"',
        'Example: "Digital CEO Method: 12-Week Business Automation Intensive"',
      ],
    },
  ],
}

export default function OfferShowcase() {
  const [isVisible, setIsVisible] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleExportPDF = async () => {
    try {
      setIsExporting(true)
      const response = await fetch('/api/export-pdf', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'grand-slam-offer.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-red-950 via-red-900 to-red-950 text-white print:bg-white">
      {/* Export Button */}
      <div className="fixed top-4 right-4 z-50 print:hidden">
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className={`px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-full font-semibold text-white shadow-lg hover:from-red-700 hover:to-red-600 transition-all duration-300 flex items-center space-x-2 ${
            isExporting ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isExporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Export PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Cover Page */}
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden print:min-h-0 print:h-screen">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-red-500/20 to-transparent transform rotate-45"></div>
          <div className="absolute top-0 right-0 w-32 h-96 bg-gradient-to-r from-red-500/10 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-8 max-w-5xl mx-auto">
          <div className="mb-16 space-y-8">
            <div className="text-xl tracking-[0.2em] text-red-300 font-light">
              {offerData.tagline}
            </div>

            <h1 className="text-7xl md:text-8xl font-bold tracking-tight mb-4">
              {offerData.title}
            </h1>

            <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto"></div>

            <h2 className="text-4xl md:text-5xl font-light tracking-[0.1em] text-red-100">
              {offerData.subtitle}
            </h2>

            <div className="text-2xl font-light text-red-200 mt-12">80+ OFFER COMPONENTS</div>

            {/* Decorative Dots */}
            <div className="grid grid-cols-9 gap-2 max-w-xs mx-auto mt-12">
              {Array(45)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-red-500/30 rounded-full"></div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Component Pages */}
      {offerData.components.map((component, index) => {
        const Icon = component.icon

        return (
          <div
            key={component.id}
            className="print:h-screen print:page-break-before print:page-break-inside-avoid relative bg-white"
          >
            <div className="max-w-7xl mx-auto p-8 print:pt-16">
              {/* Header */}
              <div className="mb-16 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${component.color} shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-red-600 text-sm font-semibold tracking-wider">
                      COMPONENT {component.id}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                      {component.title}
                    </h2>
                  </div>
                </div>

                <div className={`w-24 h-1 bg-gradient-to-r ${component.color}`}></div>

                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
                  {component.description}
                </p>
              </div>

              {/* Items Grid/List */}
              <div className="grid grid-cols-1 gap-x-12 gap-y-6">
                {component.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`group hover:transform hover:translate-x-1 transition-all duration-300 ${
                      component.id === 3 ? 'space-y-2' : 'flex items-start space-x-4'
                    }`}
                  >
                    {component.id === 3 ? (
                      <>
                        <div className="flex items-start space-x-4">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${component.color} shadow-md group-hover:shadow-lg transition-all duration-300 flex-shrink-0`}
                          >
                            <ChevronRight className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {item.split('\n')[0]}
                          </p>
                        </div>
                        <p className="text-lg text-gray-700 group-hover:text-gray-900 transition-colors pl-10">
                          {item.split('\n')[1]}
                        </p>
                      </>
                    ) : (
                      <>
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-br ${component.color} shadow-md group-hover:shadow-lg transition-all duration-300 flex-shrink-0`}
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-lg text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                            {item}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      {/* Value Proposition Page */}
      <div className="print:h-screen print:page-break-before print:page-break-inside-avoid flex items-center justify-center py-24 px-8 bg-gradient-to-br from-red-950 via-red-900 to-red-950">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-red-900/50 rounded-full px-6 py-3 border border-red-500/30">
              <Crown className="w-6 h-6 text-red-400" />
              <span className="text-red-100 font-medium tracking-wider">TOTAL VALUE</span>
              <Crown className="w-6 h-6 text-red-400" />
            </div>

            <h2 className="text-6xl md:text-7xl font-bold text-red-50">Your Investment Summary</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur rounded-2xl border border-red-500/20 p-8 hover:bg-white/10 transition-colors">
              <h3 className="text-2xl font-bold text-red-100 mb-4">Package Value</h3>
              <div className="text-5xl font-bold text-red-300">$15,785</div>
              <p className="text-red-200 mt-2">Complete system worth</p>
            </div>

            <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-2xl border border-red-500/30 p-8 hover:bg-red-800 transition-colors">
              <h3 className="text-2xl font-bold text-red-100 mb-4">Your Investment</h3>
              <div className="text-5xl font-bold text-red-50">$1,997</div>
              <p className="text-red-200 mt-2">One-time payment</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur rounded-2xl border border-red-500/20 p-12 hover:bg-white/10 transition-colors">
            <p className="text-2xl text-red-100 mb-8">
              That&apos;s a <span className="font-bold text-red-400">792% ROI</span> - but the real
              value is the freedom and success you&apos;ll achieve
            </p>

            <button className="group relative px-12 py-6 bg-gradient-to-r from-red-700 to-red-600 text-white font-bold text-xl rounded-full hover:from-red-800 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              <span className="relative z-10 flex items-center space-x-3">
                <Heart className="w-6 h-6" />
                <span>Secure Your Advantage Today</span>
                <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
