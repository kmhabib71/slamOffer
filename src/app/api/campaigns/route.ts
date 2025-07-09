import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { leadDatabase } from '@/lib/lead-db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const campaigns = await leadDatabase.getCampaignsByUser(userId)

    return NextResponse.json({
      success: true,
      campaigns,
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch campaigns',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, description, target_audience, settings, budget, schedule } = body

    if (!name || !type) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, type',
        },
        { status: 400 }
      )
    }

    const campaign = await leadDatabase.createCampaign({
      user_id: userId,
      name,
      type,
      status: 'draft',
      description,
      target_audience,
      settings: settings || {},
      metrics: {
        total_contacts: 0,
        emails_sent: 0,
        emails_opened: 0,
        emails_clicked: 0,
        replies_received: 0,
        leads_generated: 0,
        conversions: 0,
      },
      budget,
      schedule,
    })

    return NextResponse.json({
      success: true,
      campaign,
    })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create campaign',
      },
      { status: 500 }
    )
  }
}
