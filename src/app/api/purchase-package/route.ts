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

    // Get or create user profile - this ensures no duplicates
    let userProfile = await authService.getUserProfile(userId)

    if (!userProfile) {
      try {
        console.log('Creating new user profile for:', userId)
        userProfile = await authService.createUserProfile(userId, session.user.email!)
      } catch (error) {
        console.error('Error creating user profile:', error)
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
      }
    }

    // Package details with enhanced configuration
    const packageDetails = {
      starter_spark: {
        price: 9,
        credits: 1,
        regeneration_count: 2,
        price_per_offer: 9,
        total_package_value: 9,
        description: 'Perfect for single offer creation',
        features: [
          '1 complete offer generation',
          '2 offer regenerations included',
          'Full offer components',
          'Premium PDF export',
          'Email support',
        ],
      },
      growth_engine: {
        price: 47,
        credits: 10,
        regeneration_count: 0,
        price_per_offer: 4.7,
        total_package_value: 47,
        description: 'For growing businesses',
        features: [
          '10 complete offer generations',
          'All premium features',
          'Advanced offer components',
          'Premium PDF export',
          'Priority support',
        ],
      },
      agency_arsenal: {
        price: 99,
        credits: 30,
        regeneration_count: 0,
        price_per_offer: 3.3,
        total_package_value: 99,
        description: 'For agencies and teams',
        features: [
          '30 complete offer generations',
          'All premium features',
          'Advanced offer components',
          'Premium PDF export',
          'Priority support',
        ],
      },
    }

    const selectedPackage = packageDetails[packageType as keyof typeof packageDetails]

    // Validate payment details (in a real app, integrate with payment processor)
    if (!paymentDetails || !paymentDetails.method) {
      return NextResponse.json({ error: 'Payment details required' }, { status: 400 })
    }

    // Simulate payment processing
    console.log('Processing payment for:', {
      userId,
      packageType,
      amount: selectedPackage.price,
      paymentMethod: paymentDetails.method,
      currentTier: userProfile.subscription_tier,
    })

    // Check if user is already on this or a higher tier
    if (userProfile.subscription_tier === packageType) {
      return NextResponse.json(
        { error: `You already have the ${packageType} package` },
        { status: 400 }
      )
    }

    // Handle upgrade logic - preserve existing credits for upgrades
    let finalCredits = selectedPackage.credits

    if (userProfile.subscription_tier === 'free' && userProfile.credits_remaining > 0) {
      // If upgrading from free and still has free credits, preserve them
      finalCredits = selectedPackage.credits + userProfile.credits_remaining
      console.log('Preserving free credits during upgrade:', userProfile.credits_remaining)
    }

    // Upgrade user profile with enhanced package details
    try {
      const upgradeSuccess = await authService.upgradeSubscription(
        userId,
        packageType as SubscriptionTier,
        {
          price_per_offer: selectedPackage.price_per_offer,
          total_package_value: selectedPackage.total_package_value,
          purchase_date: new Date(),
          regeneration_count: selectedPackage.regeneration_count,
          original_business_context: null, // Will be set when first generation happens
        }
      )

      if (!upgradeSuccess) {
        throw new Error('Failed to upgrade subscription')
      }

      // Update credits manually if we preserved free credits
      if (finalCredits !== selectedPackage.credits) {
        await authService.updateUserProfile(userId, {
          credits_remaining: finalCredits,
        })
      }

      // Get updated profile to return
      const updatedProfile = await authService.getUserProfile(userId)

      if (!updatedProfile) {
        throw new Error('Failed to retrieve updated profile')
      }

      console.log('Successfully upgraded user:', {
        userId,
        fromTier: userProfile.subscription_tier,
        toTier: packageType,
        finalCredits,
        packageValue: selectedPackage.total_package_value,
      })

      return NextResponse.json({
        success: true,
        message: `Successfully upgraded to ${packageType}`,
        profile: updatedProfile,
        package: {
          name: packageType,
          tier: packageType,
          credits: finalCredits,
          price: selectedPackage.price,
          pricePerOffer: selectedPackage.price_per_offer,
          features: selectedPackage.features,
          description: selectedPackage.description,
          regenerations: selectedPackage.regeneration_count,
        },
        upgrade: {
          previousTier: userProfile.subscription_tier,
          creditsAdded: selectedPackage.credits,
          creditsPreserved: finalCredits - selectedPackage.credits,
          totalCredits: finalCredits,
        },
      })
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      return NextResponse.json(
        {
          error: 'Failed to upgrade subscription',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing package purchase:', error)
    return NextResponse.json(
      {
        error: 'Failed to process purchase',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
