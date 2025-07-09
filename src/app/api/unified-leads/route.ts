import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { unifiedLeadSystem } from '../../../lib/unified-lead-system'
import { z } from 'zod'

const getLeadsSchema = z.object({
  source_type: z.enum(['referral', 'employee', 'affiliate', 'direct']).optional(),
  status: z.string().optional(),
  date_range: z
    .object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    })
    .optional(),
  limit: z.number().min(1).max(500).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const source_type = searchParams.get('source_type') as any
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')

    const filters: any = {}
    if (source_type) filters.source_type = source_type
    if (status) filters.status = status
    if (limit) filters.limit = limit
    if (start_date && end_date) {
      filters.date_range = {
        start: new Date(start_date),
        end: new Date(end_date),
      }
    }

    const leads = await unifiedLeadSystem.getAllLeads(session.user.id, filters)

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Error fetching unified leads:', error)
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
    const { action, lead_id, new_status } = body

    if (action === 'update_status' && lead_id && new_status) {
      // Update lead status across all systems
      const [source_type, source_id, lead_identifier] = lead_id.split('_')

      // Route to appropriate system based on source type
      if (source_type === 'ref') {
        // Update referral system
        await updateReferralLeadStatus(source_id, lead_identifier, new_status)
      } else if (source_type === 'emp') {
        // Update employee system
        await updateEmployeeLeadStatus(source_id, lead_identifier, new_status)
      } else if (source_type === 'aff') {
        // Update affiliate system
        await updateAffiliateLeadStatus(source_id, lead_identifier, new_status)
      }

      return NextResponse.json({ message: 'Lead status updated successfully' })
    }

    if (action === 'score_lead' && lead_id) {
      // Score and assign lead
      const leads = await unifiedLeadSystem.getAllLeads(session.user.id)
      const lead = leads.find(l => l.id === lead_id)

      if (lead) {
        await unifiedLeadSystem.scoreAndAssignLead(session.user.id, lead)
        return NextResponse.json({ message: 'Lead scored and assigned successfully' })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing unified lead action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions to update specific systems
async function updateReferralLeadStatus(referralId: string, customerId: string, status: string) {
  // Import referral database and update
  const { referralDatabase } = await import('../../../lib/referral-db')
  await referralDatabase.updateCustomerStatus(referralId, customerId, status)
}

async function updateEmployeeLeadStatus(employeeId: string, leadId: string, status: string) {
  // Import employee database and update
  const { employeeDatabase } = await import('../../../lib/employee-db')
  await employeeDatabase.updateLeadStatus(employeeId, leadId, status)
}

async function updateAffiliateLeadStatus(
  affiliateId: string,
  commissionId: string,
  status: string
) {
  // Import affiliate database and update
  const { affiliateDatabase } = await import('../../../lib/affiliate-db')
  await affiliateDatabase.updateCommissionStatus(commissionId, status, 'system')
}
