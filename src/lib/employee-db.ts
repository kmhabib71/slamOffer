import { ObjectId } from 'mongodb'
import clientPromise from './mongodb'
import {
  Employee,
  EmployeeLeadActivity,
  EmployeeTeam,
  EmployeePerformanceReport,
  EmployeeTrainingModule,
  EmployeeTrainingProgress,
  EmployeeRole,
  EmployeeStatus,
  LeadGenMethod,
} from './models/employee'

export const employeeDatabase = {
  // =======================
  // EMPLOYEE OPERATIONS
  // =======================

  async createEmployee(
    employee: Omit<Employee, '_id' | 'created_at' | 'updated_at'>
  ): Promise<Employee> {
    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const employeeData = {
      ...employee,
      created_at: now,
      updated_at: now,
      performance_metrics: {
        total_leads_generated: 0,
        total_qualified_leads: 0,
        total_converted_leads: 0,
        conversion_rate: 0,
        avg_lead_quality_score: 0,
        current_streak_days: 0,
        best_streak_days: 0,
        ...employee.performance_metrics,
      },
      training_status: {
        onboarding_completed: false,
        training_modules_completed: [],
        certification_level: 'beginner' as const,
        ...employee.training_status,
      },
    }

    const result = await db.collection('employees').insertOne(employeeData)
    return { ...employeeData, _id: result.insertedId } as Employee
  },

  async getEmployeeById(employeeId: string): Promise<Employee | null> {
    const client = await clientPromise
    const db = client.db()

    const employee = await db.collection('employees').findOne({ employee_id: employeeId })
    return employee as Employee | null
  },

  async getEmployeesByUser(
    userId: string,
    filters?: {
      role?: EmployeeRole
      status?: EmployeeStatus
      team_id?: string
    }
  ): Promise<Employee[]> {
    const client = await clientPromise
    const db = client.db()

    const query: any = { user_id: userId }
    if (filters?.role) query.role = filters.role
    if (filters?.status) query.status = filters.status
    if (filters?.team_id) query.team_id = filters.team_id

    const employees = await db
      .collection('employees')
      .find(query)
      .sort({ created_at: -1 })
      .toArray()

    return employees as Employee[]
  },

  async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('employees').updateOne(
      { employee_id: employeeId },
      {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      }
    )

    return result.modifiedCount > 0
  },

  async updateEmployeePerformance(
    employeeId: string,
    metrics: Partial<Employee['performance_metrics']>
  ): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('employees').updateOne(
      { employee_id: employeeId },
      {
        $set: {
          performance_metrics: metrics,
          updated_at: new Date(),
        },
      }
    )

    return result.modifiedCount > 0
  },

  async getTopPerformingEmployees(userId: string, limit: number = 10): Promise<Employee[]> {
    const client = await clientPromise
    const db = client.db()

    const employees = await db
      .collection('employees')
      .find({
        user_id: userId,
        status: 'active',
      })
      .sort({
        'performance_metrics.total_converted_leads': -1,
        'performance_metrics.conversion_rate': -1,
      })
      .limit(limit)
      .toArray()

    return employees as Employee[]
  },

  // =======================
  // EMPLOYEE ACTIVITY OPERATIONS
  // =======================

  async logEmployeeActivity(
    activity: Omit<EmployeeLeadActivity, '_id' | 'created_at'>
  ): Promise<EmployeeLeadActivity> {
    const client = await clientPromise
    const db = client.db()

    const activityData = {
      ...activity,
      created_at: new Date(),
    }

    const result = await db.collection('employee_activities').insertOne(activityData)
    return { ...activityData, _id: result.insertedId } as EmployeeLeadActivity
  },

  async getEmployeeActivities(
    employeeId: string,
    filters?: {
      activity_type?: string
      date_range?: { start: Date; end: Date }
      limit?: number
    }
  ): Promise<EmployeeLeadActivity[]> {
    const client = await clientPromise
    const db = client.db()

    const query: any = { employee_id: employeeId }

    if (filters?.activity_type) query.activity_type = filters.activity_type
    if (filters?.date_range) {
      query.created_at = {
        $gte: filters.date_range.start,
        $lte: filters.date_range.end,
      }
    }

    const activities = await db
      .collection('employee_activities')
      .find(query)
      .sort({ created_at: -1 })
      .limit(filters?.limit || 100)
      .toArray()

    return activities as EmployeeLeadActivity[]
  },

  async getTeamActivities(teamId: string, limit: number = 100): Promise<EmployeeLeadActivity[]> {
    const client = await clientPromise
    const db = client.db()

    // First get team members
    const team = await db.collection('employee_teams').findOne({ _id: new ObjectId(teamId) })
    if (!team) return []

    const activities = await db
      .collection('employee_activities')
      .find({ employee_id: { $in: team.member_ids } })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray()

    return activities as EmployeeLeadActivity[]
  },

  // =======================
  // TEAM OPERATIONS
  // =======================

  async createTeam(
    team: Omit<EmployeeTeam, '_id' | 'created_at' | 'updated_at'>
  ): Promise<EmployeeTeam> {
    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const teamData = {
      ...team,
      created_at: now,
      updated_at: now,
      member_count: team.member_ids.length,
      team_performance: {
        total_leads_generated: 0,
        total_qualified_leads: 0,
        total_converted_leads: 0,
        team_conversion_rate: 0,
        avg_lead_quality: 0,
        current_month_leads: 0,
        last_month_leads: 0,
        ...team.team_performance,
      },
    }

    const result = await db.collection('employee_teams').insertOne(teamData)
    return { ...teamData, _id: result.insertedId } as EmployeeTeam
  },

  async getTeamsByUser(userId: string): Promise<EmployeeTeam[]> {
    const client = await clientPromise
    const db = client.db()

    const teams = await db
      .collection('employee_teams')
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .toArray()

    return teams as EmployeeTeam[]
  },

  async updateTeam(teamId: string, updates: Partial<EmployeeTeam>): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('employee_teams').updateOne(
      { _id: new ObjectId(teamId) },
      {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      }
    )

    return result.modifiedCount > 0
  },

  async addEmployeeToTeam(teamId: string, employeeId: string): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('employee_teams').updateOne(
      { _id: new ObjectId(teamId) },
      {
        $addToSet: { member_ids: employeeId },
        $inc: { member_count: 1 },
        $set: { updated_at: new Date() },
      }
    )

    // Update employee's team assignment
    await db.collection('employees').updateOne(
      { employee_id: employeeId },
      {
        $set: {
          team_id: teamId,
          updated_at: new Date(),
        },
      }
    )

    return result.modifiedCount > 0
  },

  async removeEmployeeFromTeam(teamId: string, employeeId: string): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('employee_teams').updateOne(
      { _id: new ObjectId(teamId) },
      {
        $pull: { member_ids: employeeId },
        $inc: { member_count: -1 },
        $set: { updated_at: new Date() },
      }
    )

    // Remove team assignment from employee
    await db.collection('employees').updateOne(
      { employee_id: employeeId },
      {
        $unset: { team_id: '' },
        $set: { updated_at: new Date() },
      }
    )

    return result.modifiedCount > 0
  },

  // =======================
  // PERFORMANCE OPERATIONS
  // =======================

  async generatePerformanceReport(
    employeeId: string,
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly',
    periodStart: Date,
    periodEnd: Date
  ): Promise<EmployeePerformanceReport> {
    const client = await clientPromise
    const db = client.db()

    const employee = await this.getEmployeeById(employeeId)
    if (!employee) throw new Error('Employee not found')

    // Get activities for the period
    const activities = await this.getEmployeeActivities(employeeId, {
      date_range: { start: periodStart, end: periodEnd },
    })

    // Calculate metrics
    const leadsGenerated = activities.filter(a => a.activity_type === 'lead_created').length
    const qualifiedLeads = activities.filter(a => a.activity_type === 'lead_qualified').length
    const convertedLeads = activities.filter(a => a.activity_type === 'lead_converted').length
    const rejectedLeads = activities.filter(a => a.activity_type === 'lead_rejected').length

    const conversionRate = leadsGenerated > 0 ? convertedLeads / leadsGenerated : 0
    const qualificationRate = leadsGenerated > 0 ? qualifiedLeads / leadsGenerated : 0

    // Calculate method performance
    const methodPerformance = {} as any
    for (const method of Object.values(LeadGenMethod)) {
      const methodActivities = activities.filter(a => a.method_used === method)
      const methodLeads = methodActivities.filter(a => a.activity_type === 'lead_created').length
      const methodConversions = methodActivities.filter(
        a => a.activity_type === 'lead_converted'
      ).length
      const methodTime =
        methodActivities.reduce((sum, a) => sum + (a.time_spent_minutes || 0), 0) / 60

      methodPerformance[method] = {
        leads_generated: methodLeads,
        conversion_rate: methodLeads > 0 ? methodConversions / methodLeads : 0,
        time_spent_hours: methodTime,
      }
    }

    const reportData: Omit<EmployeePerformanceReport, '_id'> = {
      user_id: employee.user_id,
      employee_id: employeeId,
      report_period: period,
      period_start: periodStart,
      period_end: periodEnd,
      leads_generated: leadsGenerated,
      qualified_leads: qualifiedLeads,
      converted_leads: convertedLeads,
      rejected_leads: rejectedLeads,
      avg_lead_quality_score:
        activities.reduce((sum, a) => sum + (a.lead_quality_score || 0), 0) / activities.length ||
        0,
      conversion_rate: conversionRate,
      qualification_rate: qualificationRate,
      total_activities: activities.length,
      avg_activities_per_day:
        activities.length /
        Math.max(
          1,
          Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
        ),
      total_time_spent_hours:
        activities.reduce((sum, a) => sum + (a.time_spent_minutes || 0), 0) / 60,
      method_performance: methodPerformance,
      target_achievement: {
        daily_target_hit_rate: 0.8, // TODO: Calculate based on actual targets
        weekly_target_hit_rate: 0.7,
        monthly_target_hit_rate: 0.75,
        current_streak: employee.performance_metrics.current_streak_days,
      },
      improvement_suggestions: this.generateImprovementSuggestions(
        conversionRate,
        qualificationRate,
        methodPerformance
      ),
      strengths: this.generateStrengths(conversionRate, qualificationRate, methodPerformance),
      generated_at: new Date(),
    }

    const result = await db.collection('employee_performance_reports').insertOne(reportData)
    return { ...reportData, _id: result.insertedId } as EmployeePerformanceReport
  },

  generateImprovementSuggestions(
    conversionRate: number,
    qualificationRate: number,
    methodPerformance: any
  ): string[] {
    const suggestions = []

    if (conversionRate < 0.1) {
      suggestions.push('Focus on lead qualification - conversion rate is below 10%')
    }
    if (qualificationRate < 0.3) {
      suggestions.push('Improve lead qualification process - qualification rate is below 30%')
    }

    // Find lowest performing method
    const methods = Object.entries(methodPerformance)
    const lowestMethod = methods.reduce(
      (min, [method, perf]: [string, any]) =>
        perf.conversion_rate < min.conversion_rate
          ? { method, conversion_rate: perf.conversion_rate }
          : min,
      { method: '', conversion_rate: 1 }
    )

    if (lowestMethod.conversion_rate < 0.05) {
      suggestions.push(`Consider additional training on ${lowestMethod.method}`)
    }

    return suggestions
  },

  generateStrengths(
    conversionRate: number,
    qualificationRate: number,
    methodPerformance: any
  ): string[] {
    const strengths = []

    if (conversionRate > 0.2) {
      strengths.push('Excellent conversion rate - above 20%')
    }
    if (qualificationRate > 0.5) {
      strengths.push('Strong lead qualification skills')
    }

    // Find highest performing method
    const methods = Object.entries(methodPerformance)
    const highestMethod = methods.reduce(
      (max, [method, perf]: [string, any]) =>
        perf.conversion_rate > max.conversion_rate
          ? { method, conversion_rate: perf.conversion_rate }
          : max,
      { method: '', conversion_rate: 0 }
    )

    if (highestMethod.conversion_rate > 0.15) {
      strengths.push(`Excels at ${highestMethod.method}`)
    }

    return strengths
  },

  // =======================
  // TRAINING OPERATIONS
  // =======================

  async createTrainingModule(
    module: Omit<EmployeeTrainingModule, '_id' | 'created_at' | 'updated_at'>
  ): Promise<EmployeeTrainingModule> {
    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const moduleData = {
      ...module,
      created_at: now,
      updated_at: now,
      completion_rate: 0,
      avg_completion_time: 0,
    }

    const result = await db.collection('employee_training_modules').insertOne(moduleData)
    return { ...moduleData, _id: result.insertedId } as EmployeeTrainingModule
  },

  async getTrainingModulesByUser(userId: string): Promise<EmployeeTrainingModule[]> {
    const client = await clientPromise
    const db = client.db()

    const modules = await db
      .collection('employee_training_modules')
      .find({ user_id: userId, status: 'active' })
      .sort({ created_at: -1 })
      .toArray()

    return modules as EmployeeTrainingModule[]
  },

  async updateTrainingProgress(
    employeeId: string,
    moduleId: string,
    progress: Partial<EmployeeTrainingProgress>
  ): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('employee_training_progress').updateOne(
      { employee_id: employeeId, module_id: moduleId },
      {
        $set: {
          ...progress,
          updated_at: new Date(),
        },
      },
      { upsert: true }
    )

    return result.acknowledged
  },

  async getEmployeeTrainingProgress(employeeId: string): Promise<EmployeeTrainingProgress[]> {
    const client = await clientPromise
    const db = client.db()

    const progress = await db
      .collection('employee_training_progress')
      .find({ employee_id: employeeId })
      .sort({ created_at: -1 })
      .toArray()

    return progress as EmployeeTrainingProgress[]
  },

  // =======================
  // ANALYTICS OPERATIONS
  // =======================

  async getEmployeeStats(userId: string): Promise<{
    total_employees: number
    active_employees: number
    total_leads_generated: number
    total_conversions: number
    avg_conversion_rate: number
    top_performers: Array<{
      employee_id: string
      name: string
      leads_generated: number
      conversion_rate: number
    }>
  }> {
    const client = await clientPromise
    const db = client.db()

    const employees = await this.getEmployeesByUser(userId)
    const activeEmployees = employees.filter(e => e.status === 'active')

    const totalLeads = employees.reduce(
      (sum, e) => sum + e.performance_metrics.total_leads_generated,
      0
    )
    const totalConversions = employees.reduce(
      (sum, e) => sum + e.performance_metrics.total_converted_leads,
      0
    )
    const avgConversionRate =
      employees.reduce((sum, e) => sum + e.performance_metrics.conversion_rate, 0) /
        employees.length || 0

    const topPerformers = employees
      .sort(
        (a, b) =>
          b.performance_metrics.total_converted_leads - a.performance_metrics.total_converted_leads
      )
      .slice(0, 5)
      .map(e => ({
        employee_id: e.employee_id,
        name: `${e.first_name} ${e.last_name}`,
        leads_generated: e.performance_metrics.total_leads_generated,
        conversion_rate: e.performance_metrics.conversion_rate,
      }))

    return {
      total_employees: employees.length,
      active_employees: activeEmployees.length,
      total_leads_generated: totalLeads,
      total_conversions: totalConversions,
      avg_conversion_rate: avgConversionRate,
      top_performers: topPerformers,
    }
  },

  // =======================
  // DATABASE MANAGEMENT
  // =======================

  async createIndexes(): Promise<void> {
    const client = await clientPromise
    const db = client.db()

    // Employee indexes
    await db.collection('employees').createIndex({ user_id: 1, employee_id: 1 }, { unique: true })
    await db.collection('employees').createIndex({ user_id: 1, status: 1 })
    await db.collection('employees').createIndex({ user_id: 1, role: 1 })
    await db.collection('employees').createIndex({ team_id: 1 })
    await db
      .collection('employees')
      .createIndex({ 'performance_metrics.total_converted_leads': -1 })

    // Activity indexes
    await db.collection('employee_activities').createIndex({ employee_id: 1, created_at: -1 })
    await db.collection('employee_activities').createIndex({ user_id: 1, created_at: -1 })
    await db.collection('employee_activities').createIndex({ lead_id: 1 })

    // Team indexes
    await db.collection('employee_teams').createIndex({ user_id: 1 })
    await db.collection('employee_teams').createIndex({ manager_id: 1 })

    // Training indexes
    await db.collection('employee_training_modules').createIndex({ user_id: 1, status: 1 })
    await db.collection('employee_training_progress').createIndex({ employee_id: 1 })
    await db.collection('employee_training_progress').createIndex({ module_id: 1 })

    // Performance report indexes
    await db
      .collection('employee_performance_reports')
      .createIndex({ employee_id: 1, period_start: -1 })
    await db
      .collection('employee_performance_reports')
      .createIndex({ user_id: 1, generated_at: -1 })

    console.log('Employee system indexes created successfully')
  },
}
