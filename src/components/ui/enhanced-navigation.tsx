'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/providers/auth-provider'
import { LogoutButton } from '@/components/auth/logout-button'
import { Home, Brain, User, Settings } from 'lucide-react'

export function EnhancedNavigation() {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
    },
    {
      href: '/mindmap/grand-slam-page',
      label: 'Grand Slam Offer',
      icon: Brain,
    },
    {
      href: '/offer-showcase',
      label: 'Offer Showcase',
      icon: Settings,
    },
    {
      href: '/pdf-demo/premium-template',
      label: 'PDF Template',
      icon: Settings,
    },
  ]

  const userItems = [
    {
      href: '/admin',
      label: 'Admin Panel',
      icon: Settings,
      adminOnly: true,
    },
  ]

  if (loading) {
    return (
      <nav className="fixed top-4 left-4 z-50">
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
          <div className="animate-pulse bg-white/20 rounded-md px-3 py-2">
            <div className="w-16 h-4 bg-white/30 rounded"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-4 left-4 z-50">
      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
        {/* Main Navigation */}
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* User Section */}
        {user && (
          <>
            {/* User Info */}
            <div className="flex items-center space-x-2 px-3 py-2 text-white/80">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{user.email}</span>
            </div>

            {/* Admin Items */}
            {userItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Logout Button */}
            <LogoutButton
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
              showIcon={false}
            >
              Logout
            </LogoutButton>
          </>
        )}

        {/* Login Link (if not authenticated) */}
        {!user && !loading && (
          <Link
            href="/auth/login"
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            <User className="w-4 h-4" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
