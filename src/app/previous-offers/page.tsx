'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Eye,
  Trash2,
  Edit2,
  Target,
  Loader,
  AlertTriangle,
  Plus,
  FileText,
} from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { SavedGrandSlamOffer } from '@/lib/offers'
import { OfferResults } from '@/components/dashboard/offer-results'
import { AuthGuard } from '@/components/auth/auth-guard'
import { PurchaseModal } from '@/components/dashboard/purchase-modal'
import { GenerationAnimation } from '@/components/dashboard/generation-animation'
import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation'
import { fetchWithAuth } from '@/utils/fetchWithAuth'

export default function PreviousOffersPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [offers, setOffers] = useState<SavedGrandSlamOffer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<SavedGrandSlamOffer | null>(null)
  const [selectedOfferForPurchase, setSelectedOfferForPurchase] =
    useState<SavedGrandSlamOffer | null>(null)
  const [viewMode, setViewMode] = useState<'text' | 'mindmap'>('text')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [purchasedOffers, setPurchasedOffers] = useState<Set<string>>(new Set())

  // Load offers when component mounts
  useEffect(() => {
    const loadOffers = async () => {
      if (!user?._id) return

      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/offers')
        const result = await response.json()

        if (response.ok && result.success && result.data) {
          setOffers(result.data)
          // Check purchase status for each offer
          await checkPurchaseStatus(result.data)
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

    if (user?._id) {
      loadOffers()
    }
  }, [user?._id])

  // Check purchase status for offers
  const checkPurchaseStatus = async (offersList: SavedGrandSlamOffer[]) => {
    const purchasedSet = new Set<string>()

    for (const offer of offersList) {
      try {
        const response = await fetch(`/api/offers/${offer.id}/purchased`)
        const result = await response.json()

        if (response.ok && result.isPurchased) {
          purchasedSet.add(offer.id)
        }
      } catch (error) {
        console.error('Error checking purchase status for offer:', offer.id, error)
      }
    }

    setPurchasedOffers(purchasedSet)
  }

  const handleDeleteOffer = async (offerId: string) => {
    if (!user?._id) return

    if (!confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (response.ok && result.success) {
        setOffers(prev => prev.filter(offer => offer.id !== offerId))
        if (selectedOffer?.id === offerId) {
          setSelectedOffer(null)
        }
      } else {
        alert('Failed to delete offer: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting offer:', error)
      alert('Failed to delete offer: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleUpdateTitle = async (offerId: string, newTitle: string) => {
    if (!user?._id) return

    if (!newTitle.trim()) return

    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      })
      const result = await response.json()

      if (response.ok && result.success) {
        setOffers(prev =>
          prev.map(offer => (offer.id === offerId ? { ...offer, title: newTitle.trim() } : offer))
        )
        setEditingId(null)
      } else {
        alert('Failed to update title: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating title:', error)
      alert('Failed to update title: ' + (error instanceof Error ? error.message : 'Unknown error'))
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
    if (isGenerating) {
      return (
        <AuthGuard>
          <GenerationAnimation businessContext={selectedOffer.offer_data.businessContext} />
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
            {purchaseError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">{purchaseError}</span>
                </div>
                {purchaseError.includes('Unauthorized') && (
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Click here to log in again
                  </button>
                )}
              </motion.div>
            )}

            <OfferResults
              offer={selectedOffer.offer_data}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onPurchaseClick={componentName => {
                setPurchaseError(null)
                setSelectedComponent(componentName || null)
                setIsPurchaseModalOpen(true)
              }}
              onStartOver={() => setSelectedOffer(null)}
              isPurchased={purchasedOffers.has(selectedOffer.id)}
            />

            <PurchaseModal
              isOpen={isPurchaseModalOpen}
              onClose={() => {
                setIsPurchaseModalOpen(false)
                setSelectedComponent(null)
                setPurchaseError(null)
              }}
              offerTitle={selectedComponent || selectedOffer.title}
              onPurchaseComplete={async () => {
                try {
                  setIsPurchaseModalOpen(false)
                  setIsGenerating(true)
                  setPurchaseError(null)

                  const response = await fetchWithAuth('/api/purchase-offer', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      offerId: selectedOffer.id,
                      businessContext: selectedOffer.offer_data.businessContext,
                      generateComplete: true,
                      userTier: 'pro',
                      componentName: selectedComponent,
                    }),
                  })

                  const data = await response.json()

                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to process purchase')
                  }

                  // Update the selected offer with the new data
                  setSelectedOffer(prev => (prev ? { ...prev, offer_data: data.data } : null))
                  setIsGenerating(false)
                  setSelectedComponent(null)
                } catch (error) {
                  console.error('Purchase error:', error)
                  setPurchaseError(
                    error instanceof Error ? error.message : 'Failed to process purchase'
                  )
                  setIsGenerating(false)
                  setIsPurchaseModalOpen(true)
                }
              }}
            />
          </main>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen relative bg-[#F9FAFB] dotted-bg">
        {/* Animated Connecting Lines */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-violet-300/30 to-transparent"
              style={{
                left: `${20 + i * 15}%`,
                height: '100vh',
              }}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatType: 'reverse' }}
            />
          ))}
        </div>

        <DashboardNavigation excludeItems={['My Offers']} />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">My Offers</h1>
            <p className="text-slate-600">View and manage your saved Grand Slam Offers</p>
          </div>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No offers yet</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Create your first Grand Slam Offer to see it here. Our AI will help you build
                compelling offers that convert.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Offer</span>
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  {/* Premium card container */}
                  <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/50 hover:border-violet-300/50 hover:scale-[1.02] overflow-hidden">
                    {/* Top decorative gradient bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500" />

                    {/* Purchase status indicator */}
                    {purchasedOffers.has(offer.id) && (
                      <div className="absolute top-4 right-4 flex items-center space-x-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Purchased
                        </span>
                      </div>
                    )}

                    {/* Card content */}
                    <div className="p-6 relative z-10">
                      {editingId === offer.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
                            placeholder="Enter new title"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateTitle(offer.id, editTitle)}
                            className="px-3 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Header section */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-violet-700 transition-colors leading-tight truncate">
                                {offer.title}
                              </h3>
                              <div className="flex items-center space-x-1.5 text-sm text-slate-500">
                                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{formatDate(offer.created_at)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setEditingId(offer.id)
                                  setEditTitle(offer.title)
                                }}
                                className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all duration-200"
                                title="Edit title"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteOffer(offer.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Delete offer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Stats section */}
                          <div className="flex items-center justify-between py-3 px-3 bg-gradient-to-r from-slate-50/80 to-slate-50/40 rounded-xl border border-slate-100/50">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-sky-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                <Target className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-700 truncate">
                                  {offer.offer_data.components.length} Components
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  Complete offer structure
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                              <p className="text-xs text-slate-500">Ready</p>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center space-x-2 pt-1">
                            <button
                              onClick={() => window.open(`/offer/${offer.id}`, '_blank')}
                              className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-gradient-to-r from-violet-50 to-sky-50 text-violet-700 rounded-lg hover:from-violet-100 hover:to-sky-100 transition-all duration-200 font-medium border border-violet-100 hover:border-violet-200 group/btn"
                            >
                              <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform flex-shrink-0" />
                              <span className="text-sm">View</span>
                            </button>
                            {purchasedOffers.has(offer.id) ? (
                              <button
                                onClick={() =>
                                  window.open(`/offer/${offer.id}?edit=true`, '_blank')
                                }
                                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105 group/btn"
                              >
                                <Edit2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform flex-shrink-0" />
                                <span className="text-sm">Edit</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedOfferForPurchase(offer)
                                  setIsPurchaseModalOpen(true)
                                }}
                                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105 group/btn relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-sky-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200" />
                                <Edit2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform relative z-10 flex-shrink-0" />
                                <span className="relative z-10 text-sm">Unlock</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Purchase Modal for Edit Button */}
          {isPurchaseModalOpen &&
            selectedOfferForPurchase &&
            !purchasedOffers.has(selectedOfferForPurchase.id) && (
              <PurchaseModal
                isOpen={isPurchaseModalOpen}
                onClose={() => {
                  setIsPurchaseModalOpen(false)
                  setSelectedOfferForPurchase(null)
                  setPurchaseError(null)
                }}
                offerTitle={selectedOfferForPurchase.title}
                onPurchaseComplete={async () => {
                  if (!selectedOfferForPurchase) return

                  try {
                    setIsPurchaseModalOpen(false)
                    setIsGenerating(true)
                    setPurchaseError(null)

                    const response = await fetchWithAuth('/api/purchase-offer', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        offerId: selectedOfferForPurchase.id,
                        businessContext: selectedOfferForPurchase.offer_data.businessContext,
                        generateComplete: true,
                        userTier: 'pro',
                      }),
                    })

                    const data = await response.json()

                    if (!response.ok) {
                      throw new Error(data.error || 'Failed to process purchase')
                    }

                    // Update purchased offers set
                    setPurchasedOffers(prev => new Set([...prev, selectedOfferForPurchase.id]))

                    // Open the offer in edit mode
                    window.open(`/offer/${selectedOfferForPurchase.id}?edit=true`, '_blank')

                    setSelectedOfferForPurchase(null)
                    setIsGenerating(false)
                  } catch (error) {
                    console.error('Purchase error:', error)
                    setPurchaseError(
                      error instanceof Error ? error.message : 'Failed to process purchase'
                    )
                    setIsGenerating(false)
                    setIsPurchaseModalOpen(true)
                  }
                }}
              />
            )}
        </main>
      </div>
    </AuthGuard>
  )
}
