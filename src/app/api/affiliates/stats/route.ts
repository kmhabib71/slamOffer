import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { affiliateDatabase } from '../../../../lib/affiliate-db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const timeRange = searchParams.get('timeRange') || '30' // days
    const metric = searchParams.get('metric') || 'all'

    const stats = await affiliateDatabase.getAffiliateStats(session.user.id)

    // Calculate additional metrics based on time range
    const now = new Date()
    const startDate = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000)

    // Get recent performance data
    const recentAffiliates = await affiliateDatabase.getAffiliatesByUser(session.user.id, {
      limit: 1000,
    })

    // Calculate time-based metrics
    const recentCommissions = await Promise.all(
      recentAffiliates.map(async affiliate => {
        const commissions = await affiliateDatabase.getCommissionsByAffiliate(
          affiliate.affiliate_id,
          {
            status: 'approved',
            date_range: { start: startDate, end: now },
          }
        )
        return {
          affiliate_id: affiliate.affiliate_id,
          commissions: commissions.length,
          amount: commissions.reduce((sum, c) => sum + c.transaction_details.commission_amount, 0),
        }
      })
    )

    // Calculate tier distribution
    const tierDistribution = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      diamond: 0,
    }

    recentAffiliates.forEach(affiliate => {
      tierDistribution[affiliate.program_details.tier]++
    })

    // Calculate status distribution
    const statusDistribution = {
      active: 0,
      pending: 0,
      suspended: 0,
      terminated: 0,
      inactive: 0,
    }

    recentAffiliates.forEach(affiliate => {
      statusDistribution[affiliate.program_details.status]++
    })

    // Calculate growth metrics
    const currentMonthAffiliates = recentAffiliates.filter(
      a =>
        new Date(a.created_at).getMonth() === now.getMonth() &&
        new Date(a.created_at).getFullYear() === now.getFullYear()
    )

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthAffiliates = recentAffiliates.filter(
      a =>
        new Date(a.created_at).getMonth() === lastMonthDate.getMonth() &&
        new Date(a.created_at).getFullYear() === lastMonthDate.getFullYear()
    )

    const growthRate =
      lastMonthAffiliates.length > 0
        ? ((currentMonthAffiliates.length - lastMonthAffiliates.length) /
            lastMonthAffiliates.length) *
          100
        : 0

    // Get tier upgrade recommendations
    const tierUpgrades = await affiliateDatabase.calculateTierUpgrades(session.user.id)

    // Calculate commission trends
    const commissionTrends = []
    for (let i = 30; i >= 0; i -= 7) {
      const weekStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 1000)

      const weeklyCommissions = recentCommissions.reduce((sum, affiliate) => {
        const commissions = affiliate.commissions.filter(
          c => new Date(c.created_at) >= weekStart && new Date(c.created_at) <= weekEnd
        )
        return sum + commissions.reduce((sum, c) => sum + c.amount, 0)
      }, 0)

      commissionTrends.push({
        week: `Week ${Math.floor(i / 7) + 1}`,
        amount: weeklyCommissions,
        date: weekStart.toISOString().split('T')[0],
      })
    }

    // Performance metrics
    const topPerformers = recentAffiliates
      .sort(
        (a, b) =>
          b.performance_metrics.lifetime_commissions_earned -
          a.performance_metrics.lifetime_commissions_earned
      )
      .slice(0, 10)
      .map(affiliate => ({
        id: affiliate.affiliate_id,
        name: `${affiliate.first_name} ${affiliate.last_name}`,
        email: affiliate.email,
        tier: affiliate.program_details.tier,
        totalSales: affiliate.performance_metrics.total_sales_volume,
        totalCommissions: affiliate.performance_metrics.lifetime_commissions_eared,
        conversionRate: affiliate.performance_metrics.conversion_rate,
        referralCode: affiliate.program_details.referral_code,
        joinDate: affiliate.created_at,
        lastSale: affiliate.performance_metrics.last_sale_date,
        recruits: affiliate.hierarchy.total_downline_count,
      }))

    // Performance alerts
    const performanceAlerts = []

    // Check for high-performing affiliates who might need tier upgrades
    const highPerformers = recentAffiliates.filter(
      a =>
        a.performance_metrics.lifetime_commissions_earned > 5000 &&
        a.program_details.tier === 'bronze'
    )
    if (highPerformers.length > 0) {
      performanceAlerts.push({
        type: 'tier_upgrade',
        message: `${highPerformers.length} affiliates may be ready for tier upgrades`,
        count: highPerformers.length,
        priority: 'medium',
      })
    }

    // Check for inactive affiliates
    const inactiveAffiliates = recentAffiliates.filter(a => {
      const daysSinceLastSale = a.performance_metrics.last_sale_date
        ? Math.floor(
            (now.getTime() - new Date(a.performance_metrics.last_sale_date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 9999
      return daysSinceLastSale > 30 && a.program_details.status === 'active'
    })
    if (inactiveAffiliates.length > 0) {
      performanceAlerts.push({
        type: 'inactive',
        message: `${inactiveAffiliates.length} affiliates haven't made a sale in 30+ days`,
        count: inactiveAffiliates.length,
        priority: 'low',
      })
    }

    // Check for pending approvals
    const pendingApprovals = recentAffiliates.filter(a => a.program_details.status === 'pending')
    if (pendingApprovals.length > 0) {
      performanceAlerts.push({
        type: 'pending_approval',
        message: `${pendingApprovals.length} affiliates pending approval`,
        count: pendingApprovals.length,
        priority: 'high',
      })
    }

    const response = {
      overview: {
        totalAffiliates: stats.total_affiliates,
        activeAffiliates: stats.active_affiliates,
        totalSalesVolume: stats.total_sales_volume,
        totalCommissionsPaid: stats.total_commissions_paid,
        avgConversionRate: stats.avg_conversion_rate,
        growthRate: growthRate,
        timeRange: `${timeRange} days`,
      },
      distributions: {
        tierDistribution,
        statusDistribution,
      },
      trends: {
        commissionTrends,
        growth: {
          currentMonth: currentMonthAffiliates.length,
          lastMonth: lastMonthAffiliatesfrom.length,
          growthRate: growthRate,
        },
      },
      topPerformers,
      recommendations: {
        tierUpgrades: tierUpgrades.slice(0, 5),
        totalUpgradeCandidates: tierUpgrades.length,
      },
      alerts: performanceAlerts,
      recentActivity: {
        newAffiliates: currentMonthAffiliates.length,
        totalCommissions: recentCommissions.reduce((sum, r) => sum + r.amount, 0),
        avgMonthlyCommission:
          recentCommissions.length > 0
            ? recentCommissions.reduce((sum, r) => sum + r.amount, 0) / recentCommissions.length
            : 0,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching affiliate stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Export commission report
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reportType, dateRange, affiliateIds } = await request.json()

    if (reportType === 'commission_report') {
      // Generate commission report
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)

      const affiliates = await affiliateDatabase.getAffiliatesByUser(session.user.id)
      const filteredAffiliates = affiliateIds
        ? affiliates.filter(a => affiliateIds.includes(a.affiliate_id))
        : affiliates

      const report = []
      for (const affiliate of filteredAffiliates) {
        const commissions = await affiliateDatabase.getCommissionsByAffiliate(
          affiliate.affiliate_id,
          {
            date_range: { start: startDate, end: endDate },
          }
        )

        const totalCommissions = commissions.reduce(
          (sum, c) => sum + c.transaction_details.commission_amount,
          0
        )
        const paidCommissions = commissions
          .filter(c => c.status === 'paid')
          .reduce((sum, c) => sum + c.transaction_details.commission_amount, 0)

        report.push({
          affiliate_id: affiliate.affiliate_id,
          name: `${affiliate.first_name} ${affiliate.last_name}`,
          email: affiliate.email,
          tier: affiliate.program_details.tier,
          referral_code: affiliate.program_details.referral_code,
          total_commissions: totalCommissions,
          paid_commissions: paidCommissions,
          pending_commissions: totalCommissions - paidCommissions,
          commission_count: commissions.length,
          conversion_rate: affiliate.performance_metrics.conversion_rate,
          avg_order_value: affiliate.performance_metrics.avg_order_value,
        })
      }

      return NextResponse.json({ report })
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
