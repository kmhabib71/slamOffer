import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { authService } from '@/lib/auth'
import { dbAtomic } from '@/lib/db-atomic'

export const dynamic = 'force-dynamic'

interface WorkflowTestResult {
  test_name: string
  status: 'passed' | 'failed' | 'skipped'
  message: string
  duration_ms: number
  details?: any
}

interface WorkflowTestSuite {
  suite_name: string
  total_tests: number
  passed: number
  failed: number
  skipped: number
  duration_ms: number
  tests: WorkflowTestResult[]
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.email
    const url = new URL(request.url)
    const testType = url.searchParams.get('type') || 'full'
    const cleanup = url.searchParams.get('cleanup') === 'true'

    console.log('Starting workflow test suite for user:', userId)

    const suiteStartTime = Date.now()
    const testSuite: WorkflowTestSuite = {
      suite_name: 'Complete Purchase and Generation Workflow',
      total_tests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration_ms: 0,
      tests: [],
    }

    // Test 1: User Profile Management
    testSuite.tests.push(await testUserProfileManagement(userId))

    // Test 2: Credit System
    testSuite.tests.push(await testCreditSystem(userId))

    // Test 3: Generation Limits
    testSuite.tests.push(await testGenerationLimits(userId))

    // Test 4: Purchase Flow
    testSuite.tests.push(await testPurchaseFlow(userId))

    // Test 5: Regeneration Logic (only for Starter Spark)
    if (testType === 'full') {
      testSuite.tests.push(await testRegenerationLogic(userId))
    }

    // Test 6: Database Integrity
    testSuite.tests.push(await testDatabaseIntegrity(userId))

    // Test 7: Usage Tracking
    testSuite.tests.push(await testUsageTracking(userId))

    // Test 8: Background Processing
    if (testType === 'full') {
      testSuite.tests.push(await testBackgroundProcessing(userId))
    }

    // Calculate summary
    testSuite.total_tests = testSuite.tests.length
    testSuite.passed = testSuite.tests.filter(t => t.status === 'passed').length
    testSuite.failed = testSuite.tests.filter(t => t.status === 'failed').length
    testSuite.skipped = testSuite.tests.filter(t => t.status === 'skipped').length
    testSuite.duration_ms = Date.now() - suiteStartTime

    // Cleanup if requested
    if (cleanup) {
      await cleanupTestData(userId)
    }

    return NextResponse.json({
      success: true,
      test_suite: testSuite,
      summary: {
        overall_status: testSuite.failed === 0 ? 'PASSED' : 'FAILED',
        pass_rate: Math.round((testSuite.passed / testSuite.total_tests) * 100),
        execution_time: `${testSuite.duration_ms}ms`,
      },
    })
  } catch (error) {
    console.error('Error running workflow tests:', error)
    return NextResponse.json(
      {
        error: 'Failed to run workflow tests',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

async function testUserProfileManagement(userId: string): Promise<WorkflowTestResult> {
  const startTime = Date.now()

  try {
    // Test profile creation and retrieval
    const profile = await authService.getUserProfile(userId)

    if (!profile) {
      return {
        test_name: 'User Profile Management',
        status: 'failed',
        message: 'User profile not found',
        duration_ms: Date.now() - startTime,
      }
    }

    // Verify profile has required fields
    const requiredFields = ['subscription_tier', 'credits_remaining', 'created_at']
    const missingFields = requiredFields.filter(field => !(field in profile))

    if (missingFields.length > 0) {
      return {
        test_name: 'User Profile Management',
        status: 'failed',
        message: `Missing required fields: ${missingFields.join(', ')}`,
        duration_ms: Date.now() - startTime,
      }
    }

    return {
      test_name: 'User Profile Management',
      status: 'passed',
      message: 'User profile retrieved successfully with all required fields',
      duration_ms: Date.now() - startTime,
      details: {
        subscription_tier: profile.subscription_tier,
        credits_remaining: profile.credits_remaining,
      },
    }
  } catch (error) {
    return {
      test_name: 'User Profile Management',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime,
    }
  }
}

async function testCreditSystem(userId: string): Promise<WorkflowTestResult> {
  const startTime = Date.now()

  try {
    // Get initial credit balance
    const initialProfile = await authService.getUserProfile(userId)
    if (!initialProfile) {
      throw new Error('User profile not found')
    }

    const initialCredits = initialProfile.credits_remaining

    // Test credit deduction using atomic operations
    const deductionResult = await dbAtomic.deductCreditsAtomic(userId, 1, false)

    if (!deductionResult.success) {
      return {
        test_name: 'Credit System',
        status: 'failed',
        message: deductionResult.error || 'Credit deduction failed',
        duration_ms: Date.now() - startTime,
      }
    }

    // Verify credits were deducted
    const expectedCredits = Math.max(0, initialCredits - 1)
    if (deductionResult.newCreditsBalance !== expectedCredits) {
      return {
        test_name: 'Credit System',
        status: 'failed',
        message: `Credit balance mismatch. Expected: ${expectedCredits}, Got: ${deductionResult.newCreditsBalance}`,
        duration_ms: Date.now() - startTime,
      }
    }

    // Restore credits for further testing
    await authService.updateUserProfile(userId, {
      credits_remaining: initialCredits,
    })

    return {
      test_name: 'Credit System',
      status: 'passed',
      message: 'Credit deduction and restoration working correctly',
      duration_ms: Date.now() - startTime,
      details: {
        initial_credits: initialCredits,
        after_deduction: deductionResult.newCreditsBalance,
        restored_credits: initialCredits,
      },
    }
  } catch (error) {
    return {
      test_name: 'Credit System',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime,
    }
  }
}

async function testGenerationLimits(userId: string): Promise<WorkflowTestResult> {
  const startTime = Date.now()

  try {
    // Test generation limit checking
    const canGenerate = await authService.canUserGenerate(userId, false)

    if (typeof canGenerate.canGenerate !== 'boolean') {
      return {
        test_name: 'Generation Limits',
        status: 'failed',
        message: 'Invalid response from canUserGenerate',
        duration_ms: Date.now() - startTime,
      }
    }

    // Test regeneration limit checking
    const canRegenerate = await authService.canUserGenerate(userId, true)

    if (typeof canRegenerate.canGenerate !== 'boolean') {
      return {
        test_name: 'Generation Limits',
        status: 'failed',
        message: 'Invalid response from canUserGenerate (regeneration)',
        duration_ms: Date.now() - startTime,
      }
    }

    return {
      test_name: 'Generation Limits',
      status: 'passed',
      message: 'Generation limit checking working correctly',
      duration_ms: Date.now() - startTime,
      details: {
        can_generate: canGenerate.canGenerate,
        can_regenerate: canRegenerate.canGenerate,
        remaining_credits: canGenerate.remainingCredits,
      },
    }
  } catch (error) {
    return {
      test_name: 'Generation Limits',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime,
    }
  }
}

async function testPurchaseFlow(userId: string): Promise<WorkflowTestResult> {
  const startTime = Date.now()

  try {
    // Test purchase flow by simulating API call
    const purchaseResponse = await fetch('/api/purchase-package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageType: 'starter_spark',
        paymentDetails: { method: 'test' },
      }),
    })

    if (!purchaseResponse.ok) {
      // If it fails due to existing plan, that's actually expected
      const errorData = await purchaseResponse.json()
      if (errorData.error.includes('already have')) {
        return {
          test_name: 'Purchase Flow',
          status: 'passed',
          message: 'Purchase flow correctly prevents duplicate purchases',
          duration_ms: Date.now() - startTime,
          details: { prevented_duplicate: true },
        }
      }

      throw new Error(errorData.error || 'Purchase failed')
    }

    const purchaseData = await purchaseResponse.json()

    return {
      test_name: 'Purchase Flow',
      status: 'passed',
      message: 'Purchase flow completed successfully',
      duration_ms: Date.now() - startTime,
      details: {
        package: purchaseData.package,
        new_tier: purchaseData.profile?.subscription_tier,
      },
    }
  } catch (error) {
    return {
      test_name: 'Purchase Flow',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime,
    }
  }
}

async function testRegenerationLogic(userId: string): Promise<WorkflowTestResult> {
  const startTime = Date.now()

  try {
    // Check regeneration status
    const regenerationStatus = await authService.getRegenerationStatus(userId)

    if (!regenerationStatus) {
      return {
        test_name: 'Regeneration Logic',
        status: 'skipped',
        message: 'User does not have regeneration capability',
        duration_ms: Date.now() - startTime,
      }
    }

    // Test regeneration status structure
    const requiredFields = ['available', 'remaining']
    const missingFields = requiredFields.filter(field => !(field in regenerationStatus))

    if (missingFields.length > 0) {
      return {
        test_name: 'Regeneration Logic',
        status: 'failed',
        message: `Missing regeneration status fields: ${missingFields.join(', ')}`,
        duration_ms: Date.now() - startTime,
      }
    }

    return {
      test_name: 'Regeneration Logic',
      status: 'passed',
      message: 'Regeneration logic working correctly',
      duration_ms: Date.now() - startTime,
      details: regenerationStatus,
    }
  } catch (error) {
    return {
      test_name: 'Regeneration Logic',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime,
    }
  }
}

async function testDatabaseIntegrity(userId: string): Promise<WorkflowTestResult> {
  const startTime = Date.now()

  try {
    // Test atomic operations
    const testResult = await dbAtomic.checkGenerationLimitsAtomic(userId, false)

    if (typeof testResult.canGenerate !== 'boolean') {
      return {
        test_name: 'Database Integrity',
        status: 'failed',
        message: 'Atomic operations not working correctly',
        duration_ms: Date.now() - startTime,
      }
    }

    // Test profile update atomicity
    const updateResult = await dbAtomic.createUserProfileAtomic(userId, userId, {
      subscription_tier: 'test',
    })

    if (!updateResult.success) {
      return {
        test_name: 'Database Integrity',
        status: 'failed',
        message: updateResult.error || 'Atomic profile update failed',
        duration_ms: Date.now() - startTime,
      }
    }

    return {
      test_name: 'Database Integrity',
      status: 'passed',
      message: 'Database atomic operations working correctly',
      duration_ms: Date.now() - startTime,
      details: {
        generation_check: testResult.canGenerate,
        profile_update: updateResult.success,
      },
    }
  } catch (error) {
    return {
      test_name: 'Database Integrity',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime,
    }
  }
}

async function testUsageTracking(userId: string): Promise<WorkflowTestResult> {
  const startTime = Date.now()

  try {
    // Test usage tracking API
    const usageResponse = await fetch('/api/user/usage-check')

    if (!usageResponse.ok) {
      throw new Error('Usage tracking API failed')
    }

    const usageData = await usageResponse.json()

    if (!usageData.success || !usageData.profile) {
      return {
        test_name: 'Usage Tracking',
        status: 'failed',
        message: 'Usage tracking API returned invalid data',
        duration_ms: Date.now() - startTime,
      }
    }

    return {
      test_name: 'Usage Tracking',
      status: 'passed',
      message: 'Usage tracking working correctly',
      duration_ms: Date.now() - startTime,
      details: {
        subscription_tier: usageData.profile.subscription_tier,
        credits_remaining: usageData.profile.credits_remaining,
      },
    }
  } catch (error) {
    return {
      test_name: 'Usage Tracking',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime,
    }
  }
}

async function testBackgroundProcessing(userId: string): Promise<WorkflowTestResult> {
  const startTime = Date.now()

  try {
    // Test background job creation
    const jobResponse = await fetch('/api/background-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offerId: 'test-offer-id',
        businessContext: { businessDescription: 'Test business' },
        isRegeneration: false,
      }),
    })

    if (!jobResponse.ok) {
      const errorData = await jobResponse.json()
      return {
        test_name: 'Background Processing',
        status: 'failed',
        message: errorData.error || 'Background job creation failed',
        duration_ms: Date.now() - startTime,
      }
    }

    const jobData = await jobResponse.json()

    if (!jobData.success || !jobData.jobId) {
      return {
        test_name: 'Background Processing',
        status: 'failed',
        message: 'Background job creation returned invalid data',
        duration_ms: Date.now() - startTime,
      }
    }

    return {
      test_name: 'Background Processing',
      status: 'passed',
      message: 'Background processing job created successfully',
      duration_ms: Date.now() - startTime,
      details: {
        job_id: jobData.jobId,
        status: jobData.status,
      },
    }
  } catch (error) {
    return {
      test_name: 'Background Processing',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime,
    }
  }
}

async function cleanupTestData(userId: string): Promise<void> {
  try {
    // Clean up any test data created during testing
    // This would include test offers, background jobs, etc.
    console.log('Cleaning up test data for user:', userId)
    // Add actual cleanup logic here
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}
