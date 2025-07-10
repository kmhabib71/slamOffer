import { ObjectId } from 'mongodb'
import clientPromise from './mongodb'
import { CompleteGrandSlamOffer, SavedGrandSlamOffer } from '@/types'

// Generate a user-friendly title from business description
function generateOfferTitle(businessDescription: string): string {
  // Extract the first meaningful phrase (up to 50 characters)
  const cleanDesc = businessDescription
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
  const words = cleanDesc.split(' ')

  // Try to get a meaningful title
  if (words.length >= 3) {
    let title = words.slice(0, 6).join(' ')
    if (title.length > 50) {
      title = title.substring(0, 47) + '...'
    }
    return title
  }

  return cleanDesc.length > 50 ? cleanDesc.substring(0, 47) + '...' : cleanDesc
}

// Save a generated offer to MongoDB
export async function saveGrandSlamOffer(
  userId: string,
  offer: CompleteGrandSlamOffer,
  userTier: 'free' | 'pro'
): Promise<{ success: boolean; data?: SavedGrandSlamOffer; error?: string }> {
  try {
    // Input validation
    if (!userId) {
      return { success: false, error: 'User ID is required' }
    }
    if (!offer || !offer.businessContext?.businessDescription) {
      return { success: false, error: 'Invalid offer data' }
    }

    const client = await clientPromise
    const db = client.db()
    const title = generateOfferTitle(offer.businessContext.businessDescription)

    // Check if user exists before saving - AI-FRIENDLY: Uses unified user_profiles collection
    let userExists
    try {
      // Try to find by ObjectId first (if userId is a valid ObjectId)
      userExists = await db.collection('user_profiles').findOne({
        $or: [{ _id: new ObjectId(userId) }, { email: userId }],
      })
    } catch (error) {
      // If userId is not a valid ObjectId (e.g., it's an email), just search by email
      userExists = await db.collection('user_profiles').findOne({ email: userId })
    }
    if (!userExists) {
      console.error('User validation error: User not found')
      return { success: false, error: 'User not found or unauthorized' }
    }

    // Create the offer document
    const now = new Date()
    const offerDoc = {
      _id: new ObjectId(),
      user_id: userId,
      title,
      business_description: offer.businessContext.businessDescription,
      offer_data: offer,
      total_offer_value: offer.totalOfferValue || '0',
      user_tier: userTier,
      isPublic: false, // Default to private
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    }

    // Insert the offer
    const result = await db.collection('grand_slam_offers').insertOne(offerDoc)

    if (!result.acknowledged) {
      return { success: false, error: 'Failed to save offer' }
    }

    // Return the saved offer with string ID
    const savedOffer: SavedGrandSlamOffer = {
      id: result.insertedId.toString(),
      user_id: userId,
      title,
      business_description: offer.businessContext.businessDescription,
      offer_data: offer,
      total_offer_value: offer.totalOfferValue || '0',
      user_tier: userTier,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    }

    return { success: true, data: savedOffer }
  } catch (error) {
    console.error('Unexpected error saving offer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Get all offers for a user
export async function getUserOffers(
  userId: string,
  retryCount = 0
): Promise<{ success: boolean; data?: SavedGrandSlamOffer[]; error?: string }> {
  try {
    // Add a small delay if this is a retry attempt
    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
    }

    const client = await clientPromise
    const db = client.db()

    const offers = await db
      .collection('grand_slam_offers')
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .toArray()

    // Convert MongoDB documents to SavedGrandSlamOffer format
    const formattedOffers: SavedGrandSlamOffer[] = offers.map(offer => ({
      id: offer._id.toString(),
      user_id: offer.user_id,
      title: offer.title,
      business_description: offer.business_description,
      offer_data: offer.offer_data,
      total_offer_value: offer.total_offer_value,
      user_tier: offer.user_tier,
      created_at: offer.created_at,
      updated_at: offer.updated_at,
    }))

    return { success: true, data: formattedOffers }
  } catch (error) {
    console.error('Error fetching offers:', error)

    // If this is a network error or other temporary issue, retry up to 3 times
    if (retryCount < 3) {
      console.log(`Retrying getUserOffers (attempt ${retryCount + 1})...`)
      return getUserOffers(userId, retryCount + 1)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Get a specific offer by ID (with access control)
export async function getOfferById(
  offerId: string,
  userEmail: string | null
): Promise<{ success: boolean; data?: SavedGrandSlamOffer; error?: string }> {
  try {
    const client = await clientPromise
    const db = client.db()

    // First, find the offer in grand_slam_offers
    const offer = await db.collection('grand_slam_offers').findOne({ _id: new ObjectId(offerId) })

    if (!offer) {
      return { success: false, error: 'Offer not found' }
    }

    // Get the owner's email - AI-FRIENDLY: Uses unified user_profiles collection
    let owner
    try {
      // Try to find by ObjectId first (if offer.user_id is a valid ObjectId)
      owner = await db.collection('user_profiles').findOne({
        $or: [{ _id: new ObjectId(offer.user_id) }, { email: offer.user_id }],
      })
    } catch (error) {
      // If offer.user_id is not a valid ObjectId (e.g., it's an email), just search by email
      owner = await db.collection('user_profiles').findOne({ email: offer.user_id })
    }

    if (!owner) {
      return { success: false, error: 'Offer owner not found' }
    }

    // Check access permissions
    const isOwner = userEmail === owner.email
    const isPublic = offer.isPublic === true

    if (!isOwner && !isPublic) {
      return { success: false, error: 'Access denied' }
    }

    // Check if the owner has purchased this offer (for full content)
    const ownerPurchased = await db.collection('purchased_offers').findOne({
      userId: owner.email,
      offerId: offerId, // Use the main document ID, not the nested offer_data._id
      status: 'active',
    })

    let finalOfferData = offer.offer_data

    // If owner has purchased, use the full content from purchased_offers
    if (ownerPurchased) {
      finalOfferData = ownerPurchased.offerData
    }

    // Convert MongoDB document to SavedGrandSlamOffer format
    const formattedOffer: SavedGrandSlamOffer & { owner_email: string; isPublic: boolean } = {
      id: offer._id.toString(),
      user_id: offer.user_id,
      title: offer.title,
      business_description: offer.business_description,
      offer_data: finalOfferData,
      total_offer_value: offer.total_offer_value,
      user_tier: offer.user_tier,
      created_at: offer.created_at,
      updated_at: offer.updated_at,
      owner_email: owner.email,
      isPublic: offer.isPublic || false,
    }

    return { success: true, data: formattedOffer }
  } catch (error) {
    console.error('Error fetching offer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Get a specific offer by ID for owner only (backwards compatibility)
export async function getOfferByIdForOwner(
  offerId: string,
  userId: string
): Promise<{ success: boolean; data?: SavedGrandSlamOffer; error?: string }> {
  try {
    const client = await clientPromise
    const db = client.db()

    const offer = await db
      .collection('grand_slam_offers')
      .findOne({ _id: new ObjectId(offerId), user_id: userId })

    if (!offer) {
      return { success: false, error: 'Offer not found' }
    }

    // Convert MongoDB document to SavedGrandSlamOffer format
    const formattedOffer: SavedGrandSlamOffer = {
      id: offer._id.toString(),
      user_id: offer.user_id,
      title: offer.title,
      business_description: offer.business_description,
      offer_data: offer.offer_data,
      total_offer_value: offer.total_offer_value,
      user_tier: offer.user_tier,
      created_at: offer.created_at,
      updated_at: offer.updated_at,
    }

    return { success: true, data: formattedOffer }
  } catch (error) {
    console.error('Error fetching offer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Update offer visibility (public/private)
export async function updateOfferVisibility(
  offerId: string,
  userEmail: string,
  isPublic: boolean
): Promise<{ success: boolean; data?: { isPublic: boolean }; error?: string }> {
  try {
    const client = await clientPromise
    const db = client.db()

    // First, find the user by email to get their ID - AI-FRIENDLY: Uses unified user_profiles collection
    const user = await db.collection('user_profiles').findOne({ email: userEmail })
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const result = await db.collection('grand_slam_offers').updateOne(
      { _id: new ObjectId(offerId), user_id: user._id.toString() },
      {
        $set: {
          isPublic: isPublic,
          updated_at: new Date().toISOString(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return { success: false, error: 'Offer not found or access denied' }
    }

    return { success: true, data: { isPublic } }
  } catch (error) {
    console.error('Error updating offer visibility:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Delete an offer
export async function deleteOffer(
  offerId: string,
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise
    const db = client.db()

    // First, find the user by email to get their ID - AI-FRIENDLY: Uses unified user_profiles collection
    const user = await db.collection('user_profiles').findOne({ email: userEmail })
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const result = await db
      .collection('grand_slam_offers')
      .deleteOne({ _id: new ObjectId(offerId), user_id: user._id.toString() })

    if (result.deletedCount === 0) {
      return { success: false, error: 'Offer not found or unauthorized' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting offer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Update offer title
export async function updateOfferTitle(
  offerId: string,
  userEmail: string,
  newTitle: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise
    const db = client.db()

    // First, find the user by email to get their ID - AI-FRIENDLY: Uses unified user_profiles collection
    const user = await db.collection('user_profiles').findOne({ email: userEmail })
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const result = await db.collection('grand_slam_offers').updateOne(
      { _id: new ObjectId(offerId), user_id: user._id.toString() },
      {
        $set: {
          title: newTitle,
          updated_at: new Date().toISOString(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return { success: false, error: 'Offer not found or unauthorized' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating offer title:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
