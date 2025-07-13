import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { generateCompleteGrandSlamOffer } from '@/lib/openai'
import { authService, dbHelpers } from '@/lib/auth'
import { emailService } from '@/lib/email-service'
import clientPromise from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Get the current session using NextAuth
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: 'Authentication failed',
          details: 'No valid session found',
        },
        { status: 401 }
      )
    }

    // Use email as user identifier since NextAuth doesn't provide ID by default
    const userId = session.user.email

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const {
      offerId,
      businessContext,
      generateComplete = true,
      userTier = 'pro',
      componentName,
    } = body

    if (!offerId || !businessContext) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get or create user profile
    let userProfile = await authService.getUserProfile(userId)

    if (!userProfile) {
      // Create user profile if it doesn't exist
      try {
        userProfile = await authService.createUserProfile(userId, session.user.email!)
      } catch (error) {
        console.error('Error creating user profile:', error)
        return NextResponse.json(
          {
            error: 'Failed to create user profile',
            details: error,
          },
          { status: 500 }
        )
      }
    }

    // Skip duplicate check for unlock purchases to allow full generation

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()

        const sendProgress = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(message))
        }

        // Start the generation process
        const generateOffer = async () => {
          try {
            // Check if generation is already in progress for this offer ID
            const client = await clientPromise
            const db = client.db()
            const generationLock = await db.collection('generation_locks').findOne({
              offerId,
              userId,
              status: 'in_progress',
            })

            if (generationLock) {
              sendProgress({
                type: 'error',
                error: 'Generation already in progress for this offer',
              })
              controller.close()
              return
            }

            // Create generation lock
            await db.collection('generation_locks').insertOne({
              offerId,
              userId,
              status: 'in_progress',
              created_at: new Date(),
            })

            sendProgress({
              type: 'progress',
              step: 'starting',
              message: 'Initializing AI generation...',
              progress: 0,
            })

            sendProgress({
              type: 'progress',
              step: 'generating',
              message: 'Packaging complete offer for you...',
              progress: 20,
            })

            console.log('🎯 ROUTE: purchase-offer-stream - About to call generateCompleteGrandSlamOffer')
            console.log('📊 User:', userId, 'Offer:', offerId)

            const completeOffer = await generateCompleteGrandSlamOffer({
              businessContext,
              userTier: 'pro',
              generateComplete: true,
              offerId: offerId,
            })

            sendProgress({
              type: 'progress',
              step: 'saving',
              message: 'Saving your complete offer...',
              progress: 80,
            })

            // Save the purchase
            await dbHelpers.savePurchasedOffer(userId, offerId, completeOffer, componentName)

            sendProgress({
              type: 'progress',
              step: 'complete',
              message: 'Your offer is ready!',
              progress: 100,
            })

            // Send email notification for offer generation completion
            try {
              await emailService.sendOfferGenerationComplete({
                userEmail: session.user.email!,
                userName: session.user.name || '',
                offerId: offerId,
                offerTitle: `Grand Slam Offer for ${businessContext.businessDescription?.substring(0, 50)}...`,
                isFullGeneration: generateComplete,
                businessDescription: businessContext.businessDescription || '',
              })
            } catch (emailError) {
              console.error('Error sending email notification:', emailError)
              // Don't fail the request if email fails
            }

            // Send the final result
            sendProgress({
              type: 'complete',
              data: completeOffer,
            })

            // Clean up generation lock
            await db.collection('generation_locks').deleteOne({
              offerId,
              userId,
              status: 'in_progress',
            })

            controller.close()
          } catch (error) {
            console.error('Error generating offer:', error)
            
            // Clean up generation lock on error
            try {
              const client = await clientPromise
              const db = client.db()
              await db.collection('generation_locks').deleteOne({
                offerId,
                userId,
                status: 'in_progress',
              })
            } catch (cleanupError) {
              console.error('Error cleaning up generation lock:', cleanupError)
            }

            sendProgress({
              type: 'error',
              error: error instanceof Error ? error.message : 'Failed to generate offer',
            })
            controller.close()
          }
        }

        generateOffer()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Error processing purchase:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process purchase',
        details: error,
      },
      { status: 500 }
    )
  }
}
