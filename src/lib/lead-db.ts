import { ObjectId } from 'mongodb'
import clientPromise from './mongodb'
import {
  Lead,
  Campaign,
  WorkflowExecution,
  LeadActivity,
  LeadScore,
  LeadSource,
  LeadStatus,
  CampaignType,
} from './models/lead'

export const leadDatabase = {
  // Lead operations
  async createLead(lead: Omit<Lead, '_id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const newLead: Lead = {
      ...lead,
      created_at: now,
      updated_at: now,
    }

    const result = await db.collection('leads').insertOne(newLead)
    return { ...newLead, _id: result.insertedId }
  },

  async getLeadById(leadId: string | ObjectId): Promise<Lead | null> {
    const client = await clientPromise
    const db = client.db()

    const lead = await db.collection('leads').findOne({ _id: new ObjectId(leadId) })
    return lead as Lead | null
  },

  async getLeadsByUser(
    userId: string,
    filters?: {
      status?: LeadStatus
      source?: LeadSource
      limit?: number
      skip?: number
    }
  ): Promise<Lead[]> {
    const client = await clientPromise
    const db = client.db()

    const query: any = { user_id: userId }
    if (filters?.status) query.status = filters.status
    if (filters?.source) query.source = filters.source

    const leads = await db
      .collection('leads')
      .find(query)
      .sort({ created_at: -1 })
      .limit(filters?.limit || 100)
      .skip(filters?.skip || 0)
      .toArray()

    return leads as Lead[]
  },

  async updateLead(leadId: string | ObjectId, updates: Partial<Lead>): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('leads').updateOne(
      { _id: new ObjectId(leadId) },
      {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      }
    )

    return result.modifiedCount > 0
  },

  async updateLeadStatus(leadId: string | ObjectId, status: LeadStatus): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const updates: any = {
      status,
      updated_at: new Date(),
    }

    if (status === 'converted') {
      updates.conversion_date = new Date()
    }

    const result = await db
      .collection('leads')
      .updateOne({ _id: new ObjectId(leadId) }, { $set: updates })

    return result.modifiedCount > 0
  },

  async deleteLead(leadId: string | ObjectId): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('leads').deleteOne({ _id: new ObjectId(leadId) })
    return result.deletedCount > 0
  },

  // Campaign operations
  async createCampaign(
    campaign: Omit<Campaign, '_id' | 'created_at' | 'updated_at'>
  ): Promise<Campaign> {
    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const newCampaign: Campaign = {
      ...campaign,
      created_at: now,
      updated_at: now,
    }

    const result = await db.collection('campaigns').insertOne(newCampaign)
    return { ...newCampaign, _id: result.insertedId }
  },

  async getCampaignsByUser(userId: string): Promise<Campaign[]> {
    const client = await clientPromise
    const db = client.db()

    const campaigns = await db
      .collection('campaigns')
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .toArray()

    return campaigns as Campaign[]
  },

  async updateCampaign(
    campaignId: string | ObjectId,
    updates: Partial<Campaign>
  ): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('campaigns').updateOne(
      { _id: new ObjectId(campaignId) },
      {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      }
    )

    return result.modifiedCount > 0
  },

  async updateCampaignMetrics(
    campaignId: string | ObjectId,
    metrics: Partial<Campaign['metrics']>
  ): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('campaigns').updateOne(
      { _id: new ObjectId(campaignId) },
      {
        $set: {
          metrics: metrics,
          updated_at: new Date(),
        },
      }
    )

    return result.modifiedCount > 0
  },

  // Workflow execution operations
  async createWorkflowExecution(
    execution: Omit<WorkflowExecution, '_id' | 'created_at'>
  ): Promise<WorkflowExecution> {
    const client = await clientPromise
    const db = client.db()

    const newExecution: WorkflowExecution = {
      ...execution,
      created_at: new Date(),
    }

    const result = await db.collection('workflow_executions').insertOne(newExecution)
    return { ...newExecution, _id: result.insertedId }
  },

  async updateWorkflowExecution(
    executionId: string | ObjectId,
    updates: Partial<WorkflowExecution>
  ): Promise<boolean> {
    const client = await clientPromise
    const db = client.db()

    const result = await db
      .collection('workflow_executions')
      .updateOne({ _id: new ObjectId(executionId) }, { $set: updates })

    return result.modifiedCount > 0
  },

  async getWorkflowExecutions(
    userId: string,
    filters?: {
      workflow_type?: CampaignType
      status?: string
      limit?: number
    }
  ): Promise<WorkflowExecution[]> {
    const client = await clientPromise
    const db = client.db()

    const query: any = { user_id: userId }
    if (filters?.workflow_type) query.workflow_type = filters.workflow_type
    if (filters?.status) query.status = filters.status

    const executions = await db
      .collection('workflow_executions')
      .find(query)
      .sort({ created_at: -1 })
      .limit(filters?.limit || 50)
      .toArray()

    return executions as WorkflowExecution[]
  },

  // Lead activity operations
  async addLeadActivity(activity: Omit<LeadActivity, '_id' | 'created_at'>): Promise<LeadActivity> {
    const client = await clientPromise
    const db = client.db()

    const newActivity: LeadActivity = {
      ...activity,
      created_at: new Date(),
    }

    const result = await db.collection('lead_activities').insertOne(newActivity)
    return { ...newActivity, _id: result.insertedId }
  },

  async getLeadActivities(leadId: string | ObjectId, limit: number = 50): Promise<LeadActivity[]> {
    const client = await clientPromise
    const db = client.db()

    const activities = await db
      .collection('lead_activities')
      .find({ lead_id: new ObjectId(leadId) })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray()

    return activities as LeadActivity[]
  },

  // Lead scoring operations
  async updateLeadScore(score: Omit<LeadScore, '_id' | 'calculated_at'>): Promise<LeadScore> {
    const client = await clientPromise
    const db = client.db()

    const newScore: LeadScore = {
      ...score,
      calculated_at: new Date(),
    }

    // Update or insert lead score
    const result = await db.collection('lead_scores').findOneAndUpdate(
      {
        lead_id: score.lead_id,
        score_type: score.score_type,
      },
      { $set: newScore },
      {
        upsert: true,
        returnDocument: 'after',
      }
    )

    return result as LeadScore
  },

  async getLeadScore(leadId: string | ObjectId, scoreType?: string): Promise<LeadScore[]> {
    const client = await clientPromise
    const db = client.db()

    const query: any = { lead_id: new ObjectId(leadId) }
    if (scoreType) query.score_type = scoreType

    const scores = await db
      .collection('lead_scores')
      .find(query)
      .sort({ calculated_at: -1 })
      .toArray()

    return scores as LeadScore[]
  },

  // Analytics and reporting
  async getLeadStats(userId: string): Promise<{
    total_leads: number
    leads_by_status: Record<LeadStatus, number>
    leads_by_source: Record<LeadSource, number>
    conversion_rate: number
    avg_score: number
  }> {
    const client = await clientPromise
    const db = client.db()

    const leads = (await db.collection('leads').find({ user_id: userId }).toArray()) as Lead[]

    const stats = {
      total_leads: leads.length,
      leads_by_status: {} as Record<LeadStatus, number>,
      leads_by_source: {} as Record<LeadSource, number>,
      conversion_rate: 0,
      avg_score: 0,
    }

    // Initialize counters
    const statuses: LeadStatus[] = ['hot', 'warm', 'cold', 'converted', 'lost']
    const sources: LeadSource[] = ['warm', 'cold', 'content', 'paid', 'referral']

    statuses.forEach(status => (stats.leads_by_status[status] = 0))
    sources.forEach(source => (stats.leads_by_source[source] = 0))

    let totalScore = 0
    let convertedLeads = 0

    leads.forEach(lead => {
      stats.leads_by_status[lead.status]++
      stats.leads_by_source[lead.source]++
      totalScore += lead.score
      if (lead.status === 'converted') convertedLeads++
    })

    stats.conversion_rate = leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0
    stats.avg_score = leads.length > 0 ? totalScore / leads.length : 0

    return stats
  },

  // Database initialization
  async createIndexes(): Promise<void> {
    const client = await clientPromise
    const db = client.db()

    // Create indexes for better performance
    await Promise.all([
      // Leads indexes
      db.collection('leads').createIndex({ user_id: 1 }),
      db.collection('leads').createIndex({ email: 1 }),
      db.collection('leads').createIndex({ status: 1 }),
      db.collection('leads').createIndex({ source: 1 }),
      db.collection('leads').createIndex({ created_at: -1 }),

      // Campaigns indexes
      db.collection('campaigns').createIndex({ user_id: 1 }),
      db.collection('campaigns').createIndex({ type: 1 }),
      db.collection('campaigns').createIndex({ status: 1 }),

      // Workflow executions indexes
      db.collection('workflow_executions').createIndex({ user_id: 1 }),
      db.collection('workflow_executions').createIndex({ n8n_execution_id: 1 }),
      db.collection('workflow_executions').createIndex({ workflow_type: 1 }),

      // Lead activities indexes
      db.collection('lead_activities').createIndex({ lead_id: 1 }),
      db.collection('lead_activities').createIndex({ user_id: 1 }),
      db.collection('lead_activities').createIndex({ created_at: -1 }),

      // Lead scores indexes
      db.collection('lead_scores').createIndex({ lead_id: 1, score_type: 1 }, { unique: true }),
    ])

    console.log('✅ Lead generation database indexes created successfully')
  },
}
