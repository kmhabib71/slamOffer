'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Star, Shield, Download, Zap, CheckCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  componentName?: string
  totalItems?: number
}

export function PurchaseModal({ isOpen, onClose, componentName, totalItems }: PurchaseModalProps) {
  const features = [
    {
      icon: CheckCircle,
      title: 'Complete Offer Access',
      description: 'Unlock all strategies and items for every component'
    },
    {
      icon: Download,
      title: 'Professional PDF Export',
      description: 'Export your complete offer as a beautifully formatted PDF'
    },
    {
      icon: Zap,
      title: 'Interactive Mindmap',
      description: 'Visualize your offer structure with our interactive mindmap'
    },
    {
      icon: Shield,
      title: '30-Day Money Back',
      description: 'Not satisfied? Get a full refund within 30 days'
    }
  ]

  const handlePurchase = () => {
    // TODO: Implement actual purchase logic
    console.log('Purchase clicked')
    // This would typically redirect to a payment processor or open a checkout
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-violet-600 to-sky-600 px-8 py-6">
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                  
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Star className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white">
                      Unlock Your Complete Grand Slam Offer
                    </h3>
                    <p className="text-white/90 mt-2">
                      Get instant access to all {totalItems || 100}+ strategies and unlock premium features
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="px-8 py-6">
                  {componentName && (
                    <div className="bg-gradient-to-r from-violet-50 to-sky-50 rounded-lg p-4 mb-6">
                      <p className="text-slate-700 text-center">
                        You're currently viewing <span className="font-bold text-violet-600">{componentName}</span>.
                        Upgrade to see all strategies and unlock advanced features!
                      </p>
                    </div>
                  )}

                  {/* Features Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {features.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <feature.icon className="h-6 w-6 text-violet-600 mt-0.5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
                          <p className="text-sm text-slate-600">{feature.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-violet-600 to-sky-600 rounded-2xl p-6 text-white">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="text-3xl font-bold">$47</span>
                        <span className="text-white/80 line-through">$97</span>
                      </div>
                      <p className="text-white/90">One-time payment • Lifetime access</p>
                      <div className="bg-white/20 rounded-lg p-3 mt-4">
                        <p className="text-sm">
                          🎯 Based on Alex Hormozi's $100M methodology<br />
                          ⚡ Instant access to all features<br />
                          📄 Professional PDF export included
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePurchase}
                    className="w-full bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-700 hover:to-sky-700 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 group"
                  >
                    <span>Unlock Complete Offer Now</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* Guarantee */}
                  <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-slate-600">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
