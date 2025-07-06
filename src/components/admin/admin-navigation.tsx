'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'

interface AdminNavigationProps {
  user: User
  adminUser: any
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ user, adminUser }) => {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await authService.signOut()
    window.location.href = '/'
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/pdf-designer', label: 'PDF Designer', icon: '📄' },
    { href: '/admin/templates', label: 'Templates', icon: '🎨' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">SlamOffer Admin</span>
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <Link
                href="/admin/templates"
                className={`flex items-center px-4 py-2 text-sm font-medium ${
                  pathname === '/admin/templates'
                    ? 'text-violet-600 bg-violet-50'
                    : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'
                }`}
              >
                <span className="mr-3">📋</span>
                Templates
              </Link>
              <Link
                href="/admin/settings"
                className={`flex items-center px-4 py-2 text-sm font-medium ${
                  pathname === '/admin/settings'
                    ? 'text-violet-600 bg-violet-50'
                    : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'
                }`}
              >
                <span className="mr-3">⚙️</span>
                Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{user.email}</span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {adminUser.role}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
