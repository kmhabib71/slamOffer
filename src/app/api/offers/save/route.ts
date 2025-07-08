import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { saveGrandSlamOffer } from '@/lib/offers'
import { authService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { offerData, userTier } = await request.json()

    if (!offerData) {
      return NextResponse.json({ error: 'Offer data is required' }, { status: 400 })
    }

    const result = await saveGrandSlamOffer((session.user as any).id, offerData, userTier || 'free')

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Error saving offer:', error)
    return NextResponse.json({ error: 'Failed to save offer' }, { status: 500 })
  }
}
