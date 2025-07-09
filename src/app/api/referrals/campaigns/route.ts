import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { referralDatabase } from '@/lib/referral-db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaigns = await referralDatabase.getReferralCampaignsByUser((session.user as any).id)

    return NextResponse.json({
      success: true,
      data: campaigns,
    })
  } catch (error) {
    console.error('Error fetching referral campaigns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      reward_type,
      reward_amount,
      reward_description,
      min_purchase_amount,
      max_rewards_per_referrer,
      time_limit_days,
      target_segments,
      exclude_segments,
      min_customer_ltv,
      auto_request_enabled,
      auto_request_triggers,
      referral_request_template,
      referral_landing_page,
      thank_you_template,
      start_date,
      end_date,
    } = body

    // Validate required fields
    if (!name || !reward_type || !reward_amount) {
      return NextResponse.json(
        { error: 'Missing required fields: name, reward_type, reward_amount' },
        { status: 400 }
      )
    }

    // Create the campaign
    const newCampaign = await referralDatabase.createReferralCampaign({
      user_id: (session.user as any).id,
      name,
      description,
      status: 'active',
      reward_type,
      reward_amount,
      reward_description,
      min_purchase_amount,
      max_rewards_per_referrer,
      time_limit_days,
      target_segments,
      exclude_segments,
      min_customer_ltv,
      auto_request_enabled: auto_request_enabled || false,
      auto_request_triggers: auto_request_triggers || {
        after_purchase: false,
        after_days: 7,
        after_satisfaction_score: 8,
      },
      referral_request_template,
      referral_landing_page,
      thank_you_template,
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
    })

    return NextResponse.json({
      success: true,
      data: newCampaign,
    })
  } catch (error) {
    console.error('Error creating referral campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
