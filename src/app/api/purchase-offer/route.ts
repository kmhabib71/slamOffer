import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
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
      userTier,
      componentName,
      isRegeneration = false,
    } = body

    // Debug logging
    console.log('Generation request:', {
      userId,
      offerId,
      businessContext: businessContext ? 'present' : 'missing',
      generateComplete,
      userTier,
      componentName,
      isRegeneration,
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
      try {
        userProfile = await authService.createUserProfile(userId, session.user.email!)
      } catch (error) {
        console.error('Error creating user profile:', error)
        return NextResponse.json(
          {
            error: 'Failed to create user profile',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        )
      }
    }

    // Check if user can generate (handles both new generations and regenerations)
    const canGenerate = await authService.canUserGenerate(userId, isRegeneration)

    if (!canGenerate.canGenerate) {
      return NextResponse.json(
        {
          error: canGenerate.reason || 'Cannot generate offer',
          details: {
            remainingCredits: canGenerate.remainingCredits,
            dailyRemaining: canGenerate.dailyRemaining,
            regenerationsRemaining: canGenerate.regenerationsRemaining,
          },
        },
        { status: 403 }
      )
    }

    // For regenerations, use the original business context
    let finalBusinessContext = businessContext
    if (isRegeneration && userProfile.subscription_tier === 'starter_spark') {
      const originalContext = userProfile.package_details?.original_business_context
      if (originalContext) {
        finalBusinessContext = originalContext
        console.log('Using original business context for regeneration')
      } else {
        // Store the current context as original for future regenerations
        await authService.storeOriginalBusinessContext(userId, businessContext)
        console.log('Stored original business context for future regenerations')
      }
    }

    // Determine the actual user tier for generation
    let effectiveTier = userProfile.subscription_tier

    // Check if this is a purchased offer (individual purchase)
    if (!isRegeneration) {
      const isPurchased = await dbHelpers.isPurchasedByUser(userId, offerId)
      if (isPurchased) {
        return NextResponse.json({ error: 'Offer already purchased' }, { status: 400 })
      }
    }

    // Handle different generation types
    let shouldDeductCredits = true
    let creditsToDeduct = 1
    let generationTier: 'free' | 'pro' = 'free'

    if (isRegeneration && userProfile.subscription_tier === 'starter_spark') {
      // Regenerations for Starter Spark don't consume credits
      shouldDeductCredits = false
      creditsToDeduct = 0
      generationTier = 'pro' // Regenerations get full content
    } else if (userProfile.subscription_tier === 'free') {
      // Free users get basic offers
      generationTier = 'free'
      creditsToDeduct = 1
    } else {
      // Paid users get full offers
      generationTier = 'pro'
      creditsToDeduct = 1
    }

    // Deduct credits BEFORE generation to prevent race conditions
    if (shouldDeductCredits) {
      try {
        const deductionSuccess = await authService.deductCredits(
          userId,
          creditsToDeduct,
          isRegeneration
        )
        if (!deductionSuccess) {
          return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
        }
        console.log('Successfully deducted credits:', creditsToDeduct)
      } catch (error) {
        console.error('Error deducting credits:', error)
        return NextResponse.json({ error: 'Failed to process credits' }, { status: 500 })
      }
    } else {
      // For regenerations, still track the generation
      try {
        await authService.deductCredits(userId, 0, true)
        console.log('Tracked regeneration without credit deduction')
      } catch (error) {
        console.error('Error tracking regeneration:', error)
        // Continue anyway since this is just tracking
      }
    }

    // Generate the offer
    let completeOffer
    try {
      console.log('Starting AI generation with tier:', generationTier)

      completeOffer = await generateCompleteGrandSlamOffer({
        businessContext: finalBusinessContext,
        userTier: generationTier,
        generateComplete: generationTier !== 'free', // Free users get limited content
        componentName,
      })

      console.log('AI generation completed successfully')
    } catch (error) {
      console.error('Error generating offer:', error)

      // If generation fails, refund credits
      if (shouldDeductCredits) {
        try {
          await authService.updateUserProfile(userId, {
            credits_remaining: userProfile.credits_remaining, // Restore original credits
          })
          console.log('Refunded credits due to generation failure')
        } catch (refundError) {
          console.error('Error refunding credits:', refundError)
        }
      }

      return NextResponse.json(
        {
          error: 'Failed to generate offer',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

    // Save the generation result based on user tier
    try {
      if (userProfile.subscription_tier === 'free') {
        // Free tier: Save to grand_slam_offers collection (no purchase record)
        const { saveGrandSlamOffer } = await import('@/lib/offers')
        const saveResult = await saveGrandSlamOffer(userId, completeOffer, 'free')
        if (!saveResult.success) {
          throw new Error(saveResult.error || 'Failed to save free offer')
        }
        console.log('Saved free tier offer to grand_slam_offers')
        
        // Update user stats for free tier
        try {
          await authService.updateUserProfile(userId, {
            total_offers_generated: (userProfile.total_offers_generated || 0) + 1,
            last_generation_date: new Date(),
          })
          console.log('Updated user stats for free tier generation')
        } catch (statsError) {
          console.error('Error updating user stats:', statsError)
          // Don't fail the whole operation for stats update failure
        }
      } else {
        // Paid tier: Save to purchased_offers collection
        if (isRegeneration) {
          await dbHelpers.savePurchasedOffer(userId, offerId, completeOffer, componentName)
          console.log('Saved regenerated offer')
        } else {
          await dbHelpers.savePurchasedOffer(userId, offerId, completeOffer, componentName)
          console.log('Saved paid tier offer')
          
          // Update user stats for paid tier
          try {
            await authService.updateUserProfile(userId, {
              total_offers_generated: (userProfile.total_offers_generated || 0) + 1,
              last_generation_date: new Date(),
            })
            console.log('Updated user stats for paid tier generation')
          } catch (statsError) {
            console.error('Error updating user stats:', statsError)
            // Don't fail the whole operation for stats update failure
          }
        }
      }
    } catch (error) {
      console.error('Error saving offer:', error)
      return NextResponse.json(
        {
          error: 'Failed to save offer',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

    // Get updated user profile to return current status
    const updatedProfile = await authService.getUserProfile(userId)

    // Get regeneration status for response
    const regenerationStatus = await authService.getRegenerationStatus(userId)

    return NextResponse.json({
      success: true,
      data: completeOffer,
      generation: {
        type: isRegeneration ? 'regeneration' : 'new',
        tier: generationTier,
        creditsDeducted: creditsToDeduct,
        remainingCredits: updatedProfile?.credits_remaining || 0,
        regenerationsRemaining: regenerationStatus.remaining || 0,
      },
      profile: {
        subscription_tier: updatedProfile?.subscription_tier,
        credits_remaining: updatedProfile?.credits_remaining,
        can_regenerate: regenerationStatus.available,
        regenerations_remaining: regenerationStatus.remaining,
      },
    })
  } catch (error) {
    console.error('Error processing generation:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process generation',
        details: error instanceof Error ? error.stack : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
