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
  UserPlus,
  TrendingUp,
  Target,
  Plus,
  Search,
  Award,
  RefreshCw,
  Phone,
  Mail,
  MessageSquare,
  Network,
  UserCheck,
  FileText,
} from 'lucide-react'

interface EmployeeStats {
  total_employees: number
  active_employees: number
  total_leads_generated: number
  total_conversions: number
  avg_conversion_rate: number
  top_performers: Array<{
    employee_id: string
    name: string
    leads_generated: number
    conversion_rate: number
  }>
}

interface Employee {
  _id: string
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: string
  status: string
  hire_date: string
  assigned_methods: string[]
  daily_lead_target: number
  weekly_lead_target: number
  monthly_lead_target: number
  performance_metrics: {
    total_leads_generated: number
    total_qualified_leads: number
    total_converted_leads: number
    conversion_rate: number
    avg_lead_quality_score: number
    current_streak_days: number
    best_streak_days: number
  }
  training_status: {
    onboarding_completed: boolean
    certification_level: string
  }
  team_id?: string
  created_at: string
}

const LEAD_GEN_METHODS = [
  { value: 'cold_calling', label: 'Cold Calling', icon: Phone },
  { value: 'cold_emailing', label: 'Cold Emailing', icon: Mail },
  { value: 'linkedin_outreach', label: 'LinkedIn Outreach', icon: MessageSquare },
  { value: 'networking', label: 'Networking', icon: Network },
  { value: 'referrals', label: 'Referrals', icon: UserCheck },
  { value: 'content_creation', label: 'Content Creation', icon: FileText },
  { value: 'social_media', label: 'Social Media', icon: MessageSquare },
]

export default function EmployeeDashboard() {
  const [stats, setStats] = useState<EmployeeStats | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddEmployee, setShowAddEmployee] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch stats and employees in parallel
      const [statsResponse, employeesResponse] = await Promise.all([
        fetch('/api/employees/stats'),
        fetch('/api/employees'),
      ])

      const statsData = await statsResponse.json()
      const employeesData = await employeesResponse.json()

      if (statsData.success) {
        setStats(statsData.data)
      }

      if (employeesData.success) {
        setEmployees(employeesData.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      case 'terminated':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'lead_generator':
        return 'bg-blue-100 text-blue-800'
      case 'lead_qualifier':
        return 'bg-purple-100 text-purple-800'
      case 'closer':
        return 'bg-green-100 text-green-800'
      case 'manager':
        return 'bg-orange-100 text-orange-800'
      case 'admin':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodIcon = (method: string) => {
    const methodObj = LEAD_GEN_METHODS.find(m => m.value === method)
    return methodObj ? methodObj.icon : FileText
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch =
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === 'all' || employee.role === roleFilter
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
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
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your team-based lead generation</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={fetchData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddEmployee(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_employees}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{stats.active_employees} active</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Generated</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_leads_generated}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{stats.total_conversions} converted</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.avg_conversion_rate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Team average</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-gray-900">+18.2%</p>
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
      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          {/* Filters */}
          <Card className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <option value="all">All Roles</option>
                <option value="lead_generator">Lead Generator</option>
                <option value="lead_qualifier">Lead Qualifier</option>
                <option value="closer">Closer</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="terminated">Terminated</option>
              </Select>
            </div>
          </Card>

          {/* Employees Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leads Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Methods
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map(employee => (
                    <tr key={employee._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                          <div className="text-xs text-gray-400">ID: {employee.employee_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getRoleColor(employee.role)}>
                          {employee.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(employee.status)}>{employee.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.performance_metrics.total_leads_generated}
                        </div>
                        <div className="text-xs text-gray-500">
                          {employee.performance_metrics.total_qualified_leads} qualified
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(employee.performance_metrics.conversion_rate * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {employee.performance_metrics.current_streak_days} day streak
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-1">
                          {employee.assigned_methods.slice(0, 3).map(method => {
                            const Icon = getMethodIcon(method)
                            return (
                              <div
                                key={method}
                                className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center"
                                title={method.replace('_', ' ')}
                              >
                                <Icon className="w-3 h-3 text-gray-600" />
                              </div>
                            )
                          })}
                          {employee.assigned_methods.length > 3 && (
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-600">
                                +{employee.assigned_methods.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Team Management</h3>
              <p className="text-gray-600 mb-4">
                Organize employees into teams and track team performance
              </p>
              <Button>Create Team</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Training Programs</h3>
              <p className="text-gray-600 mb-4">Manage employee training and skill development</p>
              <Button>Create Training Module</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Analytics</h3>
              <p className="text-gray-600 mb-4">
                Deep dive into employee and team performance metrics
              </p>
              <Button>View Reports</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Performers */}
      {stats && stats.top_performers.length > 0 && (
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-4">
            {stats.top_performers.map((performer, index) => (
              <div
                key={performer.employee_id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                    <p className="text-xs text-gray-500">ID: {performer.employee_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {performer.leads_generated} leads
                  </p>
                  <p className="text-xs text-gray-500">
                    {(performer.conversion_rate * 100).toFixed(1)}% conversion
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
