'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, getSession, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('callbackUrl') || searchParams.get('redirect') || '/dashboard'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only redirect if user is trying to access login while already authenticated
    // and there's a specific redirect URL (not just accessing /auth/login directly)
    if (status === 'authenticated' && session?.user && redirectTo !== '/dashboard') {
      router.push(redirectTo)
    }
  }, [session, status, router, redirectTo])

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
          // Redirect to intended page after successful login
          router.push(redirectTo)
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
      await signIn('google', { callbackUrl: redirectTo })
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-sky-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-sky-200 rounded-full animate-ping"></div>
          </div>
          <p className="text-slate-600 animate-pulse font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <ArrowRight className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-slate-600 font-medium">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-sky-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-sky-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-sky-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-violet-400/10 to-sky-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-violet-500 to-sky-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2
              className={`text-3xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent transition-all duration-300 ${isFlipping ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}
            >
              {mode === 'signin' ? 'Welcome back!' : 'Join us today!'}
            </h2>
            <p className="mt-2 text-sm text-slate-600 font-medium">
              {redirectTo.includes('/admin') && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800 mb-2">
                  🔐 Admin access required
                </span>
              )}
              <br />
              {mode === 'signin' ? 'Sign in to your account' : 'Create your new account'}
            </p>
          </motion.div>
        </div>

        {/* Form Container */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`bg-white/90 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20 transition-all duration-500 ${isFlipping ? 'scale-95' : 'scale-100'}`}
          >
            {/* Google Sign In */}
            <div className="mb-6">
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
            </div>

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

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`rounded-lg p-4 flex items-center space-x-2 ${
                      error.includes('✅')
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                  >
                    {error.includes('✅') ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800 font-medium"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
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
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div>
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
              </div>
            </form>

            {/* Mode Switch */}
            <div className="mt-6">
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleModeSwitch}
                  className="text-sm text-violet-600 hover:text-violet-500 transition-colors duration-200 font-semibold"
                >
                  {mode === 'signin'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
