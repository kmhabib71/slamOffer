'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { authService } from '@/lib/auth'

export function AdminSetup() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleCreateAdmin = async () => {
    if (!session?.user?.email) {
      setError('You must be signed in to create an admin user')
      return
    }

    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const result = await authService.createAdminUser(session.user.email, 'admin')

      if (result) {
        setMessage('Admin user created successfully!')
      } else {
        setError('Failed to create admin user')
      }
    } catch (error) {
      console.error('Error creating admin user:', error)
      setError('An error occurred while creating the admin user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckAdminStatus = async () => {
    if (!session?.user?.email) {
      setError('You must be signed in to check admin status')
      return
    }

    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const isAdmin = await authService.isUserAdmin(session.user.email)

      if (isAdmin) {
        setMessage('You are already an admin user!')
      } else {
        setMessage('You are not an admin user')
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setError('An error occurred while checking admin status')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Setup</h2>

      {session?.user && (
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Current user: <span className="font-medium">{session.user.email}</span>
          </p>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleCheckAdminStatus}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Checking...' : 'Check Admin Status'}
        </button>

        <button
          onClick={handleCreateAdmin}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Admin User'}
        </button>
      </div>

      {message && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>Make sure you're signed in with the email you want to make an admin</li>
          <li>Click "Check Admin Status" to see if you're already an admin</li>
          <li>If not, click "Create Admin User" to grant admin privileges</li>
          <li>Once you're an admin, you can access the admin panel at /admin</li>
        </ol>
      </div>
    </div>
  )
}
