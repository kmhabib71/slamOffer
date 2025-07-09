import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import LeadAnalytics from '@/components/lead-generation/lead-analytics'

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  const userId = (session.user as any).id as string

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <LeadAnalytics userId={userId} />
    </div>
  )
}
