'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Unified Leads', href: '/unified-leads', icon: '🚀' },
    { name: 'Offers', href: '/offers', icon: '💎' },
    { name: 'Referrals', href: '/referrals', icon: '🔗' },
    { name: 'Employees', href: '/employees', icon: '👥' },
    { name: 'Affiliates', href: '/affiliates', icon: '🤝' },
    { name: 'Help', href: '/dashboard/help', icon: '❓' },
  ]

  return (
    <nav className="space-y-2 px-2">
      {navItems.map(item => (
        <Link
          key={item.name}
          href={item.href}
          className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            pathname === item.href ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  )
}
