import { NextResponse } from 'next/server'
import { generateAllComponents } from '@/lib/openai'

interface BatchGenerationRequest {
  businessContext: {
    businessType: string
    targetMarket: string
    mainProblem: string
    revenueGoal: string
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BatchGenerationRequest

    // Validate request body
    if (!body.businessContext) {
      return NextResponse.json({ error: 'Missing business context' }, { status: 400 })
    }

    const { businessType, targetMarket, mainProblem, revenueGoal } = body.businessContext

    if (!businessType || !targetMarket || !mainProblem || !revenueGoal) {
      return NextResponse.json({ 
        error: 'Missing required fields: businessType, targetMarket, mainProblem, revenueGoal' 
      }, { status: 400 })
    }

    console.log('Starting batch generation for:', body.businessContext)

    const allComponents = await generateAllComponents(body.businessContext)
    
    return NextResponse.json({
      success: true,
      data: allComponents,
      message: 'All 11 components generated successfully'
    })
  } catch (error) {
    console.error('Batch generation error:', error)
    
    // Return more detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to generate all components',
      details: errorMessage 
    }, { status: 500 })
  }
}

// Rate limiting configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
