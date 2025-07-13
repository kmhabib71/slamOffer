import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { authService } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.email
    const url = new URL(request.url)
    const timeframe = url.searchParams.get('timeframe') || '30d'
    const includeHistory = url.searchParams.get('history') === 'true'

    // Get user profile
    const userProfile = await authService.getUserProfile(userId)
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate: Date

    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get generation history within timeframe
    const generationHistory = userProfile.generation_history || []
    const filteredHistory = generationHistory.filter(
      (record: any) => new Date(record.date) >= startDate
    )

    // Calculate usage statistics
    const stats = {
      current_period: {
        total_generations: filteredHistory.length,
        new_generations: filteredHistory.filter((r: any) => r.type === 'new').length,
        regenerations: filteredHistory.filter((r: any) => r.type === 'regeneration').length,
        credits_used: filteredHistory.reduce((sum: number, r: any) => sum + r.credits_used, 0),
      },
      daily_breakdown: [] as any[],
      tier_info: {
        current_tier: userProfile.subscription_tier,
        credits_remaining: userProfile.credits_remaining,
        credits_used_total: userProfile.credits_used || 0,
        tier_limits: getTierLimits(userProfile.subscription_tier),
      },
      regeneration_status: null as any,
    }

    // Get daily breakdown
    const dailyMap = new Map<string, any>()
    const dailyUsage = userProfile.daily_usage || []

    // Initialize all days in range
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dailyMap.set(dateStr, {
        date: dateStr,
        generations: 0,
        credits_used: 0,
        new_generations: 0,
        regenerations: 0,
        daily_usage_count: 0,
      })
    }

    // Populate with actual data
    filteredHistory.forEach((record: any) => {
      const dateStr = new Date(record.date).toISOString().split('T')[0]
      const day = dailyMap.get(dateStr)
      if (day) {
        day.generations += 1
        day.credits_used += record.credits_used
        if (record.type === 'new') {
          day.new_generations += 1
        } else if (record.type === 'regeneration') {
          day.regenerations += 1
        }
      }
    })

    // Add daily usage data
    dailyUsage.forEach((usage: any) => {
      const day = dailyMap.get(usage.date)
      if (day) {
        day.daily_usage_count = usage.count
      }
    })

    stats.daily_breakdown = Array.from(dailyMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Get regeneration status for Starter Spark
    if (userProfile.subscription_tier === 'starter_spark') {
      const regenerationStatus = await authService.getRegenerationStatus(userId)
      stats.regeneration_status = regenerationStatus
    }

    // Response data
    const response: any = {
      success: true,
      timeframe,
      user: {
        subscription_tier: userProfile.subscription_tier,
        credits_remaining: userProfile.credits_remaining,
        total_offers_generated: userProfile.total_offers_generated || 0,
        last_generation_date: userProfile.last_generation_date,
        created_at: userProfile.created_at,
      },
      stats,
      limits: {
        daily_limit: userProfile.subscription_tier === 'free' ? 1 : null,
        total_credits: getTierLimits(userProfile.subscription_tier).total_credits,
        regenerations: getTierLimits(userProfile.subscription_tier).regenerations,
      },
    }

    // Include full history if requested
    if (includeHistory) {
      response.history = filteredHistory
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching usage analytics:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch usage analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Get usage summary for admin or reporting
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.email
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'daily_summary':
        return await getDailySummary(userId, params)
      case 'tier_usage':
        return await getTierUsage(userId, params)
      case 'regeneration_patterns':
        return await getRegenerationPatterns(userId, params)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing usage analytics:', error)
    return NextResponse.json(
      {
        error: 'Failed to process usage analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

async function getDailySummary(userId: string, params: any) {
  const userProfile = await authService.getUserProfile(userId)
  if (!userProfile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  const today = new Date().toISOString().split('T')[0]
  const todayUsage = userProfile.daily_usage?.find((usage: any) => usage.date === today)
  const todayGenerations =
    userProfile.generation_history?.filter(
      (record: any) => new Date(record.date).toISOString().split('T')[0] === today
    ) || []

  return NextResponse.json({
    success: true,
    daily_summary: {
      date: today,
      generations_today: todayGenerations.length,
      credits_used_today: todayGenerations.reduce((sum: number, r: any) => sum + r.credits_used, 0),
      daily_usage_count: todayUsage?.count || 0,
      remaining_daily_limit:
        userProfile.subscription_tier === 'free' ? Math.max(0, 1 - (todayUsage?.count || 0)) : null,
      can_generate_today:
        userProfile.subscription_tier === 'free'
          ? (todayUsage?.count || 0) < 1
          : userProfile.credits_remaining > 0,
    },
  })
}

async function getTierUsage(userId: string, params: any) {
  const userProfile = await authService.getUserProfile(userId)
  if (!userProfile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  const tierLimits = getTierLimits(userProfile.subscription_tier)
  const packageDetails = userProfile.package_details || {}

  return NextResponse.json({
    success: true,
    tier_usage: {
      current_tier: userProfile.subscription_tier,
      tier_limits: tierLimits,
      usage: {
        credits_used: tierLimits.total_credits - userProfile.credits_remaining,
        credits_remaining: userProfile.credits_remaining,
        percentage_used:
          tierLimits.total_credits > 0
            ? ((tierLimits.total_credits - userProfile.credits_remaining) /
                tierLimits.total_credits) *
              100
            : 0,
        regenerations_used: packageDetails.regenerations_used || 0,
        regenerations_remaining: Math.max(
          0,
          (tierLimits.regenerations || 0) - (packageDetails.regenerations_used || 0)
        ),
      },
      package_details: packageDetails,
    },
  })
}

async function getRegenerationPatterns(userId: string, params: any) {
  const userProfile = await authService.getUserProfile(userId)
  if (!userProfile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  const regenerationHistory =
    userProfile.generation_history?.filter((record: any) => record.type === 'regeneration') || []

  const patterns = {
    total_regenerations: regenerationHistory.length,
    regeneration_dates: regenerationHistory.map((r: any) => r.date),
    frequency:
      regenerationHistory.length > 0 ? calculateRegenerationFrequency(regenerationHistory) : null,
    tier_specific:
      userProfile.subscription_tier === 'starter_spark'
        ? {
            regenerations_used: userProfile.package_details?.regenerations_used || 0,
            regenerations_remaining: Math.max(
              0,
              2 - (userProfile.package_details?.regenerations_used || 0)
            ),
            has_original_context: !!userProfile.package_details?.original_business_context,
          }
        : null,
  }

  return NextResponse.json({
    success: true,
    regeneration_patterns: patterns,
  })
}

function getTierLimits(tier: string) {
  const limits = {
    free: { total_credits: 3, daily_limit: 1, regenerations: 0 },
    starter_spark: { total_credits: 1, daily_limit: null, regenerations: 2 },
    growth_engine: { total_credits: 10, daily_limit: null, regenerations: 0 },
    agency_arsenal: { total_credits: 30, daily_limit: null, regenerations: 0 },
  }

  return limits[tier as keyof typeof limits] || limits.free
}

function calculateRegenerationFrequency(regenerationHistory: any[]) {
  if (regenerationHistory.length < 2) return null

  const dates = regenerationHistory
    .map(r => new Date(r.date))
    .sort((a, b) => a.getTime() - b.getTime())
  const intervals = []

  for (let i = 1; i < dates.length; i++) {
    const interval = dates[i].getTime() - dates[i - 1].getTime()
    intervals.push(interval)
  }

  const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
  const averageDays = averageInterval / (24 * 60 * 60 * 1000)

  return {
    average_days_between: Math.round(averageDays * 100) / 100,
    total_intervals: intervals.length,
    shortest_interval_days: Math.min(...intervals) / (24 * 60 * 60 * 1000),
    longest_interval_days: Math.max(...intervals) / (24 * 60 * 60 * 1000),
  }
}
