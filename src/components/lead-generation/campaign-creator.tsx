'use client'

import { useState } from 'react'
import { CampaignType, CampaignStatus } from '@/lib/models/lead'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Users, Calendar, DollarSign, Target, Settings, Save, Play, Zap } from 'lucide-react'

interface CampaignCreatorProps {
  userId: string
  onCampaignCreated?: (campaign: any) => void
}

export default function CampaignCreator({ userId, onCampaignCreated }: CampaignCreatorProps) {
  const [loading, setLoading] = useState(false)
  const [campaignData, setCampaignData] = useState({
    name: '',
    type: '' as CampaignType,
    description: '',
    target_audience: {
      industry: [] as string[],
      company_size: [] as string[],
      job_titles: [] as string[],
      location: [] as string[],
    },
    settings: {
      email_template: '',
      follow_up_sequence: false,
      follow_up_interval_days: 3,
      max_follow_ups: 3,
      personalization_level: 'medium' as 'basic' | 'medium' | 'high',
      a_b_testing: false,
    },
    budget: {
      total_budget: 0,
      cost_per_contact: 0,
    },
    schedule: {
      start_date: new Date(),
      send_times: ['09:00', '14:00'],
      send_days: [1, 2, 3, 4, 5], // Monday to Friday
      timezone: 'UTC',
    },
  })

  const handleInputChange = (field: string, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const handleArrayChange = (
    parent: string,
    field: string,
    value: string,
    action: 'add' | 'remove'
  ) => {
    setCampaignData(prev => {
      const parentObj = prev[parent as keyof typeof prev] as any
      const currentArray = parentObj[field] || []

      if (action === 'add' && !currentArray.includes(value)) {
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [field]: [...currentArray, value],
          },
        }
      } else if (action === 'remove') {
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [field]: currentArray.filter((item: string) => item !== value),
          },
        }
      }

      return prev
    })
  }

  const saveCampaign = async (status: CampaignStatus = 'draft') => {
    setLoading(true)
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...campaignData,
          status,
        }),
      })

      if (response.ok) {
        const { campaign } = await response.json()
        onCampaignCreated?.(campaign)
        alert(`Campaign ${status === 'draft' ? 'saved as draft' : 'created and activated'}!`)

        // Reset form
        setCampaignData({
          name: '',
          type: '' as CampaignType,
          description: '',
          target_audience: {
            industry: [],
            company_size: [],
            job_titles: [],
            location: [],
          },
          settings: {
            email_template: '',
            follow_up_sequence: false,
            follow_up_interval_days: 3,
            max_follow_ups: 3,
            personalization_level: 'medium',
            a_b_testing: false,
          },
          budget: {
            total_budget: 0,
            cost_per_contact: 0,
          },
          schedule: {
            start_date: new Date(),
            send_times: ['09:00', '14:00'],
            send_days: [1, 2, 3, 4, 5],
            timezone: 'UTC',
          },
        })
      } else {
        throw new Error('Failed to save campaign')
      }
    } catch (error) {
      console.error('Error saving campaign:', error)
      alert('Error saving campaign. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const triggerWorkflow = async () => {
    if (!campaignData.name || !campaignData.type) {
      alert('Please fill in campaign name and type first.')
      return
    }

    setLoading(true)
    try {
      // First save the campaign
      await saveCampaign('active')

      // Then trigger the n8n workflow
      const response = await fetch('/api/n8n-workflows/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType: campaignData.type,
          data: {
            campaign: campaignData,
            userId,
          },
        }),
      })

      if (response.ok) {
        const { executionId } = await response.json()
        alert(`Campaign launched! Execution ID: ${executionId}`)
      } else {
        throw new Error('Failed to trigger workflow')
      }
    } catch (error) {
      console.error('Error triggering workflow:', error)
      alert('Error launching campaign. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="text-gray-600">Set up your lead generation campaign powered by n8n</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => saveCampaign('draft')}
            disabled={loading || !campaignData.name}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={triggerWorkflow}
            disabled={loading || !campaignData.name || !campaignData.type}
          >
            <Zap className="h-4 w-4 mr-2" />
            Launch Campaign
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="audience">Target Audience</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Name</label>
                <Input
                  placeholder="Enter campaign name..."
                  value={campaignData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Campaign Type</label>
                <Select
                  value={campaignData.type}
                  onValueChange={value => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warm-outreach">Warm Outreach</SelectItem>
                    <SelectItem value="cold-outreach">Cold Outreach</SelectItem>
                    <SelectItem value="content-marketing">Content Marketing</SelectItem>
                    <SelectItem value="paid-ads">Paid Advertising</SelectItem>
                    <SelectItem value="referral">Referral Program</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full p-3 border rounded-md"
                  rows={3}
                  placeholder="Describe your campaign objectives..."
                  value={campaignData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Target Audience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Industries</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {campaignData.target_audience.industry.map(industry => (
                    <span
                      key={industry}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                    >
                      {industry}
                      <button
                        onClick={() =>
                          handleArrayChange('target_audience', 'industry', industry, 'remove')
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add industry..." id="industry-input" />
                  <Button
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById('industry-input') as HTMLInputElement
                      if (input.value.trim()) {
                        handleArrayChange('target_audience', 'industry', input.value.trim(), 'add')
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company Size</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {campaignData.target_audience.company_size.map(size => (
                    <span
                      key={size}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1"
                    >
                      {size}
                      <button
                        onClick={() =>
                          handleArrayChange('target_audience', 'company_size', size, 'remove')
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select
                    onValueChange={value =>
                      handleArrayChange('target_audience', 'company_size', value, 'add')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Job Titles</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {campaignData.target_audience.job_titles.map(title => (
                    <span
                      key={title}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1"
                    >
                      {title}
                      <button
                        onClick={() =>
                          handleArrayChange('target_audience', 'job_titles', title, 'remove')
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add job title..." id="job-title-input" />
                  <Button
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById('job-title-input') as HTMLInputElement
                      if (input.value.trim()) {
                        handleArrayChange(
                          'target_audience',
                          'job_titles',
                          input.value.trim(),
                          'add'
                        )
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Campaign Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Template</label>
                <textarea
                  className="w-full p-3 border rounded-md"
                  rows={4}
                  placeholder="Enter your email template... Use {{name}} for personalization"
                  value={campaignData.settings.email_template}
                  onChange={e => handleNestedChange('settings', 'email_template', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Personalization Level</label>
                <Select
                  value={campaignData.settings.personalization_level}
                  onValueChange={value =>
                    handleNestedChange('settings', 'personalization_level', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (Name only)</SelectItem>
                    <SelectItem value="medium">Medium (Name + Company)</SelectItem>
                    <SelectItem value="high">High (Full personalization)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="follow-up"
                  checked={campaignData.settings.follow_up_sequence}
                  onChange={e =>
                    handleNestedChange('settings', 'follow_up_sequence', e.target.checked)
                  }
                />
                <label htmlFor="follow-up" className="text-sm font-medium">
                  Enable follow-up sequence
                </label>
              </div>

              {campaignData.settings.follow_up_sequence && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Follow-up Interval (days)
                    </label>
                    <Input
                      type="number"
                      value={campaignData.settings.follow_up_interval_days}
                      onChange={e =>
                        handleNestedChange(
                          'settings',
                          'follow_up_interval_days',
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Follow-ups</label>
                    <Input
                      type="number"
                      value={campaignData.settings.max_follow_ups}
                      onChange={e =>
                        handleNestedChange('settings', 'max_follow_ups', parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ab-testing"
                  checked={campaignData.settings.a_b_testing}
                  onChange={e => handleNestedChange('settings', 'a_b_testing', e.target.checked)}
                />
                <label htmlFor="ab-testing" className="text-sm font-medium">
                  Enable A/B testing
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Total Budget ($)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={campaignData.budget.total_budget}
                  onChange={e =>
                    handleNestedChange('budget', 'total_budget', parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cost per Contact ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={campaignData.budget.cost_per_contact}
                  onChange={e =>
                    handleNestedChange(
                      'budget',
                      'cost_per_contact',
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Estimated Reach:</strong>{' '}
                  {campaignData.budget.total_budget && campaignData.budget.cost_per_contact
                    ? Math.floor(
                        campaignData.budget.total_budget / campaignData.budget.cost_per_contact
                      )
                    : 0}{' '}
                  contacts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={campaignData.schedule.start_date.toISOString().split('T')[0]}
                  onChange={e =>
                    handleNestedChange('schedule', 'start_date', new Date(e.target.value))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Send Times</label>
                <div className="flex gap-2">
                  {campaignData.schedule.send_times.map((time, index) => (
                    <Input
                      key={index}
                      type="time"
                      value={time}
                      onChange={e => {
                        const newTimes = [...campaignData.schedule.send_times]
                        newTimes[index] = e.target.value
                        handleNestedChange('schedule', 'send_times', newTimes)
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Send Days</label>
                <div className="flex gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <label key={day} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={campaignData.schedule.send_days.includes(index + 1)}
                        onChange={e => {
                          const newDays = e.target.checked
                            ? [...campaignData.schedule.send_days, index + 1]
                            : campaignData.schedule.send_days.filter(d => d !== index + 1)
                          handleNestedChange('schedule', 'send_days', newDays)
                        }}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <Select
                  value={campaignData.schedule.timezone}
                  onValueChange={value => handleNestedChange('schedule', 'timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
