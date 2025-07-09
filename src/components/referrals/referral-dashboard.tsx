'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  UserCheck,
  TrendingUp,
  DollarSign,
  Plus,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react'

interface ReferralStats {
  total_referrals: number
  pending_referrals: number
  converted_referrals: number
  conversion_rate: number
  total_referral_revenue: number
  avg_referral_value: number
  top_referrers: Array<{
    referrer_name: string
    referrer_email: string
    referral_count: number
    conversion_count: number
  }>
}

interface Referral {
  _id: string
  referrer_name: string
  referrer_email: string
  prospect_name: string
  prospect_email: string
  prospect_phone?: string
  referral_code: string
  referral_source: string
  status: 'pending' | 'contacted' | 'qualified' | 'converted' | 'declined' | 'expired'
  conversion_value?: number
  reward_amount?: number
  created_at: string
  updated_at: string
}

export default function ReferralDashboard() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch stats and referrals in parallel
      const [statsResponse, referralsResponse] = await Promise.all([
        fetch('/api/referrals/stats'),
        fetch('/api/referrals'),
      ])

      const statsData = await statsResponse.json()
      const referralsData = await referralsResponse.json()

      if (statsData.success) {
        setStats(statsData.data)
      }

      if (referralsData.success) {
        setReferrals(referralsData.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (referralId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/referrals/${referralId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh data after status change
        fetchData()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'contacted':
        return 'bg-blue-100 text-blue-800'
      case 'qualified':
        return 'bg-purple-100 text-purple-800'
      case 'converted':
        return 'bg-green-100 text-green-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch =
      referral.referrer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.prospect_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.prospect_email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || referral.status === statusFilter
    const matchesSource = sourceFilter === 'all' || referral.referral_source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referral Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your customer referral program</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={fetchData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Referral
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_referrals}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{stats.pending_referrals} pending</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Converted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.converted_referrals}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {(stats.conversion_rate * 100).toFixed(1)}% conversion rate
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.total_referral_revenue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              ${stats.avg_referral_value.toFixed(2)} avg value
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Growth</p>
                <p className="text-2xl font-bold text-gray-900">+12.5%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">vs last month</p>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="referrals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="referrals">All Referrals</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="space-y-4">
          {/* Filters */}
          <Card className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search referrals..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="declined">Declined</option>
                <option value="expired">Expired</option>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <option value="all">All Sources</option>
                <option value="direct">Direct</option>
                <option value="automated">Automated</option>
                <option value="incentivized">Incentivized</option>
                <option value="word_of_mouth">Word of Mouth</option>
                <option value="social_share">Social Share</option>
              </Select>
            </div>
          </Card>

          {/* Referrals Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prospect
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReferrals.map(referral => (
                    <tr key={referral._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {referral.referrer_name}
                          </div>
                          <div className="text-sm text-gray-500">{referral.referrer_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {referral.prospect_name}
                          </div>
                          <div className="text-sm text-gray-500">{referral.prospect_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(referral.status)}>{referral.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {referral.referral_source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {referral.conversion_value ? `$${referral.conversion_value}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Select
                          value={referral.status}
                          onValueChange={value => handleStatusChange(referral._id, value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="declined">Declined</option>
                          <option value="expired">Expired</option>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Referral Campaigns</h3>
              <p className="text-gray-600 mb-4">
                Create and manage referral campaigns to automate your referral program
              </p>
              <Button>Create Campaign</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Referral Analytics</h3>
              <p className="text-gray-600 mb-4">Deep dive into your referral program performance</p>
              <Button>View Analytics</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Referrers */}
      {stats && stats.top_referrers.length > 0 && (
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Referrers</h3>
          <div className="space-y-4">
            {stats.top_referrers.map((referrer, index) => (
              <div
                key={referrer.referrer_email}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{referrer.referrer_name}</p>
                    <p className="text-xs text-gray-500">{referrer.referrer_email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {referrer.referral_count} referrals
                  </p>
                  <p className="text-xs text-gray-500">{referrer.conversion_count} converted</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
