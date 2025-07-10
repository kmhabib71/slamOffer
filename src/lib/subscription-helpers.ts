import { SubscriptionTier, SubscriptionHelpers } from './auth-types'

export const subscriptionHelpers: SubscriptionHelpers = {
  getTierDisplayName: (tier: SubscriptionTier): string => {
    switch (tier) {
      case 'free':
        return 'Free'
      case 'starter_spark':
        return 'Starter Spark'
      case 'growth_engine':
        return 'Growth Engine'
      case 'agency_arsenal':
        return 'Agency Arsenal'
      default:
        return 'Unknown'
    }
  },

  getTierCredits: (tier: SubscriptionTier): number => {
    switch (tier) {
      case 'free':
        return 3
      case 'starter_spark':
        return 1
      case 'growth_engine':
        return 10
      case 'agency_arsenal':
        return 30
      default:
        return 0
    }
  },

  getTierPrice: (tier: SubscriptionTier): number => {
    switch (tier) {
      case 'free':
        return 0
      case 'starter_spark':
        return 9
      case 'growth_engine':
        return 47
      case 'agency_arsenal':
        return 99
      default:
        return 0
    }
  },

  getPricePerOffer: (tier: SubscriptionTier): number => {
    switch (tier) {
      case 'free':
        return 0
      case 'starter_spark':
        return 9
      case 'growth_engine':
        return 4.7
      case 'agency_arsenal':
        return 3.3
      default:
        return 0
    }
  },

  isFreeTier: (tier: SubscriptionTier): boolean => {
    return tier === 'free'
  },

  isPaidTier: (tier: SubscriptionTier): boolean => {
    return tier !== 'free'
  },
}
