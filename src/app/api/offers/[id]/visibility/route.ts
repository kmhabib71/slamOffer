import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { updateOfferVisibility } from '@/lib/offers'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isPublic } = await request.json()

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json({ error: 'isPublic must be a boolean' }, { status: 400 })
    }

    // For now, we'll use email as user ID since we need to find the user by email
    // In a real implementation, you'd want to get the actual user ID
    const userEmail = session.user.email

    // We need to get the user ID from the database first
    // For simplicity, we'll pass the email and handle it in the function
    const { id } = await params
    const result = await updateOfferVisibility(id, userEmail, isPublic)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Error updating offer visibility:', error)
    return NextResponse.json({ error: 'Failed to update offer visibility' }, { status: 500 })
  }
}
