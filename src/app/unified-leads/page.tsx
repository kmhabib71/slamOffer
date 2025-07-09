import { Suspense } from 'react'
import { AuthGuard } from '../../components/auth/auth-guard'
import { DashboardNavigation } from '../../components/dashboard/dashboard-navigation'
import UnifiedLeadDashboard from '../../components/unified-leads/unified-lead-dashboard'

export default function UnifiedLeadsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <DashboardNavigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }
          >
            <UnifiedLeadDashboard />
          </Suspense>
        </div>
      </div>
    </AuthGuard>
  )
}
