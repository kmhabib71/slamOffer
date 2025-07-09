export interface N8nWebhookData {
  userId: string
  workflowType: string
  [key: string]: any
}

export interface N8nWorkflowResponse {
  executionId: string
  status: 'running' | 'completed' | 'failed'
  data?: any
  error?: string
}

export class N8nClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678'
    this.apiKey = process.env.N8N_API_KEY || ''
  }

  /**
   * Trigger a workflow via webhook
   */
  async triggerWorkflow(workflowName: string, data: N8nWebhookData): Promise<N8nWorkflowResponse> {
    try {
      const webhookUrl = `${this.baseUrl}/webhook/${workflowName}`

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      return {
        executionId: result.executionId || 'unknown',
        status: 'running',
        data: result,
      }
    } catch (error) {
      console.error('n8n workflow trigger error:', error)
      throw new Error(
        `Failed to trigger n8n workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get workflow execution status
   */
  async getWorkflowStatus(executionId: string): Promise<N8nWorkflowResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/executions/${executionId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get execution status: ${response.status}`)
      }

      const execution = await response.json()

      return {
        executionId,
        status: execution.finished ? 'completed' : 'running',
        data: execution.data,
      }
    } catch (error) {
      console.error('n8n status check error:', error)
      return {
        executionId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get workflow execution results
   */
  async getWorkflowResults(executionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/executions/${executionId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get execution results: ${response.status}`)
      }

      const execution = await response.json()
      return execution.data
    } catch (error) {
      console.error('n8n results fetch error:', error)
      throw error
    }
  }

  /**
   * List all active workflows
   */
  async getActiveWorkflows(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/active`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get active workflows: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('n8n active workflows error:', error)
      return []
    }
  }

  /**
   * Test webhook connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      })

      // Even a 404 means n8n is running
      return response.status < 500
    } catch (error) {
      console.error('n8n connection test failed:', error)
      return false
    }
  }
}

// Workflow type definitions
export const WORKFLOW_TYPES = {
  WARM_OUTREACH: 'warm-outreach',
  COLD_OUTREACH: 'cold-outreach',
  CONTENT_MARKETING: 'content-marketing',
  PAID_ADS: 'paid-ads',
  LEAD_SCORING: 'lead-scoring',
  REFERRAL_PROGRAM: 'referral-program',
} as const

// Helper functions for common workflows
export const n8nWorkflows = {
  // Warm outreach workflow
  triggerWarmOutreach: async (
    client: N8nClient,
    data: {
      userId: string
      contacts: Array<{
        email: string
        name: string
        company?: string
      }>
      message_template?: string
      follow_up_days?: number[]
    }
  ) => {
    return client.triggerWorkflow(WORKFLOW_TYPES.WARM_OUTREACH, {
      workflowType: WORKFLOW_TYPES.WARM_OUTREACH,
      ...data,
    })
  },

  // Cold outreach workflow
  triggerColdOutreach: async (
    client: N8nClient,
    data: {
      userId: string
      prospects: Array<{
        email: string
        name?: string
        company?: string
        linkedin_url?: string
      }>
      sequence_settings: {
        total_emails: number
        intervals_days: number[]
        personalization_level: 'basic' | 'medium' | 'high'
      }
    }
  ) => {
    return client.triggerWorkflow(WORKFLOW_TYPES.COLD_OUTREACH, {
      workflowType: WORKFLOW_TYPES.COLD_OUTREACH,
      ...data,
    })
  },

  // Content marketing workflow
  triggerContentMarketing: async (
    client: N8nClient,
    data: {
      userId: string
      content_type: 'linkedin' | 'facebook' | 'twitter' | 'blog' | 'email'
      topics: string[]
      schedule: {
        frequency: 'daily' | 'weekly' | 'monthly'
        time: string
        days?: number[]
      }
      industry?: string
    }
  ) => {
    return client.triggerWorkflow(WORKFLOW_TYPES.CONTENT_MARKETING, {
      workflowType: WORKFLOW_TYPES.CONTENT_MARKETING,
      ...data,
    })
  },

  // Paid advertising workflow
  triggerPaidAds: async (
    client: N8nClient,
    data: {
      userId: string
      platform: 'google' | 'facebook' | 'linkedin'
      campaign_type: 'lead_generation' | 'brand_awareness' | 'conversion'
      target_audience: {
        demographics?: any
        interests?: string[]
        behaviors?: string[]
      }
      budget: {
        daily_budget: number
        total_budget: number
      }
      ad_creative: {
        headline: string
        description: string
        cta: string
      }
    }
  ) => {
    return client.triggerWorkflow(WORKFLOW_TYPES.PAID_ADS, {
      workflowType: WORKFLOW_TYPES.PAID_ADS,
      ...data,
    })
  },

  // Lead scoring workflow
  triggerLeadScoring: async (
    client: N8nClient,
    data: {
      userId: string
      leads: Array<{
        id: string
        email: string
        company?: string
        job_title?: string
        industry?: string
        website_activity?: any
        email_engagement?: any
      }>
    }
  ) => {
    return client.triggerWorkflow(WORKFLOW_TYPES.LEAD_SCORING, {
      workflowType: WORKFLOW_TYPES.LEAD_SCORING,
      ...data,
    })
  },
}

// Singleton instance
export const n8nClient = new N8nClient()
