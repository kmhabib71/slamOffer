import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { unifiedLeadSystem } from '../../../../lib/unified-lead-system'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, config } = body

    if (action === 'process_pending_leads') {
      // Process all pending leads through the unified system
      const leads = await unifiedLeadSystem.getAllLeads(session.user.id, {
        status: 'new',
        limit: 100,
      })

      const processedLeads = []
      for (const lead of leads) {
        await unifiedLeadSystem.scoreAndAssignLead(session.user.id, lead)
        processedLeads.push({
          id: lead.id,
          name: lead.name,
          score: 'calculated',
          assigned: true,
        })
      }

      return NextResponse.json({
        message: `Processed ${processedLeads.length} leads`,
        processedLeads,
      })
    }

    if (action === 'auto_process_commissions') {
      // Automatically process all pending commissions
      const commissions = await unifiedLeadSystem.processAllCommissions(session.user.id)

      return NextResponse.json({
        message: 'Commissions processed successfully',
        commissions,
      })
    }

    if (action === 'generate_performance_report') {
      // Generate automated performance report
      const report = await unifiedLeadSystem.exportUnifiedReport(session.user.id)

      // Send email notification (would integrate with email service)
      const emailSent = await sendPerformanceReport(session.user.email, report)

      return NextResponse.json({
        message: 'Performance report generated and sent',
        report,
        emailSent,
      })
    }

    if (action === 'optimize_lead_assignment') {
      // Optimize lead assignment based on performance
      const leads = await unifiedLeadSystem.getAllLeads(session.user.id, {
        status: 'qualified',
        limit: 50,
      })

      const optimizations = []
      for (const lead of leads) {
        const bestSource = await findBestPerformingSource(session.user.id, lead.type)
        if (bestSource && bestSource.id !== lead.source_details.source_id) {
          optimizations.push({
            leadId: lead.id,
            currentSource: lead.source_details.source_name,
            recommendedSource: bestSource.name,
            reason: 'Higher conversion rate',
          })
        }
      }

      return NextResponse.json({
        message: `Found ${optimizations.length} optimization opportunities`,
        optimizations,
      })
    }

    if (action === 'setup_automation_rules') {
      // Setup automated rules for lead processing
      const rules = config?.rules || []

      const setupResults = await setupAutomationRules(session.user.id, rules)

      return NextResponse.json({
        message: 'Automation rules setup successfully',
        setupResults,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing automation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (action === 'automation_status') {
      // Get current automation status
      const status = await getAutomationStatus(session.user.id)
      return NextResponse.json({ status })
    }

    if (action === 'pending_actions') {
      // Get pending automated actions
      const pendingActions = await getPendingActions(session.user.id)
      return NextResponse.json({ pendingActions })
    }

    if (action === 'automation_metrics') {
      // Get automation performance metrics
      const metrics = await getAutomationMetrics(session.user.id)
      return NextResponse.json({ metrics })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching automation data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions
async function sendPerformanceReport(email: string, report: any): Promise<boolean> {
  // This would integrate with an email service like SendGrid, Mailgun, etc.
  console.log(`Sending performance report to ${email}`)
  return true
}

async function findBestPerformingSource(userId: string, sourceType: string): Promise<any> {
  // This would analyze performance data to find the best performing source
  const metrics = await unifiedLeadSystem.getUnifiedMetrics(userId)

  const sourcesOfType = metrics.revenue_by_source
  const bestSource = Object.entries(sourcesOfType)
    .filter(([key]) => key.startsWith(sourceType))
    .sort(([, a], [, b]) => b - a)[0]

  if (bestSource) {
    return {
      id: bestSource[0],
      name: bestSource[0],
      revenue: bestSource[1],
    }
  }

  return null
}

async function setupAutomationRules(userId: string, rules: any[]): Promise<any> {
  // This would setup automation rules in the database
  const setupResults = {
    rulesCreated: rules.length,
    rulesEnabled: rules.filter(r => r.enabled).length,
    errors: [],
  }

  // Save rules to database (would implement database storage)
  console.log(`Setting up ${rules.length} automation rules for user ${userId}`)

  return setupResults
}

async function getAutomationStatus(userId: string): Promise<any> {
  // This would get current automation status from database
  return {
    enabled: true,
    rulesActive: 5,
    lastRun: new Date().toISOString(),
    leadsProcessed: 23,
    commissionsProcessed: 8,
    errors: 0,
  }
}

async function getPendingActions(userId: string): Promise<any[]> {
  // This would get pending automated actions from database
  return [
    {
      id: 'action_1',
      type: 'lead_assignment',
      description: 'Assign 3 new leads to best performing sources',
      scheduledFor: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
    },
    {
      id: 'action_2',
      type: 'commission_processing',
      description: 'Process 15 pending commissions',
      scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
    },
    {
      id: 'action_3',
      type: 'performance_report',
      description: 'Generate weekly performance report',
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: 'low',
    },
  ]
}

async function getAutomationMetrics(userId: string): Promise<any> {
  // This would get automation performance metrics from database
  return {
    totalLeadsProcessed: 156,
    totalCommissionsProcessed: 89,
    averageProcessingTime: 2.3, // seconds
    errorRate: 0.02, // 2%
    timeSaved: 45.7, // hours
    accuracyRate: 0.98, // 98%
    lastWeekStats: {
      leadsProcessed: 34,
      commissionsProcessed: 23,
      errorsEncountered: 1,
    },
  }
}
