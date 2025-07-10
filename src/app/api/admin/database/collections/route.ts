import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user is admin - AI-FRIENDLY: Uses unified user_profiles collection
    const client = await clientPromise
    const db = client.db()

    const user = await db.collection('user_profiles').findOne({ email: session.user.email })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all collections
    const collections = await db.listCollections().toArray()

    // Get document counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async collection => {
        const count = await db.collection(collection.name).countDocuments()
        return {
          name: collection.name,
          count: count,
          type: collection.type || 'collection',
        }
      })
    )

    return NextResponse.json({
      success: true,
      collections: collectionsWithCounts,
    })
  } catch (error) {
    console.error('Error listing collections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
