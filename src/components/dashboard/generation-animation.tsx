'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Target, 
  Lightbulb, 
  Rocket, 
  Star, 
  Zap, 
  CheckCircle, 
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  Users,
  DollarSign
} from 'lucide-react'

interface GenerationAnimationProps {
  businessContext: {
    businessDescription: string
  }
}

const generationSteps = [
  {
    id: 1,
    title: 'Analyzing Your Business Context',
    description: 'Understanding your target market and core challenges',
    icon: Brain,
    color: 'from-violet-500 to-purple-600',
    duration: 8000
  },
  {
    id: 2,
    title: 'Identifying Dream Outcomes',
    description: 'Crafting specific, measurable transformation goals',
    icon: Target,
    color: 'from-sky-500 to-blue-600',
    duration: 7000
  },
  {
    id: 3,
    title: 'Mapping Problems & Obstacles',
    description: 'Discovering hidden pain points your competitors miss',
    icon: Lightbulb,
    color: 'from-amber-500 to-orange-600',
    duration: 9000
  },
  {
    id: 4,
    title: 'Creating Value Solutions',
    description: 'Building "How to" solutions for every obstacle',
    icon: Rocket,
    color: 'from-emerald-500 to-green-600',
    duration: 8500
  },
  {
    id: 5,
    title: 'Optimizing Delivery Systems',
    description: 'Designing scalable, high-value delivery methods',
    icon: TrendingUp,
    color: 'from-pink-500 to-rose-600',
    duration: 7500
  },
  {
    id: 6,
    title: 'Applying Hormozi Framework',
    description: 'Implementing $100M offers methodology',
    icon: Star,
    color: 'from-violet-500 to-indigo-600',
    duration: 9500
  },
  {
    id: 7,
    title: 'Finalizing Your Grand Slam Offer',
    description: 'Polishing and optimizing for maximum conversion',
    icon: CheckCircle,
    color: 'from-emerald-500 to-teal-600',
    duration: 6000
  }
]

export function GenerationAnimation({ businessContext }: GenerationAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showParticles, setShowParticles] = useState(true)

  useEffect(() => {
    const stepDuration = generationSteps[currentStep]?.duration || 8000
    const interval = 50 // Update every 50ms for smooth animation
    const totalIntervals = stepDuration / interval

    let currentProgress = 0
    const progressTimer = setInterval(() => {
      currentProgress += 1
      const stepProgress = (currentProgress / totalIntervals) * 100
      setProgress(stepProgress)

      if (stepProgress >= 100) {
        clearInterval(progressTimer)
        if (currentStep < generationSteps.length - 1) {
          setTimeout(() => {
            setCurrentStep(prev => prev + 1)
            setProgress(0)
          }, 500)
        }
      }
    }, interval)

    return () => clearInterval(progressTimer)
  }, [currentStep])

  const currentStepData = generationSteps[currentStep]

  return (
    <motion.div
      key="generating"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto text-center"
    >
      {/* Header */}
      <div className="mb-12">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="w-24 h-24 bg-gradient-to-br from-violet-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
        >
          <Sparkles className="h-12 w-12 text-white" />
        </motion.div>
        
        <h1 className="text-4xl font-black text-slate-800 mb-4">
          Crafting Your 
          <span className="bg-gradient-to-r from-violet-600 via-sky-500 to-yellow-500 bg-clip-text text-transparent">
            {' '}Grand Slam Offer
          </span>
        </h1>
        <p className="text-lg text-slate-600">
          Our AI is analyzing your business and applying Alex Hormozi's proven methodology
        </p>
      </div>

      {/* Business Context Display */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl p-6 mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Your Business Concept</h3>
        <div className="bg-gradient-to-r from-violet-50 to-sky-50 rounded-lg p-4 text-left">
          <span className="font-semibold text-slate-800 block mb-2">Business Description:</span>
          <p className="text-slate-700 leading-relaxed">{businessContext.businessDescription}</p>
        </div>
      </div>

      {/* Main Animation Area */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl p-8 mb-8 relative overflow-hidden">
        {/* Floating Particles */}
        {showParticles && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-violet-400 to-sky-400 rounded-full opacity-60"
                animate={{
                  x: [0, Math.random() * 400, 0],
                  y: [0, Math.random() * 300, 0],
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
              />
            ))}
          </div>
        )}

        {/* Current Step Display */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Step Icon */}
              <motion.div
                className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentStepData?.color} flex items-center justify-center mx-auto mb-6 shadow-2xl`}
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
                }}
              >
                {currentStepData && <currentStepData.icon className="h-10 w-10 text-white" />}
              </motion.div>

              {/* Step Content */}
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                {currentStepData?.title}
              </h2>
              <p className="text-slate-600 text-lg mb-6 max-w-md mx-auto">
                {currentStepData?.description}
              </p>

              {/* Progress Bar */}
              <div className="max-w-xs mx-auto">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                  <span>Step {currentStep + 1} of {generationSteps.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${currentStepData?.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Step Progress Indicators */}
      <div className="flex justify-center space-x-3 mb-8">
        {generationSteps.map((step, index) => (
          <motion.div
            key={step.id}
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

      {/* Fun Facts */}
      <div className="bg-gradient-to-r from-violet-50 to-sky-50 rounded-xl border border-violet-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-center space-x-2">
          <Brain className="h-5 w-5 text-violet-500" />
          <span>Did You Know?</span>
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-600">47</div>
            <div className="text-slate-600">Average problems identified per offer</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-sky-600">$100M+</div>
            <div className="text-slate-600">In revenue generated using this methodology</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">12x</div>
            <div className="text-slate-600">Average conversion rate improvement</div>
          </div>
        </div>
      </div>

      {/* Completion Message */}
      {currentStep === generationSteps.length - 1 && progress >= 95 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 bg-emerald-50 border border-emerald-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold text-emerald-800">Almost Ready!</span>
          </div>
          <p className="text-emerald-700">
            Your Grand Slam Offer is being finalized. Prepare to be amazed! 🚀
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
