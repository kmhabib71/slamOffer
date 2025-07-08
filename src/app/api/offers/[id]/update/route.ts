import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { offer_data } = await request.json()

    if (!offer_data) {
      return NextResponse.json({ error: 'Offer data is required' }, { status: 400 })
    }

    const { id } = await params
    const client = await clientPromise
    const db = client.db()

    // First, find the user by email to get their ID
    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if the offer exists and belongs to the user
    const existingOffer = await db.collection('grand_slam_offers').findOne({
      _id: new ObjectId(id),
      user_id: user._id.toString(),
    })

    if (!existingOffer) {
      return NextResponse.json({ error: 'Offer not found or access denied' }, { status: 404 })
    }

    // Update the offer with the new data
    const result = await db.collection('grand_slam_offers').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          offer_data: offer_data,
          updated_at: new Date().toISOString(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 })
    }

    // Also update any purchased offers with the same data
    await db.collection('purchased_offers').updateMany(
      {
        userId: session.user.email,
        offerId: id,
        status: 'active',
      },
      {
        $set: {
          offerData: offer_data,
        },
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Offer updated successfully',
    })
  } catch (error) {
    console.error('Error updating offer:', error)
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 })
  }
}
