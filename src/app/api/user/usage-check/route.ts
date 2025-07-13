import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { authService } from '@/lib/auth'

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

    // Check generation capability
    const canGenerate = await authService.canUserGenerate(userId, false)
    const canRegenerate = await authService.canUserGenerate(userId, true)

    // Get regeneration status
    const regenerationStatus = await authService.getRegenerationStatus(userId)

    // Calculate daily usage for today
    const today = new Date().toISOString().split('T')[0]
    const todayUsage = userProfile.daily_usage?.find(usage => usage.date === today)
    const todayCount = todayUsage?.count || 0

    // Get recent generation history
    const recentHistory = await authService.getGenerationHistory(userId, 5)

    return NextResponse.json({
      success: true,
      profile: {
        subscription_tier: userProfile.subscription_tier,
        credits_remaining: userProfile.credits_remaining,
        total_offers_generated: userProfile.total_offers_generated || 0,
        last_generation_date: userProfile.last_generation_date,
        created_at: userProfile.created_at,
        package_details: userProfile.package_details,
      },
      usage: {
        today: {
          count: todayCount,
          date: today,
        },
        daily_limit: userProfile.subscription_tier === 'free' ? 1 : null,
        daily_remaining:
          userProfile.subscription_tier === 'free' ? Math.max(0, 1 - todayCount) : null,
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
      regeneration: {
        available: regenerationStatus.available,
        remaining: regenerationStatus.remaining || 0,
        max_regenerations: regenerationStatus.maxRegenerations || 0,
        has_original_context: !!regenerationStatus.originalContext,
      },
      history: recentHistory,
      limits: {
        free_tier: {
          total_credits: 3,
          daily_limit: 1,
          description: 'Free users get 3 total generations, 1 per day',
        },
        starter_spark: {
          total_credits: 1,
          regenerations: 2,
          description: '1 complete offer + 2 regenerations of the same prompt',
        },
        growth_engine: {
          total_credits: 10,
          description: '10 complete offers, all features',
        },
        agency_arsenal: {
          total_credits: 30,
          description: '30 complete offers, all features',
        },
      },
    })
  } catch (error) {
    console.error('Error checking usage:', error)
    return NextResponse.json(
      {
        error: 'Failed to check usage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.email
    const body = await request.json()
    const { action, isRegeneration = false } = body

    if (action === 'check_can_generate') {
      const canGenerate = await authService.canUserGenerate(userId, isRegeneration)

      return NextResponse.json({
        success: true,
        can_generate: canGenerate.canGenerate,
        reason: canGenerate.reason,
        remaining_credits: canGenerate.remainingCredits || 0,
        daily_remaining: canGenerate.dailyRemaining,
        regenerations_remaining: canGenerate.regenerationsRemaining || 0,
      })
    }

    if (action === 'get_regeneration_status') {
      const regenerationStatus = await authService.getRegenerationStatus(userId)

      return NextResponse.json({
        success: true,
        regeneration: regenerationStatus,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing usage check:', error)
    return NextResponse.json(
      {
        error: 'Failed to process usage check',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
