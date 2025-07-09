import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { unifiedLeadSystem } from '../../../../lib/unified-lead-system'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const timeRange = searchParams.get('timeRange') || '30' // days
    const includeCommissions = searchParams.get('includeCommissions') === 'true'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000)

    const dateRange = { start: startDate, end: endDate }

    // Get unified metrics
    const metrics = await unifiedLeadSystem.getUnifiedMetrics(session.user.id, dateRange)

    // Get commission data if requested
    let commissionData = null
    if (includeCommissions) {
      commissionData = await unifiedLeadSystem.processAllCommissions(session.user.id)
    }

    // Calculate summary statistics
    const totalLeads = metrics.total_leads
    const totalRevenue = Object.values(metrics.revenue_by_source).reduce((sum, rev) => sum + rev, 0)
    const totalCost = Object.values(metrics.cost_per_lead).reduce((sum, cost) => sum + cost, 0)
    const overallROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0

    // Calculate source performance
    const sourcePerformance = Object.keys(metrics.leads_by_source)
      .map(sourceKey => {
        const sourceType = sourceKey.split('_')[0]
        const leads = metrics.leads_by_source[sourceKey]
        const conversions = Math.floor(leads * (metrics.conversion_rates[sourceKey] / 100))
        const revenue = metrics.revenue_by_source[sourceKey] || 0
        const cost = metrics.cost_per_lead[sourceKey] * leads
        const roi = metrics.roi_by_source[sourceKey] || 0

        return {
          source: sourceKey,
          type: sourceType,
          leads,
          conversions,
          conversionRate: metrics.conversion_rates[sourceKey],
          revenue,
          cost,
          roi,
          costPerLead: metrics.cost_per_lead[sourceKey],
        }
      })
      .sort((a, b) => b.roi - a.roi)

    // Calculate growth trends
    const growthTrends = metrics.monthly_trends.map((trend, index) => {
      const prevMonth = index > 0 ? metrics.monthly_trends[index - 1] : null
      const leadGrowth = prevMonth ? ((trend.leads - prevMonth.leads) / prevMonth.leads) * 100 : 0
      const revenueGrowth = prevMonth
        ? ((trend.revenue - prevMonth.revenue) / prevMonth.revenue) * 100
        : 0

      return {
        ...trend,
        leadGrowth,
        revenueGrowth,
      }
    })

    // Performance alerts
    const alerts = []

    // Check for declining sources
    const decliningSource = sourcePerformance.find(source => source.roi < 0)
    if (decliningSource) {
      alerts.push({
        type: 'declining_roi',
        message: `${decliningSource.source} has negative ROI (${decliningSource.roi.toFixed(1)}%)`,
        severity: 'high',
        source: decliningSource.source,
      })
    }

    // Check for low conversion rates
    const lowConversionSource = sourcePerformance.find(source => source.conversionRate < 5)
    if (lowConversionSource) {
      alerts.push({
        type: 'low_conversion',
        message: `${lowConversionSource.source} has low conversion rate (${lowConversionSource.conversionRate.toFixed(1)}%)`,
        severity: 'medium',
        source: lowConversionSource.source,
      })
    }

    // Check for high cost per lead
    const highCostSource = sourcePerformance.find(source => source.costPerLead > 50)
    if (highCostSource) {
      alerts.push({
        type: 'high_cost',
        message: `${highCostSource.source} has high cost per lead ($${highCostSource.costPerLead.toFixed(2)})`,
        severity: 'medium',
        source: highCostSource.source,
      })
    }

    // Best performing sources
    const bestPerformers = sourcePerformance
      .filter(source => source.roi > 0)
      .slice(0, 3)
      .map(source => ({
        source: source.source,
        type: source.type,
        roi: source.roi,
        leads: source.leads,
        revenue: source.revenue,
      }))

    const response = {
      summary: {
        totalLeads,
        totalRevenue,
        totalCost,
        overallROI,
        timeRange: `${timeRange} days`,
        averageConversionRate:
          Object.values(metrics.conversion_rates).reduce((sum, rate) => sum + rate, 0) /
            Object.keys(metrics.conversion_rates).length || 0,
        averageCostPerLead: totalCost / totalLeads || 0,
      },
      sourcePerformance,
      growthTrends,
      alerts,
      bestPerformers,
      commissionData,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching unified metrics:', error)
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
    const { action, dateRange } = body

    if (action === 'export_report') {
      const startDate = dateRange?.start
        ? new Date(dateRange.start)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const endDate = dateRange?.end ? new Date(dateRange.end) : new Date()

      const report = await unifiedLeadSystem.exportUnifiedReport(session.user.id, {
        start: startDate,
        end: endDate,
      })

      return NextResponse.json({ report })
    }

    if (action === 'process_commissions') {
      const commissions = await unifiedLeadSystem.processAllCommissions(session.user.id)
      return NextResponse.json({ commissions })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing unified metrics action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
