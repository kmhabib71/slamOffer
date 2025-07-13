import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { authService } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.email
    const body = await request.json()
    const { businessContext } = body

    if (!businessContext) {
      return NextResponse.json({ error: 'Business context is required' }, { status: 400 })
    }

    // Store the business context for regenerations
    await authService.storeOriginalBusinessContext(userId, businessContext)

    return NextResponse.json({
      success: true,
      message: 'Business context stored successfully',
    })
  } catch (error) {
    console.error('Error storing business context:', error)
    return NextResponse.json(
      {
        error: 'Failed to store business context',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}