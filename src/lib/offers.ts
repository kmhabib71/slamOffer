import { supabase } from './supabase'
import { CompleteGrandSlamOffer } from '@/types'

export interface SavedGrandSlamOffer {
  id: string
  user_id: string
  title: string
  business_description: string
  offer_data: CompleteGrandSlamOffer
  total_offer_value: string
  user_tier: 'free' | 'pro'
  created_at: string
  updated_at: string
}

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

// Save a generated offer to Supabase
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

    const title = generateOfferTitle(offer.businessContext.businessDescription)

    // Check if user exists before saving
    const { data: userExists, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError || !userExists) {
      console.error('User validation error:', userError)
      return { success: false, error: 'User not found or unauthorized' }
    }

    // Attempt to save the offer
    const { data, error } = await supabase
      .from('grand_slam_offers')
      .insert({
        user_id: userId,
        title,
        business_description: offer.businessContext.businessDescription,
        offer_data: offer,
        total_offer_value: offer.totalOfferValue || '0',
        user_tier: userTier,
      })
      .select()
      .single()

    if (error) {
      // Handle specific database errors
      if (error.code === '23505') {
        return { success: false, error: 'Duplicate offer found' }
      } else if (error.code === '42P01') {
        return { success: false, error: 'Database table not found - please contact support' }
      } else if (error.code === '42501') {
        return { success: false, error: 'Permission denied - please check your account status' }
      }

      console.error('Database error saving offer:', error)
      return { success: false, error: `Database error: ${error.message}` }
    }

    if (!data) {
      return { success: false, error: 'No data returned after save' }
    }

    return { success: true, data: data as SavedGrandSlamOffer }
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

    const { data, error } = await supabase
      .from('grand_slam_offers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching offers:', error)

      // If this is a PostgreSQL error that might be temporary, retry up to 3 times
      if (
        retryCount < 3 &&
        (error.message.includes('connection') ||
          error.message.includes('timeout') ||
          error.message.includes('temporarily unavailable'))
      ) {
        console.log(`Retrying getUserOffers (attempt ${retryCount + 1})...`)
        return getUserOffers(userId, retryCount + 1)
      }

      return {
        success: false,
        error: error.message,
      }
    }

    if (!data) {
      return { success: true, data: [] }
    }

    return { success: true, data: data as SavedGrandSlamOffer[] }
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

// Get a specific offer by ID
export async function getOfferById(
  offerId: string,
  userId: string
): Promise<{ success: boolean; data?: SavedGrandSlamOffer; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('grand_slam_offers')
      .select('*')
      .eq('id', offerId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching offer:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as SavedGrandSlamOffer }
  } catch (error) {
    console.error('Error fetching offer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Delete an offer
export async function deleteOffer(
  offerId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('grand_slam_offers')
      .delete()
      .eq('id', offerId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting offer:', error)
      return { success: false, error: error.message }
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
  userId: string,
  newTitle: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('grand_slam_offers')
      .update({
        title: newTitle,
        updated_at: new Date().toISOString(),
      })
      .eq('id', offerId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating offer title:', error)
      return { success: false, error: error.message }
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
