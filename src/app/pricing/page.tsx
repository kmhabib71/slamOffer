'use client'

import { useAuth } from '@/app/providers/auth-provider'
import HomePricingCards from '@/components/pricing/home-pricing-cards'
import { ArrowLeft, CheckCircle, Users, Zap, Crown } from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
  const { user } = useAuth()

  const benefits = [
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: 'Proven Framework',
      description: "Based on Alex Hormozi's $100M Offers methodology",
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: 'Trusted by Entrepreneurs',
      description: 'Join thousands of successful business owners',
    },
    {
      icon: <Zap className="h-6 w-6 text-purple-500" />,
      title: 'Instant Results',
      description: 'Generate compelling offers in minutes, not hours',
    },
    {
      icon: <Crown className="h-6 w-6 text-yellow-500" />,
      title: 'Premium Quality',
      description: 'Professional-grade offers that convert',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Choose Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Grand Slam
            </span>{' '}
            Plan
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Transform your business with irresistible offers that your customers can't refuse. Based
            on Alex Hormozi's proven $100M framework.
          </p>

          {user && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
              <p className="text-white/90 text-sm">
                Welcome back, <span className="font-semibold">{user.name || user.email}</span>
              </p>
              <p className="text-white/70 text-xs">
                Current Plan:{' '}
                <span className="font-medium capitalize">
                  {(user as any).subscription_tier || 'Free'}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">{benefit.icon}</div>
              <h3 className="text-white font-semibold mb-2">{benefit.title}</h3>
              <p className="text-white/70 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="mb-16">
          <HomePricingCards
            currentPlan={(user as any)?.subscription_tier || 'free'}
            showCurrentPlan={!!user}
          />
        </div>

        {/* FAQ Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-2">What's included in each plan?</h3>
                <p className="text-white/70 text-sm">
                  Each plan includes access to our Grand Slam Offer generator, PDF export
                  capabilities, and customer support. Higher tiers include more offers, premium
                  features, and priority support.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Can I upgrade anytime?</h3>
                <p className="text-white/70 text-sm">
                  Yes! You can upgrade your plan at any time. Your remaining credits will be
                  preserved, and you'll immediately get access to all the new features.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">What if I need more offers?</h3>
                <p className="text-white/70 text-sm">
                  You can always upgrade to a higher plan or purchase additional offer credits. We
                  also offer custom enterprise solutions for high-volume users.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-2">Is there a money-back guarantee?</h3>
                <p className="text-white/70 text-sm">
                  Yes! We offer a 30-day money-back guarantee. If you're not satisfied with your
                  purchase, we'll refund your payment, no questions asked.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">How does the AI generation work?</h3>
                <p className="text-white/70 text-sm">
                  Our AI is trained on Alex Hormozi's $100M Offers framework. Simply input your
                  business details, and it generates customized, high-converting offers tailored to
                  your specific industry and audience.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-white/70 text-sm">
                  Our plans are one-time purchases, not subscriptions. You pay once and get the
                  specified number of offers. No recurring charges or cancellation needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1000+</div>
              <div className="text-white/70 text-sm">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50k+</div>
              <div className="text-white/70 text-sm">Offers Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4.9/5</div>
              <div className="text-white/70 text-sm">Customer Rating</div>
            </div>
          </div>

          <p className="text-white/60 text-sm">
            Join thousands of entrepreneurs who've transformed their businesses with Grand Slam
            Offers
          </p>
        </div>
      </div>
    </div>
  )
}
