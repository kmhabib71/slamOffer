import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { n8nClient } from '@/lib/n8n/client'
import { leadDatabase } from '@/lib/lead-db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const body = await request.json()
    const { workflowType, campaignId, data } = body

    if (!workflowType || !data) {
      return NextResponse.json(
        {
          error: 'Missing required fields: workflowType, data',
        },
        { status: 400 }
      )
    }

    // Add user ID to the data
    const workflowData = {
      ...data,
      userId,
    }

    // Trigger the n8n workflow
    const result = await n8nClient.triggerWorkflow(workflowType, workflowData)

    // Log the workflow execution
    await leadDatabase.createWorkflowExecution({
      user_id: userId,
      campaign_id: campaignId,
      workflow_type: workflowType,
      n8n_execution_id: result.executionId,
      n8n_workflow_id: workflowType,
      status: 'running',
      input_data: workflowData,
      started_at: new Date(),
      retry_count: 0,
    })

    return NextResponse.json({
      success: true,
      executionId: result.executionId,
      status: result.status,
      data: result.data,
    })
  } catch (error) {
    console.error('n8n workflow trigger error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to trigger workflow',
      },
      { status: 500 }
    )
  }
}
