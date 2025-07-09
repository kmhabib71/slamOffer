import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { unifiedLeadSystem } from '../../../lib/unified-lead-system'
import { referralDatabase } from '../../../lib/referral-db'
import { employeeDatabase } from '../../../lib/employee-db'
import { affiliateDatabase } from '../../../lib/affiliate-db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get comprehensive system overview
    const systemOverview = await getSystemOverview(session.user.id)

    return NextResponse.json(systemOverview)
  } catch (error) {
    console.error('Error fetching system overview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getSystemOverview(userId: string) {
  // Get all system metrics in parallel
  const [
    unifiedMetrics,
    referralStats,
    employeeStats,
    affiliateStats,
    allLeads,
    commissionSummary,
  ] = await Promise.all([
    unifiedLeadSystem.getUnifiedMetrics(userId),
    referralDatabase.getReferralStats(userId),
    employeeDatabase.getEmployeeStats(userId),
    affiliateDatabase.getAffiliateStats(userId),
    unifiedLeadSystem.getAllLeads(userId, { limit: 1000 }),
    unifiedLeadSystem.processAllCommissions(userId),
  ])

  // Calculate system-wide statistics
  const systemStats = {
    totalSources: {
      referrals: referralStats.total_referrals,
      employees: employeeStats.total_employees,
      affiliates: affiliateStats.total_affiliates,
      total:
        referralStats.total_referrals +
        employeeStats.total_employees +
        affiliateStats.total_affiliates,
    },
    totalLeads: unifiedMetrics.total_leads,
    totalRevenue: Object.values(unifiedMetrics.revenue_by_source).reduce(
      (sum, rev) => sum + rev,
      0
    ),
    totalCommissions: commissionSummary.total_commissions,
    overallROI: calculateOverallROI(unifiedMetrics),
    systemHealth: calculateSystemHealth(unifiedMetrics, allLeads),
  }

  // Performance by source type
  const sourcePerformance = {
    referrals: {
      leads: allLeads.filter(l => l.type === 'referral').length,
      conversions: allLeads.filter(
        l => l.type === 'referral' && (l.status === 'converted' || l.status === 'closed_won')
      ).length,
      revenue: referralStats.total_revenue,
      commission: commissionSummary.referral_commissions,
      conversionRate: referralStats.avg_conversion_rate,
      avgOrderValue: referralStats.avg_order_value,
    },
    employees: {
      leads: allLeads.filter(l => l.type === 'employee').length,
      conversions: allLeads.filter(
        l => l.type === 'employee' && (l.status === 'converted' || l.status === 'closed_won')
      ).length,
      revenue: employeeStats.total_revenue,
      commission: commissionSummary.employee_commissions,
      conversionRate: employeeStats.avg_conversion_rate,
      avgOrderValue: employeeStats.avg_order_value,
    },
    affiliates: {
      leads: allLeads.filter(l => l.type === 'affiliate').length,
      conversions: allLeads.filter(
        l => l.type === 'affiliate' && (l.status === 'converted' || l.status === 'closed_won')
      ).length,
      revenue: affiliateStats.total_sales_volume,
      commission: commissionSummary.affiliate_commissions,
      conversionRate: affiliateStats.avg_conversion_rate,
      avgOrderValue: affiliateStats.total_sales_volume / (affiliateStats.total_affiliates || 1),
    },
  }

  // Lead pipeline analysis
  const leadPipeline = {
    new: allLeads.filter(l => l.status === 'new').length,
    contacted: allLeads.filter(l => l.status === 'contacted').length,
    qualified: allLeads.filter(l => l.status === 'qualified').length,
    converted: allLeads.filter(l => l.status === 'converted').length,
    closed_won: allLeads.filter(l => l.status === 'closed_won').length,
    closed_lost: allLeads.filter(l => l.status === 'closed_lost').length,
  }

  // Top performers across all systems
  const topPerformers = {
    referrals: referralStats.top_referrers?.slice(0, 3) || [],
    employees: employeeStats.top_employees?.slice(0, 3) || [],
    affiliates: affiliateStats.top_performers?.slice(0, 3) || [],
  }

  // Recent activity
  const recentActivity = allLeads
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map(lead => ({
      id: lead.id,
      name: lead.name,
      type: lead.type,
      source: lead.source_details.source_name,
      status: lead.status,
      created_at: lead.created_at,
      expected_value: lead.source_details.expected_commission || 0,
    }))

  // System insights and recommendations
  const insights = generateSystemInsights(systemStats, sourcePerformance, leadPipeline)

  // Growth trends
  const growthTrends = {
    monthly: unifiedMetrics.monthly_trends,
    yearOverYear: calculateYearOverYearGrowth(unifiedMetrics.monthly_trends),
    projections: calculateProjections(unifiedMetrics.monthly_trends),
  }

  return {
    systemStats,
    sourcePerformance,
    leadPipeline,
    topPerformers,
    recentActivity,
    insights,
    growthTrends,
    commissionSummary,
    lastUpdated: new Date().toISOString(),
    systemVersion: '1.0.0',
  }
}

function calculateOverallROI(metrics: any): number {
  const totalRevenue = Object.values(metrics.revenue_by_source).reduce(
    (sum: number, rev: any) => sum + rev,
    0
  )
  const totalCost = Object.values(metrics.cost_per_lead).reduce(
    (sum: number, cost: any) => sum + cost,
    0
  )
  return totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0
}

function calculateSystemHealth(metrics: any, leads: any[]): string {
  const avgConversionRate =
    Object.values(metrics.conversion_rates).reduce((sum: number, rate: any) => sum + rate, 0) /
    Object.keys(metrics.conversion_rates).length
  const recentLeads = leads.filter(
    l => new Date(l.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  )
  const leadVelocity = recentLeads.length / 7 // leads per day

  if (avgConversionRate > 20 && leadVelocity > 5) return 'excellent'
  if (avgConversionRate > 15 && leadVelocity > 3) return 'good'
  if (avgConversionRate > 10 && leadVelocity > 1) return 'fair'
  return 'needs_improvement'
}

function generateSystemInsights(
  systemStats: any,
  sourcePerformance: any,
  leadPipeline: any
): any[] {
  const insights = []

  // Performance insights
  const bestPerformingSource = Object.entries(sourcePerformance).sort(
    ([, a], [, b]) => (b as any).conversionRate - (a as any).conversionRate
  )[0]

  insights.push({
    type: 'performance',
    title: 'Best Performing Source',
    message: `${bestPerformingSource[0]} has the highest conversion rate at ${(bestPerformingSource[1] as any).conversionRate.toFixed(1)}%`,
    priority: 'high',
    actionable: true,
  })

  // Pipeline insights
  const pipelineBottleneck = Object.entries(leadPipeline).sort(
    ([, a], [, b]) => (b as number) - (a as number)
  )[0]

  if (pipelineBottleneck[0] === 'new' && (pipelineBottleneck[1] as number) > 20) {
    insights.push({
      type: 'pipeline',
      title: 'Pipeline Bottleneck',
      message: `${pipelineBottleneck[1]} leads are stuck in "${pipelineBottleneck[0]}" status`,
      priority: 'medium',
      actionable: true,
    })
  }

  // Revenue insights
  const totalRevenue = systemStats.totalRevenue
  const totalCommissions = systemStats.totalCommissions
  const commissionRatio = (totalCommissions / totalRevenue) * 100

  if (commissionRatio > 25) {
    insights.push({
      type: 'financial',
      title: 'High Commission Ratio',
      message: `Commission ratio is ${commissionRatio.toFixed(1)}% - consider optimizing commission structure`,
      priority: 'medium',
      actionable: true,
    })
  }

  // Growth insights
  if (systemStats.overallROI > 200) {
    insights.push({
      type: 'growth',
      title: 'High ROI Opportunity',
      message: `Excellent ROI of ${systemStats.overallROI.toFixed(1)}% - consider scaling successful campaigns`,
      priority: 'high',
      actionable: true,
    })
  }

  return insights
}

function calculateYearOverYearGrowth(monthlyTrends: any[]): number {
  if (monthlyTrends.length < 12) return 0

  const currentYear = monthlyTrends.slice(-12)
  const previousYear = monthlyTrends.slice(-24, -12)

  const currentYearRevenue = currentYear.reduce((sum, month) => sum + month.revenue, 0)
  const previousYearRevenue = previousYear.reduce((sum, month) => sum + month.revenue, 0)

  return previousYearRevenue > 0
    ? ((currentYearRevenue - previousYearRevenue) / previousYearRevenue) * 100
    : 0
}

function calculateProjections(monthlyTrends: any[]): any {
  if (monthlyTrends.length < 3) return { leads: 0, revenue: 0, confidence: 'low' }

  const recentTrends = monthlyTrends.slice(-3)
  const avgLeadGrowth =
    recentTrends.reduce((sum, month, index) => {
      if (index === 0) return 0
      return sum + (month.leads - recentTrends[index - 1].leads) / recentTrends[index - 1].leads
    }, 0) / 2

  const avgRevenueGrowth =
    recentTrends.reduce((sum, month, index) => {
      if (index === 0) return 0
      return (
        sum + (month.revenue - recentTrends[index - 1].revenue) / recentTrends[index - 1].revenue
      )
    }, 0) / 2

  const lastMonth = recentTrends[recentTrends.length - 1]

  return {
    leads: Math.round(lastMonth.leads * (1 + avgLeadGrowth)),
    revenue: Math.round(lastMonth.revenue * (1 + avgRevenueGrowth)),
    confidence: avgLeadGrowth > 0 && avgRevenueGrowth > 0 ? 'high' : 'medium',
  }
}
