import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { dbHelpers } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const isPurchased = await dbHelpers.isPurchasedByUser(userId, offerId)

    return NextResponse.json({
      success: true,
      isPurchased,
      offerId,
    })
  } catch (error) {
    console.error('Error checking purchase status:', error)
    return NextResponse.json({ error: 'Failed to check purchase status' }, { status: 500 })
  }
}
