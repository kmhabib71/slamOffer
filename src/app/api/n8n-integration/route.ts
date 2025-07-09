import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook'
const N8N_API_KEY = process.env.N8N_API_KEY

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { workflowType, data } = body

    // Trigger n8n workflow based on type
    const webhookUrl = `${N8N_WEBHOOK_URL}/${workflowType}`

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${N8N_API_KEY}`,
      },
      body: JSON.stringify({
        userId: session.user?.email || 'unknown',
        ...data,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to trigger n8n workflow')
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('N8N integration error:', error)
    return NextResponse.json({ error: 'Failed to trigger automation' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get workflow status from n8n
    const response = await fetch(`${N8N_WEBHOOK_URL}/status`, {
      headers: {
        Authorization: `Bearer ${N8N_API_KEY}`,
      },
    })

    const workflows = await response.json()
    return NextResponse.json(workflows)
  } catch (error) {
    console.error('N8N status error:', error)
    return NextResponse.json({ error: 'Failed to get workflow status' }, { status: 500 })
  }
}
