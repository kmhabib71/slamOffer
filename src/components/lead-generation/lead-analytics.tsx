'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BarChart3, TrendingUp, Users, Target, Mail, Calendar, DollarSign, Zap } from 'lucide-react'

interface LeadAnalyticsProps {
  userId: string
}

interface AnalyticsData {
  leadsByMonth: { month: string; count: number }[]
  conversionFunnel: { stage: string; count: number; percentage: number }[]
  sourcePerformance: {
    source: string
    leads: number
    conversion_rate: number
    cost_per_lead: number
  }[]
  campaignMetrics: {
    campaign: string
    emails_sent: number
    open_rate: number
    click_rate: number
    conversions: number
  }[]
  leadScoreDistribution: { score_range: string; count: number }[]
}

export default function LeadAnalytics({ userId }: LeadAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [userId, timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/leads/analytics?timeRange=${timeRange}`)
      const result = await response.json()
      setData(result.analytics)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Analytics</h1>
          <p className="text-gray-600">Track your lead generation performance and ROI</p>
        </div>
        <div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.leadsByMonth.reduce((sum, month) => sum + month.count, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{data?.leadsByMonth[data?.leadsByMonth.length - 1]?.count || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.conversionFunnel.find(f => f.stage === 'converted')?.percentage.toFixed(1) ||
                0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.conversionFunnel.find(f => f.stage === 'converted')?.count || 0} converted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost per Lead</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {data?.sourcePerformance.reduce((sum, source) => sum + source.cost_per_lead, 0) /
                (data?.sourcePerformance.length || 1) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.campaignMetrics.length || 0}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Leads by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.leadsByMonth.map(month => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{month.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(month.count / Math.max(...data.leadsByMonth.map(m => m.count))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{month.count}</span>
                  </div>
                </div>
              )) || <p className="text-gray-500">No data available</p>}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.conversionFunnel.map(stage => (
                <div key={stage.stage} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {stage.count} ({stage.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )) || <p className="text-gray-500">No data available</p>}
            </div>
          </CardContent>
        </Card>

        {/* Source Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Source Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Source</th>
                    <th className="text-left p-2">Leads</th>
                    <th className="text-left p-2">Conv Rate</th>
                    <th className="text-left p-2">Cost/Lead</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.sourcePerformance.map(source => (
                    <tr key={source.source} className="border-b">
                      <td className="p-2 font-medium capitalize">{source.source}</td>
                      <td className="p-2">{source.leads}</td>
                      <td className="p-2">{source.conversion_rate.toFixed(1)}%</td>
                      <td className="p-2">${source.cost_per_lead.toFixed(2)}</td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Campaign Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.campaignMetrics.map(campaign => (
                <div key={campaign.campaign} className="p-3 border rounded-lg">
                  <div className="font-medium mb-2">{campaign.campaign}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Emails: {campaign.emails_sent}</div>
                    <div>Opens: {campaign.open_rate.toFixed(1)}%</div>
                    <div>Clicks: {campaign.click_rate.toFixed(1)}%</div>
                    <div>Conversions: {campaign.conversions}</div>
                  </div>
                </div>
              )) || <p className="text-gray-500">No campaigns running</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lead Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {data?.leadScoreDistribution.map(score => (
              <div key={score.score_range} className="text-center">
                <div className="text-2xl font-bold text-blue-600">{score.count}</div>
                <div className="text-sm text-gray-600">{score.score_range}</div>
              </div>
            )) || (
              <div className="col-span-5 text-center text-gray-500">
                No lead score data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
