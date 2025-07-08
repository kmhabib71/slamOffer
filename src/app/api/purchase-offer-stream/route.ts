import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { generateCompleteGrandSlamOffer } from '@/lib/openai'
import { authService, dbHelpers } from '@/lib/auth'

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

    // Check if user has already purchased this offer
    const isPurchased = await dbHelpers.isPurchasedByUser(userId, offerId)

    if (isPurchased) {
      return NextResponse.json({ error: 'Offer already purchased' }, { status: 400 })
    }

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
            sendProgress({
              type: 'progress',
              step: 'starting',
              message: 'Initializing AI generation...',
              progress: 0,
            })

            sendProgress({
              type: 'progress',
              step: 'generating',
              message: 'Generating complete offer with AI...',
              progress: 20,
            })

            const completeOffer = await generateCompleteGrandSlamOffer({
              businessContext,
              userTier: 'pro',
              generateComplete: true,
              componentName,
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

            // Send the final result
            sendProgress({
              type: 'complete',
              data: completeOffer,
            })

            controller.close()
          } catch (error) {
            console.error('Error generating offer:', error)
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
