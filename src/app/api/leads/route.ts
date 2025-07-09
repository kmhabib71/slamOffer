import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { leadDatabase } from '@/lib/lead-db'
import { cacheManager } from '@/lib/performance/cache-manager'

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

    const url = new URL(request.url)
    const source = url.searchParams.get('source')
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search')

    // Try to get from cache first
    const cacheKey = `leads:${userId}:${source}:${status}:${page}:${limit}:${search}`
    const cachedLeads = await cacheManager.getLeads(cacheKey)

    if (cachedLeads) {
      return NextResponse.json(cachedLeads)
    }

    // Get from database using proper parameters
    const leads = await leadDatabase.getLeadsByUser(userId, {
      source: source as any,
      status: status as any,
      limit,
      skip: (page - 1) * limit,
    })

    // Cache the results
    await cacheManager.setLeads(cacheKey, leads)

    return NextResponse.json({ leads, total: leads.length })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    const body = await request.json()

    const leadData = {
      ...body,
      user_id: userId,
    }

    const lead = await leadDatabase.createLead(leadData)

    // Invalidate cache when new lead is created
    await cacheManager.invalidateLeads(userId)

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, ...updateData } = body

    const success = await leadDatabase.updateLead(id, updateData)

    // Invalidate cache when lead is updated
    await cacheManager.invalidateLeads(userId)

    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
    }

    const success = await leadDatabase.deleteLead(id)

    // Invalidate cache when lead is deleted
    await cacheManager.invalidateLeads(userId)

    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
