'use client'

import React from 'react'
import PremiumPDFExport from '@/components/pdf/premium-pdf-export'
import { GrandSlamOfferData } from '@/types'

// Sample data for demonstration
const sampleData: GrandSlamOfferData = {
  id: 'demo-1',
  title: 'Ultimate Fitness Transformation Program',
  components: [
    {
      id: 'dream-outcomes',
      title: 'Dream Outcomes',
      description: 'The specific, measurable results your customers will achieve',
      items: [
        {
          id: 'outcome-1',
          title: 'Lose 20-30 pounds in 90 days',
          content: 'Sustainable weight loss through proven nutrition and exercise protocols',
          isEditable: false,
          order: 1,
        },
        {
          id: 'outcome-2',
          title: 'Build lean muscle mass',
          content: 'Increase strength and muscle definition with progressive resistance training',
          isEditable: false,
          order: 2,
        },
        {
          id: 'outcome-3',
          title: 'Improve energy levels',
          content: 'Experience sustained energy throughout the day with optimized nutrition',
          isEditable: false,
          order: 3,
        },
      ],
      isEditable: false,
      color: '#06B6D4',
      order: 1,
    },
    {
      id: 'solutions',
      title: 'Solutions',
      description: 'The specific methods and strategies to achieve the dream outcomes',
      items: [
        {
          id: 'solution-1',
          title: 'Personalized meal planning',
          content: 'Custom nutrition plans based on your body type, goals, and preferences',
          isEditable: false,
          order: 1,
        },
        {
          id: 'solution-2',
          title: 'Progressive workout programs',
          content: 'Structured exercise routines that adapt to your fitness level and progress',
          isEditable: false,
          order: 2,
        },
        {
          id: 'solution-3',
          title: 'Daily accountability coaching',
          content: 'Regular check-ins and support to keep you on track and motivated',
          isEditable: false,
          order: 3,
        },
      ],
      isEditable: false,
      color: '#8B5CF6',
      order: 2,
    },
    {
      id: 'value-stack',
      title: 'Value Stack',
      description: 'All the additional value and bonuses included in your offer',
      items: [
        {
          id: 'bonus-1',
          title: 'Recipe database (500+ meals)',
          content: 'Access to our complete collection of healthy, delicious recipes',
          isEditable: false,
          order: 1,
        },
        {
          id: 'bonus-2',
          title: 'Workout video library',
          content: 'HD video demonstrations of all exercises with proper form',
          isEditable: false,
          order: 2,
        },
        {
          id: 'bonus-3',
          title: 'Private community access',
          content: 'Join our exclusive Facebook group for support and motivation',
          isEditable: false,
          order: 3,
        },
      ],
      isEditable: false,
      color: '#10B981',
      order: 3,
    },
    {
      id: 'risk-reversal',
      title: 'Risk Reversal',
      description: 'How you eliminate or minimize the risk for your customers',
      items: [
        {
          id: 'guarantee-1',
          title: '90-day money-back guarantee',
          content: "If you don't see results in 90 days, get a full refund - no questions asked",
          isEditable: false,
          order: 1,
        },
        {
          id: 'guarantee-2',
          title: 'Results guarantee',
          content: "We guarantee you'll lose at least 15 pounds or your next month is free",
          isEditable: false,
          order: 2,
        },
        {
          id: 'guarantee-3',
          title: 'Satisfaction guarantee',
          content: "Not happy with the program? We'll work with you until you are",
          isEditable: false,
          order: 3,
        },
      ],
      isEditable: false,
      color: '#F59E0B',
      order: 4,
    },
    {
      id: 'scarcity',
      title: 'Scarcity & Urgency',
      description: 'Why customers need to act now rather than later',
      items: [
        {
          id: 'scarcity-1',
          title: 'Limited enrollment (50 spots)',
          content: 'We only accept 50 new clients per month to ensure quality coaching',
          isEditable: false,
          order: 1,
        },
        {
          id: 'scarcity-2',
          title: 'Early bird pricing ends soon',
          content: 'Save $200 when you enroll this week - price increases next Monday',
          isEditable: false,
          order: 2,
        },
        {
          id: 'scarcity-3',
          title: 'Summer body deadline',
          content: "Start now to be beach-ready in 12 weeks - don't wait until it's too late",
          isEditable: false,
          order: 3,
        },
      ],
      isEditable: false,
      color: '#EF4444',
      order: 5,
    },
    {
      id: 'social-proof',
      title: 'Social Proof',
      description: 'Evidence that your solution works for others like your customers',
      items: [
        {
          id: 'proof-1',
          title: 'Success stories from 500+ clients',
          content: 'Real testimonials and before/after photos from satisfied customers',
          isEditable: false,
          order: 1,
        },
        {
          id: 'proof-2',
          title: 'Average weight loss: 25 pounds',
          content: 'Our clients lose an average of 25 pounds in their first 90 days',
          isEditable: false,
          order: 2,
        },
        {
          id: 'proof-3',
          title: '4.9/5 star rating',
          content: 'Rated 4.9 out of 5 stars by over 1,000 verified customers',
          isEditable: false,
          order: 3,
        },
      ],
      isEditable: false,
      color: '#8B5CF6',
      order: 6,
    },
    {
      id: 'pricing',
      title: 'Pricing Strategy',
      description: 'How you structure the price to maximize perceived value',
      items: [
        {
          id: 'price-1',
          title: 'Value-based pricing: $997',
          content: 'Priced based on the value of results, not just the cost of delivery',
          isEditable: false,
          order: 1,
        },
        {
          id: 'price-2',
          title: 'Payment plan available',
          content: '3 monthly payments of $347 (save $44 with full payment)',
          isEditable: false,
          order: 2,
        },
        {
          id: 'price-3',
          title: 'ROI guarantee',
          content: "You'll save more on healthcare costs than the program costs",
          isEditable: false,
          order: 3,
        },
      ],
      isEditable: false,
      color: '#06B6D4',
      order: 7,
    },
    {
      id: 'objection-handling',
      title: 'Objection Handling',
      description: 'How you address common concerns and objections',
      items: [
        {
          id: 'objection-1',
          title: 'Time concerns',
          content: 'Only 30 minutes per day required - we work with your schedule',
          isEditable: false,
          order: 1,
        },
        {
          id: 'objection-2',
          title: 'Cost concerns',
          content: 'Less than $11 per day for life-changing results - cheaper than coffee',
          isEditable: false,
          order: 2,
        },
        {
          id: 'objection-3',
          title: 'Will it work for me?',
          content: 'Our program has worked for people of all ages, fitness levels, and body types',
          isEditable: false,
          order: 3,
        },
      ],
      isEditable: false,
      color: '#10B981',
      order: 8,
    },
    {
      id: 'urgency',
      title: 'Urgency',
      description: 'Why customers need to act immediately',
      items: [
        {
          id: 'urgency-1',
          title: 'Limited time offer',
          content: 'This pricing and bonus package is only available until Friday at midnight',
          isEditable: false,
          order: 1,
        },
        {
          id: 'urgency-2',
          title: 'Seasonal deadline',
          content: 'Summer is approaching - start now to be ready for beach season',
          isEditable: false,
          order: 2,
        },
        {
          id: 'urgency-3',
          title: 'Health urgency',
          content: 'Every day you wait is another day of feeling tired and unhealthy',
          isEditable: false,
          order: 3,
        },
      ],
      isEditable: false,
      color: '#F59E0B',
      order: 9,
    },
    {
      id: 'bonus',
      title: 'Bonus Section',
      description: 'Additional irresistible bonuses that sweeten the deal',
      items: [
        {
          id: 'bonus-1',
          title: 'Free consultation call',
          content: '30-minute strategy session to customize the program for your specific needs',
          isEditable: false,
          order: 1,
        },
        {
          id: 'bonus-2',
          title: 'Progress tracking app',
          content: 'Access to our premium app for tracking workouts, meals, and progress',
          isEditable: false,
          order: 2,
        },
        {
          id: 'bonus-3',
          title: 'Lifetime access',
          content: 'Keep all materials and updates forever - no recurring fees',
          isEditable: false,
          order: 3,
        },
      ],
      isEditable: false,
      color: '#EF4444',
      order: 10,
    },
    {
      id: 'call-to-action',
      title: 'Call to Action',
      description: 'The specific action you want customers to take',
      items: [
        {
          id: 'cta-1',
          title: 'Clear next step',
          content: 'Click "Start My Transformation" to begin your 90-day journey',
          isEditable: false,
          order: 1,
        },
        {
          id: 'cta-2',
          title: 'Immediate benefit',
          content: 'Get instant access to your meal plan and first workout today',
          isEditable: false,
          order: 2,
        },
        {
          id: 'cta-3',
          title: 'Risk-free start',
          content: 'Start your transformation with our 90-day guarantee - nothing to lose',
          isEditable: false,
          order: 3,
        },
      ],
      isEditable: false,
      color: '#8B5CF6',
      order: 11,
    },
  ],
}

const sampleUserInfo = {
  businessName: 'FitLife Transformations',
  ownerName: 'Sarah Johnson',
  email: 'sarah@fitlife.com',
  phone: '(555) 123-4567',
  website: 'www.fitlifetransformations.com',
}

export default function PremiumTemplateDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Premium PDF Template Demo</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our premium PDF export template designed for Grand Slam Offers. This template
            features clean typography, professional layout, and optimized printing.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <PremiumPDFExport
            data={sampleData}
            coverImage="/images/cover.svg"
            userInfo={sampleUserInfo}
            onExport={url => console.log('PDF exported:', url)}
          />
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Template Features:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-blue-800">
            <ul className="space-y-2">
              <li>• Clean, minimal design inspired by Notion and Apple Keynote</li>
              <li>• Optimized for A4/Letter print format</li>
              <li>• Professional typography with proper spacing</li>
              <li>• Cover page with gradient background and branding</li>
            </ul>
            <ul className="space-y-2">
              <li>• Table of contents with value equation</li>
              <li>• 11 component sections with clear structure</li>
              <li>• Implementation summary and next steps</li>
              <li>• Print-friendly CSS with proper page breaks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
