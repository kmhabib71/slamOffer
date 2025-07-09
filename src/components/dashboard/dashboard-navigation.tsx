'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/auth-provider'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Zap,
  FolderOpen,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Target,
  Users,
  BarChart3,
} from 'lucide-react'
import { useState } from 'react'

interface DashboardNavigationProps {
  excludeItems?: string[]
}

export function DashboardNavigation({ excludeItems = [] }: DashboardNavigationProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const allNavItems = [
    {
      label: 'Create Offer',
      href: '/dashboard',
      icon: Target,
      description: 'Generate your Grand Slam Offer',
    },
    {
      label: 'Lead Generation',
      href: '/lead-generation',
      icon: Users,
      description: 'AI-powered lead generation dashboard',
    },
    {
      label: 'Workflows',
      href: '/lead-generation/workflows',
      icon: Zap,
      description: 'Trigger n8n automation workflows',
    },
    {
      label: 'Analytics',
      href: '/lead-generation/analytics',
      icon: BarChart3,
      description: 'Track performance & ROI',
    },
    {
      label: 'My Offers',
      href: '/previous-offers',
      icon: FolderOpen,
      description: 'View your previous offers',
    },
    {
      label: 'Profile',
      href: '/dashboard/profile',
      icon: User,
      description: 'Account settings and API usage',
    },
    {
      label: 'Help',
      href: '/dashboard/help',
      icon: HelpCircle,
      description: 'Documentation and support',
    },
  ]

  const navItems = allNavItems.filter(item => !excludeItems.includes(item.label))

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
  }

  return (
    <motion.header
      className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-sky-500 rounded-lg flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800 hidden sm:block">
              GrandSlamGenerator.ai
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <motion.button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all duration-200 font-medium group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={item.description}
                >
                  <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>{item.label}</span>
                </motion.button>
              )
            })}

            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium group ml-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Sign out"
            >
              <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Logout</span>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:text-violet-600 hover:bg-slate-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-slate-700 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors font-medium text-left"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Icon className="h-4 w-4" />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-xs text-slate-500">{item.description}</div>
                    </div>
                  </motion.button>
                )
              })}

              {/* Mobile Logout */}
              <motion.button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-left border-t border-slate-200 mt-2 pt-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.1 }}
              >
                <LogOut className="h-4 w-4" />
                <div>
                  <div>Logout</div>
                  <div className="text-xs text-slate-500">Sign out of your account</div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  )
}
