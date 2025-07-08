'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { signIn, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  // Remove auto-redirect on session detection
  // Only redirect after successful login in handleSubmit and handleGoogleSignIn

  const handleModeSwitch = () => {
    setIsFlipping(true)
    setError('')
    setTimeout(() => {
      setMode(mode === 'signin' ? 'signup' : 'signin')
      setIsFlipping(false)
    }, 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        // Register user
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed')
        }

        setError('✅ Account created successfully! You can now sign in.')
        setTimeout(() => {
          setMode('signin')
          setError('')
        }, 2000)
      } else {
        // Sign in user
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          throw new Error('Invalid email or password')
        }

        if (result?.ok) {
          onClose()
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setError('')
    setLoading(false)
    setShowPassword(false)
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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

        <div className="fixed inset-0">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl transition-all border border-white/20">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-violet-400/20 to-sky-400/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-sky-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative p-8">
                  {/* Close Button */}
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="w-16 h-16 bg-gradient-to-br from-violet-500 to-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    >
                      <Sparkles className="h-8 w-8 text-white" />
                    </motion.div>

                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={`text-2xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent transition-all duration-300 ${isFlipping ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}
                    >
                      {mode === 'signin' ? 'Welcome back!' : 'Join us today!'}
                    </motion.h2>

                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-sm text-slate-600 font-medium mt-2"
                    >
                      {mode === 'signin'
                        ? 'Sign in to access your Grand Slam Offers'
                        : 'Start creating irresistible offers in minutes'}
                    </motion.p>
                  </div>

                  {/* Google Sign In */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mb-6"
                  >
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 border-2 border-slate-200 hover:border-violet-300 rounded-xl px-4 py-3 text-slate-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <svg
                        className="w-5 h-5 group-hover:scale-110 transition-transform"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </motion.div>

                  {/* Divider */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white text-slate-500 font-medium">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Form */}
                  <motion.form
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`rounded-lg p-3 flex items-center space-x-2 ${
                            error.includes('✅')
                              ? 'bg-green-50 border border-green-200 text-green-800'
                              : 'bg-red-50 border border-red-200 text-red-800'
                          }`}
                        >
                          {error.includes('✅') ? (
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium">{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="modal-email"
                        className="block text-sm font-semibold text-slate-700 mb-2"
                      >
                        Email address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                          id="modal-email"
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800 font-medium"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label
                        htmlFor="modal-password"
                        className="block text-sm font-semibold text-slate-700 mb-2"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                          id="modal-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800 font-medium"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  </motion.form>

                  {/* Mode Switch */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-6 text-center"
                  >
                    <button
                      type="button"
                      onClick={handleModeSwitch}
                      className="text-sm text-violet-600 hover:text-violet-500 transition-colors duration-200 font-semibold"
                    >
                      {mode === 'signin'
                        ? "Don't have an account? Sign up"
                        : 'Already have an account? Sign in'}
                    </button>
                  </motion.div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
