import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProviderWrapper } from './providers/session-provider'
import { PostHogProvider } from './providers/posthog-provider'
import { AuthProvider } from './providers/auth-provider'
import { Navigation } from '@/components/ui/navigation'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SlamOffer | AI-Powered Grand Slam Offer Generator',
  description:
    'Create compelling grand slam offers for your business using advanced AI technology. Generate comprehensive offer components including problem analysis, value stacks, and more.',
  keywords: [
    'offer generation',
    'business offers',
    'grand slam offers',
    'AI business tools',
    'offer creator',
    'business strategy',
    'marketing offers',
  ],
  authors: [{ name: 'SlamOffer' }],
  creator: 'SlamOffer',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://slamoffer.com',
    title: 'SlamOffer | AI-Powered Grand Slam Offer Generator',
    description:
      'Create compelling grand slam offers for your business using advanced AI technology.',
    siteName: 'SlamOffer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SlamOffer | AI-Powered Grand Slam Offer Generator',
    description:
      'Create compelling grand slam offers for your business using advanced AI technology.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <SessionProviderWrapper>
          <PostHogProvider>
            <AuthProvider>
              <Navigation />
              <div className="relative min-h-screen">{children}</div>
            </AuthProvider>
          </PostHogProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
