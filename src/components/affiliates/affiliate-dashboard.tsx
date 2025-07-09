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
  Award, 
  UserPlus,
  Link,
  Mail,
  Download,
  Share2,
  Copy,
  Users as UsersIcon
} from 'lucide-react'

interface AffiliateStats {
  overview: {
    totalAffiliates: number
    activeAffiliates: number
    totalSalesVolume: number
    totalCommissionsPaid: number
    avgConversionRate: number
    growthRate: number
  }
  distributions: {
    tierDistribution: Record<string, number>
    statusDistribution: Record<string, 'active' | 'pending' | 'suspended' | 'terminated' | 'inactive'>
  }
  trends: {
    commissionTrends: Array<{
      week: string
      amount: number
      date: string
    }>
    growth: {
      currentMonth: number
      lastMonth: number
      growthRate: number
    }
  }
  topPerformers: Array<{
    id: string
    name: string
    email: string
    tier: string
    totalSales: number
    totalCommissions: number
    conversionRate: number
    referralCode: string
    joinDate: string
    lastSale?: string
    recruits: number
  }>
  recommendations: {
    tierUpgrades: Array<{
      affiliate_id: string
      current_tier: string
      recommended_tier: string
      performance_score: number
    }>
    totalUpgradeCandidates: number
  }
  alerts: Array<{
    type: string
    message: string
    count: number
    priority: 'low' | 'medium' | 'high'
  }>
  recentActivity: {
    newAffiliates: number
    totalCommissions: number
    avgMonthlyCommission: number
  }
}

interface Affiliate {
  _id: string
  user_id: string
  affiliate_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  program_details: {
    status: 'active' | 'pending' | 'suspended' | 'terminated' | 'inactive'
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
    join_date: string
    referral_code: string
  }
  performance_metrics: {
    total_conversions: number
    total_sales_volume: number
    lifetime_commissions_earned: number
    conversion_rate: number
    avg_order_value: number
    current_streak_days: number
  }
  hierarchy: {
    total_downline_count: number
    sponsor_id?: string
  }
}

const tierColors = {
  bronze: 'bg-amber-100 text-amber-800',
  silver: 'bg-gray-100 text-gray-800',
  gold: 'bg-yellow-100 text-yellow-800',
  platinum: 'bg-blue-100 text-blue-800',
  diamond: 'bg-purple-100 text-purple-800'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
  terminated: 'bg-gray-100 text-gray-800',
  inactive: 'bg-gray-100 text-gray-600'
}

export default function AffiliateDashboard() {
  const [stats, setStats] = useState<AffiliateStats | null>(null)
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
    fetchAffiliates()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/affiliates/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchAffiliates = async () => {
    try {
      const response = await fetch('/api/affiliates')
      if (response.ok) {
        const data = await response.json()
        setAffiliates(data.affiliates)
      }
    } catch (error) {
      console.error('Error fetching affiliates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAffiliate = async (affiliateData: any) => {
    try {
      const response = await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(affiliateData)
      })

      if (response.ok) {
        const newAffiliate = await response.json()
        setAffiliates([...affiliates, newAffiliate.affiliate])
        setShowCreateForm(false)
        toast({
          title: 'Success',
          description: 'Affiliate created successfully',
        })
        fetchStats() // Refresh stats
      } else {
        throw new Error('Failed to create affiliate')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create affiliate',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateAffiliateStatus = async (affiliateId: string, status: string) => {
    try {
      const response = await fetch(`/api/affiliates?id=${affiliateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ program_details: { status } })
      })

      if (response.ok) {
        fetchAffiliates()
        fetchStats()
        toast({
          title: 'Success',
          description: 'Affiliate status updated successfully',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update affiliate status',
        variant: 'destructive'
      })
    }
  }

  const handleUpgradeTier = async (affiliateId: string, newTier: string) => {
    try {
      const response = await fetch(`/api/affiliates?id=${affiliateId}`, {
        method: 'PUT',
        headers: { 'Cofrom-Type': 'application/json' },
        body: JSON.stringify({ program_details: { tier: newTier } })
      })

      if (response.ok) {
        fetchAffiliates()
        fetchStats()
        toast({
          title: 'Success',
          description: 'Affiliate tier upgraded successfully',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upgrade affiliate tier',
        variant: 'destructive'
      })
    }
  }

  const copyReferralLink = (referralCode: string) => {
    const link = `${window.location.origin}/refer/${referralCode}`
    navigator.clipboard.writeText(link)
    toast({
      title: 'Copied',
      description: 'Referral link copied to clipboard',
    })
  }

  const exportCommissionReport = async () => {
    try {
      const response = await fetch('/api/affiliates/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'commission_report',
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Create and download CSV
        const csv = convertToCSV(data.report)
        downloadCSV(csv, 'affiliate-commission-report.csv')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive'
      })
    }
  }

  const convertToCSV = (data: any[]) => {
    const headers = ['Name', 'Email', 'Tier', 'Referral Code', 'Total Commissions', 'Paid Commissions', 'Pending Commissions', 'Conversion Rate']
    const rows = data.map(item => [
      item.name,
      item.email,
      item.tier,
      item.referral_code,
      item.total_commissions,
      item.paid_commissions,
      item.pending_commissions,
      item.conversion_rate
    ])
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

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
        <h2 className="text-2xl font-bold">Affiliate Management</h2>
        <div className="flex space-x-4">
          <Button onClick={exportCommissionReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Affiliate
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalAffiliates}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.activeAffiliates} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.overview.totalSalesVolume.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.growthRate > 0 ? '+' : ''}{stats.overview.growthRate.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.overview.totalCommissionsPaid.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg: ${stats.recentActivity.avgMonthlyCommission.toFixed(2)}/month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.overview.avgConversionRate * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average across all affiliates
              </p>
            </CadContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {stats?.alerts && stats.alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.alerts.map((alert, index) => (
            <Card key={index} className={`border-l-4 ${
              alert.priority === 'high' ? 'border-red-500' : 
              alert.priority === 'medium' ? 'border-yellow-500' : 
              'border-blue-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.type.replace('_', ' ').toLowerCase()}
                    </p>
                  </div>
                  <Badge variant={
                    alert.priority === 'high' ? 'destructive' :
                    alert.priority === 'medium' ? 'default' : 'secondary'
                  }>
                    {alert.count}
                  </Badge>
                </div>
              </CardContent>
            </CadContent>
          ))}
        </div>
      )}

      {/* Commission Trends */}
      {stats?.trends && (
        <Card>
          <CardHeader>
            <CardTitle>Commission Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {stats.trends.commissionTrends.map((week, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t-md w-8 min-h-[20px]"
                    style={{ height: `${(week.amount / 10000) * 200}px` }}
                  ></div>
                  <p className="text-xs mt-2 text-muted-foreground">{week.week}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      {stats?.topPerformers && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Affiliates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topPerformers.slice(0, 5).map((performer, index) => (
                <div key={performer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{performer.name}</p>
                      <p className="text-sm text-muted-foreground">{performer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">${performer.totalCommissions.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {(performer.conversionRate * 100).toFixed(1)}% conversion
                      </p>
                    </div>
                    <Badge className={tierColors[performer.tier]}>
                      {performer.tier}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Affiliates Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Affiliates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Tier</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Sales</th>
                  <ths className="text-left p-2">Commissions</th>
                  <th className="text-left p-2">Conversion</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((affiliate) => (
                  <tr key={affiliate.affiliate_id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{affiliate.first_name} {affiliate.last_name}</p>
                        <p className="text-sm text-muted-foreground">{affiliate.program_details.referral_code}</p>
                      </div>
                    </td>
                    <td className="p-2">{affiliate.email}</td>
                    <td className="p-2">
                      <Badge className={tierColors[affiliate.program_details.tier]}>
                        {affiliate.program_details.tier}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge className={statusColors[affiliate.program_details.status]}>
                        {affiliate.program_details.status}
                      </Badge>
                    </td>
                    <td className="p-2">${affiliate.performance_metrics.total_sales_volume.toLocaleString()}</td>
                    <td className="p-2">${affiliate.performance_metrics.lifetime_commissions_earned.toLocaleString()}</td>
                    <td className="p-2">{(affiliate.performance_metrics.conversion_rate * 100).toFixed(1)}%</td>
                    <td className="p-2 text-right">
                      <div className="flex space-x-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyReferralLink(affiliate.program_details.referral_code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedAffiliate(affiliate)}
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Affiliate Form */}
      {showCreateForm && (
        <CreateAffiliateForm 
          onSubmit={handleCreateAffiliate}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit Affiliate Modal */}
      {selectedAffiliate && (
        <EditAffiliateModal 
          affiliate={selectedAffiliate}
          onClose={() => setSelectedAffiliate(null)}
          onUpdateStatus={handleUpdateAffiliateStatus}
          onUpgradeTier={handleUpgradeTier}
        />
      )}
    </div>
  )
}

// Sub-components for forms and modals would go here
function CreateAffiliateForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    website: '',
    company: '',
    sponsor_id: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Affiliate</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="p-2 border rounded"
              required
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <input
            type="url"
            placeholder="Website (optional)"
            value={formData.website}
            onChange={(e) => setFormData({...formData, website: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <div className="flex space-x-4">
            <Button type="submit">Create Affiliate</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function EditAffiliateModal({ affiliate, onClose, onUpdateStatus, onUpgradeTier }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit Affiliate</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select 
              value={affiliate.program_details.status}
              onChange={(e) => onUpdateStatus(affiliate.affiliate_id, e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="terminated">Terminated</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tier</label>
            <select 
              value={affiliate.program_details.tier}
              onChange={(e) => onUpgradeTier(affiliate.affiliate_id, e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>
          <div className="flex space-x-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 