'use client'

import React from 'react'
import GrandSlamMindmap from '@/components/mindmap/grand-slam-mindmap'
import { GrandSlamOfferData } from '@/types'

// Sample data based on Alex Hormozi's 11 components
const grandSlamOfferData: GrandSlamOfferData = {
  id: 'grand-slam-offer-1',
  title: 'Grand Slam Offer',
  components: [
    {
      id: 'component-1',
      title: 'Dream Outcome Identification',
      description: "Identify your prospect's ultimate destination",
      color: 'from-purple-500 to-purple-600',
      isEditable: false,
      order: 1,
      items: [
        {
          id: 'item-1-1',
          title: 'Focus on End Result',
          content: 'Sell the vacation, not the plane flight',
          isEditable: true,
          order: 1,
        },
        {
          id: 'item-1-2',
          title: 'Make it Specific',
          content: 'Tangible and emotionally compelling outcomes',
          isEditable: true,
          order: 2,
        },
        {
          id: 'item-1-3',
          title: 'Example Outcomes',
          content: 'Lose 20lbs in 6 weeks, Get first 10 clients, Double revenue',
          isEditable: true,
          order: 3,
        },
      ],
    },
    {
      id: 'component-2',
      title: 'Problems & Obstacles List',
      description: 'List everything that could prevent success',
      color: 'from-red-500 to-red-600',
      isEditable: false,
      order: 2,
      items: [
        {
          id: 'item-2-1',
          title: 'Dream Outcome Obstacles',
          content: "Won't be worth it financially",
          isEditable: true,
          order: 1,
        },
        {
          id: 'item-2-2',
          title: 'Likelihood Obstacles',
          content: "Won't work for me, can't stick with it",
          isEditable: true,
          order: 2,
        },
        {
          id: 'item-2-3',
          title: 'Effort & Sacrifice Obstacles',
          content: "Too hard, confusing, won't like it",
          isEditable: true,
          order: 3,
        },
        {
          id: 'item-2-4',
          title: 'Time Obstacles',
          content: 'Takes too long, too busy, not convenient',
          isEditable: true,
          order: 4,
        },
      ],
    },
    {
      id: 'component-3',
      title: 'Solutions List',
      description: 'Transform every problem into a solution',
      color: 'from-green-500 to-green-600',
      isEditable: false,
      order: 3,
      items: [
        {
          id: 'item-3-1',
          title: 'How To Statements',
          content: 'Frame solutions with "How to..." language',
          isEditable: true,
          order: 1,
        },
        {
          id: 'item-3-2',
          title: 'Address Every Obstacle',
          content: 'Solution for each problem identified',
          isEditable: true,
          order: 2,
        },
        {
          id: 'item-3-3',
          title: 'Benefit-Focused',
          content: 'Make solutions specific and compelling',
          isEditable: true,
          order: 3,
        },
      ],
    },
    {
      id: 'component-4',
      title: 'Solutions Delivery Vehicles',
      description: "Determine how you'll deliver each solution",
      color: 'from-blue-500 to-blue-600',
      isEditable: false,
      order: 4,
      items: [
        {
          id: 'item-4-1',
          title: 'Personal Attention',
          content: '1-on-1, Small Group, 1-to-Many',
          isEditable: true,
          order: 1,
        },
        {
          id: 'item-4-2',
          title: 'Effort Level',
          content: 'DIY, DWY (Done With You), DFY (Done For You)',
          isEditable: true,
          order: 2,
        },
        {
          id: 'item-4-3',
          title: 'Delivery Medium',
          content: 'In-person, phone, email, text, video, audio, written',
          isEditable: true,
          order: 3,
        },
        {
          id: 'item-4-4',
          title: 'Response Time',
          content: '24/7, business hours, within minutes/hours/days',
          isEditable: true,
          order: 4,
        },
      ],
    },
    {
      id: 'component-5',
      title: 'Trim & Stack',
      description: 'Optimize for maximum value at minimum cost',
      color: 'from-yellow-500 to-yellow-600',
      isEditable: false,
      order: 5,
      items: [
        {
          id: 'item-5-1',
          title: 'Remove High-Cost, Low-Value',
          content: "Eliminate expensive items that don't add much value",
          isEditable: true,
          order: 1,
        },
        {
          id: 'item-5-2',
          title: 'Keep High-Value Items',
          content: 'Retain both high-cost and low-cost high-value solutions',
          isEditable: true,
          order: 2,
        },
        {
          id: 'item-5-3',
          title: 'One-to-Many Solutions',
          content: 'Focus on scalable delivery methods',
          isEditable: true,
          order: 3,
        },
      ],
    },
    {
      id: 'component-6',
      title: 'High-Value Deliverable Bundle',
      description: 'Combine everything into an irresistible package',
      color: 'from-indigo-500 to-indigo-600',
      isEditable: false,
      order: 6,
      items: [
        {
          id: 'item-6-1',
          title: 'Bundle Solutions',
          content: 'Combine all high-value solutions together',
          isEditable: true,
          order: 1,
        },
        {
          id: 'item-6-2',
          title: 'Benefit-Driven Titles',
          content: 'Name each bundle with compelling benefits',
          isEditable: true,
          order: 2,
        },
        {
          id: 'item-6-3',
          title: 'Dollar Values',
          content: 'Assign specific dollar values to each bundle',
          isEditable: true,
          order: 3,
        },
        {
          id: 'item-6-4',
          title: 'Irresistible Moment',
          content: 'Create the "All that? Seriously? Yes, I\'m in!" moment',
          isEditable: true,
          order: 4,
        },
      ],
    },
    {
      id: 'component-7',
      title: 'Scarcity',
      description: 'Decrease supply to increase demand',
      color: 'from-orange-500 to-orange-600',
      isEditable: false,
      order: 7,
      items: [
        {
          id: 'item-7-1',
          title: 'Limited Supply of Seats',
          content: 'Cap total clients or weekly intake',
          isEditable: true,
          order: 1,
        },
        {
          id: 'item-7-2',
          title: 'Limited Supply of Bonuses',
          content: 'Exclusive access items',
          isEditable: true,
          order: 2,
        },
        {
          id: 'item-7-3',
          title: 'Never Available Again',
          content: 'One-time offers and limited releases',
          isEditable: true,
          order: 3,
        },
        {
          id: 'item-7-4',
          title: 'Honest Scarcity',
          content: 'Based on actual capacity limits',
          isEditable: true,
          order: 4,
        },
      ],
    },
    {
      id: 'component-8',
      title: 'Urgency',
      description: 'Add time-based pressure to drive decisions',
      color: 'from-pink-500 to-pink-600',
      isEditable: false,
      order: 8,
      items: [
        {
          id: 'item-8-1',
          title: 'Rolling Cohorts',
          content: 'Start Monday or wait until next week',
          isEditable: true,
          order: 1,
        },
        {
          id: 'item-8-2',
          title: 'Seasonal Urgency',
          content: 'Holiday/event-based deadlines',
          isEditable: true,
          order: 2,
        },
        {
          id: 'item-8-3',
          title: 'Pricing Urgency',
          content: 'Limited-time discounts or bonuses',
          isEditable: true,
          order: 3,
        },
        {
          id: 'item-8-4',
          title: 'Exploding Opportunity',
          content: 'Time-sensitive arbitrage situations',
          isEditable: true,
          order: 4,
        },
      ],
    },
    {
      id: 'component-9',
      title: 'Bonuses',
      description: "Stack value to break the prospect's mind",
      color: 'from-teal-500 to-teal-600',
      isEditable: false,
      order: 9,
      items: [
        {
          id: 'item-9-1',
          title: 'Address Specific Concerns',
          content: 'Target obstacles with focused bonuses',
          isEditable: true,
          order: 1,
        },
        {
          id: 'item-9-2',
          title: 'Benefit-Driven Names',
          content: 'Name bonuses with compelling titles',
          isEditable: true,
          order: 2,
        },
        {
          id: 'item-9-3',
          title: 'Eclipse Core Value',
          content: 'Make bonus value exceed main offer value',
          isEditable: true,
          order: 3,
        },
        {
          id: 'item-9-4',
          title: 'Tools Over Training',
          content: 'Include checklists, templates, tools',
          isEditable: true,
          order: 4,
        },
      ],
    },
    {
      id: 'component-10',
      title: 'Guarantees',
      description: 'Reverse risk to eliminate purchase resistance',
      color: 'from-cyan-500 to-cyan-600',
      isEditable: false,
      order: 10,
      items: [
        {
          id: 'item-10-1',
          title: 'Unconditional',
          content: 'No questions asked refunds',
          isEditable: true,
          order: 1,
        },
        {
          id: 'item-10-2',
          title: 'Conditional',
          content: 'Performance-based with requirements',
          isEditable: true,
          order: 2,
        },
        {
          id: 'item-10-3',
          title: 'Anti-Guarantees',
          content: 'All sales final with strong reasoning',
          isEditable: true,
          order: 3,
        },
        {
          id: 'item-10-4',
          title: 'Stack Multiple',
          content: 'Combine guarantees for maximum impact',
          isEditable: true,
          order: 4,
        },
      ],
    },
    {
      id: 'component-11',
      title: 'Naming (M.A.G.I.C. Formula)',
      description: 'Create magnetic offer names',
      color: 'from-violet-500 to-violet-600',
      isEditable: false,
      order: 11,
      items: [
        {
          id: 'item-11-1',
          title: 'Magnetic Reason Why',
          content: 'Free, discount, event-based hook',
          isEditable: true,
          order: 1,
        },
        {
          id: 'item-11-2',
          title: 'Avatar',
          content: 'Specific target audience identification',
          isEditable: true,
          order: 2,
        },
        {
          id: 'item-11-3',
          title: 'Goal',
          content: 'Clear dream outcome statement',
          isEditable: true,
          order: 3,
        },
        {
          id: 'item-11-4',
          title: 'Interval',
          content: 'Timeframe for achievement',
          isEditable: true,
          order: 4,
        },
        {
          id: 'item-11-5',
          title: 'Container',
          content: 'Blueprint, challenge, system, intensive, etc.',
          isEditable: true,
          order: 5,
        },
      ],
    },
  ],
}

export default function MindmapPage() {
  const handleDataChange = (newData: GrandSlamOfferData) => {
    console.log('Grand Slam Offer data changed:', newData)
    // Here you could save the data to your backend or local storage
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Grand Slam Offer Builder</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Build your irresistible offer using Alex Hormozi's proven 11-component framework. Switch
            between mindmap and text views to visualize and edit your offer structure. All items are
            fully editable - customize each component to fit your business.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <GrandSlamMindmap data={grandSlamOfferData} onDataChange={handleDataChange} />
        </div>

        <div className="mt-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md light-content">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mindmap View</h3>
              <p className="text-gray-600 text-sm">
                Visualize the complete Grand Slam Offer framework with the parent node connected to
                all 11 components via dotted lines. Each component has its own editable items.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md light-content">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Text View</h3>
              <p className="text-gray-600 text-sm">
                View and edit all components in a structured, vertical format. Perfect for detailed
                content editing and comprehensive offer development.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md light-content">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fully Editable</h3>
              <p className="text-gray-600 text-sm">
                Add, edit, or delete items within each component. The framework structure remains
                intact while you customize the content to your specific offer.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-center">
            Alex Hormozi's $100M Offers Framework
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Phase 1: Core Offer (Components 1-6)</h4>
              <ul className="space-y-1 text-purple-100">
                <li>• Dream Outcome Identification</li>
                <li>• Problems & Obstacles List</li>
                <li>• Solutions List</li>
                <li>• Solutions Delivery Vehicles</li>
                <li>• Trim & Stack</li>
                <li>• High-Value Deliverable Bundle</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Phase 2: Enhancement (Components 7-11)</h4>
              <ul className="space-y-1 text-purple-100">
                <li>• Scarcity</li>
                <li>• Urgency</li>
                <li>• Bonuses</li>
                <li>• Guarantees</li>
                <li>• Naming (M.A.G.I.C. Formula)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Benefits</h4>
              <ul className="space-y-1 text-purple-100">
                <li>• Systematic approach</li>
                <li>• Proven methodology</li>
                <li>• Irresistible offers</li>
                <li>• Higher conversions</li>
                <li>• Competitive advantage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
