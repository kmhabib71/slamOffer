import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import clientPromise from '@/lib/mongodb'

export async function DELETE() {
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

    // Delete all collections except the admin user
    const deletedCollections = []
    const adminEmail = session.user.email

    for (const collection of collections) {
      const collectionName = collection.name

      // Skip system collections
      if (collectionName.startsWith('system.')) {
        continue
      }

      try {
        await db.collection(collectionName).drop()
        deletedCollections.push(collectionName)
      } catch (error) {
        console.warn(`Failed to delete collection ${collectionName}:`, error)
      }
    }

    // Recreate the user_profiles collection with just the admin user
    const adminUser = {
      email: adminEmail,
      name: 'Admin',
      role: 'admin',
      subscription_tier: 'premium',
      credits_remaining: 999,
      total_offers_generated: 0,
      daily_generation_count: 0,
      purchased_offers_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('user_profiles').insertOne(adminUser)

    return NextResponse.json({
      success: true,
      message: 'All data cleaned successfully. Database reset to fresh state.',
      deletedCollections: deletedCollections,
      recreated: ['user_profiles (with admin user)'],
    })
  } catch (error) {
    console.error('Error cleaning all data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
