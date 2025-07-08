import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { deleteOffer, updateOfferTitle, getOfferById } from '@/lib/offers'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userEmail = session?.user?.email
    const { id } = await params

    const result = await getOfferById(id, userEmail || null)

    if (!result.success) {
      if (result.error === 'Offer not found') {
        return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
      } else if (result.error === 'Access denied') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      } else {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Error fetching offer:', error)
    return NextResponse.json({ error: 'Failed to fetch offer' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const result = await deleteOffer(id, session.user.email)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Error deleting offer:', error)
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title } = await request.json()

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const { id } = await params
    const result = await updateOfferTitle(id, session.user.email, title.trim())

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating offer:', error)
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 })
  }
}
