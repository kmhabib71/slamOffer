import { NextResponse } from 'next/server'
import { generatePreview } from '@/lib/openai'

interface PreviewGenerationRequest {
  businessContext: {
    businessDescription: string
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PreviewGenerationRequest

    console.log('🎯 Preview generation API called')
    console.log('📝 Request body:', body)

    // Validate request body
    if (!body.businessContext?.businessDescription) {
      return NextResponse.json({ error: 'Missing businessDescription in businessContext' }, { status: 400 })
    }

    console.log('⚡ Calling generatePreview with businessContext...')
    const preview = await generatePreview(body.businessContext)
    console.log('✅ Preview generation successful, returning data')
    
    return NextResponse.json(preview)
  } catch (error) {
    console.error('❌ Preview generation error:', error)
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 })
  }
}

// Rate limit the API to stay within budget
export const config = {
  api: {
    bodyParser: true,
  },
}
