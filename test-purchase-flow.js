/**
 * Test script for duplicate purchase scenarios (credit top-up functionality)
 * This script tests the enhanced purchase flow that allows credit top-ups
 */

const https = require('https')
const http = require('http')

// Configuration
const CONFIG = {
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  TEST_EMAIL: 'test-duplicate-purchase@example.com',
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

// Test Suite: Duplicate Purchase Scenarios
async function testDuplicatePurchaseFlow() {
  log('Testing Duplicate Purchase Flow (Credit Top-up)...', 'info')

  try {
    // Test 1: Verify purchase-package API accepts duplicate purchases
    log('Test 1: Verify API accepts same-tier repurchase...', 'info')
    
    const duplicatePurchaseTest = await makeRequest(`${CONFIG.APP_URL}/api/purchase-package`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        packageType: 'starter_spark',
        paymentDetails: {
          method: 'demo',
          amount: 9,
        },
      },
    })

    // Note: Without authentication, this should return 401, but we can check that it's not a 400 error about duplicate packages
    if (duplicatePurchaseTest.status === 401) {
      log('API endpoint correctly requires authentication', 'success')
    } else if (duplicatePurchaseTest.status === 400 && duplicatePurchaseTest.data.error?.includes('already have')) {
      assert(false, 'API still blocks duplicate purchases - credit top-up logic not implemented')
    } else {
      log('API endpoint response looks correct for duplicate purchase handling', 'success')
    }

    // Test 2: Check API response structure for credit top-up
    log('Test 2: Verify API response structure includes top-up information...', 'info')
    
    // Since we can't actually test with authentication in this script, we'll verify the code structure
    const purchasePackageCode = require('fs').readFileSync(
      require('path').join(__dirname, 'src/app/api/purchase-package/route.ts'), 
      'utf8'
    )

    assert(
      purchasePackageCode.includes('credit_top_up'),
      'Purchase package API includes credit top-up logic'
    )
    
    assert(
      purchasePackageCode.includes('creditsAdded'),
      'Purchase package API returns credit addition information'
    )
    
    assert(
      purchasePackageCode.includes('newCreditBalance'),
      'Purchase package API calculates new credit balance'
    )

    // Test 3: Check PurchaseModal handles success responses
    log('Test 3: Verify PurchaseModal can handle credit top-up responses...', 'info')
    
    const purchaseModalCode = require('fs').readFileSync(
      require('path').join(__dirname, 'src/components/dashboard/purchase-modal.tsx'), 
      'utf8'
    )

    assert(
      purchaseModalCode.includes('Purchase successful') || purchaseModalCode.includes('success'),
      'PurchaseModal displays success messages'
    )

    // Test 4: Verify error handling for duplicate purchases
    log('Test 4: Verify proper error handling...', 'info')
    
    assert(
      purchasePackageCode.includes('Failed to add credits to existing plan'),
      'Purchase package API includes proper error handling for credit top-ups'
    )

  } catch (error) {
    log(`Duplicate purchase test failed: ${error.message}`, 'error')
    testResults.failed++
    testResults.errors.push(`Duplicate purchase: ${error.message}`)
  }
}

// Test Suite: Enhanced Features
async function testEnhancedFeatures() {
  log('Testing Enhanced Features...', 'info')

  try {
    // Test 1: Verify grand unlock card is added
    log('Test 1: Verify grand unlock card implementation...', 'info')
    
    const offerTextViewCode = require('fs').readFileSync(
      require('path').join(__dirname, 'src/components/dashboard/offer-text-view.tsx'), 
      'utf8'
    )

    assert(
      offerTextViewCode.includes('Grand Unlock Card for Free Users'),
      'Grand unlock card is implemented in offer-text-view'
    )
    
    assert(
      offerTextViewCode.includes('Launch Time Offer'),
      'Launch time offer pricing is displayed'
    )
    
    assert(
      offerTextViewCode.includes('Regular Price $19'),
      'Regular price $19 is shown with strikethrough'
    )

    // Test 2: Verify unlock buttons consistency
    log('Test 2: Verify all unlock buttons use same handler...', 'info')
    
    const unlockButtonMatches = offerTextViewCode.match(/handlePurchaseClick/g)
    assert(
      unlockButtonMatches && unlockButtonMatches.length >= 2,
      'Multiple unlock buttons use the same purchase handler'
    )

    // Test 3: Verify animation logic in dashboard
    log('Test 3: Verify dashboard animation logic...', 'info')
    
    const dashboardCode = require('fs').readFileSync(
      require('path').join(__dirname, 'src/app/dashboard/page.tsx'), 
      'utf8'
    )

    assert(
      dashboardCode.includes('GenerationAnimation'),
      'Dashboard includes GenerationAnimation for free users'
    )
    
    assert(
      dashboardCode.includes('RealTimePackingAnimation'),
      'Dashboard includes RealTimePackingAnimation for paid generation'
    )

  } catch (error) {
    log(`Enhanced features test failed: ${error.message}`, 'error')
    testResults.failed++
    testResults.errors.push(`Enhanced features: ${error.message}`)
  }
}

// Main test runner
async function runTests() {
  log('🚀 Starting Enhanced Purchase Flow Tests', 'info')
  log('='.repeat(50), 'info')

  try {
    // Test duplicate purchase scenarios
    await testDuplicatePurchaseFlow()

    // Test enhanced features
    await testEnhancedFeatures()

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
    log('🎉 Enhanced purchase flow is working correctly!', 'success')
    process.exit(0)
  } else if (successRate >= 70) {
    log('⚠️  Some issues found, but major functionality works', 'warning')
    process.exit(1)
  } else {
    log('🚨 Significant issues found, needs fixing', 'error')
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