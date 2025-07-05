import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from './providers/posthog-provider'
import { AuthProvider } from './providers/auth-provider'
import { Navigation } from '@/components/ui/navigation'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GrandSlamGenerator.ai | Turn Any Idea Into An Irresistible $100M Offer In 90 Seconds',
  description:
    "AI-powered cosmic offer generation that transforms your business ideas into irresistible offers customers can't refuse. Based on Alex Hormozi's proven $100M Offers methodology.",
  keywords: [
    'offer generation',
    'business offers',
    'Alex Hormozi',
    'grand slam offers',
    'AI business tools',
    'irresistible offers',
    'cosmic AI',
    '$100M offers',
  ],
  authors: [{ name: 'GrandSlamGenerator.ai' }],
  creator: 'GrandSlamGenerator.ai',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://grandslamgenerator.ai',
    title: 'GrandSlamGenerator.ai | Turn Any Idea Into An Irresistible $100M Offer In 90 Seconds',
    description:
      "AI-powered cosmic offer generation that transforms your business ideas into irresistible offers customers can't refuse. Based on Alex Hormozi's proven $100M Offers methodology.",
    siteName: 'GrandSlamGenerator.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GrandSlamGenerator.ai | Turn Any Idea Into An Irresistible $100M Offer In 90 Seconds',
    description:
      "AI-powered cosmic offer generation that transforms your business ideas into irresistible offers customers can't refuse.",
    creator: '@grandslamgen',
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
        className={`${inter.variable} font-sans antialiased bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white`}
        suppressHydrationWarning
      >
        <PostHogProvider>
          <AuthProvider>
            <Navigation />
            <div className="relative min-h-screen">{children}</div>
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
