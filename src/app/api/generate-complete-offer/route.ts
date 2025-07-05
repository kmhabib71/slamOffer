import { NextResponse } from 'next/server'
import { generateCompleteGrandSlamOffer } from '@/lib/openai'
import { CompleteOfferRequest } from '@/types'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompleteOfferRequest

    // Validate request body
    if (!body.businessContext) {
      return NextResponse.json({ error: 'Missing business context' }, { status: 400 })
    }

    const { businessDescription } = body.businessContext

    if (!businessDescription || businessDescription.trim().length < 10) {
      return NextResponse.json({ 
        error: 'Business description is required and must be at least 10 characters long' 
      }, { status: 400 })
    }

    if (!body.userTier) {
      return NextResponse.json({ error: 'Missing user tier information' }, { status: 400 })
    }

    console.log('Starting complete offer generation for:', {
      businessContext: body.businessContext,
      userTier: body.userTier,
      generateComplete: body.generateComplete,
    })

    const startTime = Date.now()
    const completeOffer = await generateCompleteGrandSlamOffer(body)
    const endTime = Date.now()
    
    console.log(`Generation completed in ${endTime - startTime}ms`)
    console.log(`Token usage: ${completeOffer.metadata.tokenUsage}`)
    console.log(`Components generated: ${completeOffer.components.length}`)
    
    return NextResponse.json({
      success: true,
      data: completeOffer,
      message: `Complete Grand Slam Offer generated successfully for ${body.userTier} user`,
    })
  } catch (error) {
    console.error('Complete offer generation error:', error)
    
    // Return more detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to generate complete offer',
      details: errorMessage 
    }, { status: 500 })
  }
}

// Rate limiting and validation configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
}
