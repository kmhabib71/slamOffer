import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export interface QueryOptions {
  limit?: number
  skip?: number
  sort?: Record<string, 1 | -1>
  select?: Record<string, 1 | 0>
  index?: string
}

export interface AggregationPipeline {
  $match?: any
  $lookup?: any
  $group?: any
  $sort?: any
  $limit?: number
  $skip?: number
  $project?: any
  $unwind?: any
}

class QueryOptimizer {
  private client: any

  constructor() {
    this.initializeClient()
  }

  private async initializeClient() {
    this.client = await clientPromise
  }

  // Optimized lead queries
  async getLeadsWithPagination(
    userId: string,
    options: QueryOptions & {
      status?: string
      source?: string
      search?: string
      dateRange?: { start: Date; end: Date }
    } = {}
  ) {
    const client = await clientPromise
    const db = client.db()

    // Build aggregation pipeline for complex queries
    const pipeline: AggregationPipeline[] = [
      {
        $match: {
          user_id: userId,
          ...(options.status && { status: options.status }),
          ...(options.source && { source: options.source }),
          ...(options.search && {
            $or: [
              { email: { $regex: options.search, $options: 'i' } },
              { first_name: { $regex: options.search, $options: 'i' } },
              { last_name: { $regex: options.search, $options: 'i' } },
              { company: { $regex: options.search, $options: 'i' } },
            ],
          }),
          ...(options.dateRange && {
            created_at: {
              $gte: options.dateRange.start,
              $lte: options.dateRange.end,
            },
          }),
        },
      },
      {
        $sort: options.sort || { created_at: -1 },
      },
      {
        $skip: options.skip || 0,
      },
      {
        $limit: options.limit || 10,
      },
    ]

    // Add projection if specified
    if (options.select) {
      pipeline.push({ $project: options.select })
    }

    const results = await db.collection('leads').aggregate(pipeline).toArray()

    // Get total count for pagination
    const countPipeline = [
      {
        $match: {
          user_id: userId,
          ...(options.status && { status: options.status }),
          ...(options.source && { source: options.source }),
          ...(options.search && {
            $or: [
              { email: { $regex: options.search, $options: 'i' } },
              { first_name: { $regex: options.search, $options: 'i' } },
              { last_name: { $regex: options.search, $options: 'i' } },
              { company: { $regex: options.search, $options: 'i' } },
            ],
          }),
          ...(options.dateRange && {
            created_at: {
              $gte: options.dateRange.start,
              $lte: options.dateRange.end,
            },
          }),
        },
      },
      {
        $count: 'total',
      },
    ]

    const countResult = await db.collection('leads').aggregate(countPipeline).toArray()
    const totalCount = countResult[0]?.total || 0

    return {
      leads: results,
      total: totalCount,
      page: Math.floor((options.skip || 0) / (options.limit || 10)) + 1,
      pages: Math.ceil(totalCount / (options.limit || 10)),
    }
  }

  // Optimized analytics queries
  async getLeadAnalytics(userId: string, dateRange?: { start: Date; end: Date }) {
    const client = await clientPromise
    const db = client.db()

    const matchCondition: any = { user_id: userId }
    if (dateRange) {
      matchCondition.created_at = {
        $gte: dateRange.start,
        $lte: dateRange.end,
      }
    }

    const pipeline = [
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          total_leads: { $sum: 1 },
          leads_by_status: {
            $push: '$status',
          },
          leads_by_source: {
            $push: '$source',
          },
          avg_score: { $avg: '$score' },
          converted_leads: {
            $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] },
          },
          total_estimated_value: { $sum: '$estimated_value' },
        },
      },
      {
        $project: {
          _id: 0,
          total_leads: 1,
          avg_score: { $round: ['$avg_score', 2] },
          conversion_rate: {
            $round: [{ $divide: ['$converted_leads', '$total_leads'] }, 4],
          },
          total_estimated_value: 1,
          leads_by_status: 1,
          leads_by_source: 1,
        },
      },
    ]

    const result = await db.collection('leads').aggregate(pipeline).toArray()
    const analytics = result[0] || {}

    // Process status and source arrays into counts
    const statusCounts: Record<string, number> = {}
    const sourceCounts: Record<string, number> = {}

    if (analytics.leads_by_status) {
      for (const status of analytics.leads_by_status) {
        statusCounts[status] = (statusCounts[status] || 0) + 1
      }
    }

    if (analytics.leads_by_source) {
      for (const source of analytics.leads_by_source) {
        sourceCounts[source] = (sourceCounts[source] || 0) + 1
      }
    }

    return {
      ...analytics,
      leads_by_status: statusCounts,
      leads_by_source: sourceCounts,
    }
  }

  // Batch operations for better performance
  async batchUpdateLeads(updates: Array<{ id: string; data: any }>) {
    const client = await clientPromise
    const db = client.db()

    const bulkOperations = updates.map(update => ({
      updateOne: {
        filter: { _id: new ObjectId(update.id) },
        update: { $set: { ...update.data, updated_at: new Date() } },
      },
    }))

    const result = await db.collection('leads').bulkWrite(bulkOperations)
    return result
  }

  // Index management
  async createOptimalIndexes() {
    const client = await clientPromise
    const db = client.db()

    // Create compound indexes for common queries
    await db.collection('leads').createIndex({ user_id: 1, created_at: -1 })
    await db.collection('leads').createIndex({ user_id: 1, status: 1 })
    await db.collection('leads').createIndex({ user_id: 1, source: 1 })
    await db.collection('leads').createIndex({ user_id: 1, score: -1 })
    await db.collection('leads').createIndex({ email: 1 })

    // Text index for search functionality
    await db.collection('leads').createIndex({
      email: 'text',
      first_name: 'text',
      last_name: 'text',
      company: 'text',
    })

    // Campaign indexes
    await db.collection('campaigns').createIndex({ user_id: 1, created_at: -1 })
    await db.collection('campaigns').createIndex({ user_id: 1, status: 1 })
    await db.collection('campaigns').createIndex({ user_id: 1, type: 1 })

    // Workflow execution indexes
    await db.collection('workflow_executions').createIndex({ user_id: 1, created_at: -1 })
    await db.collection('workflow_executions').createIndex({ user_id: 1, status: 1 })
    await db.collection('workflow_executions').createIndex({ execution_id: 1 })

    console.log('Optimal indexes created successfully')
  }

  // Query performance monitoring
  async getQueryPerformance(collection: string, query: any) {
    const client = await clientPromise
    const db = client.db()

    const explain = await db.collection(collection).find(query).explain('executionStats')

    return {
      indexUsed: explain.executionStats.indexUsed,
      executionTime: explain.executionStats.executionTimeMillis,
      docsExamined: explain.executionStats.totalDocsExamined,
      docsReturned: explain.executionStats.totalDocsReturned,
      efficiency:
        explain.executionStats.totalDocsReturned / explain.executionStats.totalDocsExamined || 0,
    }
  }
}

export const queryOptimizer = new QueryOptimizer()
export default queryOptimizer
