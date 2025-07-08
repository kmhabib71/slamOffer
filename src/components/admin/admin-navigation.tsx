'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { User } from '@/types'

interface AdminNavigationProps {
  user: User | null
}

export function AdminNavigation({ user }: AdminNavigationProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/templates', label: 'Templates', icon: '📄' },
    { href: '/admin/pdf-designer', label: 'PDF Designer', icon: '🎨' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-xl font-bold text-gray-900">
              Admin Panel
            </Link>

            <div className="flex space-x-4">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {session?.user && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">{session.user.email}</span>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  Back to App
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
