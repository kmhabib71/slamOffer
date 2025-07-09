import { NextRequest, NextResponse } from 'next/server'
import { leadDatabase } from '@/lib/lead-db'
import { LeadSource, LeadStatus } from '@/lib/models/lead'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workflowType, userId, executionId, data, status } = body

    if (!workflowType || !userId || !executionId) {
      return NextResponse.json(
        {
          error: 'Missing required fields: workflowType, userId, executionId',
        },
        { status: 400 }
      )
    }

    console.log(`n8n webhook received: ${workflowType} for user ${userId}`)

    // Update workflow execution status
    await leadDatabase.updateWorkflowExecution(executionId, {
      status: status || 'completed',
      output_data: data,
      completed_at: new Date(),
    })

    // Process different workflow types
    switch (workflowType) {
      case 'warm-outreach':
        await processWarmOutreachResults(userId, data)
        break

      case 'cold-outreach':
        await processColdOutreachResults(userId, data)
        break

      case 'content-marketing':
        await processContentMarketingResults(userId, data)
        break

      case 'paid-ads':
        await processPaidAdsResults(userId, data)
        break

      case 'lead-scoring':
        await processLeadScoringResults(userId, data)
        break

      case 'referral-program':
        await processReferralResults(userId, data)
        break

      default:
        console.warn(`Unknown workflow type: ${workflowType}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    })
  } catch (error) {
    console.error('n8n webhook error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process webhook',
      },
      { status: 500 }
    )
  }
}

// Process warm outreach results
async function processWarmOutreachResults(userId: string, data: any) {
  const { contacts, results } = data

  for (const contact of contacts || []) {
    try {
      // Create or update lead
      const lead = await leadDatabase.createLead({
        user_id: userId,
        email: contact.email,
        first_name: contact.first_name,
        last_name: contact.last_name,
        company: contact.company,
        source: 'warm' as LeadSource,
        status: 'warm' as LeadStatus,
        score: 75, // Warm leads start with high score
        tags: ['warm-outreach'],
        notes: `Added via warm outreach campaign`,
        last_contacted: new Date(),
      })

      // Log activity
      await leadDatabase.addLeadActivity({
        lead_id: lead._id!,
        user_id: userId,
        activity_type: 'email_sent',
        description: `Warm outreach email sent to ${contact.email}`,
        metadata: { campaign_type: 'warm-outreach' },
      })
    } catch (error) {
      console.error(`Error processing warm outreach contact ${contact.email}:`, error)
    }
  }
}

// Process cold outreach results
async function processColdOutreachResults(userId: string, data: any) {
  const { prospects, results } = data

  for (const prospect of prospects || []) {
    try {
      // Create or update lead
      const lead = await leadDatabase.createLead({
        user_id: userId,
        email: prospect.email,
        first_name: prospect.first_name,
        last_name: prospect.last_name,
        company: prospect.company,
        linkedin_url: prospect.linkedin_url,
        source: 'cold' as LeadSource,
        status: 'cold' as LeadStatus,
        score: 45, // Cold leads start with medium score
        tags: ['cold-outreach'],
        notes: `Added via cold outreach campaign`,
        last_contacted: new Date(),
      })

      // Log activity
      await leadDatabase.addLeadActivity({
        lead_id: lead._id!,
        user_id: userId,
        activity_type: 'email_sent',
        description: `Cold outreach email sent to ${prospect.email}`,
        metadata: { campaign_type: 'cold-outreach' },
      })
    } catch (error) {
      console.error(`Error processing cold outreach prospect ${prospect.email}:`, error)
    }
  }
}

// Process content marketing results
async function processContentMarketingResults(userId: string, data: any) {
  const { content_type, engagement_data } = data

  if (engagement_data?.new_followers) {
    for (const follower of engagement_data.new_followers) {
      try {
        const lead = await leadDatabase.createLead({
          user_id: userId,
          email: follower.email || `${follower.username}@unknown.com`,
          first_name: follower.name?.split(' ')[0],
          last_name: follower.name?.split(' ').slice(1).join(' '),
          linkedin_url: follower.profile_url,
          source: 'content' as LeadSource,
          status: 'warm' as LeadStatus,
          score: 60, // Content leads get good score
          tags: ['content-marketing', content_type],
          notes: `Engaged with ${content_type} content`,
        })

        await leadDatabase.addLeadActivity({
          lead_id: lead._id!,
          user_id: userId,
          activity_type: 'note_added',
          description: `New follower from ${content_type} content`,
          metadata: { content_type },
        })
      } catch (error) {
        console.error(`Error processing content marketing follower:`, error)
      }
    }
  }
}

// Process paid ads results
async function processPaidAdsResults(userId: string, data: any) {
  const { platform, leads } = data

  for (const leadData of leads || []) {
    try {
      const lead = await leadDatabase.createLead({
        user_id: userId,
        email: leadData.email,
        first_name: leadData.first_name,
        last_name: leadData.last_name,
        company: leadData.company,
        phone: leadData.phone,
        source: 'paid' as LeadSource,
        status: 'hot' as LeadStatus,
        score: 85, // Paid leads are high quality
        tags: ['paid-ads', platform],
        notes: `Generated from ${platform} ads`,
        estimated_value: leadData.estimated_value,
      })

      await leadDatabase.addLeadActivity({
        lead_id: lead._id!,
        user_id: userId,
        activity_type: 'note_added',
        description: `New lead from ${platform} ads campaign`,
        metadata: { platform, cost_per_lead: leadData.cost_per_lead },
      })
    } catch (error) {
      console.error(`Error processing paid ads lead:`, error)
    }
  }
}

// Process lead scoring results
async function processLeadScoringResults(userId: string, data: any) {
  const { scored_leads } = data

  for (const scoredLead of scored_leads || []) {
    try {
      // Update lead score
      await leadDatabase.updateLeadScore({
        lead_id: scoredLead.lead_id,
        user_id: userId,
        score_type: 'total',
        score_value: scoredLead.total_score,
        factors: scoredLead.score_factors,
      })

      // Update lead status based on score
      let newStatus: LeadStatus = 'cold'
      if (scoredLead.total_score >= 80) newStatus = 'hot'
      else if (scoredLead.total_score >= 60) newStatus = 'warm'

      await leadDatabase.updateLeadStatus(scoredLead.lead_id, newStatus)

      await leadDatabase.addLeadActivity({
        lead_id: scoredLead.lead_id,
        user_id: userId,
        activity_type: 'status_changed',
        description: `Lead score updated to ${scoredLead.total_score} - status: ${newStatus}`,
        metadata: { score: scoredLead.total_score, factors: scoredLead.score_factors },
      })
    } catch (error) {
      console.error(`Error processing lead scoring:`, error)
    }
  }
}

// Process referral program results
async function processReferralResults(userId: string, data: any) {
  const { referrals } = data

  for (const referral of referrals || []) {
    try {
      const lead = await leadDatabase.createLead({
        user_id: userId,
        email: referral.email,
        first_name: referral.first_name,
        last_name: referral.last_name,
        company: referral.company,
        source: 'referral' as LeadSource,
        status: 'warm' as LeadStatus,
        score: 80, // Referrals are high quality
        tags: ['referral', 'referred-by-' + referral.referrer_id],
        notes: `Referred by ${referral.referrer_name}`,
        estimated_value: referral.estimated_value,
      })

      await leadDatabase.addLeadActivity({
        lead_id: lead._id!,
        user_id: userId,
        activity_type: 'note_added',
        description: `New referral from ${referral.referrer_name}`,
        metadata: { referrer: referral.referrer_name, referrer_id: referral.referrer_id },
      })
    } catch (error) {
      console.error(`Error processing referral:`, error)
    }
  }
}
