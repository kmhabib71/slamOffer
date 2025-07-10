import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import clientPromise from '@/lib/mongodb'

export async function DELETE(request: NextRequest) {
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

    const { collectionName } = await request.json()

    if (!collectionName) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 })
    }

    // Prevent deletion of critical system collections
    const protectedCollections = ['user_profiles'] // Keep the unified collection

    if (protectedCollections.includes(collectionName)) {
      return NextResponse.json(
        {
          error: `Cannot delete protected collection: ${collectionName}`,
        },
        { status: 400 }
      )
    }

    // Delete the collection
    await db.collection(collectionName).drop()

    return NextResponse.json({
      success: true,
      message: `Collection '${collectionName}' deleted successfully`,
    })
  } catch (error) {
    console.error('Error deleting collection:', error)

    // Handle case where collection doesn't exist
    if (error instanceof Error && error.message.includes('ns not found')) {
      return NextResponse.json(
        {
          error: 'Collection not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
