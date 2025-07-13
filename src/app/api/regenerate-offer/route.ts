import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { generateCompleteGrandSlamOffer } from '@/lib/openai'
import { authService, dbHelpers } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.email

    // Parse request body
    const body = await request.json()
    const { offerId, componentName } = body

    console.log('Regeneration request:', {
      userId,
      offerId,
      componentName,
    })

    if (!offerId) {
      return NextResponse.json({ error: 'Offer ID is required' }, { status: 400 })
    }

    // Get user profile
    const userProfile = await authService.getUserProfile(userId)
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Check if user is on Starter Spark tier
    if (userProfile.subscription_tier !== 'starter_spark') {
      return NextResponse.json(
        { error: 'Regeneration is only available for Starter Spark users' },
        { status: 403 }
      )
    }

    // Check if user has regenerations available
    const regenerationStatus = await authService.getRegenerationStatus(userId)
    if (!regenerationStatus.available) {
      return NextResponse.json(
        {
          error: 'No regenerations remaining',
          details: {
            remaining: regenerationStatus.remaining,
            maxRegenerations: regenerationStatus.maxRegenerations,
          },
        },
        { status: 403 }
      )
    }

    // Get original business context
    const originalContext = regenerationStatus.originalContext
    if (!originalContext) {
      return NextResponse.json(
        { error: 'Original business context not found. Cannot regenerate.' },
        { status: 400 }
      )
    }

    console.log('Starting regeneration with original context')

    // Generate the regenerated offer using original context
    let regeneratedOffer
    try {
      regeneratedOffer = await generateCompleteGrandSlamOffer({
        businessContext: originalContext,
        userTier: 'pro', // Starter Spark regenerations get full content
        generateComplete: true,
        componentName,
      })

      console.log('Regeneration completed successfully')
    } catch (error) {
      console.error('Error during regeneration:', error)
      return NextResponse.json(
        {
          error: 'Failed to regenerate offer',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

    // Track the regeneration (doesn't deduct credits)
    try {
      await authService.deductCredits(userId, 0, true) // Track regeneration
      console.log('Successfully tracked regeneration')
    } catch (error) {
      console.error('Error tracking regeneration:', error)
      // Continue anyway since generation was successful
    }

    // Save the regenerated offer
    try {
      await dbHelpers.savePurchasedOffer(userId, offerId, regeneratedOffer, componentName)
      console.log('Saved regenerated offer')
    } catch (error) {
      console.error('Error saving regenerated offer:', error)
      return NextResponse.json(
        {
          error: 'Failed to save regenerated offer',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

    // Get updated regeneration status
    const updatedRegenerationStatus = await authService.getRegenerationStatus(userId)
    const updatedProfile = await authService.getUserProfile(userId)

    return NextResponse.json({
      success: true,
      message: 'Offer regenerated successfully',
      data: regeneratedOffer,
      regeneration: {
        type: 'regeneration',
        remaining: updatedRegenerationStatus.remaining,
        maxRegenerations: updatedRegenerationStatus.maxRegenerations,
        available: updatedRegenerationStatus.available,
      },
      profile: {
        subscription_tier: updatedProfile?.subscription_tier,
        credits_remaining: updatedProfile?.credits_remaining,
        regenerations_used: updatedProfile?.package_details?.regenerations_used || 0,
      },
      offer: {
        id: offerId,
        generated_at: new Date().toISOString(),
        type: 'regeneration',
        component: componentName,
      },
    })
  } catch (error) {
    console.error('Error processing regeneration:', error)
    return NextResponse.json(
      {
        error: 'Failed to process regeneration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check regeneration status
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.email

    // Get user profile
    const userProfile = await authService.getUserProfile(userId)
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get regeneration status
    const regenerationStatus = await authService.getRegenerationStatus(userId)

    return NextResponse.json({
      success: true,
      profile: {
        subscription_tier: userProfile.subscription_tier,
        eligible_for_regeneration: userProfile.subscription_tier === 'starter_spark',
      },
      regeneration: {
        available: regenerationStatus.available,
        remaining: regenerationStatus.remaining || 0,
        maxRegenerations: regenerationStatus.maxRegenerations || 0,
        used: (regenerationStatus.maxRegenerations || 0) - (regenerationStatus.remaining || 0),
        hasOriginalContext: !!regenerationStatus.originalContext,
      },
      rules: {
        description: 'Starter Spark users get 2 regenerations of the same prompt',
        restrictions: [
          'Only available for Starter Spark tier',
          'Uses the exact same business description',
          'No editing of the original prompt allowed',
          'Does not consume additional credits',
        ],
      },
    })
  } catch (error) {
    console.error('Error checking regeneration status:', error)
    return NextResponse.json(
      {
        error: 'Failed to check regeneration status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
