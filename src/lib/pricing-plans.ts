export interface PricingPlan {
  id: string
  name: string
  price: number
  originalPrice?: number
  credits: number
  features: string[]
  popular?: boolean
  color: string
  description: string
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 3,
    features: ['3 Grand Slam Offers', 'Basic PDF Export', 'Email Support', 'Standard Templates'],
    color: 'gray',
    description: 'Perfect for testing the waters',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 47,
    originalPrice: 97,
    credits: 25,
    features: [
      '25 Grand Slam Offers',
      'Premium PDF Export',
      'Priority Support',
      'All Templates',
      'Advanced Customization',
      'Analytics Dashboard',
    ],
    popular: true,
    color: 'blue',
    description: 'Most popular for serious entrepreneurs',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 97,
    originalPrice: 197,
    credits: 100,
    features: [
      '100 Grand Slam Offers',
      'Premium PDF Export',
      'White-label Options',
      'Priority Support',
      'All Templates',
      'Advanced Customization',
      'Analytics Dashboard',
      'Custom Branding',
      'API Access',
    ],
    color: 'purple',
    description: 'For agencies and power users',
  },
]

export const getColorClasses = (color: string) => {
  const colorMap = {
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      button: 'bg-gray-600 hover:bg-gray-700 text-white',
      accent: 'text-gray-600',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-300',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      accent: 'text-blue-600',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-300',
      button: 'bg-purple-600 hover:purple-700 text-white',
      accent: 'text-purple-600',
    },
  }

  return colorMap[color as keyof typeof colorMap] || colorMap.gray
}

export const getPlanById = (planId: string): PricingPlan | undefined => {
  return pricingPlans.find(plan => plan.id === planId)
}

export const getUserPlanStatus = (userTier: string, creditsRemaining: number) => {
  const currentPlan = getPlanById(userTier) || pricingPlans[0]
  const maxCredits = currentPlan.credits
  const usedCredits = maxCredits - creditsRemaining
  const usagePercentage = (usedCredits / maxCredits) * 100

  return {
    currentPlan,
    maxCredits,
    usedCredits,
    creditsRemaining,
    usagePercentage: Math.min(usagePercentage, 100),
  }
}
