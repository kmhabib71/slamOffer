import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { dbHelpers } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.email
    const { id } = await params
    const offerId = id

    if (!offerId) {
      return NextResponse.json({ error: 'Offer ID is required' }, { status: 400 })
    }

    // Check if user has purchased this offer
    const isPurchased = await dbHelpers.isPurchasedByUser(userId, offerId)

    if (!isPurchased) {
      return NextResponse.json({ error: 'Offer not purchased' }, { status: 404 })
    }

    // Get the purchased offer data
    const client = await clientPromise
    const db = client.db()

    const purchasedOffer = await db.collection('purchased_offers').findOne({
      userId,
      offerId,
      status: 'active',
    })

    if (!purchasedOffer) {
      return NextResponse.json({ error: 'Purchased offer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: purchasedOffer.offerData,
      isPurchased: true,
    })
  } catch (error) {
    console.error('Error fetching purchased offer:', error)
    return NextResponse.json({ error: 'Failed to fetch purchased offer' }, { status: 500 })
  }
}
