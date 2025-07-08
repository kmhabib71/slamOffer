'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/auth-provider'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

export default function LogoutPage() {
  const [loading, setLoading] = useState(true) // Start with loading true
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { signOut, user, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth to be initialized before making decisions
    if (!isInitialized) return

    // If user is logged in, start logout process
    if (user) {
      handleLogout()
    } else {
      // If no user, show "already logged out" state
      setLoading(false)
    }
  }, [user, isInitialized])

  const handleLogout = async () => {
    try {
      setLoading(true)
      setError('')

      // Clear any local storage or session storage first
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.clear()
        // Clear sessionStorage
        sessionStorage.clear()
      }

      // Sign out using NextAuth - this will redirect to home page automatically
      await signOut()

      // Set success state (this might not be reached due to signOut redirect)
      setSuccess(true)
      setLoading(false)

      // Fallback redirect in case signOut doesn't redirect
      setTimeout(() => {
        router.replace('/')
      }, 1000)
    } catch (err: any) {
      console.error('Logout error:', err)
      setError(err.message || 'An error occurred during logout')
      setLoading(false)
    }
  }

  const handleGoHome = () => {
    router.replace('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-sky-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-sky-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-sky-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20"
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-violet-500 to-sky-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            {error ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <h2 className="text-2xl font-black text-slate-800">Logout Error</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 transition-all duration-300"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleGoHome}
                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-white border-2 border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all duration-300"
                  >
                    Go Home
                  </button>
                </div>
              </motion.div>
            ) : loading ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600 mx-auto"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-sky-200 rounded-full animate-ping mx-auto"></div>
                </div>
                <h2 className="text-2xl font-black text-slate-800">Logging out...</h2>
                <p className="text-slate-600 font-medium">
                  Please wait while we securely log you out.
                </p>
              </motion.div>
            ) : success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <h2 className="text-2xl font-black text-slate-800">Successfully Logged Out</h2>
                <p className="text-slate-600 font-medium">You have been securely logged out.</p>
                <p className="text-sm text-slate-500">Redirecting to home page...</p>
                <button
                  onClick={handleGoHome}
                  className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                >
                  <span>Go Home</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <h2 className="text-2xl font-black text-slate-800">Already Logged Out</h2>
                <p className="text-slate-600 font-medium">You are not currently logged in.</p>
                <button
                  onClick={handleGoHome}
                  className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 transition-all duration-300"
                >
                  <span>Go Home</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
