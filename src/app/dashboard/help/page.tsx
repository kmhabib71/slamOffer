'use client'

import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation'
import { motion } from 'framer-motion'
import {
  HelpCircle,
  BookOpen,
  Video,
  MessageCircle,
  Mail,
  ExternalLink,
  Play,
  FileText,
  Users,
  Zap,
  Target,
  Brain,
} from 'lucide-react'
import { useState } from 'react'

export default function HelpPage() {
  const [showOnboardingVideo, setShowOnboardingVideo] = useState(false)

  const helpSections = [
    {
      title: 'Getting Started',
      icon: Play,
      items: [
        {
          title: 'Quick Start Guide',
          description: 'Learn how to create your first Grand Slam Offer in 5 minutes',
          action: 'View Guide',
          href: '#quick-start',
        },
        {
          title: 'Onboarding Video',
          description: 'Watch our 3-minute tutorial on using the AI generator',
          action: 'Watch Video',
          onClick: () => setShowOnboardingVideo(true),
        },
        {
          title: 'Best Practices',
          description: 'Tips for creating the most effective offers',
          action: 'Read Tips',
          href: '#best-practices',
        },
      ],
    },
    {
      title: 'Features & Tools',
      icon: Zap,
      items: [
        {
          title: 'AI Offer Generator',
          description: 'How to use the AI to create compelling offers',
          action: 'Learn More',
          href: '#ai-generator',
        },
        {
          title: 'PDF Export',
          description: 'Export your offers as professional PDFs',
          action: 'View Options',
          href: '#pdf-export',
        },
        {
          title: 'Offer Templates',
          description: 'Use pre-built templates for different industries',
          action: 'Browse Templates',
          href: '#templates',
        },
      ],
    },
    {
      title: 'Account & Billing',
      icon: Users,
      items: [
        {
          title: 'Subscription Plans',
          description: 'Compare Free vs Pro features and pricing',
          action: 'View Plans',
          href: '#plans',
        },
        {
          title: 'API Usage',
          description: 'Understanding your credit usage and limits',
          action: 'Check Usage',
          href: '/dashboard/profile',
        },
        {
          title: 'Billing FAQ',
          description: 'Common questions about billing and payments',
          action: 'Read FAQ',
          href: '#billing-faq',
        },
      ],
    },
  ]

  const faqs = [
    {
      question: 'How does the AI generate offers?',
      answer:
        "Our AI is trained on Alex Hormozi's $100M methodology, analyzing your business description to create personalized offers with all 11 components of a Grand Slam Offer.",
    },
    {
      question: "What's the difference between Free and Pro?",
      answer:
        'Free users get 3 items per component with basic features. Pro users get 30-50 items per component, PDF export, premium templates, and unlimited generations.',
    },
    {
      question: 'Can I edit the generated offers?',
      answer:
        'Yes! All generated content can be customized. Pro users can also export to PDF and use advanced editing features.',
    },
    {
      question: 'How accurate is the AI?',
      answer:
        'Our AI has a 94% success rate and is continuously improved based on user feedback and the latest marketing strategies.',
    },
  ]

  return (
    <div className="min-h-screen relative bg-[#F9FAFB] dotted-bg">
      {/* Animated Connecting Lines */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-violet-300/30 to-transparent"
            style={{
              left: `${20 + i * 15}%`,
              height: '100vh',
            }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatType: 'reverse' }}
          />
        ))}
      </div>
      <DashboardNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-violet-500 to-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <HelpCircle className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Help & Support</h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Everything you need to know about creating irresistible offers with our AI-powered
              platform
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Video className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Watch Tutorial</h3>
              <p className="text-slate-600 text-sm mb-4">3-minute onboarding video</p>
              <button
                onClick={() => setShowOnboardingVideo(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
              >
                Watch Now
              </button>
            </motion.div>

            <motion.div
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Live Chat</h3>
              <p className="text-slate-600 text-sm mb-4">Get instant help from our team</p>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200">
                Start Chat
              </button>
            </motion.div>

            <motion.div
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Email Support</h3>
              <p className="text-slate-600 text-sm mb-4">Get detailed help via email</p>
              <a
                href="mailto:support@grandslamgenerator.ai"
                className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
              >
                Send Email
              </a>
            </motion.div>
          </div>

          {/* Help Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {helpSections.map((section, index) => {
              const Icon = section.icon
              return (
                <motion.div
                  key={section.title}
                  className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-sky-500 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{section.title}</h3>
                  </div>

                  <div className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 mb-1">{item.title}</h4>
                          <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                          {item.onClick ? (
                            <button
                              onClick={item.onClick}
                              className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center space-x-1"
                            >
                              <span>{item.action}</span>
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          ) : (
                            <a
                              href={item.href}
                              className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center space-x-1"
                            >
                              <span>{item.action}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* FAQ Section */}
          <motion.div
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Frequently Asked Questions</h2>
              <p className="text-slate-600">Quick answers to common questions</p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="border-b border-slate-200 pb-6 last:border-b-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + index * 0.1 }}
                >
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{faq.question}</h3>
                  <p className="text-slate-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Onboarding Video Modal */}
      {showOnboardingVideo && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowOnboardingVideo(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Onboarding Tutorial</h3>
              <button
                onClick={() => setShowOnboardingVideo(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
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
            <div className="p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="h-12 w-12 text-white ml-1" />
              </div>
              <h4 className="text-2xl font-bold text-slate-800 mb-4">Coming Soon!</h4>
              <p className="text-slate-600 mb-6">
                Our comprehensive onboarding video is being finalized. In the meantime, try
                generating your first offer - it's intuitive and easy!
              </p>
              <button
                onClick={() => setShowOnboardingVideo(false)}
                className="bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200"
              >
                Got it, thanks!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
