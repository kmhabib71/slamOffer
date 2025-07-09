'use client'

import { useState } from 'react'
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
import {
  Zap,
  Mail,
  Users,
  MessageCircle,
  Target,
  Share2,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

interface WorkflowTriggersProps {
  userId: string
}

interface WorkflowExecution {
  id: string
  type: string
  status: 'running' | 'completed' | 'failed'
  startTime: Date
  endTime?: Date
  results?: any
}

export default function WorkflowTriggers({ userId }: WorkflowTriggersProps) {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  // Workflow specific states
  const [warmOutreachData, setWarmOutreachData] = useState({
    contacts: '',
    message_template: 'Hi {{name}}, I wanted to reach out about {{company}}...',
  })

  const [coldOutreachData, setColdOutreachData] = useState({
    prospects: '',
    sequence_settings: {
      total_emails: 3,
      intervals_days: [1, 3, 7],
      personalization_level: 'medium' as 'basic' | 'medium' | 'high',
    },
  })

  const [contentMarketingData, setContentMarketingData] = useState({
    content_type: 'linkedin' as 'linkedin' | 'facebook' | 'twitter' | 'blog' | 'email',
    topics: '',
    schedule: {
      frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
      time: '09:00',
      days: [1, 3, 5],
    },
  })

  const [paidAdsData, setPaidAdsData] = useState({
    platform: 'google' as 'google' | 'facebook' | 'linkedin',
    campaign_type: 'lead_generation' as 'lead_generation' | 'brand_awareness' | 'conversion',
    target_audience: {
      demographics: '',
      interests: '',
      behaviors: '',
    },
    budget: {
      daily_budget: 50,
      total_budget: 1000,
    },
    ad_creative: {
      headline: '',
      description: '',
      cta: 'Learn More',
    },
  })

  const triggerWorkflow = async (workflowType: string, data: any) => {
    setLoading(workflowType)

    try {
      const response = await fetch('/api/n8n-workflows/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType,
          data: {
            ...data,
            userId,
          },
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // Add to executions list
        const newExecution: WorkflowExecution = {
          id: result.executionId,
          type: workflowType,
          status: 'running',
          startTime: new Date(),
        }

        setExecutions(prev => [newExecution, ...prev])

        // Poll for status updates
        pollExecutionStatus(result.executionId)

        alert(`${workflowType} workflow triggered successfully!`)
      } else {
        throw new Error('Failed to trigger workflow')
      }
    } catch (error) {
      console.error('Error triggering workflow:', error)
      alert('Failed to trigger workflow. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const pollExecutionStatus = async (executionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/n8n-workflows/status?executionId=${executionId}`)

        if (response.ok) {
          const result = await response.json()

          setExecutions(prev =>
            prev.map(exec =>
              exec.id === executionId
                ? {
                    ...exec,
                    status: result.status,
                    endTime: result.status !== 'running' ? new Date() : undefined,
                    results: result.data,
                  }
                : exec
            )
          )

          // Stop polling if completed or failed
          if (result.status === 'completed' || result.status === 'failed') {
            clearInterval(pollInterval)
          }
        }
      } catch (error) {
        console.error('Error polling execution status:', error)
        clearInterval(pollInterval)
      }
    }, 2000) // Poll every 2 seconds
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const parseContactsList = (contactsString: string) => {
    return contactsString
      .split('\n')
      .map(line => {
        const [email, name, company] = line.split(',').map(s => s.trim())
        return { email, name, company }
      })
      .filter(contact => contact.email)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Triggers</h1>
          <p className="text-gray-600">Manually trigger n8n workflows for lead generation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Triggers */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="warm-outreach" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="warm-outreach">
                <Users className="h-4 w-4 mr-2" />
                Warm
              </TabsTrigger>
              <TabsTrigger value="cold-outreach">
                <Mail className="h-4 w-4 mr-2" />
                Cold
              </TabsTrigger>
              <TabsTrigger value="content-marketing">
                <MessageCircle className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="paid-ads">
                <Target className="h-4 w-4 mr-2" />
                Paid Ads
              </TabsTrigger>
            </TabsList>

            <TabsContent value="warm-outreach">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Warm Outreach
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Contacts (email,name,company per line)
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-md"
                      rows={4}
                      placeholder="john@example.com,John Doe,Example Corp&#10;jane@test.com,Jane Smith,Test Inc"
                      value={warmOutreachData.contacts}
                      onChange={e =>
                        setWarmOutreachData(prev => ({ ...prev, contacts: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message Template</label>
                    <textarea
                      className="w-full p-3 border rounded-md"
                      rows={3}
                      value={warmOutreachData.message_template}
                      onChange={e =>
                        setWarmOutreachData(prev => ({ ...prev, message_template: e.target.value }))
                      }
                    />
                  </div>

                  <Button
                    onClick={() =>
                      triggerWorkflow('warm-outreach', {
                        contacts: parseContactsList(warmOutreachData.contacts),
                        message_template: warmOutreachData.message_template,
                      })
                    }
                    disabled={loading === 'warm-outreach' || !warmOutreachData.contacts.trim()}
                    className="w-full"
                  >
                    {loading === 'warm-outreach' ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Triggering...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Trigger Warm Outreach
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cold-outreach">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Cold Outreach
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Prospects (email,name,company per line)
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-md"
                      rows={4}
                      placeholder="prospect@company.com,Prospect Name,Company Name"
                      value={coldOutreachData.prospects}
                      onChange={e =>
                        setColdOutreachData(prev => ({ ...prev, prospects: e.target.value }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Total Emails</label>
                      <Input
                        type="number"
                        value={coldOutreachData.sequence_settings.total_emails}
                        onChange={e =>
                          setColdOutreachData(prev => ({
                            ...prev,
                            sequence_settings: {
                              ...prev.sequence_settings,
                              total_emails: parseInt(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Personalization</label>
                      <Select
                        value={coldOutreachData.sequence_settings.personalization_level}
                        onValueChange={value =>
                          setColdOutreachData(prev => ({
                            ...prev,
                            sequence_settings: {
                              ...prev.sequence_settings,
                              personalization_level: value as 'basic' | 'medium' | 'high',
                            },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      triggerWorkflow('cold-outreach', {
                        prospects: parseContactsList(coldOutreachData.prospects),
                        sequence_settings: coldOutreachData.sequence_settings,
                      })
                    }
                    disabled={loading === 'cold-outreach' || !coldOutreachData.prospects.trim()}
                    className="w-full"
                  >
                    {loading === 'cold-outreach' ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Triggering...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Trigger Cold Outreach
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content-marketing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Content Marketing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Content Type</label>
                    <Select
                      value={contentMarketingData.content_type}
                      onValueChange={value =>
                        setContentMarketingData(prev => ({ ...prev, content_type: value as any }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Topics (comma-separated)
                    </label>
                    <Input
                      placeholder="AI, automation, business growth"
                      value={contentMarketingData.topics}
                      onChange={e =>
                        setContentMarketingData(prev => ({ ...prev, topics: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Frequency</label>
                    <Select
                      value={contentMarketingData.schedule.frequency}
                      onValueChange={value =>
                        setContentMarketingData(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule, frequency: value as any },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() =>
                      triggerWorkflow('content-marketing', {
                        ...contentMarketingData,
                        topics: contentMarketingData.topics.split(',').map(t => t.trim()),
                      })
                    }
                    disabled={
                      loading === 'content-marketing' || !contentMarketingData.topics.trim()
                    }
                    className="w-full"
                  >
                    {loading === 'content-marketing' ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Triggering...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Trigger Content Marketing
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paid-ads">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Paid Advertising
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Platform</label>
                      <Select
                        value={paidAdsData.platform}
                        onValueChange={value =>
                          setPaidAdsData(prev => ({ ...prev, platform: value as any }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google Ads</SelectItem>
                          <SelectItem value="facebook">Facebook Ads</SelectItem>
                          <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Campaign Type</label>
                      <Select
                        value={paidAdsData.campaign_type}
                        onValueChange={value =>
                          setPaidAdsData(prev => ({ ...prev, campaign_type: value as any }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead_generation">Lead Generation</SelectItem>
                          <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                          <SelectItem value="conversion">Conversion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Daily Budget ($)</label>
                      <Input
                        type="number"
                        value={paidAdsData.budget.daily_budget}
                        onChange={e =>
                          setPaidAdsData(prev => ({
                            ...prev,
                            budget: { ...prev.budget, daily_budget: parseInt(e.target.value) },
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Total Budget ($)</label>
                      <Input
                        type="number"
                        value={paidAdsData.budget.total_budget}
                        onChange={e =>
                          setPaidAdsData(prev => ({
                            ...prev,
                            budget: { ...prev.budget, total_budget: parseInt(e.target.value) },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ad Headline</label>
                    <Input
                      placeholder="Your compelling headline here"
                      value={paidAdsData.ad_creative.headline}
                      onChange={e =>
                        setPaidAdsData(prev => ({
                          ...prev,
                          ad_creative: { ...prev.ad_creative, headline: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ad Description</label>
                    <textarea
                      className="w-full p-3 border rounded-md"
                      rows={2}
                      placeholder="Describe your offer..."
                      value={paidAdsData.ad_creative.description}
                      onChange={e =>
                        setPaidAdsData(prev => ({
                          ...prev,
                          ad_creative: { ...prev.ad_creative, description: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <Button
                    onClick={() => triggerWorkflow('paid-ads', paidAdsData)}
                    disabled={loading === 'paid-ads' || !paidAdsData.ad_creative.headline.trim()}
                    className="w-full"
                  >
                    {loading === 'paid-ads' ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Triggering...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Trigger Paid Ads
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Execution History */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Execution History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {executions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No executions yet</p>
                ) : (
                  executions.map(execution => (
                    <div key={execution.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{execution.type}</span>
                        {getStatusIcon(execution.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Started: {execution.startTime.toLocaleTimeString()}</p>
                        {execution.endTime && (
                          <p>Finished: {execution.endTime.toLocaleTimeString()}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
