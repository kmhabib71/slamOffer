import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserOffers } from '@/lib/offers'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getUserOffers((session.user as any).id)

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 })
  }
}
