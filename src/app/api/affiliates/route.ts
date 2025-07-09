import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { affiliateDatabase } from '../../../lib/affiliate-db'
import { z } from 'zod'

// Validation schemas
const createAffiliateSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  profile: z
    .object({
      company_name: z.string().optional(),
      website: z.string().url().optional(),
      bio: z.string().optional(),
      specialties: z.array(z.string()).default([]),
      target_audience: z.string().optional(),
      social_media: z
        .object({
          twitter: z.string().optional(),
          linkedin: z.string().optional(),
          facebook: z.string().optional(),
          instagram: z.string().optional(),
          tiktok: z.string().optional(),
          youtube: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  sponsor_id: z.string().optional(),
  payment_info: z
    .object({
      preferred_payment_method: z
        .enum(['paypal', 'bank_transfer', 'stripe', 'crypto', 'check'])
        .default('paypal'),
      payment_threshold: z.number().min(10).default(100),
      payment_schedule: z.enum(['weekly', 'bi-weekly', 'monthly', 'quarterly']).default('monthly'),
      payment_details: z
        .object({
          paypal_email: z.string().email().optional(),
          bank_account: z.string().optional(),
          crypto_wallet: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
})

const updateAffiliateSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  profile: z
    .object({
      company_name: z.string().optional(),
      website: z.string().url().optional(),
      bio: z.string().optional(),
      specialties: z.array(z.string()).optional(),
      target_audience: z.string().optional(),
      social_media: z
        .object({
          twitter: z.string().optional(),
          linkedin: z.string().optional(),
          facebook: z.string().optional(),
          instagram: z.string().optional(),
          tiktok: z.string().optional(),
          youtube: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  program_details: z
    .object({
      status: z.enum(['active', 'pending', 'suspended', 'terminated', 'inactive']).optional(),
      tier: z.enum(['bronze', 'silver', 'gold', 'platinum', 'diamond']).optional(),
    })
    .optional(),
  payment_info: z
    .object({
      preferred_payment_method: z
        .enum(['paypal', 'bank_transfer', 'stripe', 'crypto', 'check'])
        .optional(),
      payment_threshold: z.number().min(10).optional(),
      payment_schedule: z.enum(['weekly', 'bi-weekly', 'monthly', 'quarterly']).optional(),
    })
    .optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as any
    const tier = searchParams.get('tier') as any
    const sponsorId = searchParams.get('sponsor_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')

    const affiliates = await affiliateDatabase.getAffiliatesByUser(session.user.id, {
      status,
      tier,
      sponsor_id: sponsorId,
      limit,
      skip,
    })

    return NextResponse.json({ affiliates })
  } catch (error) {
    console.error('Error fetching affiliates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAffiliateSchema.parse(body)

    // Generate unique affiliate ID and referral code
    const affiliateId = `AFF_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const referralCode = await affiliateDatabase.generateAffiliateCode()

    // Determine recruitment level if there's a sponsor
    let recruitmentLevel = 1
    if (validatedData.sponsor_id) {
      const sponsor = await affiliateDatabase.getAffiliateById(validatedData.sponsor_id)
      if (sponsor) {
        recruitmentLevel = sponsor.hierarchy.recruitment_level + 1
      }
    }

    // Create affiliate
    const affiliate = await affiliateDatabase.createAffiliate({
      user_id: session.user.id,
      affiliate_id: affiliateId,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      email: validatedData.email,
      phone: validatedData.phone,
      profile: {
        company_name: validatedData.profile?.company_name || '',
        website: validatedData.profile?.website || '',
        bio: validatedData.profile?.bio || '',
        specialties: validatedData.profile?.specialties || [],
        target_audience: validatedData.profile?.target_audience || '',
        social_media: validatedData.profile?.social_media || {},
      },
      program_details: {
        status: 'pending',
        tier: 'bronze',
        join_date: new Date(),
        referral_code: referralCode,
      },
      hierarchy: {
        sponsor_id: validatedData.sponsor_id,
        recruitment_level: recruitmentLevel,
        recruited_affiliates: [],
        total_downline_count: 0,
      },
      commission_structure: {
        base_commission_rate: 0.05, // 5% base commission
        tier_bonus_rate: 0.01, // 1% tier bonus for bronze
        recruitment_bonus: 50, // $50 for recruiting new affiliate
        volume_bonuses: [
          { threshold: 10000, bonus_rate: 0.02 },
          { threshold: 50000, bonus_rate: 0.03 },
          { threshold: 100000, bonus_rate: 0.05 },
        ],
        override_commissions: [
          { level: 1, commission_rate: 0.02 },
          { level: 2, commission_rate: 0.01 },
          { level: 3, commission_rate: 0.005 },
        ],
      },
      performance_metrics: {
        total_referrals: 0,
        total_conversions: 0,
        total_sales_volume: 0,
        conversion_rate: 0,
        avg_order_value: 0,
        lifetime_commissions_earned: 0,
        current_month_commissions: 0,
        last_month_commissions: 0,
        best_month_commissions: 0,
        current_streak_days: 0,
        best_streak_days: 0,
      },
      marketing_resources: {
        approved_email_templates: [],
        approved_social_posts: [],
        banner_ads_used: [],
        video_testimonials: [],
        case_studies_created: [],
        custom_content_approved: false,
      },
      payment_info: {
        preferred_payment_method: validatedData.payment_info?.preferred_payment_method || 'paypal',
        payment_threshold: validatedData.payment_info?.payment_threshold || 100,
        payment_schedule: validatedData.payment_info?.payment_schedule || 'monthly',
        payment_details: validatedData.payment_info?.payment_details || {},
        tax_information: {
          tax_form_submitted: false,
          tax_exempt: false,
          country: 'US',
        },
      },
      compliance: {
        agreement_signed: false,
        agreement_version: '1.0',
        compliance_training_completed: false,
        policy_violations: 0,
        gdpr_consent: false,
        marketing_consent: false,
      },
      activity_tracking: {
        total_logins: 0,
        emails_sent: 0,
        social_posts_made: 0,
        content_pieces_created: 0,
        webinars_attended: 0,
        training_modules_completed: [],
      },
    })

    // Create recruitment record if there's a sponsor
    if (validatedData.sponsor_id) {
      await affiliateDatabase.createRecruitment({
        user_id: session.user.id,
        recruiter_id: validatedData.sponsor_id,
        recruit_id: affiliateId,
        recruitment_id: `REC_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        recruitment_details: {
          recruitment_method: 'direct',
          recruitment_source: 'admin_dashboard',
        },
        recruitment_status: 'registered',
        recruitment_bonus: {
          bonus_amount: 50,
          bonus_paid: false,
          bonus_conditions_met: false,
          bonus_conditions: ['First sale by recruit', 'Recruit stays active for 30 days'],
        },
        recruit_performance: {
          total_sales_generated: 0,
          commissions_earned: 0,
          is_active_performer: false,
        },
      })
    }

    return NextResponse.json({ affiliate })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating affiliate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const affiliateId = searchParams.get('id')
    if (!affiliateId) {
      return NextResponse.json({ error: 'Affiliate ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateAffiliateSchema.parse(body)

    const success = await affiliateDatabase.updateAffiliate(affiliateId, validatedData)
    if (!success) {
      return NextResponse.json({ error: 'Failed to update affiliate' }, { status: 500 })
    }

    const updatedAffiliate = await affiliateDatabase.getAffiliateById(affiliateId)
    return NextResponse.json({ affiliate: updatedAffiliate })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating affiliate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const affiliateId = searchParams.get('id')
    if (!affiliateId) {
      return NextResponse.json({ error: 'Affiliate ID is required' }, { status: 400 })
    }

    // Instead of deleting, we'll terminate the affiliate
    const success = await affiliateDatabase.updateAffiliate(affiliateId, {
      program_details: {
        status: 'terminated',
        termination_date: new Date(),
      },
    })

    if (!success) {
      return NextResponse.json({ error: 'Failed to terminate affiliate' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Affiliate terminated successfully' })
  } catch (error) {
    console.error('Error terminating affiliate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
