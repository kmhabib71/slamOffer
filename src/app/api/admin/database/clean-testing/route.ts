/**
 * 🚨 TESTING ONLY - REMOVE BEFORE PRODUCTION
 * 
 * Database cleanup functionality for testing purposes
 * This provides dangerous data deletion capabilities and MUST be removed before production
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import clientPromise from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

// TESTING ONLY - Database cleanup endpoints
export async function POST(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    // For testing, allow if user is logged in
    // In production, this should require admin authentication
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, collection } = body

    console.log('🚨 TESTING ONLY: Database cleanup requested', {
      action,
      collection,
      user: session.user.email
    })

    const client = await clientPromise
    const db = client.db()

    let result: any
    let message: string

    switch (action) {
      case 'clean-all':
        // Clean all three collections
        const cleanAllResults = await Promise.all([
          db.collection('user_profiles').deleteMany({}),
          db.collection('purchased_offers').deleteMany({}),
          db.collection('grand_slam_offers').deleteMany({})
        ])
        
        result = {
          user_profiles: cleanAllResults[0].deletedCount,
          purchased_offers: cleanAllResults[1].deletedCount,
          grand_slam_offers: cleanAllResults[2].deletedCount
        }
        message = `Cleaned all collections: ${result.user_profiles + result.purchased_offers + result.grand_slam_offers} total documents deleted`
        break

      case 'clean-user-profiles':
        result = await db.collection('user_profiles').deleteMany({})
        message = `Deleted ${result.deletedCount} user profiles`
        break

      case 'clean-purchased-offers':
        result = await db.collection('purchased_offers').deleteMany({})
        message = `Deleted ${result.deletedCount} purchased offers`
        break

      case 'clean-grand-slam-offers':
        result = await db.collection('grand_slam_offers').deleteMany({})
        message = `Deleted ${result.deletedCount} grand slam offers`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: clean-all, clean-user-profiles, clean-purchased-offers, or clean-grand-slam-offers' },
          { status: 400 }
        )
    }

    console.log('🧹 Database cleanup completed:', message)

    return NextResponse.json({
      success: true,
      message,
      result,
      warning: '🚨 TESTING ONLY - This functionality must be removed before production!'
    })

  } catch (error) {
    console.error('Database cleanup error:', error)
    return NextResponse.json(
      { 
        error: 'Database cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// TESTING ONLY - Get collection counts
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const counts = await Promise.all([
      db.collection('user_profiles').countDocuments(),
      db.collection('purchased_offers').countDocuments(),
      db.collection('grand_slam_offers').countDocuments()
    ])

    return NextResponse.json({
      success: true,
      collections: {
        user_profiles: counts[0],
        purchased_offers: counts[1],
        grand_slam_offers: counts[2],
        total: counts[0] + counts[1] + counts[2]
      },
      warning: '🚨 TESTING ONLY - This functionality must be removed before production!'
    })

  } catch (error) {
    console.error('Error getting collection counts:', error)
    return NextResponse.json(
      { error: 'Failed to get collection counts' },
      { status: 500 }
    )
  }
}