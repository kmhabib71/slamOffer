import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { generateCompleteGrandSlamOffer } from '@/lib/openai'
import { authService, dbHelpers } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Get the current session using NextAuth
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: 'Authentication failed',
          details: 'No valid session found',
        },
        { status: 401 }
      )
    }

    // Use email as user identifier since NextAuth doesn't provide ID by default
    const userId = session.user.email

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const {
      offerId,
      businessContext,
      generateComplete = true,
      userTier = 'pro',
      componentName,
    } = body

    // Debug logging
    console.log('Purchase request body:', {
      offerId,
      businessContext: businessContext ? 'present' : 'missing',
      generateComplete,
      userTier,
      componentName,
    })

    if (!offerId || !businessContext) {
      console.log('Missing required fields:', {
        offerId: !!offerId,
        businessContext: !!businessContext,
      })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get or create user profile
    let userProfile = await authService.getUserProfile(userId)

    if (!userProfile) {
      // Create user profile if it doesn't exist
      try {
        userProfile = await authService.createUserProfile(userId, session.user.email!)
      } catch (error) {
        console.error('Error creating user profile:', error)
        return NextResponse.json(
          {
            error: 'Failed to create user profile',
            details: error,
          },
          { status: 500 }
        )
      }
    }

    // Check if user has already purchased this offer
    const isPurchased = await dbHelpers.isPurchasedByUser(userId, offerId)

    if (isPurchased) {
      return NextResponse.json({ error: 'Offer already purchased' }, { status: 400 })
    }

    // Note: We no longer upgrade users to global pro status
    // Each offer purchase is tracked individually

    // Generate the complete offer (now as pro user)
    let completeOffer
    try {
      completeOffer = await generateCompleteGrandSlamOffer({
        businessContext,
        userTier: 'pro', // Always use pro tier for purchased offers
        generateComplete: true, // Always generate complete content for purchases
        componentName,
      })
    } catch (error) {
      console.error('Error generating offer:', error)
      return NextResponse.json(
        {
          error: 'Failed to generate offer',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

    // Save the purchase
    try {
      await dbHelpers.savePurchasedOffer(userId, offerId, completeOffer, componentName)
    } catch (error) {
      console.error('Error saving purchase:', error)
      return NextResponse.json(
        {
          error: 'Failed to save purchase',
          details: error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: completeOffer,
    })
  } catch (error) {
    console.error('Error processing purchase:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process purchase',
        details: error,
      },
      { status: 500 }
    )
  }
}
