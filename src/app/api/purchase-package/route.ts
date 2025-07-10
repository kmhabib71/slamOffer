import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { authService, SubscriptionTier } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.email
    const body = await request.json()
    const { packageType, paymentDetails } = body

    // Validate package type
    if (!['starter_spark', 'growth_engine', 'agency_arsenal'].includes(packageType)) {
      return NextResponse.json({ error: 'Invalid package type' }, { status: 400 })
    }

    // Get or create user profile
    let userProfile = await authService.getUserProfile(userId)

    if (!userProfile) {
      try {
        userProfile = await authService.createUserProfile(userId, session.user.email!)
      } catch (error) {
        console.error('Error creating user profile:', error)
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
      }
    }

    // Package details
    const packageDetails = {
      starter_spark: {
        price: 9,
        credits: 1,
        regeneration_count: 2,
        price_per_offer: 9,
      },
      growth_engine: {
        price: 47,
        credits: 10,
        regeneration_count: 0,
        price_per_offer: 4.7,
      },
      agency_arsenal: {
        price: 99,
        credits: 30,
        regeneration_count: 0,
        price_per_offer: 3.3,
      },
    }

    const selectedPackage = packageDetails[packageType as keyof typeof packageDetails]

    // Simulate payment processing (in a real app, this would integrate with a payment processor)
    // For now, we'll just assume the payment is successful
    console.log('Processing payment for package:', packageType, 'Amount:', selectedPackage.price)

    // Update user profile with new package
    try {
      await authService.upgradeSubscription(userId, packageType as SubscriptionTier, {
        price_per_offer: selectedPackage.price_per_offer,
        total_package_value: selectedPackage.price,
        purchase_date: new Date(),
        regeneration_count: selectedPackage.regeneration_count,
      })

      // Get updated profile
      const updatedProfile = await authService.getUserProfile(userId)

      return NextResponse.json({
        success: true,
        message: 'Package purchased successfully',
        profile: updatedProfile,
        package: {
          name: packageType,
          credits: selectedPackage.credits,
          price: selectedPackage.price,
          pricePerOffer: selectedPackage.price_per_offer,
        },
      })
    } catch (error) {
      console.error('Error updating user profile:', error)
      return NextResponse.json(
        { error: 'Failed to update user profile after payment' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing package purchase:', error)
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 })
  }
}
