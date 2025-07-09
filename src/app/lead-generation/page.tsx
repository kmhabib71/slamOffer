import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import LeadDashboard from '@/components/lead-generation/lead-dashboard'

export default async function LeadGenerationPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  const userId = (session.user as any).id as string

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <LeadDashboard userId={userId} />
    </div>
  )
}
