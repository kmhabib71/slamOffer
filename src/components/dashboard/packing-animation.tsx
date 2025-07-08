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
} from 'lucide-react'

interface PackingAnimationProps {
  businessContext: {
    businessDescription: string
  }
  onComplete?: () => void
}

const packingSteps = [
  {
    icon: Package,
    title: 'Collecting Your Strategies',
    description: 'Gathering all 11 components of your Grand Slam Offer...',
    duration: 3000,
  },
  {
    icon: Sparkles,
    title: 'Enhancing with AI Intelligence',
    description: 'Adding advanced insights and optimization...',
    duration: 4000,
  },
  {
    icon: Crown,
    title: 'Unlocking Pro Features',
    description: 'Activating your complete offer package...',
    duration: 3000,
  },
  {
    icon: Gift,
    title: 'Finalizing Your Package',
    description: 'Preparing your complete Grand Slam Offer...',
    duration: 2000,
  },
]

export function PackingAnimation({ businessContext, onComplete }: PackingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const totalDuration = packingSteps.reduce((sum, step) => sum + step.duration, 0)
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += 100
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(newProgress)

      // Calculate current step based on elapsed time
      let stepTime = 0
      for (let i = 0; i < packingSteps.length; i++) {
        stepTime += packingSteps[i].duration
        if (elapsed <= stepTime) {
          setCurrentStep(i)
          break
        }
      }

      if (elapsed >= totalDuration) {
        setIsComplete(true)
        clearInterval(timer)
        setTimeout(() => {
          onComplete?.()
        }, 1500)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [onComplete])

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
            <CurrentIcon className="h-12 w-12 text-white" />
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
                : currentStepData?.description}
            </motion.p>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          {/* Progress Text */}
          <p className="text-sm text-slate-500 mb-8">
            {isComplete ? 'Complete!' : `${Math.round(progress)}% complete`}
          </p>

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
          {packingSteps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep || isComplete

            return (
              <motion.div
                key={index}
                className={`flex flex-col items-center space-y-2 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white'
                      : isActive
                        ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <StepIcon className="h-6 w-6" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'text-violet-600' : 'text-slate-500'
                  }`}
                >
                  Step {index + 1}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
