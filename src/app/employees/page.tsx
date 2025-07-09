import { Metadata } from 'next'
import EmployeeDashboard from '@/components/employees/employee-dashboard'

export const metadata: Metadata = {
  title: 'Employee Dashboard | Grand Slam Offer',
  description: 'Manage your team-based lead generation and employee performance',
}

export default function EmployeesPage() {
  return <EmployeeDashboard />
}
