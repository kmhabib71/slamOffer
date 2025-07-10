import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { UnifiedUserService } from '@/lib/unified-user-service'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userEmail = session.user.email

    // Get user profile using the unified service
    const userProfile = await UnifiedUserService.findByEmail(userEmail)

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Check if user can generate - implement the same logic as authService
    const canGenerate = await checkUserCanGenerate(userProfile)

    // Calculate daily usage count
    const today = new Date().toISOString().split('T')[0]
    const todayUsage = userProfile.daily_usage?.find(usage => usage.date === today)
    const dailyUsageCount = todayUsage?.count || 0

    // Return usage data
    return NextResponse.json({
      canGenerate: canGenerate.canGenerate,
      reason: canGenerate.reason,
      remainingCredits: canGenerate.remainingCredits || userProfile.credits_remaining,
      subscriptionTier: userProfile.subscription_tier,
      dailyUsageCount,
      packageDetails: userProfile.package_details,
      totalGenerated: userProfile.total_offers_generated || 0,
      lastGenerationDate: userProfile.last_generation_date,
    })
  } catch (error) {
    console.error('Error checking usage:', error)
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 })
  }
}

// Helper function to check if user can generate (same logic as authService)
async function checkUserCanGenerate(profile: any): Promise<{
  canGenerate: boolean
  reason?: string
  remainingCredits?: number
}> {
  try {
    // Free users have limits: max 3 total offers, 1 per day
    if (profile.subscription_tier === 'free') {
      // Check total limit
      if (profile.credits_remaining <= 0) {
        return {
          canGenerate: false,
          reason: 'No more free offers available',
          remainingCredits: 0,
        }
      }

      // Check daily limit - get today's date
      const today = new Date().toISOString().split('T')[0]
      const todayUsage = profile.daily_usage?.find((usage: any) => usage.date === today)

      if (todayUsage && todayUsage.count >= 1) {
        return {
          canGenerate: false,
          reason: 'Daily limit reached (1 per day)',
          remainingCredits: profile.credits_remaining,
        }
      }

      return { canGenerate: true, remainingCredits: profile.credits_remaining }
    }

    // Paid users can generate if they have credits
    if (profile.credits_remaining > 0) {
      return { canGenerate: true, remainingCredits: profile.credits_remaining }
    }

    return { canGenerate: false, reason: 'No credits remaining', remainingCredits: 0 }
  } catch (error) {
    console.error('Error checking generation limits:', error)
    return { canGenerate: false, reason: 'Error checking limits' }
  }
}
