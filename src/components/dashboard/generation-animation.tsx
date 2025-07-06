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
  DollarSign,
} from 'lucide-react'

interface GenerationAnimationProps {
  businessContext: {
    businessDescription: string
  }
}

const generationSteps = [
  {
    id: 1,
    title: 'Identifying Dream Outcomes',
    description: 'Crafting your perfect customer transformation story',
    icon: Target,
    color: 'from-pink-500 to-rose-600',
    quote: '"The size of your success is measured by the strength of your desire"',
    duration: 3000,
  },
  {
    id: 2,
    title: 'Mapping Problems & Pain Points',
    description: 'Uncovering critical obstacles your customers face',
    icon: Lightbulb,
    color: 'from-orange-500 to-red-600',
    quote: '"Every problem is a gift. Without them we wouldn\'t grow"',
    duration: 3000,
  },
  {
    id: 3,
    title: 'Crafting Solution Strategies',
    description: 'Developing powerful solutions for each problem',
    icon: Brain,
    color: 'from-blue-500 to-blue-700',
    quote: '"Don\'t find customers for your solution, find solutions for your customers"',
    duration: 3000,
  },
  {
    id: 4,
    title: 'Designing Delivery Vehicles',
    description: 'Creating effective ways to deliver your solutions',
    icon: Rocket,
    color: 'from-emerald-500 to-green-600',
    quote: '"The best way to predict the future is to create it"',
    duration: 3000,
  },
  {
    id: 5,
    title: 'Optimizing Value Stack',
    description: 'Maximizing the perceived and real value of your offer',
    icon: TrendingUp,
    color: 'from-amber-500 to-yellow-600',
    quote: '"Price is what you pay. Value is what you get"',
    duration: 3000,
  },
  {
    id: 6,
    title: 'Building Ultimate Deliverable',
    description: 'Packaging your solutions into a compelling offer',
    icon: Star,
    color: 'from-purple-500 to-violet-600',
    quote: '"Make it so good they can\'t ignore you"',
    duration: 3000,
  },
  {
    id: 7,
    title: 'Implementing Scarcity',
    description: 'Adding genuine scarcity elements to drive action',
    icon: Clock,
    color: 'from-red-500 to-rose-600',
    quote: '"The two most powerful warriors are patience and time"',
    duration: 3000,
  },
  {
    id: 8,
    title: 'Creating Urgency',
    description: 'Developing authentic reasons to act now',
    icon: Zap,
    color: 'from-sky-500 to-blue-600',
    quote: '"The best time to act was yesterday. The next best time is now"',
    duration: 3000,
  },
  {
    id: 9,
    title: 'Crafting Bonuses',
    description: 'Designing irresistible bonus offerings',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-600',
    quote: '"In business, the real prize lies in the unexpected extra"',
    duration: 3000,
  },
  {
    id: 10,
    title: 'Adding Guarantees',
    description: 'Creating risk-reversing guarantees',
    icon: Shield,
    color: 'from-teal-500 to-emerald-600',
    quote: '"Trust is the currency of business. Guarantee it"',
    duration: 3000,
  },
  {
    id: 11,
    title: 'Finalizing Offer Name',
    description: 'Crafting a compelling name for your offer',
    icon: CheckCircle,
    color: 'from-cyan-500 to-blue-600',
    quote: '"Your offer\'s name is its handshake with the world"',
    duration: 3000,
  },
]

export function GenerationAnimation({ businessContext }: GenerationAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showParticles, setShowParticles] = useState(true)

  useEffect(() => {
    // Set total duration to 33 seconds (3 seconds per step)
    const totalDuration = 33000
    const stepDuration = Math.floor(totalDuration / generationSteps.length)
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
          }, 200) // Slightly longer transition for epic effect
        }
      }
    }, interval)

    return () => clearInterval(progressTimer)
  }, [currentStep])

  const currentStepData = generationSteps[currentStep]
  const overallProgress = Math.round((currentStep * 100 + progress) / generationSteps.length)

  return (
    <motion.div
      key="generating"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto text-center"
    >
      {/* Header with Epic Animation */}
      <div className="mb-12">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="w-24 h-24 bg-gradient-to-br from-violet-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
        >
          <Sparkles className="h-12 w-12 text-white" />
        </motion.div>

        <motion.h1
          className="text-4xl font-black text-slate-800 mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Crafting Your
          <span className="bg-gradient-to-r from-violet-600 via-sky-500 to-yellow-500 bg-clip-text text-transparent">
            {' '}
            Grand Slam Offer
          </span>
        </motion.h1>
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
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        )}

        {/* Epic Component Animation */}
        <div className="relative z-20">
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{
              duration: 0.5,
              type: 'spring',
              stiffness: 100,
            }}
            className="flex flex-col items-center"
          >
            {/* Icon with Epic Animation */}
            <motion.div
              className={`w-20 h-20 bg-gradient-to-br ${currentStepData.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform`}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              {React.createElement(currentStepData.icon, {
                className: 'h-10 w-10 text-white',
              })}
            </motion.div>

            {/* Title with Stagger Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-3">{currentStepData.title}</h3>
              <p className="text-slate-600 mb-4">{currentStepData.description}</p>
            </motion.div>

            {/* Motivational Quote */}
            {/* <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8 text-lg italic text-slate-700 font-medium"
            >
              {currentStepData.quote}
            </motion.div> */}

            {/* Progress Bars with Gradient Animation */}
            <div className="w-full max-w-md mx-auto">
              <div className="h-2 bg-slate-200/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 via-sky-500 to-violet-500 bg-size-200"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${progress}%`,
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    width: { duration: 0.1, ease: 'linear' },
                    backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                  }}
                />
              </div>
              <div className="mt-4 flex justify-between items-center text-sm text-slate-500">
                <span className="font-medium">
                  Step {currentStep + 1} of {generationSteps.length}
                </span>
                <span className="font-medium">{Math.round(progress)}% Complete</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="mt-4 text-center text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-sky-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Overall Progress: {overallProgress}%
          </motion.div>
        </div>

        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-sky-50/30 z-0" />
        <div className="absolute inset-0 bg-grid-slate-200/20 z-0" />
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

// Add this CSS to your global styles or component
const styles = `
.bg-size-200 {
  background-size: 200% 200%;
}

.bg-grid-slate-200\/20 {
  background-image: linear-gradient(to right, rgba(226, 232, 240, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(226, 232, 240, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
`
