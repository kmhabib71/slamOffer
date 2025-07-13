import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { authService } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.email
    const body = await request.json()
    const { amount = 1, isRegeneration = false, offerId, generationType = 'new' } = body

    // Validate input
    if (amount < 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 })
    }

    // Get user profile first
    const userProfile = await authService.getUserProfile(userId)
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Check if user can generate before deducting
    const canGenerate = await authService.canUserGenerate(userId, isRegeneration)
    if (!canGenerate.canGenerate) {
      return NextResponse.json(
        {
          error: 'Cannot deduct credits',
          reason: canGenerate.reason,
          details: {
            remainingCredits: canGenerate.remainingCredits || 0,
            dailyRemaining: canGenerate.dailyRemaining,
            regenerationsRemaining: canGenerate.regenerationsRemaining || 0,
          },
        },
        { status: 403 }
      )
    }

    // Deduct credits using the enhanced service
    try {
      const deductionSuccess = await authService.deductCredits(userId, amount, isRegeneration)

      if (!deductionSuccess) {
        return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
      }

      // Add generation record for tracking
      if (offerId) {
        await authService.addGenerationRecord(
          userId,
          offerId,
          generationType as 'new' | 'regeneration',
          isRegeneration ? 0 : amount
        )
      }

      // Get updated profile
      const updatedProfile = await authService.getUserProfile(userId)

      // Get regeneration status
      const regenerationStatus = await authService.getRegenerationStatus(userId)

      return NextResponse.json({
        success: true,
        message: isRegeneration
          ? 'Regeneration tracked successfully'
          : 'Credits deducted successfully',
        deduction: {
          amount: isRegeneration ? 0 : amount,
          isRegeneration,
          generationType,
          offerId,
        },
        profile: {
          subscription_tier: updatedProfile?.subscription_tier,
          credits_remaining: updatedProfile?.credits_remaining || 0,
          total_offers_generated: updatedProfile?.total_offers_generated || 0,
        },
        regeneration: {
          available: regenerationStatus.available,
          remaining: regenerationStatus.remaining || 0,
          max_regenerations: regenerationStatus.maxRegenerations || 0,
        },
        limits: {
          can_generate: updatedProfile ? await authService.canUserGenerate(userId, false) : null,
          can_regenerate: updatedProfile ? await authService.canUserGenerate(userId, true) : null,
        },
      })
    } catch (error) {
      console.error('Error deducting credits:', error)
      return NextResponse.json(
        {
          error: 'Failed to process credit deduction',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing credit deduction request:', error)
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check current credit status
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

    // Get generation capabilities
    const canGenerate = await authService.canUserGenerate(userId, false)
    const canRegenerate = await authService.canUserGenerate(userId, true)

    // Get regeneration status
    const regenerationStatus = await authService.getRegenerationStatus(userId)

    return NextResponse.json({
      success: true,
      profile: {
        subscription_tier: userProfile.subscription_tier,
        credits_remaining: userProfile.credits_remaining,
        total_offers_generated: userProfile.total_offers_generated || 0,
        last_generation_date: userProfile.last_generation_date,
        package_details: userProfile.package_details,
      },
      generation: {
        can_generate: canGenerate.canGenerate,
        can_regenerate: canRegenerate.canGenerate,
        generation_reason: canGenerate.reason,
        regeneration_reason: canRegenerate.reason,
        remaining_credits: canGenerate.remainingCredits || 0,
        daily_remaining: canGenerate.dailyRemaining,
        regenerations_remaining: canGenerate.regenerationsRemaining || 0,
      },
      regeneration: regenerationStatus,
    })
  } catch (error) {
    console.error('Error checking credit status:', error)
    return NextResponse.json(
      {
        error: 'Failed to check status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
