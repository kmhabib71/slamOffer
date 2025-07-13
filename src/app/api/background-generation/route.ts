import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { generateCompleteGrandSlamOffer } from '@/lib/openai'
import { authService, dbHelpers } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

interface BackgroundJob {
  _id?: string
  userId: string
  offerId: string
  businessContext: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: any
  error?: string
  createdAt: Date
  updatedAt: Date
  processingStartedAt?: Date
  completedAt?: Date
}

// Start a background generation job
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.email
    const body = await request.json()
    const { offerId, businessContext, isRegeneration = false } = body

    if (!offerId || !businessContext) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user can generate
    const canGenerate = await authService.canUserGenerate(userId, isRegeneration)
    if (!canGenerate.canGenerate) {
      return NextResponse.json(
        {
          error: 'Cannot start generation',
          reason: canGenerate.reason,
        },
        { status: 403 }
      )
    }

    // Create background job
    const client = await clientPromise
    const db = client.db()

    const job: Omit<BackgroundJob, '_id'> = {
      userId,
      offerId,
      businessContext,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('background_jobs').insertOne(job)
    const jobId = result.insertedId.toString()

    // Start processing in background (don't await)
    processJob(jobId, isRegeneration).catch(error => {
      console.error('Background job processing error:', error)
    })

    return NextResponse.json({
      success: true,
      jobId,
      status: 'pending',
      message: 'Background generation started',
    })
  } catch (error) {
    console.error('Error starting background job:', error)
    return NextResponse.json(
      {
        error: 'Failed to start background generation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Check status of background job
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.email
    const url = new URL(request.url)
    const jobId = url.searchParams.get('jobId')

    if (!jobId) {
      // Get all user's recent jobs
      const client = await clientPromise
      const db = client.db()

      const jobs = await db
        .collection('background_jobs')
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()

      return NextResponse.json({
        success: true,
        jobs: jobs.map(job => ({
          id: job._id.toString(),
          offerId: job.offerId,
          status: job.status,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          processingStartedAt: job.processingStartedAt,
          completedAt: job.completedAt,
          error: job.error,
        })),
      })
    }

    // Get specific job
    const client = await clientPromise
    const db = client.db()

    const job = await db.collection('background_jobs').findOne({
      _id: new (require('mongodb').ObjectId)(jobId),
      userId, // Ensure user owns this job
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job._id.toString(),
        offerId: job.offerId,
        status: job.status,
        result: job.result,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        processingStartedAt: job.processingStartedAt,
        completedAt: job.completedAt,
      },
    })
  } catch (error) {
    console.error('Error checking job status:', error)
    return NextResponse.json(
      {
        error: 'Failed to check job status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Background processing function
async function processJob(jobId: string, isRegeneration: boolean = false) {
  const client = await clientPromise
  const db = client.db()

  try {
    // Update job status to processing
    await db.collection('background_jobs').updateOne(
      { _id: new (require('mongodb').ObjectId)(jobId) },
      {
        $set: {
          status: 'processing',
          processingStartedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    )

    // Get job details
    const job = await db.collection('background_jobs').findOne({
      _id: new (require('mongodb').ObjectId)(jobId),
    })

    if (!job) {
      throw new Error('Job not found')
    }

    // Check user permissions and deduct credits
    const userProfile = await authService.getUserProfile(job.userId)
    if (!userProfile) {
      throw new Error('User profile not found')
    }

    // Determine generation tier
    let generationTier: 'free' | 'pro' = 'free'
    if (userProfile.subscription_tier !== 'free') {
      generationTier = 'pro'
    }

    // Deduct credits before generation
    if (!isRegeneration) {
      await authService.deductCredits(job.userId, 1, false)
    } else if (userProfile.subscription_tier === 'starter_spark') {
      await authService.deductCredits(job.userId, 0, true)
    }

    // For regenerations, get original business context
    let finalBusinessContext = job.businessContext
    if (isRegeneration && userProfile.subscription_tier === 'starter_spark') {
      const originalContext = userProfile.package_details?.original_business_context
      if (originalContext) {
        finalBusinessContext = originalContext
      }
    }

    // Generate the offer
    const result = await generateCompleteGrandSlamOffer({
      businessContext: finalBusinessContext,
      userTier: generationTier,
      generateComplete: generationTier === 'pro',
    })

    // Save the generated offer
    await dbHelpers.savePurchasedOffer(job.userId, job.offerId, result)

    // Update job status to completed
    await db.collection('background_jobs').updateOne(
      { _id: new (require('mongodb').ObjectId)(jobId) },
      {
        $set: {
          status: 'completed',
          result: result,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    )

    console.log('Background job completed successfully:', jobId)
  } catch (error) {
    console.error('Background job processing failed:', error)

    // Update job status to failed
    await db.collection('background_jobs').updateOne(
      { _id: new (require('mongodb').ObjectId)(jobId) },
      {
        $set: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    )

    // Refund credits if generation failed
    try {
      const job = await db.collection('background_jobs').findOne({
        _id: new (require('mongodb').ObjectId)(jobId),
      })

      if (job && !isRegeneration) {
        const userProfile = await authService.getUserProfile(job.userId)
        if (userProfile) {
          await authService.updateUserProfile(job.userId, {
            credits_remaining: userProfile.credits_remaining + 1,
          })
          console.log('Refunded credits due to generation failure')
        }
      }
    } catch (refundError) {
      console.error('Error refunding credits:', refundError)
    }
  }
}

// Cleanup old jobs (can be called periodically)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Delete jobs older than 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const result = await db.collection('background_jobs').deleteMany({
      createdAt: { $lt: sevenDaysAgo },
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error('Error cleaning up jobs:', error)
    return NextResponse.json(
      {
        error: 'Failed to cleanup jobs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
