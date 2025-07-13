/**
 * Grand Slam Offer Application - Automated Testing Script
 * Run this script to validate core functionality before production deployment
 */

const { MongoClient } = require('mongodb')
const https = require('https')
const http = require('http')

// Configuration
const CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/grand-slam-offer',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  TEST_EMAIL: 'test-automation@example.com',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
}

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  warnings: [],
}

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = {
    info: '🔍',
    success: '✅',
    error: '❌',
    warning: '⚠️',
  }[type]

  console.log(`[${timestamp}] ${prefix} ${message}`)
}

function assert(condition, message) {
  if (condition) {
    testResults.passed++
    log(`PASS: ${message}`, 'success')
  } else {
    testResults.failed++
    testResults.errors.push(message)
    log(`FAIL: ${message}`, 'error')
  }
}

function warn(message) {
  testResults.warnings.push(message)
  log(`WARNING: ${message}`, 'warning')
}

// Database connection
async function connectToDatabase() {
  try {
    const client = new MongoClient(CONFIG.MONGODB_URI)
    await client.connect()
    log('Connected to MongoDB', 'success')
    return client.db()
  } catch (error) {
    log(`Database connection failed: ${error.message}`, 'error')
    throw error
  }
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https')
    const requestModule = isHttps ? https : http

    const req = requestModule.request(url, options, res => {
      let data = ''
      res.on('data', chunk => (data += chunk))
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({ status: res.statusCode, data: jsonData })
        } catch (e) {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })

    req.on('error', reject)

    if (options.body) {
      req.write(JSON.stringify(options.body))
    }

    req.end()
  })
}

// Test Suite 1: Database Integrity
async function testDatabaseIntegrity(db) {
  log('Testing Database Integrity...', 'info')

  try {
    // Check required collections exist
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)

    assert(collectionNames.includes('user_profiles'), 'user_profiles collection exists')
    assert(collectionNames.includes('offers'), 'offers collection exists')
    assert(collectionNames.includes('background_jobs'), 'background_jobs collection exists')

    // Check for duplicate user profiles
    const duplicates = await db
      .collection('user_profiles')
      .aggregate([
        { $group: { _id: '$email', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
      ])
      .toArray()

    assert(duplicates.length === 0, 'No duplicate user profiles found')

    // Check for users with negative credits
    const negativeCredits = await db
      .collection('user_profiles')
      .find({
        credits_remaining: { $lt: 0 },
      })
      .toArray()

    assert(negativeCredits.length === 0, 'No users with negative credits')

    // Check for invalid subscription tiers
    const invalidTiers = await db
      .collection('user_profiles')
      .find({
        subscription_tier: { $nin: ['free', 'starter_spark', 'growth_engine', 'agency_arsenal'] },
      })
      .toArray()

    assert(invalidTiers.length === 0, 'All users have valid subscription tiers')
  } catch (error) {
    log(`Database integrity test failed: ${error.message}`, 'error')
    testResults.failed++
    testResults.errors.push(`Database integrity: ${error.message}`)
  }
}

// Test Suite 2: API Endpoints
async function testAPIEndpoints() {
  log('Testing API Endpoints...', 'info')

  try {
    // Test health check (if available)
    const healthCheck = await makeRequest(`${CONFIG.APP_URL}/api/health`)
    if (healthCheck.status === 200) {
      log('Health check endpoint working', 'success')
    } else {
      warn('Health check endpoint not available or not working')
    }

    // Test authentication endpoints
    const authCheck = await makeRequest(`${CONFIG.APP_URL}/api/auth/session`)
    assert(authCheck.status !== 500, 'Auth session endpoint not throwing 500 error')

    // Test user profile endpoint (should require auth)
    const profileCheck = await makeRequest(`${CONFIG.APP_URL}/api/user/profile`)
    assert(profileCheck.status === 401, 'User profile endpoint requires authentication')

    // Test usage check endpoint (should require auth)
    const usageCheck = await makeRequest(`${CONFIG.APP_URL}/api/user/usage-check`)
    assert(usageCheck.status === 401, 'Usage check endpoint requires authentication')
  } catch (error) {
    log(`API endpoint test failed: ${error.message}`, 'error')
    testResults.failed++
    testResults.errors.push(`API endpoints: ${error.message}`)
  }
}

// Test Suite 3: Environment Configuration
async function testEnvironmentConfig() {
  log('Testing Environment Configuration...', 'info')

  // Check required environment variables
  const requiredEnvVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'MONGODB_URI',
    'OPENAI_API_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ]

  requiredEnvVars.forEach(envVar => {
    assert(process.env[envVar], `${envVar} environment variable is set`)
  })

  // Test MongoDB connection string format
  if (process.env.MONGODB_URI) {
    assert(
      process.env.MONGODB_URI.startsWith('mongodb://') ||
        process.env.MONGODB_URI.startsWith('mongodb+srv://'),
      'MongoDB URI has correct format'
    )
  }

  // Test OpenAI API key format
  if (process.env.OPENAI_API_KEY) {
    assert(process.env.OPENAI_API_KEY.startsWith('sk-'), 'OpenAI API key has correct format')
  }
}

// Test Suite 4: Application Startup
async function testApplicationStartup() {
  log('Testing Application Startup...', 'info')

  try {
    // Test if application is running
    const response = await makeRequest(CONFIG.APP_URL)
    assert(response.status === 200, 'Application is running and responding')

    // Test if main page loads
    if (typeof response.data === 'string') {
      assert(
        response.data.includes('Grand Slam Offer') || response.data.includes('html'),
        'Main page loads correctly'
      )
    }
  } catch (error) {
    log(`Application startup test failed: ${error.message}`, 'error')
    testResults.failed++
    testResults.errors.push(`Application startup: ${error.message}`)
  }
}

// Test Suite 5: User Tier Logic Validation
async function testUserTierLogic(db) {
  log('Testing User Tier Logic...', 'info')

  try {
    // Test free tier users
    const freeUsers = await db
      .collection('user_profiles')
      .find({
        subscription_tier: 'free',
      })
      .toArray()

    freeUsers.forEach(user => {
      assert(user.daily_limit === 1, `Free user ${user.email} has correct daily limit`)
      assert(user.credits_remaining <= 3, `Free user ${user.email} has valid credit count`)
    })

    // Test starter spark users
    const starterUsers = await db
      .collection('user_profiles')
      .find({
        subscription_tier: 'starter_spark',
      })
      .toArray()

    starterUsers.forEach(user => {
      assert(
        user.package_details?.regeneration_count !== undefined,
        `Starter Spark user ${user.email} has regeneration count`
      )
    })

    // Test growth engine users
    const growthUsers = await db
      .collection('user_profiles')
      .find({
        subscription_tier: 'growth_engine',
      })
      .toArray()

    growthUsers.forEach(user => {
      assert(
        user.credits_remaining <= 10,
        `Growth Engine user ${user.email} has valid credit count`
      )
    })

    // Test agency arsenal users
    const agencyUsers = await db
      .collection('user_profiles')
      .find({
        subscription_tier: 'agency_arsenal',
      })
      .toArray()

    agencyUsers.forEach(user => {
      assert(
        user.credits_remaining <= 30,
        `Agency Arsenal user ${user.email} has valid credit count`
      )
    })
  } catch (error) {
    log(`User tier logic test failed: ${error.message}`, 'error')
    testResults.failed++
    testResults.errors.push(`User tier logic: ${error.message}`)
  }
}

// Test Suite 6: Background Jobs
async function testBackgroundJobs(db) {
  log('Testing Background Jobs...', 'info')

  try {
    // Check for stuck background jobs
    const stuckJobs = await db
      .collection('background_jobs')
      .find({
        status: 'processing',
        created_at: { $lt: new Date(Date.now() - 10 * 60 * 1000) }, // 10 minutes ago
      })
      .toArray()

    if (stuckJobs.length > 0) {
      warn(`Found ${stuckJobs.length} potentially stuck background jobs`)
    } else {
      log('No stuck background jobs found', 'success')
    }

    // Check for failed jobs
    const failedJobs = await db
      .collection('background_jobs')
      .find({
        status: 'failed',
      })
      .toArray()

    if (failedJobs.length > 0) {
      warn(`Found ${failedJobs.length} failed background jobs`)
    }

    // Check job completion rate
    const totalJobs = await db.collection('background_jobs').countDocuments()
    const completedJobs = await db.collection('background_jobs').countDocuments({
      status: 'completed',
    })

    if (totalJobs > 0) {
      const completionRate = (completedJobs / totalJobs) * 100
      assert(
        completionRate >= 80,
        `Background job completion rate is acceptable (${completionRate.toFixed(1)}%)`
      )
    }
  } catch (error) {
    log(`Background jobs test failed: ${error.message}`, 'error')
    testResults.failed++
    testResults.errors.push(`Background jobs: ${error.message}`)
  }
}

// Main test runner
async function runTests() {
  log('🚀 Starting Grand Slam Offer Application Tests', 'info')
  log('='.repeat(50), 'info')

  try {
    // Test environment configuration first
    await testEnvironmentConfig()

    // Test application startup
    await testApplicationStartup()

    // Test API endpoints
    await testAPIEndpoints()

    // Connect to database for database-specific tests
    const db = await connectToDatabase()

    // Test database integrity
    await testDatabaseIntegrity(db)

    // Test user tier logic
    await testUserTierLogic(db)

    // Test background jobs
    await testBackgroundJobs(db)

    // Close database connection
    await db.client.close()
  } catch (error) {
    log(`Test execution failed: ${error.message}`, 'error')
    testResults.failed++
    testResults.errors.push(`Test execution: ${error.message}`)
  }

  // Print results
  log('='.repeat(50), 'info')
  log('🎯 Test Results Summary', 'info')
  log(`✅ Passed: ${testResults.passed}`, 'success')
  log(`❌ Failed: ${testResults.failed}`, 'error')
  log(`⚠️  Warnings: ${testResults.warnings.length}`, 'warning')

  if (testResults.errors.length > 0) {
    log('\n❌ Failed Tests:', 'error')
    testResults.errors.forEach(error => {
      log(`  • ${error}`, 'error')
    })
  }

  if (testResults.warnings.length > 0) {
    log('\n⚠️  Warnings:', 'warning')
    testResults.warnings.forEach(warning => {
      log(`  • ${warning}`, 'warning')
    })
  }

  const totalTests = testResults.passed + testResults.failed
  const successRate = totalTests > 0 ? (testResults.passed / totalTests) * 100 : 0

  log(`\n📊 Success Rate: ${successRate.toFixed(1)}%`, 'info')

  if (successRate >= 90) {
    log('🎉 Application is ready for production!', 'success')
    process.exit(0)
  } else if (successRate >= 70) {
    log('⚠️  Application needs minor fixes before production', 'warning')
    process.exit(1)
  } else {
    log('🚨 Application needs significant fixes before production', 'error')
    process.exit(1)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    log(`Critical error: ${error.message}`, 'error')
    process.exit(1)
  })
}

module.exports = {
  runTests,
  testResults,
  CONFIG,
}
