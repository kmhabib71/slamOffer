'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/auth-provider'
import { Button } from '@/components/ui/button'

export default function LogoutPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    handleLogout()
  }, [])

  const handleLogout = async () => {
    try {
      setLoading(true)

      // Sign out from Supabase
      await signOut()

      // Clear any local storage or session storage
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.clear()

        // Clear sessionStorage
        sessionStorage.clear()

        // Clear any cookies for this domain
        document.cookie.split(';').forEach(function (c) {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
        })
      }

      // Redirect to home page after a brief delay
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (err: any) {
      console.error('Logout error:', err)
      setError(err.message || 'An error occurred during logout')
      setLoading(false)
    }
  }

  const handleManualLogout = async () => {
    await handleLogout()
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Logout Error</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleManualLogout} className="w-full">
                Try Again
              </Button>
              <Button onClick={() => router.push('/')} variant="outline" className="w-full mt-2">
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Logging out...</h2>
                <p className="text-gray-600">Please wait while we securely log you out.</p>
              </>
            ) : (
              <>
                <div className="text-green-600 text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Successfully Logged Out</h2>
                <p className="text-gray-600">You have been securely logged out.</p>
                <Button onClick={() => router.push('/')} className="mt-4">
                  Go Home
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
