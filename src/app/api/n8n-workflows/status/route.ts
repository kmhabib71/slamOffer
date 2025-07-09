import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { n8nClient } from '@/lib/n8n/client'
import { leadDatabase } from '@/lib/lead-db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const executionId = searchParams.get('executionId')

    if (!executionId) {
      return NextResponse.json(
        {
          error: 'Missing executionId parameter',
        },
        { status: 400 }
      )
    }

    // Get status from n8n
    const result = await n8nClient.getWorkflowStatus(executionId)

    // Update local database if execution is completed
    if (result.status === 'completed' || result.status === 'failed') {
      await leadDatabase.updateWorkflowExecution(executionId, {
        status: result.status,
        output_data: result.data,
        error_message: result.error,
        completed_at: new Date(),
      })
    }

    return NextResponse.json({
      success: true,
      executionId,
      status: result.status,
      data: result.data,
      error: result.error,
    })
  } catch (error) {
    console.error('n8n workflow status error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get workflow status',
      },
      { status: 500 }
    )
  }
}

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

    const { executionIds } = await request.json()

    if (!executionIds || !Array.isArray(executionIds)) {
      return NextResponse.json(
        {
          error: 'Missing or invalid executionIds array',
        },
        { status: 400 }
      )
    }

    // Get status for multiple executions
    const results = await Promise.all(
      executionIds.map(async (executionId: string) => {
        try {
          const result = await n8nClient.getWorkflowStatus(executionId)

          // Update local database if execution is completed
          if (result.status === 'completed' || result.status === 'failed') {
            await leadDatabase.updateWorkflowExecution(executionId, {
              status: result.status,
              output_data: result.data,
              error_message: result.error,
              completed_at: new Date(),
            })
          }

          return result
        } catch (error) {
          return {
            executionId,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('n8n workflow batch status error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get workflow statuses',
      },
      { status: 500 }
    )
  }
}
