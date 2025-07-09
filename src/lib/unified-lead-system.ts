import { referralDatabase } from './referral-db'
import { employeeDatabase } from './employee-db'
import { affiliateDatabase } from './affiliate-db'

export interface LeadSource {
  id: string
  type: 'referral' | 'employee' | 'affiliate' | 'direct'
  name: string
  email: string
  phone?: string
  source_details: {
    source_id: string
    source_name: string
    commission_rate?: number
    expected_commission?: number
    tracking_code?: string
  }
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed_won' | 'closed_lost'
  priority: 'low' | 'medium' | 'high'
  created_at: Date
  last_activity: Date
  notes?: string
}

export interface LeadMetrics {
  total_leads: number
  leads_by_source: Record<string, number>
  conversion_rates: Record<string, number>
  revenue_by_source: Record<string, number>
  cost_per_lead: Record<string, number>
  roi_by_source: Record<string, number>
  monthly_trends: Array<{
    month: string
    leads: number
    conversions: number
    revenue: number
  }>
}

export interface LeadGenerationCampaign {
  id: string
  name: string
  type: 'referral' | 'employee' | 'affiliate' | 'multi-channel'
  active_sources: Array<{
    type: 'referral' | 'employee' | 'affiliate'
    enabled: boolean
    target_count: number
    budget: number
    commission_rate: number
  }>
  campaign_metrics: {
    total_budget: number
    spent_budget: number
    leads_generated: number
    conversions: number
    revenue_generated: number
    roi: number
  }
  automation_rules: {
    auto_assign_leads: boolean
    lead_scoring_enabled: boolean
    auto_follow_up: boolean
    commission_auto_approval: boolean
  }
  status: 'active' | 'paused' | 'completed'
  created_at: Date
  updated_at: Date
}

export class UnifiedLeadSystem {
  // =======================
  // LEAD AGGREGATION
  // =======================

  async getAllLeads(
    userId: string,
    filters?: {
      source_type?: 'referral' | 'employee' | 'affiliate' | 'direct'
      status?: string
      date_range?: { start: Date; end: Date }
      limit?: number
    }
  ): Promise<LeadSource[]> {
    const leads: LeadSource[] = []

    // Get referral leads
    if (!filters?.source_type || filters.source_type === 'referral') {
      const referrals = await referralDatabase.getReferralsByUser(userId)
      referrals.forEach(referral => {
        referral.customers.forEach(customer => {
          leads.push({
            id: `ref_${referral.referral_id}_${customer.customer_id}`,
            type: 'referral',
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            source_details: {
              source_id: referral.referral_id,
              source_name: referral.referrer_name,
              commission_rate: referral.commission_rate,
              expected_commission: customer.expected_commission,
              tracking_code: referral.tracking_code,
            },
            status: this.mapStatus(customer.status),
            priority: this.calculatePriority(customer.lead_score),
            created_at: new Date(customer.created_at),
            last_activity: new Date(customer.last_activity || customer.created_at),
            notes: customer.notes,
          })
        })
      })
    }

    // Get employee leads
    if (!filters?.source_type || filters.source_type === 'employee') {
      const employees = await employeeDatabase.getEmployeesByUser(userId)
      for (const employee of employees) {
        const leads_from_employee = await employeeDatabase.getLeadsByEmployee(employee.employee_id)
        leads_from_employee.forEach(lead => {
          leads.push({
            id: `emp_${employee.employee_id}_${lead.id}`,
            type: 'employee',
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            source_details: {
              source_id: employee.employee_id,
              source_name: `${employee.first_name} ${employee.last_name}`,
              commission_rate: employee.compensation.commission_rate,
              expected_commission: lead.expected_commission,
              tracking_code: employee.tracking_code,
            },
            status: this.mapStatus(lead.status),
            priority: this.calculatePriority(lead.lead_score || 50),
            created_at: new Date(lead.created_at),
            last_activity: new Date(lead.last_activity || lead.created_at),
            notes: lead.notes,
          })
        })
      }
    }

    // Get affiliate leads
    if (!filters?.source_type || filters.source_type === 'affiliate') {
      const affiliates = await affiliateDatabase.getAffiliatesByUser(userId)
      for (const affiliate of affiliates) {
        const commissions = await affiliateDatabase.getCommissionsByAffiliate(
          affiliate.affiliate_id
        )
        commissions.forEach(commission => {
          leads.push({
            id: `aff_${affiliate.affiliate_id}_${commission.commission_id}`,
            type: 'affiliate',
            name: commission.transaction_details.customer_email.split('@')[0],
            email: commission.transaction_details.customer_email,
            source_details: {
              source_id: affiliate.affiliate_id,
              source_name: `${affiliate.first_name} ${affiliate.last_name}`,
              commission_rate: commission.transaction_details.commission_rate,
              expected_commission: commission.transaction_details.commission_amount,
              tracking_code: affiliate.program_details.referral_code,
            },
            status: commission.status === 'paid' ? 'converted' : 'qualified',
            priority: 'medium',
            created_at: new Date(commission.created_at),
            last_activity: new Date(commission.updated_at),
            notes: `Order: ${commission.transaction_details.product_name}`,
          })
        })
      }
    }

    // Apply filters
    let filteredLeads = leads
    if (filters?.status) {
      filteredLeads = filteredLeads.filter(lead => lead.status === filters.status)
    }
    if (filters?.date_range) {
      filteredLeads = filteredLeads.filter(
        lead =>
          lead.created_at >= filters.date_range!.start && lead.created_at <= filters.date_range!.end
      )
    }

    // Sort by priority and date
    filteredLeads.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.created_at.getTime() - a.created_at.getTime()
    })

    return filteredLeads.slice(0, filters?.limit || 100)
  }

  // =======================
  // UNIFIED ANALYTICS
  // =======================

  async getUnifiedMetrics(
    userId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<LeadMetrics> {
    const leads = await this.getAllLeads(userId, { date_range: dateRange })

    const metrics: LeadMetrics = {
      total_leads: leads.length,
      leads_by_source: {},
      conversion_rates: {},
      revenue_by_source: {},
      cost_per_lead: {},
      roi_by_source: {},
      monthly_trends: [],
    }

    // Calculate by source
    const sourceMetrics = new Map()
    leads.forEach(lead => {
      const sourceKey = `${lead.type}_${lead.source_details.source_id}`
      if (!sourceMetrics.has(sourceKey)) {
        sourceMetrics.set(sourceKey, {
          name: lead.source_details.source_name,
          type: lead.type,
          total_leads: 0,
          conversions: 0,
          revenue: 0,
          cost: 0,
        })
      }

      const source = sourceMetrics.get(sourceKey)
      source.total_leads++

      if (lead.status === 'converted' || lead.status === 'closed_won') {
        source.conversions++
        source.revenue += lead.source_details.expected_commission || 0
      }

      // Estimate cost based on commission rates
      source.cost +=
        (lead.source_details.expected_commission || 0) *
        (lead.source_details.commission_rate || 0.1)
    })

    // Populate metrics
    sourceMetrics.forEach((source, key) => {
      metrics.leads_by_source[key] = source.total_leads
      metrics.conversion_rates[key] =
        source.total_leads > 0 ? (source.conversions / source.total_leads) * 100 : 0
      metrics.revenue_by_source[key] = source.revenue
      metrics.cost_per_lead[key] = source.total_leads > 0 ? source.cost / source.total_leads : 0
      metrics.roi_by_source[key] =
        source.cost > 0 ? ((source.revenue - source.cost) / source.cost) * 100 : 0
    })

    // Calculate monthly trends
    const monthlyData = new Map()
    leads.forEach(lead => {
      const monthKey = lead.created_at.toISOString().substring(0, 7) // YYYY-MM
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { leads: 0, conversions: 0, revenue: 0 })
      }

      const month = monthlyData.get(monthKey)
      month.leads++

      if (lead.status === 'converted' || lead.status === 'closed_won') {
        month.conversions++
        month.revenue += lead.source_details.expected_commission || 0
      }
    })

    metrics.monthly_trends = Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        leads: data.leads,
        conversions: data.conversions,
        revenue: data.revenue,
      }))

    return metrics
  }

  // =======================
  // COMMISSION MANAGEMENT
  // =======================

  async processAllCommissions(userId: string): Promise<{
    referral_commissions: number
    employee_commissions: number
    affiliate_commissions: number
    total_commissions: number
  }> {
    const commissionSummary = {
      referral_commissions: 0,
      employee_commissions: 0,
      affiliate_commissions: 0,
      total_commissions: 0,
    }

    // Process referral commissions
    const referralCommissions = await this.processReferralCommissions(userId)
    commissionSummary.referral_commissions = referralCommissions

    // Process employee commissions
    const employeeCommissions = await this.processEmployeeCommissions(userId)
    commissionSummary.employee_commissions = employeeCommissions

    // Process affiliate commissions
    const affiliateCommissions = await this.processAffiliateCommissions(userId)
    commissionSummary.affiliate_commissions = affiliateCommissions

    commissionSummary.total_commissions =
      commissionSummary.referral_commissions +
      commissionSummary.employee_commissions +
      commissionSummary.affiliate_commissions

    return commissionSummary
  }

  private async processReferralCommissions(userId: string): Promise<number> {
    const referrals = await referralDatabase.getReferralsByUser(userId)
    let total = 0

    for (const referral of referrals) {
      for (const customer of referral.customers) {
        if (customer.status === 'converted' && !customer.commission_paid) {
          total += customer.expected_commission || 0
          // Mark as paid
          await referralDatabase.updateCustomerCommission(
            referral.referral_id,
            customer.customer_id,
            'paid'
          )
        }
      }
    }

    return total
  }

  private async processEmployeeCommissions(userId: string): Promise<number> {
    const employees = await employeeDatabase.getEmployeesByUser(userId)
    let total = 0

    for (const employee of employees) {
      const commissions = await employeeDatabase.getCommissionsByEmployee(employee.employee_id)
      for (const commission of commissions) {
        if (commission.status === 'approved' && commission.payment_status !== 'paid') {
          total += commission.commission_amount
          // Mark as paid
          await employeeDatabase.updateCommissionStatus(commission.commission_id, 'paid')
        }
      }
    }

    return total
  }

  private async processAffiliateCommissions(userId: string): Promise<number> {
    const affiliates = await affiliateDatabase.getAffiliatesByUser(userId)
    let total = 0

    for (const affiliate of affiliates) {
      const commissions = await affiliateDatabase.getCommissionsByAffiliate(affiliate.affiliate_id)
      for (const commission of commissions) {
        if (commission.status === 'approved' && !commission.payment_info.payment_date) {
          total += commission.transaction_details.commission_amount
          // Mark as paid
          await affiliateDatabase.updateCommissionStatus(
            commission.commission_id,
            'paid',
            'system',
            'Automated payment processing'
          )
        }
      }
    }

    return total
  }

  // =======================
  // LEAD SCORING & ASSIGNMENT
  // =======================

  async scoreAndAssignLead(userId: string, lead: LeadSource): Promise<void> {
    // Calculate lead score based on multiple factors
    const score = this.calculateLeadScore(lead)

    // Assign to best available source based on performance
    const bestSource = await this.findBestSourceForLead(userId, lead)

    // Create follow-up tasks
    await this.createFollowUpTasks(userId, lead, bestSource)
  }

  private calculateLeadScore(lead: LeadSource): number {
    let score = 50 // Base score

    // Source type scoring
    const sourceTypeScores = {
      referral: 20,
      employee: 15,
      affiliate: 10,
      direct: 5,
    }
    score += sourceTypeScores[lead.type] || 0

    // Email domain scoring
    if (lead.email.includes('@gmail.com') || lead.email.includes('@yahoo.com')) {
      score += 5
    } else if (lead.email.includes('.edu')) {
      score += 15
    } else if (!lead.email.includes('@gmail.com') && !lead.email.includes('@yahoo.com')) {
      score += 10 // Business email
    }

    // Phone number bonus
    if (lead.phone) {
      score += 10
    }

    // Source quality bonus
    if (lead.source_details.commission_rate && lead.source_details.commission_rate > 0.1) {
      score += 15 // High-value source
    }

    return Math.min(score, 100)
  }

  private async findBestSourceForLead(userId: string, lead: LeadSource): Promise<any> {
    // This would analyze performance of all sources and assign to best performer
    // For now, return the original source
    return {
      id: lead.source_details.source_id,
      name: lead.source_details.source_name,
      type: lead.type,
    }
  }

  private async createFollowUpTasks(userId: string, lead: LeadSource, source: any): Promise<void> {
    // Create automated follow-up tasks
    const tasks = [
      {
        type: 'email_follow_up',
        scheduled_for: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
        message: `Follow up with ${lead.name} from ${source.name}`,
      },
      {
        type: 'call_follow_up',
        scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        message: `Call ${lead.name} if no response to email`,
      },
      {
        type: 'final_follow_up',
        scheduled_for: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        message: `Final follow-up with ${lead.name}`,
      },
    ]

    // This would integrate with a task management system
    // await taskDatabase.createTasks(userId, tasks)
  }

  // =======================
  // HELPER METHODS
  // =======================

  private mapStatus(
    status: string
  ): 'new' | 'contacted' | 'qualified' | 'converted' | 'closed_won' | 'closed_lost' {
    const statusMap: Record<
      string,
      'new' | 'contacted' | 'qualified' | 'converted' | 'closed_won' | 'closed_lost'
    > = {
      new: 'new',
      contacted: 'contacted',
      qualified: 'qualified',
      converted: 'converted',
      closed_won: 'closed_won',
      closed_lost: 'closed_lost',
      completed: 'converted',
      active: 'qualified',
      pending: 'contacted',
    }
    return statusMap[status] || 'new'
  }

  private calculatePriority(score: number): 'low' | 'medium' | 'high' {
    if (score >= 80) return 'high'
    if (score >= 60) return 'medium'
    return 'low'
  }

  // =======================
  // EXPORT METHODS
  // =======================

  async exportUnifiedReport(userId: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    const leads = await this.getAllLeads(userId, { date_range: dateRange })
    const metrics = await this.getUnifiedMetrics(userId, dateRange)
    const commissions = await this.processAllCommissions(userId)

    return {
      summary: {
        total_leads: leads.length,
        total_revenue: Object.values(metrics.revenue_by_source).reduce((sum, rev) => sum + rev, 0),
        total_commissions: commissions.total_commissions,
        avg_cost_per_lead:
          Object.values(metrics.cost_per_lead).reduce((sum, cost) => sum + cost, 0) /
          Object.keys(metrics.cost_per_lead).length,
        overall_roi:
          Object.values(metrics.roi_by_source).reduce((sum, roi) => sum + roi, 0) /
          Object.keys(metrics.roi_by_source).length,
      },
      leads,
      metrics,
      commissions,
      export_date: new Date().toISOString(),
    }
  }
}

// Export singleton instance
export const unifiedLeadSystem = new UnifiedLeadSystem()
