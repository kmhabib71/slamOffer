import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { authService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false, error: 'Not authenticated' }, { status: 401 })
    }

    const isAdmin = await authService.isUserAdmin(session.user.email)

    return NextResponse.json({
      isAdmin,
      email: session.user.email,
      message: isAdmin ? 'User is admin' : 'User is not admin',
    })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json(
      {
        isAdmin: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
