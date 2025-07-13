'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/auth-provider'
import { OfferResults } from '@/components/dashboard/offer-results'
import { AuthGuard } from '@/components/auth/auth-guard'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Share2, Eye, EyeOff, Edit3 } from 'lucide-react'
import Link from 'next/link'
import { PurchaseModal } from '@/components/dashboard/purchase-modal'
import { PackingAnimation } from '@/components/dashboard/packing-animation'
import { fetchWithAuth } from '@/utils/fetchWithAuth'

type ClientCompleteGrandSlamOffer = {
  _id: string
  user_id: string
  businessContext: {
    businessDescription: string
  }
  components: any[]
  totalOfferValue: string
  createdAt: Date
  metadata: {
    tokenUsage?: number
    generationTime?: number
    model?: string
    testMode?: boolean
  }
  isPublic?: boolean
}

export default function OfferDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [offer, setOffer] = useState<ClientCompleteGrandSlamOffer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'mindmap' | 'text'>('text')
  const [isOwner, setIsOwner] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [showPackingAnimation, setShowPackingAnimation] = useState(false)

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await fetch(`/api/offers/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Offer not found')
          } else if (response.status === 403) {
            setError('This offer is private and you do not have permission to view it')
          } else {
            setError('Failed to load offer')
          }
          return
        }

        const data = await response.json()

        // Convert to client-safe format
        const clientOffer: ClientCompleteGrandSlamOffer = {
          ...data.data.offer_data,
          _id: data.data.id || data.data._id?.toString() || '',
          user_id: data.data.user_id?.toString() || '',
          businessContext: data.data.offer_data?.businessContext || {
            businessDescription: data.data.business_description || '',
          },
          isPublic: data.data.isPublic,
        }

        setOffer(clientOffer)
        const userIsOwner = user?.email === data.data.owner_email
        setIsOwner(userIsOwner)

        // Check if the owner has purchased this offer (backend already returns purchased content if available)
        // We determine purchase status by checking if the offer has full content (more than 3 items per component)
        if (userIsOwner && clientOffer.components && clientOffer.components.length > 0) {
          const hasFullContent = clientOffer.components.some(
            component => component.items && component.items.length > 3
          )
          setIsPurchased(hasFullContent)
        }
      } catch (err) {
        console.error('Error fetching offer:', err)
        setError('Failed to load offer')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchOffer()
    }
  }, [params.id, user])

  // Purchase status check functions removed - backend now handles this automatically
  // The getOfferById function returns purchased content when owner has purchased

  const togglePublicStatus = async () => {
    if (!offer || !isOwner) return

    setIsToggling(true)
    try {
      const response = await fetch(`/api/offers/${offer._id}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublic: !offer.isPublic,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update offer visibility')
      }

      const data = await response.json()
      setOffer(prev => (prev ? { ...prev, isPublic: data.data.isPublic } : null))
    } catch (err) {
      console.error('Error updating visibility:', err)
    } finally {
      setIsToggling(false)
    }
  }

  const copyShareLink = async () => {
    const url = `${window.location.origin}/offer/${offer?._id}`
    await navigator.clipboard.writeText(url)
    // You could add a toast notification here
  }

  const handlePurchaseClick = () => {
    if (isOwner && !isPurchased) {
      setShowPurchaseModal(true)
    }
  }

  const handlePurchaseComplete = async (purchaseData?: any) => {
    if (!offer) return

    try {
      setShowPurchaseModal(false)
      setShowPackingAnimation(true)
      setIsGenerating(true)
      setPurchaseError(null)

      console.log('🎯 OFFER PAGE - Purchase completed, checking for generated offer data')
      
      // For unlock purchases, the purchase-package API already handles generation
      // Check if we received generated offer data from the purchase
      if (purchaseData?.generatedOffer) {
        console.log('🎯 OFFER PAGE - Received generated offer from purchase-package API')
        
        // Show animation for a minimum time for user experience
        setTimeout(() => {
          // Update the offer with the full version from purchase-package API
          const updatedOffer: ClientCompleteGrandSlamOffer = {
            ...purchaseData.generatedOffer,
            _id: purchaseData.generatedOffer._id?.toString() || offer._id,
            user_id: purchaseData.generatedOffer.user_id?.toString() || offer.user_id,
            businessContext: purchaseData.generatedOffer.businessContext || offer.businessContext,
            isPublic: offer.isPublic,
          }

          setOffer(updatedOffer)
          setIsPurchased(true)
          setIsGenerating(false)
          setShowPackingAnimation(false)
          
          console.log('🎯 OFFER PAGE - Offer updated successfully with generated data')
        }, 3000) // Show animation for at least 3 seconds
      } else {
        console.log('⚠️ OFFER PAGE - No generated offer data received, this might be a regular package purchase')
        setIsGenerating(false)
        setShowPackingAnimation(false)
      }
    } catch (error) {
      console.error('Purchase error:', error)
      setPurchaseError(error instanceof Error ? error.message : 'Failed to process purchase')
      setIsGenerating(false)
      setShowPackingAnimation(false)
      setShowPurchaseModal(true)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen relative bg-[#F9FAFB] dotted-bg flex items-center justify-center">
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
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            ))}
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 relative z-10"></div>
        </div>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen relative bg-[#F9FAFB] dotted-bg flex items-center justify-center">
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
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            ))}
          </div>
          <div className="text-center relative z-10">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!offer) {
    return (
      <AuthGuard>
        <div className="min-h-screen relative bg-[#F9FAFB] dotted-bg flex items-center justify-center">
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
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            ))}
          </div>
          <div className="text-center relative z-10">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Offer Not Found</h1>
            <p className="text-slate-600 mb-6">The offer you're looking for doesn't exist.</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  // Show packing animation if purchase is in progress
  if (showPackingAnimation) {
    return (
      <AuthGuard>
        <PackingAnimation
          businessContext={offer.businessContext}
          onComplete={() => {
            console.log('🎯 OFFER PAGE - Packing animation completed')
            // Animation will automatically hide when data is ready
          }}
        />
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

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
          <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>

              <div className="h-6 w-px bg-slate-300" />

              <div>
                <h1 className="text-lg font-semibold text-slate-800">
                  {offer.businessContext?.businessDescription?.substring(0, 50) || 'Untitled Offer'}
                  ...
                </h1>
                <p className="text-sm text-slate-500">{isOwner ? 'Your Offer' : 'Shared Offer'}</p>
              </div>
            </div>

            {/* Owner Controls */}
            {isOwner && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePublicStatus}
                  disabled={isToggling}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    offer.isPublic
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {offer.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span>{offer.isPublic ? 'Public' : 'Private'}</span>
                </button>

                {offer.isPublic && (
                  <button
                    onClick={copyShareLink}
                    className="flex items-center space-x-2 px-3 py-2 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Copy Link</span>
                  </button>
                )}

{isPurchased ? (
                  <Link
                    href={`/offer/${offer._id}/edit`}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed opacity-75"
                    title="Purchase the complete offer to edit"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            )}
          </nav>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8 relative z-10">
          <OfferResults
            offer={offer}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onPurchaseClick={handlePurchaseClick}
            onStartOver={() => router.push('/dashboard')}
            isPurchased={isPurchased}
          />
        </main>

        {/* Purchase Modal */}
        {showPurchaseModal && (
          <PurchaseModal
            isOpen={showPurchaseModal}
            onClose={() => {
              setShowPurchaseModal(false)
              setPurchaseError(null)
            }}
            offerTitle={
              offer?.businessContext?.businessDescription?.substring(0, 50) + '...' ||
              'Complete Offer'
            }
            onPurchaseComplete={handlePurchaseComplete}
          />
        )}
      </div>
    </AuthGuard>
  )
}
