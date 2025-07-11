import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { UnifiedUserService } from '@/lib/unified-user-service'
import { getPlanById } from '@/lib/pricing-plans'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount = 1 } = body

    // Get current user data
    const user = await UnifiedUserService.findByEmail(session.user.email)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's current plan
    const currentPlan = getPlanById(user.subscription_tier) || getPlanById('free')!

    // For free users, deduct credits
    if (user.subscription_tier === 'free') {
      const newCredits = Math.max(0, user.credits_remaining - amount)

      // Update user credits
      const updateSuccess = await UnifiedUserService.updateSubscription(session.user.email, {
        credits_remaining: newCredits,
      })

      if (!updateSuccess) {
        return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        creditsRemaining: newCredits,
        subscriptionTier: user.subscription_tier,
        message: `${amount} credit(s) deducted successfully`,
      })
    }

    // For paid users, we might want to track usage but not deduct credits
    // This could be useful for analytics or rate limiting
    return NextResponse.json({
      success: true,
      creditsRemaining: user.credits_remaining, // No change for paid users
      subscriptionTier: user.subscription_tier,
      message: 'Generation completed (no credits deducted for paid plan)',
    })
  } catch (error) {
    console.error('Error deducting credit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
