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

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'

    // Calculate date range
    const now = new Date()
    const daysBack =
      timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Get all leads for the user
    const leads = await leadDatabase.getLeadsByUser(userId, { limit: 10000 })
    const campaigns = await leadDatabase.getCampaignsByUser(userId)

    // Filter leads by date range
    const filteredLeads = leads.filter(lead => new Date(lead.created_at) >= startDate)

    // Calculate analytics
    const analytics = {
      leadsByMonth: calculateLeadsByMonth(filteredLeads),
      conversionFunnel: calculateConversionFunnel(filteredLeads),
      sourcePerformance: calculateSourcePerformance(filteredLeads),
      campaignMetrics: calculateCampaignMetrics(campaigns),
      leadScoreDistribution: calculateLeadScoreDistribution(filteredLeads),
    }

    return NextResponse.json({
      success: true,
      analytics,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      },
      { status: 500 }
    )
  }
}

function calculateLeadsByMonth(leads: any[]) {
  const monthCounts: { [key: string]: number } = {}

  leads.forEach(lead => {
    const month = new Date(lead.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
    monthCounts[month] = (monthCounts[month] || 0) + 1
  })

  return Object.entries(monthCounts).map(([month, count]) => ({ month, count }))
}

function calculateConversionFunnel(leads: any[]) {
  const totalLeads = leads.length
  const statusCounts = {
    total: totalLeads,
    hot: leads.filter(l => l.status === 'hot').length,
    warm: leads.filter(l => l.status === 'warm').length,
    cold: leads.filter(l => l.status === 'cold').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
  }

  return Object.entries(statusCounts).map(([stage, count]) => ({
    stage,
    count,
    percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
  }))
}

function calculateSourcePerformance(leads: any[]) {
  const sources = ['warm', 'cold', 'content', 'paid', 'referral']

  return sources.map(source => {
    const sourceLeads = leads.filter(l => l.source === source)
    const converted = sourceLeads.filter(l => l.status === 'converted').length

    return {
      source,
      leads: sourceLeads.length,
      conversion_rate: sourceLeads.length > 0 ? (converted / sourceLeads.length) * 100 : 0,
      cost_per_lead: Math.random() * 50 + 10, // Mock data - would come from actual campaign costs
    }
  })
}

function calculateCampaignMetrics(campaigns: any[]) {
  return campaigns.map(campaign => ({
    campaign: campaign.name,
    emails_sent: campaign.metrics?.emails_sent || 0,
    open_rate:
      campaign.metrics?.emails_opened && campaign.metrics?.emails_sent
        ? (campaign.metrics.emails_opened / campaign.metrics.emails_sent) * 100
        : 0,
    click_rate:
      campaign.metrics?.emails_clicked && campaign.metrics?.emails_sent
        ? (campaign.metrics.emails_clicked / campaign.metrics.emails_sent) * 100
        : 0,
    conversions: campaign.metrics?.conversions || 0,
  }))
}

function calculateLeadScoreDistribution(leads: any[]) {
  const scoreRanges = [
    { range: '0-20', min: 0, max: 20 },
    { range: '21-40', min: 21, max: 40 },
    { range: '41-60', min: 41, max: 60 },
    { range: '61-80', min: 61, max: 80 },
    { range: '81-100', min: 81, max: 100 },
  ]

  return scoreRanges.map(({ range, min, max }) => ({
    score_range: range,
    count: leads.filter(l => l.score >= min && l.score <= max).length,
  }))
}
