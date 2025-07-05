import { NextResponse } from 'next/server'
import { generatePreview } from '@/lib/openai'
import { PreviewRequest } from '@/types'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PreviewRequest

    // Validate request body
    if (!body.businessContext || !body.componentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const preview = await generatePreview(body)
    return NextResponse.json(preview)
  } catch (error) {
    console.error('Preview generation error:', error)
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 })
  }
}

// Rate limit the API to stay within budget
export const config = {
  api: {
    bodyParser: true,
  },
}
