'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Sparkles,
  Crown,
  CheckCircle,
  Gift,
  Star,
  Zap,
  Trophy,
  Rocket,
  Diamond,
  Brain,
  Loader,
} from 'lucide-react'

interface RealTimePackingAnimationProps {
  businessContext: {
    businessDescription: string
  }
  offerId: string
  onComplete?: (data: any) => void
  onError?: (error: string) => void
}

const packingSteps = [
  {
    icon: Package,
    title: 'Initializing AI Generation',
    description: 'Setting up your personalized offer generation...',
    step: 'starting',
  },
  {
    icon: Brain,
    title: 'Analyzing Your Business',
    description: 'AI is studying your business context and goals...',
    step: 'analyzing',
  },
  {
    icon: Sparkles,
    title: 'Generating Complete Offer',
    description: 'Creating all 11 components with advanced AI...',
    step: 'generating',
  },
  {
    icon: Crown,
    title: 'Optimizing Strategies',
    description: 'Fine-tuning each component for maximum impact...',
    step: 'optimizing',
  },
  {
    icon: Gift,
    title: 'Saving Your Package',
    description: 'Securing your complete Grand Slam Offer...',
    step: 'saving',
  },
  {
    icon: CheckCircle,
    title: 'Your Offer is Ready!',
    description: 'Complete offer generated and ready to view!',
    step: 'complete',
  },
]

export function RealTimePackingAnimation({
  businessContext,
  offerId,
  onComplete,
  onError,
}: RealTimePackingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [isConnecting, setIsConnecting] = useState(true)

  useEffect(() => {
    let eventSource: EventSource | null = null

    const connectToStream = async () => {
      try {
        setIsConnecting(true)

        // First, start the purchase process
        const response = await fetch('/api/purchase-offer-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            offerId,
            businessContext: businessContext,
            generateComplete: true,
            userTier: 'pro',
            componentName: undefined,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to start purchase process')
        }

        if (!response.body) {
          throw new Error('No response stream available')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        setIsConnecting(false)

        const readStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read()

              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.substring(6))

                    if (data.type === 'progress') {
                      setProgress(data.progress)
                      setCurrentMessage(data.message)

                      // Update current step based on progress
                      const stepIndex = Math.min(
                        Math.floor((data.progress / 100) * (packingSteps.length - 1)),
                        packingSteps.length - 1
                      )
                      setCurrentStep(stepIndex)
                    } else if (data.type === 'complete') {
                      setIsComplete(true)
                      setProgress(100)
                      setCurrentStep(packingSteps.length - 1)
                      setTimeout(() => {
                        onComplete?.(data.data)
                      }, 1500)
                    } else if (data.type === 'error') {
                      onError?.(data.error)
                    }
                  } catch (e) {
                    console.error('Error parsing SSE data:', e)
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error reading stream:', error)
            onError?.('Connection lost during generation')
          }
        }

        readStream()
      } catch (error) {
        console.error('Error connecting to stream:', error)
        onError?.(error instanceof Error ? error.message : 'Failed to connect to generation stream')
      }
    }

    connectToStream()

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [offerId, businessContext, onComplete, onError])

  const currentStepData = packingSteps[currentStep]
  const CurrentIcon = currentStepData?.icon || Package

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Main Animation Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-12 mb-8"
        >
          {/* Animated Icon */}
          <motion.div
            key={currentStep}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl"
          >
            {isConnecting ? (
              <Loader className="h-12 w-12 text-white animate-spin" />
            ) : (
              <CurrentIcon className="h-12 w-12 text-white" />
            )}
          </motion.div>

          {/* Floating Elements */}
          <div className="relative mb-8">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, Math.cos((i * 60 * Math.PI) / 180) * 100],
                  y: [0, Math.sin((i * 60 * Math.PI) / 180) * 100],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut',
                }}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-sky-400 rounded-full" />
              </motion.div>
            ))}
          </div>

          {/* Step Title */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-slate-800 mb-4"
            >
              {isComplete ? '🎉 Your Offer is Ready!' : currentStepData?.title}
            </motion.h2>
          </AnimatePresence>

          {/* Step Description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-lg text-slate-600 mb-8"
            >
              {isComplete
                ? 'Your complete Grand Slam Offer has been generated and is ready to view!'
                : currentMessage || currentStepData?.description}
            </motion.p>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Progress Text */}
          <p className="text-sm text-slate-500 mb-8">
            {isComplete ? 'Complete!' : `${Math.round(progress)}% complete`}
          </p>

          {/* Real-time Status */}
          {!isComplete && (
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
              <span className="text-sm text-slate-600">
                {isConnecting ? 'Connecting to AI...' : 'This might take few minutes...'}
              </span>
            </div>
          )}

          {/* Business Context */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Your Business</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {businessContext.businessDescription.length > 150
                ? `${businessContext.businessDescription.substring(0, 150)}...`
                : businessContext.businessDescription}
            </p>
          </div>
        </motion.div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-4">
          {packingSteps.map((step, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index < currentStep
                  ? 'bg-emerald-500'
                  : index === currentStep
                    ? 'bg-violet-500 scale-125'
                    : 'bg-slate-300'
              }`}
              animate={index === currentStep ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
