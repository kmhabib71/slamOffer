import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { referralDatabase } from '@/lib/referral-db'
import { ReferralSource } from '@/lib/models/referral'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const source = searchParams.get('source') as ReferralSource
    const campaignId = searchParams.get('campaign_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')

    const filters: any = {}
    if (status) filters.status = status
    if (source) filters.source = source
    if (campaignId) filters.campaign_id = campaignId
    if (limit) filters.limit = limit
    if (skip) filters.skip = skip

    const referrals = await referralDatabase.getReferralsByUser((session.user as any).id, filters)

    return NextResponse.json({
      success: true,
      data: referrals,
      count: referrals.length,
    })
  } catch (error) {
    console.error('Error fetching referrals:', error)
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
      referrer_id,
      referrer_email,
      referrer_name,
      prospect_email,
      prospect_name,
      prospect_phone,
      prospect_company,
      referral_source,
      referral_message,
      campaign_id,
      reward_amount,
      expires_in_days,
    } = body

    // Validate required fields
    if (!referrer_id || !referrer_email || !referrer_name || !prospect_email || !prospect_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if referral already exists for this prospect
    const existingReferral = await referralDatabase.getReferralsByUser((session.user as any).id, {
      limit: 1000, // Get all to check for duplicates
    })

    const duplicate = existingReferral.find(
      r => r.prospect_email === prospect_email && r.status !== 'expired' && r.status !== 'declined'
    )

    if (duplicate) {
      return NextResponse.json(
        { error: 'Referral already exists for this prospect' },
        { status: 409 }
      )
    }

    // Generate unique referral code
    const referralCode = await referralDatabase.generateReferralCode()

    // Calculate expiration date
    const expiresAt = expires_in_days
      ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000)
      : undefined

    // Create the referral
    const newReferral = await referralDatabase.createReferral({
      referrer_id,
      referrer_email,
      referrer_name,
      prospect_email,
      prospect_name,
      prospect_phone,
      prospect_company,
      referral_code: referralCode,
      referral_source: referral_source || 'direct',
      referral_message,
      status: 'pending',
      user_id: (session.user as any).id,
      campaign_id,
      reward_amount,
      expires_at: expiresAt,
    })

    // Log the activity
    await referralDatabase.logReferralActivity({
      referral_id: newReferral._id.toString(),
      user_id: (session.user as any).id,
      activity_type: 'referral_created',
      description: `Referral created for ${prospect_name} (${prospect_email}) by ${referrer_name}`,
    })

    return NextResponse.json({
      success: true,
      data: newReferral,
      referral_code: referralCode,
    })
  } catch (error) {
    console.error('Error creating referral:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
