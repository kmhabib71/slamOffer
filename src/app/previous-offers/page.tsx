'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Eye,
  Trash2,
  Edit2,
  Sparkles,
  Target,
  Crown,
  Star,
  Loader,
  AlertTriangle,
  Plus,
  FileText,
} from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { getUserOffers, deleteOffer, updateOfferTitle, SavedGrandSlamOffer } from '@/lib/offers'
import { OfferResults } from '@/components/dashboard/offer-results'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function PreviousOffersPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [offers, setOffers] = useState<SavedGrandSlamOffer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<SavedGrandSlamOffer | null>(null)
  const [viewMode, setViewMode] = useState<'text' | 'mindmap'>('text')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  // Load offers when component mounts
  useEffect(() => {
    const loadOffers = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        setError(null)
        const result = await getUserOffers(user.id)

        if (result.success && result.data) {
          setOffers(result.data)
        } else {
          setError(result.error || 'Failed to load offers')
        }
      } catch (err) {
        console.error('Error loading offers:', err)
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadOffers()
    }
  }, [user?.id])

  const handleDeleteOffer = async (offerId: string) => {
    if (!user?.id) return

    if (!confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
      return
    }

    const result = await deleteOffer(offerId, user.id)

    if (result.success) {
      setOffers(prev => prev.filter(offer => offer.id !== offerId))
      if (selectedOffer?.id === offerId) {
        setSelectedOffer(null)
      }
    } else {
      alert('Failed to delete offer: ' + result.error)
    }
  }

  const handleUpdateTitle = async (offerId: string, newTitle: string) => {
    if (!user?.id) return

    if (!newTitle.trim()) return

    const result = await updateOfferTitle(offerId, user.id, newTitle.trim())

    if (result.success) {
      setOffers(prev =>
        prev.map(offer => (offer.id === offerId ? { ...offer, title: newTitle.trim() } : offer))
      )
      setEditingId(null)
    } else {
      alert('Failed to update title: ' + result.error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // If viewing a specific offer
  if (selectedOffer) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#F9FAFB] dotted-bg">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
            <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedOffer(null)}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Back to Offers</span>
                </button>

                <div className="h-6 w-px bg-slate-300"></div>

                <div>
                  <h1 className="text-lg font-bold text-slate-800">{selectedOffer.title}</h1>
                  <p className="text-sm text-slate-600">
                    Created {formatDate(selectedOffer.created_at)}
                  </p>
                </div>
              </div>
            </nav>
          </header>

          {/* Offer Display */}
          <main className="container mx-auto px-6 py-8">
            <OfferResults
              offer={selectedOffer.offer_data}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onPurchaseClick={() => {}}
              onStartOver={() => setSelectedOffer(null)}
            />
          </main>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F9FAFB] dotted-bg">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
          <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Dashboard</span>
              </button>

              <div className="h-6 w-px bg-slate-300"></div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-slate-800">Previous Offers</span>
                  <div className="text-xs text-slate-600">Your saved Grand Slam Offers</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Create New Offer</span>
              </button>

              <div className="flex items-center space-x-2 text-slate-700">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-100 to-sky-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-violet-700">
                    {user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold">{user?.email}</div>
                  <div className="text-xs text-slate-500 flex items-center space-x-1">
                    {user?.profile?.subscription_tier === 'pro' ? (
                      <>
                        <Crown className="h-3 w-3 text-amber-500" />
                        <span>Pro User</span>
                      </>
                    ) : (
                      <>
                        <Star className="h-3 w-3 text-slate-400" />
                        <span>Free ({user?.profile?.credits_remaining || 0} credits)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-violet-500" />
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">No offers yet</h3>
              <p className="text-slate-500 mb-6">
                Create your first Grand Slam Offer to see it here.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Create New Offer</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map(offer => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-200/60"
                >
                  <div className="p-6">
                    {editingId === offer.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          placeholder="Enter new title"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateTitle(offer.id, editTitle)}
                          className="px-3 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">{offer.title}</h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingId(offer.id)
                              setEditTitle(offer.title)
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-slate-500 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(offer.created_at)}</span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-violet-500" />
                        <span className="text-sm text-slate-600">
                          {offer.offer_data.components.length} Components
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedOffer(offer)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
