import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { referralDatabase } from '@/lib/referral-db'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const referral = await referralDatabase.getReferralById(params.id)
    if (!referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
    }

    // Check if user owns this referral
    if (referral.user_id !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: referral,
    })
  } catch (error) {
    console.error('Error fetching referral:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, conversion_value, reward_amount, notes, lead_id, customer_id } = body

    // Get the referral first to check ownership
    const referral = await referralDatabase.getReferralById(params.id)
    if (!referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
    }

    if (referral.user_id !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (conversion_value !== undefined) updateData.conversion_value = conversion_value
    if (reward_amount !== undefined) updateData.reward_amount = reward_amount
    if (notes !== undefined) updateData.notes = notes
    if (lead_id !== undefined) updateData.lead_id = lead_id
    if (customer_id !== undefined) updateData.customer_id = customer_id

    // Add conversion timestamp if status is being changed to converted
    if (status === 'converted' && referral.status !== 'converted') {
      updateData.converted_at = new Date()
    }

    // Update the referral
    const success = await referralDatabase.updateReferral(params.id, updateData)

    if (success) {
      // Log the activity
      await referralDatabase.logReferralActivity({
        referral_id: params.id,
        user_id: (session.user as any).id,
        activity_type: status === 'converted' ? 'prospect_converted' : 'prospect_contacted',
        description: `Referral status updated to ${status || 'updated'}`,
        data: updateData,
      })

      // Update campaign metrics if campaign is associated
      if (referral.campaign_id) {
        await referralDatabase.updateCampaignMetrics(referral.campaign_id)
      }

      return NextResponse.json({
        success: true,
        message: 'Referral updated successfully',
      })
    } else {
      return NextResponse.json({ error: 'Failed to update referral' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating referral:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the referral first to check ownership
    const referral = await referralDatabase.getReferralById(params.id)
    if (!referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
    }

    if (referral.user_id !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Instead of deleting, we'll mark as expired
    const success = await referralDatabase.updateReferral(params.id, {
      status: 'expired',
    })

    if (success) {
      // Log the activity
      await referralDatabase.logReferralActivity({
        referral_id: params.id,
        user_id: (session.user as any).id,
        activity_type: 'referral_expired',
        description: 'Referral marked as expired by user',
      })

      return NextResponse.json({
        success: true,
        message: 'Referral expired successfully',
      })
    } else {
      return NextResponse.json({ error: 'Failed to expire referral' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error expiring referral:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
