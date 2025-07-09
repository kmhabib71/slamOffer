import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { leadDatabase } from '@/lib/lead-db'
import { cacheManager } from '@/lib/performance/cache-manager'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    // Try to get from cache first
    const cachedStats = await cacheManager.getStats(userId)
    if (cachedStats) {
      return NextResponse.json(cachedStats)
    }

    // Get from database
    const stats = await leadDatabase.getLeadStats(userId)

    // Cache the results for 5 minutes
    await cacheManager.setStats(userId, stats, 300)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching lead stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
