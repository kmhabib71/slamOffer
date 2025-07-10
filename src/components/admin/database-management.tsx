'use client'

import { useState, useEffect } from 'react'
import { Trash2, Database, AlertTriangle, RefreshCw } from 'lucide-react'

interface Collection {
  name: string
  count: number
  type: string
}

export default function DatabaseManagement() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [cleaningAll, setCleaningAll] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchCollections = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/database/collections')
      const data = await response.json()

      if (data.success) {
        setCollections(data.collections)
      } else {
        setError(data.error || 'Failed to fetch collections')
      }
    } catch (err) {
      setError('Failed to fetch collections')
    } finally {
      setLoading(false)
    }
  }

  const deleteCollection = async (collectionName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the collection "${collectionName}"? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      setDeleting(collectionName)
      const response = await fetch('/api/admin/database/delete-collection', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionName }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        fetchCollections() // Refresh the list
      } else {
        setError(data.error || 'Failed to delete collection')
      }
    } catch (err) {
      setError('Failed to delete collection')
    } finally {
      setDeleting(null)
    }
  }

  const cleanAllData = async () => {
    if (
      !confirm(
        '⚠️ DANGER: This will delete ALL data from the database and reset it to a fresh state. Only the admin user will remain. Are you absolutely sure?'
      )
    ) {
      return
    }

    if (
      !confirm(
        'This is your FINAL WARNING. All offers, users, and data will be permanently deleted. Type "YES" to confirm.'
      )
    ) {
      return
    }

    try {
      setCleaningAll(true)
      const response = await fetch('/api/admin/database/clean-all', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        fetchCollections() // Refresh the list
      } else {
        setError(data.error || 'Failed to clean all data')
      }
    } catch (err) {
      setError('Failed to clean all data')
    } finally {
      setCleaningAll(false)
    }
  }

  useEffect(() => {
    fetchCollections()
  }, [])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Database Management</h2>
        </div>
        <button
          onClick={fetchCollections}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Clean All Data Button */}
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <h3 className="text-lg font-semibold text-red-300">Danger Zone</h3>
        </div>
        <p className="text-red-200 text-sm mb-4">
          This will delete ALL data from the database and reset it to a fresh state. Only the admin
          user will remain.
        </p>
        <button
          onClick={cleanAllData}
          disabled={cleaningAll}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {cleaningAll ? 'Cleaning All Data...' : 'Clean All Data (Fresh Start)'}
        </button>
      </div>

      {/* Collections List */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Database Collections</h3>

        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
            <p className="text-gray-300">Loading collections...</p>
          </div>
        ) : collections.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No collections found</p>
        ) : (
          <div className="space-y-3">
            {collections.map(collection => (
              <div
                key={collection.name}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-blue-400" />
                  <div>
                    <h4 className="font-medium text-white">{collection.name}</h4>
                    <p className="text-sm text-gray-400">
                      {collection.count} documents • {collection.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {collection.name === 'user_profiles' && (
                    <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded">
                      PROTECTED
                    </span>
                  )}

                  <button
                    onClick={() => deleteCollection(collection.name)}
                    disabled={deleting === collection.name || collection.name === 'user_profiles'}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-3 w-3" />
                    {deleting === collection.name ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information */}
      <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
        <h4 className="font-medium text-blue-300 mb-2">Information</h4>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>
            • The <code>user_profiles</code> collection is protected and cannot be deleted
          </li>
          <li>
            • After cleaning all data, only the <code>user_profiles</code> collection will remain
            with the admin user
          </li>
          <li>
            • Deleting collections will permanently remove all data - this action cannot be undone
          </li>
          <li>• System collections (starting with 'system.') are automatically skipped</li>
        </ul>
      </div>
    </div>
  )
}
