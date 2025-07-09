'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { useToast } from '../ui/use-toast'
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  Download,
  RefreshCw,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
} from 'lucide-react'

interface LeadSource {
  id: string
  type: 'referral' | 'employee' | 'affiliate' | 'direct'
  name: string
  email: string
  phone?: string
  source_details: {
    source_id: string
    source_name: string
    commission_rate?: number
    expected_commission?: number
    tracking_code?: string
  }
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed_won' | 'closed_lost'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  last_activity: string
  notes?: string
}

interface UnifiedMetrics {
  summary: {
    totalLeads: number
    totalRevenue: number
    totalCost: number
    overallROI: number
    timeRange: string
    averageConversionRate: number
    averageCostPerLead: number
  }
  sourcePerformance: Array<{
    source: string
    type: string
    leads: number
    conversions: number
    conversionRate: number
    revenue: number
    cost: number
    roi: number
    costPerLead: number
  }>
  growthTrends: Array<{
    month: string
    leads: number
    conversions: number
    revenue: number
    leadGrowth: number
    revenueGrowth: number
  }>
  alerts: Array<{
    type: string
    message: string
    severity: 'low' | 'medium' | 'high'
    source: string
  }>
  bestPerformers: Array<{
    source: string
    type: string
    roi: number
    leads: number
    revenue: number
  }>
  commissionData?: {
    referral_commissions: number
    employee_commissions: number
    affiliate_commissions: number
    total_commissions: number
  }
}

const sourceTypeColors = {
  referral: 'bg-blue-100 text-blue-800',
  employee: 'bg-green-100 text-green-800',
  affiliate: 'bg-purple-100 text-purple-800',
  direct: 'bg-gray-100 text-gray-800',
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-orange-100 text-orange-800',
  converted: 'bg-green-100 text-green-800',
  closed_won: 'bg-emerald-100 text-emerald-800',
  closed_lost: 'bg-red-100 text-red-800',
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

export default function UnifiedLeadDashboard() {
  const [metrics, setMetrics] = useState<UnifiedMetrics | null>(null)
  const [leads, setLeads] = useState<LeadSource[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('30')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [timeRange, filterType, filterStatus])

  const fetchData = async () => {
    try {
      // Fetch metrics
      const metricsResponse = await fetch(
        `/api/unified-leads/metrics?timeRange=${timeRange}&includeCommissions=true`
      )
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
      }

      // Fetch leads
      const leadsParams = new URLSearchParams()
      if (filterType !== 'all') leadsParams.append('source_type', filterType)
      if (filterStatus !== 'all') leadsParams.append('status', filterStatus)
      leadsParams.append('limit', '100')

      const leadsResponse = await fetch(`/api/unified-leads?${leadsParams}`)
      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json()
        setLeads(leadsData.leads)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch lead data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/unified-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          lead_id: leadId,
          new_status: newStatus,
        }),
      })

      if (response.ok) {
        fetchData()
        toast({
          title: 'Success',
          description: 'Lead status updated successfully',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lead status',
        variant: 'destructive',
      })
    }
  }

  const handleScoreLead = async (leadId: string) => {
    try {
      const response = await fetch('/api/unified-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'score_lead',
          lead_id: leadId,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Lead scored and assigned successfully',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to score lead',
        variant: 'destructive',
      })
    }
  }

  const handleExportReport = async () => {
    try {
      const response = await fetch('/api/unified-leads/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export_report',
          dateRange: {
            start: new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        downloadReport(data.report)
        toast({
          title: 'Success',
          description: 'Report exported successfully',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      })
    }
  }

  const downloadReport = (report: any) => {
    const dataStr = JSON.stringify(report, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `unified-lead-report-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      searchTerm === '' ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source_details.source_name.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Unified Lead Generation</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.summary.totalLeads}</div>
              <p className="text-xs text-muted-foreground">{metrics.summary.timeRange}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${metrics.summary.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                ${metrics.summary.averageCostPerLead.toFixed(2)} avg cost/lead
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${metrics.summary.overallROI >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {metrics.summary.overallROI.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.summary.averageConversionRate.toFixed(1)}% avg conversion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${metrics.commissionData?.total_commissions.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">All sources combined</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {metrics?.alerts && metrics.alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.alerts.map((alert, index) => (
            <Card
              key={index}
              className={`border-l-4 ${
                alert.severity === 'high'
                  ? 'border-red-500'
                  : alert.severity === 'medium'
                    ? 'border-yellow-500'
                    : 'border-blue-500'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      alert.severity === 'high'
                        ? 'text-red-500'
                        : alert.severity === 'medium'
                          ? 'text-yellow-500'
                          : 'text-blue-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">Source: {alert.source}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Source Performance */}
      {metrics?.sourcePerformance && (
        <Card>
          <CardHeader>
            <CardTitle>Source Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.sourcePerformance.slice(0, 5).map((source, index) => (
                <div
                  key={source.source}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{source.source}</p>
                      <Badge className={sourceTypeColors[source.type]}>{source.type}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="font-medium">{source.leads}</p>
                      <p className="text-muted-foreground">Leads</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{source.conversions}</p>
                      <p className="text-muted-foreground">Conversions</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{source.conversionRate.toFixed(1)}%</p>
                      <p className="text-muted-foreground">Rate</p>
                    </div>
                    <div className="text-center">
                      <p
                        className={`font-medium ${source.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {source.roi.toFixed(1)}%
                      </p>
                      <p className="text-muted-foreground">ROI</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters:</span>
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Sources</option>
          <option value="referral">Referrals</option>
          <option value="employee">Employees</option>
          <option value="affiliate">Affiliates</option>
          <option value="direct">Direct</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="closed_won">Closed Won</option>
          <option value="closed_lost">Closed Lost</option>
        </select>
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Lead</th>
                  <th className="text-left p-2">Source</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Priority</th>
                  <th className="text-left p-2">Expected Value</th>
                  <th className="text-left p-2">Created</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{lead.source_details.source_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.source_details.tracking_code}
                        </p>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={sourceTypeColors[lead.type]}>{lead.type}</Badge>
                    </td>
                    <td className="p-2">
                      <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
                    </td>
                    <td className="p-2">
                      <Badge className={priorityColors[lead.priority]}>{lead.priority}</Badge>
                    </td>
                    <td className="p-2">
                      ${lead.source_details.expected_commission?.toLocaleString() || 0}
                    </td>
                    <td className="p-2">{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td className="p-2 text-right">
                      <div className="flex space-x-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleScoreLead(lead.id)}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                        <select
                          value={lead.status}
                          onChange={e => handleUpdateLeadStatus(lead.id, e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="closed_won">Closed Won</option>
                          <option value="closed_lost">Closed Lost</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
