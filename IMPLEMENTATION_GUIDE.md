# 🚀 Complete Implementation Guide: Phases 1-5

## Step-by-Step Setup for Flawless Operation & High Performance

### 📋 Table of Contents

1. [Pre-Implementation Checklist](#pre-implementation-checklist)
2. [Phase 1: Core Four Foundation](#phase-1-core-four-foundation)
3. [Phase 2: Dashboard System](#phase-2-dashboard-system)
4. [Phase 3: Performance Optimization](#phase-3-performance-optimization)
5. [Phase 4A: Referral System](#phase-4a-referral-system)
6. [Phase 4B: Employee System](#phase-4b-employee-system)
7. [Phase 4C: Agency System](#phase-4c-agency-system)
8. [Phase 4D: Affiliate System](#phase-4d-affiliate-system)
9. [Phase 5: Unified Integration](#phase-5-unified-integration)
10. [Performance Optimization](#performance-optimization)
11. [Scaling Strategy](#scaling-strategy)
12. [Testing Procedures](#testing-procedures)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Pre-Implementation Checklist

### Environment Setup

```bash
# 1. Node.js Version (Required: 18.0.0 or higher)
node --version  # Should be 18+

# 2. MongoDB Setup (Required: 5.0 or higher)
mongod --version  # Should be 5.0+

# 3. Git Repository
git --version  # Should be 2.0+
```

### Required Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "next-auth": "^4.24.0",
    "mongodb": "^6.0.0",
    "tailwindcss": "^3.3.0",
    "zod": "^3.22.0",
    "lucide-react": "^0.294.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Environment Variables Setup

```env
# Database
MONGODB_URI=mongodb://localhost:27017/slamOffer
MONGODB_DB=slamOffer

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters

# API Keys (Optional for Phase 1)
OPENAI_API_KEY=your-openai-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
SENDGRID_API_KEY=your-sendgrid-api-key

# Performance Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📊 Phase 1: Core Four Foundation

### Step 1.1: Database Initialization

```bash
# Start MongoDB
mongod --dbpath /path/to/your/db

# Create indexes (Run this script)
node scripts/create-indexes.js
```

**Create Database Indexes Script:**

```javascript
// scripts/create-indexes.js
const { MongoClient } = require('mongodb')

async function createIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db()

  // Core indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('offers').createIndex({ user_id: 1, created_at: -1 })
  await db.collection('offers').createIndex({ user_id: 1, status: 1 })

  console.log('✅ Core indexes created')
  await client.close()
}

createIndexes().catch(console.error)
```

### Step 1.2: Authentication Setup

```typescript
// Verify auth configuration in src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}
```

### Step 1.3: Core Components Testing

```bash
# Test the application
npm run dev

# Verify these pages load without errors:
# - http://localhost:3000/
# - http://localhost:3000/dashboard
# - http://localhost:3000/auth/login
```

**Health Check Endpoint:**

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    await client.db().admin().ping()

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
```

---

## 🎯 Phase 2: Dashboard System

### Step 2.1: Dashboard Components Verification

```bash
# Verify dashboard loads
curl http://localhost:3000/api/health
# Should return: {"status":"healthy","database":"connected"}
```

### Step 2.2: Navigation Testing

**Test Navigation Flow:**

1. Login successfully
2. Navigate to each dashboard section
3. Verify no console errors
4. Check responsive design

**Debug Navigation Issues:**

```typescript
// Add to components/ui/navigation.tsx for debugging
useEffect(() => {
  console.log('Current pathname:', pathname)
  console.log('Navigation items:', navItems)
}, [pathname])
```

### Step 2.3: Performance Monitoring Setup

```typescript
// src/lib/performance.ts
export class PerformanceMonitor {
  static startTimer(label: string) {
    console.time(label)
  }

  static endTimer(label: string) {
    console.timeEnd(label)
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(label)
    try {
      return await fn()
    } finally {
      this.endTimer(label)
    }
  }
}
```

---

## 🏃‍♂️ Phase 3: Performance Optimization

### Step 3.1: Database Optimization

```javascript
// scripts/optimize-database.js
async function optimizeDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db()

  // Create compound indexes for better query performance
  await db.collection('offers').createIndex({
    user_id: 1,
    created_at: -1,
    status: 1,
  })

  // Enable compression
  await db.command({
    collMod: 'offers',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['user_id', 'title', 'created_at'],
        properties: {
          user_id: { bsonType: 'string' },
          title: { bsonType: 'string' },
          created_at: { bsonType: 'date' },
        },
      },
    },
  })

  console.log('✅ Database optimized')
  await client.close()
}
```

### Step 3.2: Next.js Optimization

```javascript
// next.config.ts
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig
```

### Step 3.3: Memory Management

```typescript
// src/lib/memory-management.ts
export class MemoryManager {
  private static cache = new Map()
  private static maxCacheSize = 1000

  static set(key: string, value: any, ttl = 300000) {
    // 5 min default
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
    })
  }

  static get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  static clear() {
    this.cache.clear()
  }
}
```

---

## 🔗 Phase 4A: Referral System

### Step 4A.1: Database Setup

```bash
# Create referral indexes
node scripts/create-referral-indexes.js
```

```javascript
// scripts/create-referral-indexes.js
async function createReferralIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db()

  // Referral indexes
  await db.collection('referrals').createIndex({ user_id: 1, referral_id: 1 }, { unique: true })
  await db.collection('referrals').createIndex({ user_id: 1, status: 1 })
  await db.collection('referrals').createIndex({ tracking_code: 1 }, { unique: true })
  await db.collection('referrals').createIndex({ 'customers.email': 1 })

  console.log('✅ Referral indexes created')
  await client.close()
}
```

### Step 4A.2: API Testing

```bash
# Test referral creation
curl -X POST http://localhost:3000/api/referrals \
  -H "Content-Type: application/json" \
  -d '{
    "referrer_name": "Test User",
    "referrer_email": "test@example.com",
    "commission_rate": 0.1
  }'

# Test referral stats
curl http://localhost:3000/api/referrals/stats
```

### Step 4A.3: Performance Testing

```javascript
// scripts/test-referral-performance.js
async function testReferralPerformance() {
  const start = Date.now()

  // Create 100 test referrals
  for (let i = 0; i < 100; i++) {
    await fetch('http://localhost:3000/api/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrer_name: `Test User ${i}`,
        referrer_email: `test${i}@example.com`,
        commission_rate: 0.1,
      }),
    })
  }

  const end = Date.now()
  console.log(`Created 100 referrals in ${end - start}ms`)

  // Test retrieval performance
  const retrievalStart = Date.now()
  await fetch('http://localhost:3000/api/referrals?limit=100')
  const retrievalEnd = Date.now()
  console.log(`Retrieved 100 referrals in ${retrievalEnd - retrievalStart}ms`)
}
```

---

## 👥 Phase 4B: Employee System

### Step 4B.1: Database Setup

```javascript
// scripts/create-employee-indexes.js
async function createEmployeeIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db()

  // Employee indexes
  await db.collection('employees').createIndex({ user_id: 1, employee_id: 1 }, { unique: true })
  await db.collection('employees').createIndex({ user_id: 1, status: 1 })
  await db.collection('employees').createIndex({ email: 1 })
  await db.collection('employees').createIndex({ 'performance_metrics.total_leads_generated': -1 })

  // Employee commission indexes
  await db.collection('employee_commissions').createIndex({ employee_id: 1, created_at: -1 })
  await db.collection('employee_commissions').createIndex({ user_id: 1, status: 1 })

  console.log('✅ Employee indexes created')
  await client.close()
}
```

### Step 4B.2: Data Validation

```typescript
// src/lib/validation/employee-validation.ts
import { z } from 'zod'

export const employeeSchema = z.object({
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.enum(['sales', 'marketing', 'customer_service', 'operations']),
  role: z.enum(['junior', 'senior', 'manager', 'director']),
  compensation: z.object({
    base_salary: z.number().min(0),
    commission_rate: z.number().min(0).max(1),
    bonus_structure: z.array(
      z.object({
        threshold: z.number().min(0),
        amount: z.number().min(0),
      })
    ),
  }),
})

export function validateEmployeeData(data: any) {
  try {
    return employeeSchema.parse(data)
  } catch (error) {
    throw new Error(`Validation failed: ${error.message}`)
  }
}
```

---

## 🏢 Phase 4C: Agency System

### Step 4C.1: Database Setup

```javascript
// scripts/create-agency-indexes.js
async function createAgencyIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db()

  // Agency indexes
  await db.collection('agencies').createIndex({ user_id: 1, agency_id: 1 }, { unique: true })
  await db.collection('agencies').createIndex({ user_id: 1, status: 1 })
  await db.collection('agencies').createIndex({ 'contact_info.email': 1 })
  await db.collection('agencies').createIndex({ 'performance_metrics.total_revenue_generated': -1 })

  console.log('✅ Agency indexes created')
  await client.close()
}
```

### Step 4C.2: Performance Monitoring

```typescript
// src/lib/agency-performance.ts
export class AgencyPerformanceMonitor {
  static async trackAgencyMetrics(agencyId: string) {
    const startTime = Date.now()

    try {
      // Track performance metrics
      const metrics = await this.calculateMetrics(agencyId)
      const endTime = Date.now()

      console.log(`Agency ${agencyId} metrics calculated in ${endTime - startTime}ms`)
      return metrics
    } catch (error) {
      console.error(`Error tracking agency ${agencyId}:`, error)
      throw error
    }
  }

  private static async calculateMetrics(agencyId: string) {
    // Implementation for metrics calculation
    return {
      leads_generated: 0,
      revenue: 0,
      conversion_rate: 0,
    }
  }
}
```

---

## 🤝 Phase 4D: Affiliate System

### Step 4D.1: Database Setup

```javascript
// scripts/create-affiliate-indexes.js
async function createAffiliateIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db()

  // Affiliate indexes
  await db.collection('affiliates').createIndex({ user_id: 1, affiliate_id: 1 }, { unique: true })
  await db.collection('affiliates').createIndex({ user_id: 1, 'program_details.status': 1 })
  await db
    .collection('affiliates')
    .createIndex({ 'program_details.referral_code': 1 }, { unique: true })
  await db.collection('affiliates').createIndex({ 'hierarchy.sponsor_id': 1 })
  await db
    .collection('affiliates')
    .createIndex({ 'performance_metrics.lifetime_commissions_earned': -1 })

  // Commission indexes
  await db.collection('affiliate_commissions').createIndex({ affiliate_id: 1, created_at: -1 })
  await db.collection('affiliate_commissions').createIndex({ user_id: 1, status: 1 })

  console.log('✅ Affiliate indexes created')
  await client.close()
}
```

### Step 4D.2: Commission Processing

```typescript
// src/lib/affiliate-commission-processor.ts
export class AffiliateCommissionProcessor {
  static async processCommissionBatch(affiliateIds: string[]) {
    const results = []

    for (const affiliateId of affiliateIds) {
      try {
        const commission = await this.processAffiliateCommission(affiliateId)
        results.push({ affiliateId, status: 'success', commission })
      } catch (error) {
        results.push({ affiliateId, status: 'error', error: error.message })
      }
    }

    return results
  }

  private static async processAffiliateCommission(affiliateId: string) {
    // Implementation for commission processing
    return { amount: 0, status: 'processed' }
  }
}
```

---

## 🔗 Phase 5: Unified Integration

### Step 5.1: Integration Testing

```bash
# Test unified system
curl http://localhost:3000/api/unified-leads
curl http://localhost:3000/api/unified-leads/metrics
curl http://localhost:3000/api/system-overview
```

### Step 5.2: Cross-System Validation

```typescript
// scripts/validate-integration.js
async function validateIntegration() {
  console.log('🔍 Validating system integration...')

  // Test unified lead aggregation
  const leadsResponse = await fetch('http://localhost:3000/api/unified-leads')
  const leads = await leadsResponse.json()

  console.log(`✅ Found ${leads.leads?.length || 0} unified leads`)

  // Test metrics aggregation
  const metricsResponse = await fetch('http://localhost:3000/api/unified-leads/metrics')
  const metrics = await metricsResponse.json()

  console.log(`✅ Metrics summary:`, {
    totalLeads: metrics.summary?.totalLeads,
    totalRevenue: metrics.summary?.totalRevenue,
    overallROI: metrics.summary?.overallROI,
  })

  // Test system overview
  const overviewResponse = await fetch('http://localhost:3000/api/system-overview')
  const overview = await overviewResponse.json()

  console.log(`✅ System health: ${overview.systemStats?.systemHealth}`)

  console.log('🎉 Integration validation complete!')
}

validateIntegration().catch(console.error)
```

---

## ⚡ Performance Optimization

### Database Optimization

```javascript
// scripts/optimize-performance.js
async function optimizePerformance() {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db()

  // Enable read concern for better performance
  await db.command({
    setParameter: 1,
    wiredTigerConcurrentReadTransactions: 64,
    wiredTigerConcurrentWriteTransactions: 64,
  })

  // Create background indexes
  const collections = [
    'referrals',
    'employees',
    'agencies',
    'affiliates',
    'affiliate_commissions',
    'employee_commissions',
  ]

  for (const collection of collections) {
    await db.collection(collection).createIndex({ created_at: -1 }, { background: true })
  }

  console.log('✅ Performance optimization complete')
  await client.close()
}
```

### Application Caching

```typescript
// src/lib/cache.ts
class ApplicationCache {
  private static instance: ApplicationCache
  private cache = new Map()
  private ttl = 300000 // 5 minutes

  static getInstance() {
    if (!this.instance) {
      this.instance = new ApplicationCache()
    }
    return this.instance
  }

  set(key: string, value: any, customTTL?: number) {
    this.cache.set(key, {
      value,
      expires: Date.now() + (customTTL || this.ttl),
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item || Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    return item.value
  }

  clear() {
    this.cache.clear()
  }
}

export const cache = ApplicationCache.getInstance()
```

---

## 📈 Scaling Strategy

### 1. Database Scaling

```javascript
// mongodb-scaling.js
const scalingConfig = {
  // Connection pooling
  maxPoolSize: 100,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,

  // Read preferences
  readPreference: 'secondaryPreferred',

  // Write concerns
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 5000,
  },
}
```

### 2. Application Scaling

```typescript
// src/lib/scaling.ts
export class ScalingManager {
  static async handleHighLoad() {
    // Implement connection pooling
    const maxConnections = process.env.MAX_DB_CONNECTIONS || 100

    // Implement query optimization
    const queryTimeout = process.env.QUERY_TIMEOUT || 5000

    // Implement caching strategy
    const cacheEnabled = process.env.CACHE_ENABLED === 'true'

    return {
      maxConnections,
      queryTimeout,
      cacheEnabled,
    }
  }

  static async monitorPerformance() {
    const metrics = {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
    }

    console.log('Performance metrics:', metrics)
    return metrics
  }
}
```

### 3. Load Balancing Setup

```nginx
# nginx.conf for load balancing
upstream slamoffer_backend {
    least_conn;
    server 127.0.0.1:3000 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3001 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3002 weight=1 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://slamoffer_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
```

---

## 🧪 Testing Procedures

### 1. Unit Tests

```typescript
// tests/api/referrals.test.ts
import { describe, test, expect } from '@jest/globals'

describe('Referral API', () => {
  test('should create referral successfully', async () => {
    const response = await fetch('/api/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrer_name: 'Test User',
        referrer_email: 'test@example.com',
        commission_rate: 0.1,
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.referral).toBeDefined()
  })
})
```

### 2. Integration Tests

```typescript
// tests/integration/unified-system.test.ts
describe('Unified System Integration', () => {
  test('should aggregate leads from all sources', async () => {
    // Create test data in each system
    await createTestReferral()
    await createTestEmployee()
    await createTestAffiliate()

    // Test unified aggregation
    const response = await fetch('/api/unified-leads')
    const data = await response.json()

    expect(data.leads.length).toBeGreaterThan(0)
    expect(data.leads.some(l => l.type === 'referral')).toBe(true)
    expect(data.leads.some(l => l.type === 'employee')).toBe(true)
    expect(data.leads.some(l => l.type === 'affiliate')).toBe(true)
  })
})
```

### 3. Performance Tests

```typescript
// tests/performance/load.test.ts
describe('Performance Tests', () => {
  test('should handle 1000 concurrent requests', async () => {
    const requests = Array(1000)
      .fill(null)
      .map(() => fetch('/api/unified-leads/metrics'))

    const start = Date.now()
    const responses = await Promise.all(requests)
    const end = Date.now()

    expect(responses.every(r => r.ok)).toBe(true)
    expect(end - start).toBeLessThan(10000) // Less than 10 seconds
  })
})
```

### 4. End-to-End Tests

```typescript
// tests/e2e/user-flow.test.ts
describe('Complete User Flow', () => {
  test('should complete full lead generation cycle', async () => {
    // 1. User logs in
    await loginUser()

    // 2. Creates referral
    const referral = await createReferral()

    // 3. Views unified dashboard
    const dashboard = await loadUnifiedDashboard()
    expect(dashboard.leads.some(l => l.id.includes(referral.id))).toBe(true)

    // 4. Processes commission
    await processCommission(referral.id)

    // 5. Exports report
    const report = await exportReport()
    expect(report.summary.totalLeads).toBeGreaterThan(0)
  })
})
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues

```typescript
// Debug database connection
async function debugDatabase() {
  try {
    const client = await clientPromise
    const db = client.db()
    const result = await db.admin().ping()
    console.log('✅ Database connected:', result)
  } catch (error) {
    console.error('❌ Database connection failed:', error)

    // Common fixes:
    // 1. Check MONGODB_URI in .env
    // 2. Ensure MongoDB is running
    // 3. Check network connectivity
    // 4. Verify database credentials
  }
}
```

#### 2. Performance Issues

```typescript
// Monitor slow queries
async function monitorQueries() {
  const client = await clientPromise
  const db = client.db()

  // Enable profiling for slow queries
  await db.command({
    profile: 2,
    slowms: 100, // Log queries slower than 100ms
  })

  // Check profiler data
  const profile = await db.collection('system.profile').find().toArray()
  console.log('Slow queries:', profile)
}
```

#### 3. Memory Leaks

```typescript
// Monitor memory usage
function monitorMemory() {
  setInterval(() => {
    const usage = process.memoryUsage()
    console.log('Memory usage:', {
      rss: Math.round(usage.rss / 1024 / 1024) + ' MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + ' MB',
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB',
      external: Math.round(usage.external / 1024 / 1024) + ' MB',
    })

    // Alert if memory usage is too high
    if (usage.heapUsed > 1000 * 1024 * 1024) {
      // 1GB
      console.warn('⚠️ High memory usage detected')
    }
  }, 30000) // Check every 30 seconds
}
```

#### 4. API Rate Limiting

```typescript
// Implement rate limiting
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
})

// Apply to API routes
export { limiter as default }
```

### Error Handling Best Practices

```typescript
// src/lib/error-handler.ts
export class ErrorHandler {
  static async handleDatabaseError(error: any) {
    console.error('Database error:', error)

    if (error.code === 11000) {
      return { error: 'Duplicate entry', code: 'DUPLICATE' }
    }

    if (error.name === 'ValidationError') {
      return { error: 'Invalid data', code: 'VALIDATION' }
    }

    return { error: 'Database error', code: 'DATABASE' }
  }

  static async handleAPIError(error: any) {
    console.error('API error:', error)

    return {
      error: 'Internal server error',
      code: 'API_ERROR',
      timestamp: new Date().toISOString(),
    }
  }
}
```

---

## 📊 Monitoring and Alerts

### 1. Health Check System

```typescript
// src/lib/health-monitor.ts
export class HealthMonitor {
  static async checkSystemHealth() {
    const checks = {
      database: await this.checkDatabase(),
      memory: await this.checkMemory(),
      apis: await this.checkAPIs(),
      performance: await this.checkPerformance(),
    }

    const overallHealth = Object.values(checks).every(check => check.status === 'healthy')

    return {
      overall: overallHealth ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString(),
    }
  }

  private static async checkDatabase() {
    try {
      const client = await clientPromise
      await client.db().admin().ping()
      return { status: 'healthy', responseTime: Date.now() }
    } catch (error) {
      return { status: 'unhealthy', error: error.message }
    }
  }

  private static async checkMemory() {
    const usage = process.memoryUsage()
    const usedPercent = (usage.heapUsed / usage.heapTotal) * 100

    return {
      status: usedPercent < 90 ? 'healthy' : 'unhealthy',
      usedPercent: Math.round(usedPercent),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB',
    }
  }

  private static async checkAPIs() {
    const endpoints = [
      '/api/health',
      '/api/unified-leads',
      '/api/referrals',
      '/api/employees',
      '/api/affiliates',
    ]

    const results = await Promise.all(
      endpoints.map(async endpoint => {
        try {
          const response = await fetch(`http://localhost:3000${endpoint}`)
          return { endpoint, status: response.ok ? 'healthy' : 'unhealthy' }
        } catch (error) {
          return { endpoint, status: 'unhealthy', error: error.message }
        }
      })
    )

    return {
      status: results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy',
      endpoints: results,
    }
  }

  private static async checkPerformance() {
    const start = Date.now()

    // Test database query performance
    try {
      const client = await clientPromise
      await client.db().collection('users').findOne()
      const responseTime = Date.now() - start

      return {
        status: responseTime < 1000 ? 'healthy' : 'unhealthy',
        responseTime: responseTime + 'ms',
      }
    } catch (error) {
      return { status: 'unhealthy', error: error.message }
    }
  }
}
```

### 2. Automated Monitoring Script

```bash
#!/bin/bash
# scripts/monitor.sh

echo "🔍 Starting system monitoring..."

# Check if application is running
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ Application is not responding"
    # Restart application
    npm run restart
    exit 1
fi

# Check system health
HEALTH=$(curl -s http://localhost:3000/api/health | jq -r '.status')
if [ "$HEALTH" != "healthy" ]; then
    echo "⚠️ System health check failed"
    # Send alert
    echo "System health issue detected at $(date)" | mail -s "SlamOffer Health Alert" admin@yourcompany.com
fi

# Check database performance
DB_RESPONSE=$(curl -w "%{time_total}" -s -o /dev/null http://localhost:3000/api/system-overview)
if (( $(echo "$DB_RESPONSE > 2.0" | bc -l) )); then
    echo "⚠️ Slow database response: ${DB_RESPONSE}s"
fi

echo "✅ Monitoring complete"
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Database indexes created
- [ ] Environment variables set
- [ ] Performance optimization applied
- [ ] Monitoring setup
- [ ] Error handling implemented

### Production Deployment

```bash
# 1. Build application
npm run build

# 2. Run production tests
npm run test:production

# 3. Create database backup
mongodump --uri="$MONGODB_URI" --out=backup-$(date +%Y%m%d)

# 4. Deploy application
npm run deploy

# 5. Verify deployment
curl https://your-domain.com/api/health

# 6. Run smoke tests
npm run test:smoke
```

### Post-Deployment

- [ ] Health checks passing
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] User flows working
- [ ] Monitoring alerts configured

---

## 📝 Maintenance Schedule

### Daily

- Check application health
- Monitor error rates
- Review performance metrics
- Backup critical data

### Weekly

- Analyze performance trends
- Review and optimize slow queries
- Update dependencies
- Clean up logs

### Monthly

- Full system performance review
- Database optimization
- Security audit
- Capacity planning review

---

This comprehensive implementation guide ensures your SlamOffer application runs flawlessly with high performance at scale. Follow each phase step-by-step, implement the monitoring and optimization strategies, and maintain regular testing procedures for optimal results.
