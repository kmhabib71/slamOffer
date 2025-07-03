'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Brain } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()

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
  ]

  return (
    <nav className="fixed top-4 left-4 z-50">
      {/* <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
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
      </div> */}
    </nav>
  )
}
