import { Lead, Campaign, LeadScore, LeadActivity } from '@/lib/models/lead'

// Simple in-memory cache for development
class InMemoryCache {
  private cache = new Map<string, { data: any; expires: number }>()

  async get(key: string): Promise<any> {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  async set(key: string, data: any, ttl: number = 300): Promise<void> {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl * 1000,
    })
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async invalidatePattern(pattern: string): Promise<void> {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

class CacheManager {
  private cache: InMemoryCache
  private defaultTTL = 300 // 5 minutes

  constructor() {
    this.cache = new InMemoryCache()
  }

  // Cache keys
  private keys = {
    leads: (userId: string) => `leads:${userId}`,
    leadStats: (userId: string) => `lead-stats:${userId}`,
    campaigns: (userId: string) => `campaigns:${userId}`,
    analytics: (userId: string) => `analytics:${userId}`,
    workflowStatus: (executionId: string) => `workflow:${executionId}`,
  }

  // Lead caching
  async getLeads(userId: string): Promise<Lead[] | null> {
    return this.cache.get(this.keys.leads(userId))
  }

  async setLeads(userId: string, leads: Lead[], ttl?: number): Promise<void> {
    await this.cache.set(this.keys.leads(userId), leads, ttl || this.defaultTTL)
  }

  async invalidateLeads(userId: string): Promise<void> {
    await this.cache.del(this.keys.leads(userId))
    await this.cache.del(this.keys.leadStats(userId))
    await this.cache.del(this.keys.analytics(userId))
  }

  // Stats caching
  async getStats(userId: string): Promise<any> {
    return this.cache.get(this.keys.leadStats(userId))
  }

  async setStats(userId: string, stats: any, ttl?: number): Promise<void> {
    await this.cache.set(this.keys.leadStats(userId), stats, ttl || this.defaultTTL)
  }

  // Campaign caching
  async getCampaigns(userId: string): Promise<Campaign[] | null> {
    return this.cache.get(this.keys.campaigns(userId))
  }

  async setCampaigns(userId: string, campaigns: Campaign[], ttl?: number): Promise<void> {
    await this.cache.set(this.keys.campaigns(userId), campaigns, ttl || this.defaultTTL)
  }

  async invalidateCampaigns(userId: string): Promise<void> {
    await this.cache.del(this.keys.campaigns(userId))
  }

  // Analytics caching
  async getAnalytics(userId: string): Promise<any> {
    return this.cache.get(this.keys.analytics(userId))
  }

  async setAnalytics(userId: string, analytics: any, ttl?: number): Promise<void> {
    await this.cache.set(this.keys.analytics(userId), analytics, ttl || this.defaultTTL)
  }

  // Workflow status caching
  async getWorkflowStatus(executionId: string): Promise<any> {
    return this.cache.get(this.keys.workflowStatus(executionId))
  }

  async setWorkflowStatus(executionId: string, status: any, ttl?: number): Promise<void> {
    await this.cache.set(this.keys.workflowStatus(executionId), status, ttl || 60) // 1 minute for real-time data
  }

  // Batch operations
  async invalidateUserData(userId: string): Promise<void> {
    await this.invalidateLeads(userId)
    await this.invalidateCampaigns(userId)
    await this.cache.invalidatePattern(userId)
  }

  // Health check
  async healthCheck(): Promise<{ status: string; cacheSize: number }> {
    return {
      status: 'healthy',
      cacheSize: (this.cache as any).cache.size,
    }
  }
}

export const cacheManager = new CacheManager()
export type { CacheManager }
