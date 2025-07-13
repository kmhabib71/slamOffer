import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { authService } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'Regeneration functionality has been disabled' },
    { status: 410 }
  )
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