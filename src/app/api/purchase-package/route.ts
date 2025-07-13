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
    const { packageType, paymentDetails, offerId, businessContext } = body

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

    // Handle same-tier repurchase (credit top-up)
    if (userProfile.subscription_tier === packageType) {
      console.log('Same tier repurchase detected - adding credits:', {
        userId,
        currentTier: packageType,
        currentCredits: userProfile.credits_remaining,
        additionalCredits: selectedPackage.credits,
      })

      // Add credits to existing balance
      const newCreditBalance = userProfile.credits_remaining + selectedPackage.credits

      try {
        // Update user profile with additional credits
        await authService.updateUserProfile(userId, {
          credits_remaining: newCreditBalance,
          // Update package details to reflect additional purchase
          package_details: {
            ...userProfile.package_details,
            total_package_value: (userProfile.package_details?.total_package_value || 0) + selectedPackage.total_package_value,
            purchase_date: new Date(), // Update to latest purchase date
          },
        })

        // Get updated profile to return
        const updatedProfile = await authService.getUserProfile(userId)

        if (!updatedProfile) {
          throw new Error('Failed to retrieve updated profile')
        }

        console.log('Successfully added credits to existing plan:', {
          userId,
          previousCredits: userProfile.credits_remaining,
          newCredits: newCreditBalance,
          creditsAdded: selectedPackage.credits,
        })

        return NextResponse.json({
          success: true,
          message: `Successfully added ${selectedPackage.credits} credits to your ${packageType} plan`,
          profile: updatedProfile,
          package: {
            name: packageType,
            tier: packageType,
            credits: newCreditBalance,
            price: selectedPackage.price,
            pricePerOffer: selectedPackage.price_per_offer,
            features: selectedPackage.features,
            description: selectedPackage.description,
            regenerations: selectedPackage.regeneration_count,
          },
          topUp: {
            creditsAdded: selectedPackage.credits,
            previousCredits: userProfile.credits_remaining,
            newTotalCredits: newCreditBalance,
            purchaseType: 'credit_top_up',
          },
        })
      } catch (error) {
        console.error('Error adding credits to existing plan:', error)
        return NextResponse.json(
          {
            error: 'Failed to add credits to existing plan',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        )
      }
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
          original_business_context: businessContext || null, // Store business context for unlock purchases
        }
      )

      if (!upgradeSuccess) {
        throw new Error('Failed to upgrade subscription')
      }

      // Handle unlock purchase logic - immediately consume credit for Starter Spark
      let isUnlockPurchase = Boolean(offerId && businessContext)
      
      if (isUnlockPurchase && packageType === 'starter_spark') {
        console.log('Unlock purchase detected - will consume credit immediately for:', {
          userId,
          offerId,
          packageType
        })
        
        // For unlock purchases, set credits to 0 since the purchase is for immediate use
        finalCredits = 0
      }

      // Update credits manually if we preserved free credits or it's an unlock purchase
      if (finalCredits !== selectedPackage.credits) {
        await authService.updateUserProfile(userId, {
          credits_remaining: finalCredits,
        })
        console.log('Updated credits:', {
          isUnlockPurchase,
          expectedCredits: selectedPackage.credits,
          finalCredits,
          reason: isUnlockPurchase ? 'unlock_purchase_consumed' : 'preserved_free_credits'
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
        isUnlockPurchase,
      })

      // Handle unlock purchase generation immediately
      let generatedOffer = null
      if (isUnlockPurchase && offerId && businessContext) {
        console.log('🎯 UNLOCK PURCHASE - Generating offer immediately')
        
        try {
          // Import and generate the complete offer
          const { generateCompleteGrandSlamOffer } = await import('@/lib/openai')
          const { dbHelpers } = await import('@/lib/auth')
          const { emailService } = await import('@/lib/email-service')
          
          console.log('⚡ Starting immediate OpenAI generation for unlock purchase')
          
          generatedOffer = await generateCompleteGrandSlamOffer({
            businessContext,
            userTier: 'pro',
            generateComplete: true,
            offerId: offerId,
          })
          
          console.log('✅ OpenAI generation completed, saving to database')
          
          // Save the generated offer
          await dbHelpers.savePurchasedOffer(userId, offerId, generatedOffer)
          
          console.log('✅ Offer saved to database successfully')
          
          // Send email notification
          try {
            await emailService.sendOfferGenerationComplete({
              userEmail: session.user.email!,
              userName: session.user.name || '',
              offerId: offerId,
              offerTitle: `Grand Slam Offer for ${businessContext.businessDescription?.substring(0, 50)}...`,
              isFullGeneration: true,
              businessDescription: businessContext.businessDescription || '',
            })
            console.log('✅ Email notification sent')
          } catch (emailError) {
            console.error('⚠️ Email notification failed:', emailError)
            // Don't fail the whole purchase for email issues
          }
          
        } catch (generationError) {
          console.error('❌ Error during unlock purchase generation:', generationError)
          // Don't fail the purchase, but log the error
          // User can try generating again from the dashboard
        }
      }

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
          isUnlockPurchase,
        },
        // Include generated offer data for unlock purchases
        generatedOffer: generatedOffer,
        offerGenerated: Boolean(generatedOffer),
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
