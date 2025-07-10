export interface HomePricingPlan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  popular: boolean
  gradient: string
  pricePerOffer: string
  badge: string | null
  id: string
}

export const homePricingPlans: HomePricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for testing the waters',
    features: [
      '3 total offer generations',
      '1 offer per day limit',
      'Basic offer components',
      'Email support',
      'Standard PDF export',
    ],
    cta: 'Get Started Free',
    popular: false,
    gradient: 'from-slate-500 to-slate-600',
    pricePerOffer: 'Free trial',
    badge: null,
  },
  {
    id: 'starter-spark',
    name: 'Starter Spark',
    price: '$9',
    period: 'one-time',
    description: 'Perfect for single offer creation',
    features: [
      '1 complete offer generation',
      '2 offer regenerations included',
      'Full offer components',
      'Premium PDF export',
      'Email support',
      'Offer editing capabilities',
    ],
    cta: 'Buy Now',
    popular: false,
    gradient: 'from-orange-500 to-red-500',
    pricePerOffer: '$9 per offer',
    badge: 'One-Time Purchase',
  },
  {
    id: 'growth-engine',
    name: 'Growth Engine',
    price: '$47',
    period: 'package',
    description: 'For growing businesses',
    features: [
      '10 complete offer generations',
      'All premium features',
      'Advanced offer components',
      'Premium PDF export',
      'Priority support',
      'Offer editing & regeneration',
    ],
    cta: 'Buy Package',
    popular: true,
    gradient: 'from-violet-500 to-sky-500',
    pricePerOffer: '$4.70 per offer',
    badge: 'Best Value',
  },
  {
    id: 'agency-arsenal',
    name: 'Agency Arsenal',
    price: '$99',
    period: 'package',
    description: 'For agencies and teams',
    features: [
      '30 complete offer generations',
      'All premium features',
      'Advanced offer components',
      'Premium PDF export',
      'Priority support',
      'Bulk offer management',
    ],
    cta: 'Buy Package',
    popular: false,
    gradient: 'from-sky-500 to-yellow-500',
    pricePerOffer: '$3.30 per offer',
    badge: 'Best Deal',
  },
]

export const getHomePricingPlan = (planId: string): HomePricingPlan | undefined => {
  return homePricingPlans.find(plan => plan.id === planId)
}

export const getHomePlanStatus = (subscriptionTier: string, creditsRemaining: number) => {
  const plan = getHomePricingPlan(subscriptionTier) || homePricingPlans[0]

  // Calculate max credits based on plan
  let maxCredits = 3 // default for free
  if (subscriptionTier === 'starter-spark') maxCredits = 3 // 1 + 2 regenerations
  if (subscriptionTier === 'growth-engine') maxCredits = 10
  if (subscriptionTier === 'agency-arsenal') maxCredits = 30

  const usedCredits = maxCredits - creditsRemaining
  const usagePercentage = maxCredits > 0 ? (usedCredits / maxCredits) * 100 : 0

  return {
    currentPlan: plan,
    creditsRemaining,
    maxCredits,
    usedCredits,
    usagePercentage,
  }
}
