import { Metadata } from 'next'
import ReferralDashboard from '@/components/referrals/referral-dashboard'

export const metadata: Metadata = {
  title: 'Referral Dashboard | Grand Slam Offer',
  description: 'Manage your customer referral program and track referral performance',
}

export default function ReferralsPage() {
  return <ReferralDashboard />
}
