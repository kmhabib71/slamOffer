import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { unifiedLeadSystem } from '../../../../lib/unified-lead-system'
import { z } from 'zod'

const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  type: z.enum(['referral', 'employee', 'affiliate', 'multi-channel']),
  active_sources: z.array(
    z.object({
      type: z.enum(['referral', 'employee', 'affiliate']),
      enabled: z.boolean(),
      target_count: z.number().min(1),
      budget: z.number().min(0),
      commission_rate: z.number().min(0).max(1),
    })
  ),
  automation_rules: z.object({
    auto_assign_leads: z.boolean().default(true),
    lead_scoring_enabled: z.boolean().default(true),
    auto_follow_up: z.boolean().default(true),
    commission_auto_approval: z.boolean().default(false),
  }),
  target_metrics: z
    .object({
      total_leads: z.number().min(1),
      conversion_rate: z.number().min(0).max(1),
      revenue_target: z.number().min(0),
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
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Get campaigns from database (would implement database storage)
    const campaigns = await getCampaignsByUser(session.user.id, { status, type })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
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
    const validatedData = createCampaignSchema.parse(body)

    // Create unified campaign
    const campaign = await unifiedLeadSystem.createUnifiedCampaign(session.user.id, {
      name: validatedData.name,
      type: validatedData.type,
      active_sources: validatedData.active_sources,
      campaign_metrics: {
        total_budget: validatedData.active_sources.reduce((sum, source) => sum + source.budget, 0),
        spent_budget: 0,
        leads_generated: 0,
        conversions: 0,
        revenue_generated: 0,
        roi: 0,
      },
      automation_rules: validatedData.automation_rules,
      status: 'active',
    })

    // Initialize campaign tracking
    await initializeCampaignTracking(session.user.id, campaign.id)

    return NextResponse.json({ campaign })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating campaign:', error)
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
    const campaignId = searchParams.get('id')
    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { action, ...updates } = body

    if (action === 'update_status') {
      const success = await updateCampaignStatus(campaignId, updates.status)
      return NextResponse.json({ success })
    }

    if (action === 'update_budget') {
      const success = await updateCampaignBudget(campaignId, updates.sourceType, updates.newBudget)
      return NextResponse.json({ success })
    }

    if (action === 'add_source') {
      const success = await addSourceToCampaign(campaignId, updates.source)
      return NextResponse.json({ success })
    }

    if (action === 'remove_source') {
      const success = await removeSourceFromCampaign(campaignId, updates.sourceType)
      return NextResponse.json({ success })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating campaign:', error)
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
    const campaignId = searchParams.get('id')
    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Soft delete - mark as completed
    const success = await updateCampaignStatus(campaignId, 'completed')

    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions (would be implemented with actual database)
async function getCampaignsByUser(userId: string, filters: any): Promise<any[]> {
  // Mock campaigns data - would fetch from database
  return [
    {
      id: 'campaign_1',
      name: 'Q4 Lead Generation Blitz',
      type: 'multi-channel',
      active_sources: [
        { type: 'referral', enabled: true, target_count: 50, budget: 5000, commission_rate: 0.1 },
        { type: 'employee', enabled: true, target_count: 30, budget: 3000, commission_rate: 0.08 },
        {
          type: 'affiliate',
          enabled: true,
          target_count: 100,
          budget: 10000,
          commission_rate: 0.12,
        },
      ],
      campaign_metrics: {
        total_budget: 18000,
        spent_budget: 8500,
        leads_generated: 89,
        conversions: 23,
        revenue_generated: 45000,
        roi: 250,
      },
      automation_rules: {
        auto_assign_leads: true,
        lead_scoring_enabled: true,
        auto_follow_up: true,
        commission_auto_approval: false,
      },
      status: 'active',
      created_at: new Date('2024-01-01').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'campaign_2',
      name: 'Referral Holiday Special',
      type: 'referral',
      active_sources: [
        { type: 'referral', enabled: true, target_count: 100, budget: 8000, commission_rate: 0.15 },
      ],
      campaign_metrics: {
        total_budget: 8000,
        spent_budget: 3200,
        leads_generated: 45,
        conversions: 12,
        revenue_generated: 18000,
        roi: 125,
      },
      automation_rules: {
        auto_assign_leads: true,
        lead_scoring_enabled: true,
        auto_follow_up: true,
        commission_auto_approval: true,
      },
      status: 'active',
      created_at: new Date('2024-01-15').toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
}

async function initializeCampaignTracking(userId: string, campaignId: string): Promise<void> {
  // Initialize tracking for campaign performance
  console.log(`Initializing tracking for campaign ${campaignId} for user ${userId}`)

  // Set up automated tracking rules
  // Create performance monitoring alerts
  // Initialize lead scoring for campaign
}

async function updateCampaignStatus(campaignId: string, status: string): Promise<boolean> {
  // Update campaign status in database
  console.log(`Updating campaign ${campaignId} status to ${status}`)
  return true
}

async function updateCampaignBudget(
  campaignId: string,
  sourceType: string,
  newBudget: number
): Promise<boolean> {
  // Update campaign budget for specific source
  console.log(`Updating campaign ${campaignId} ${sourceType} budget to ${newBudget}`)
  return true
}

async function addSourceToCampaign(campaignId: string, source: any): Promise<boolean> {
  // Add new source to campaign
  console.log(`Adding source ${source.type} to campaign ${campaignId}`)
  return true
}

async function removeSourceFromCampaign(campaignId: string, sourceType: string): Promise<boolean> {
  // Remove source from campaign
  console.log(`Removing source ${sourceType} from campaign ${campaignId}`)
  return true
}
