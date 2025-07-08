'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, User, LogOut, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export interface NavItem {
  label: string
  href?: string
  onClick?: () => void
  type?: 'link' | 'button' | 'dropdown'
  variant?: 'default' | 'primary' | 'ghost'
  icon?: React.ComponentType<{ className?: string }>
  submenu?: NavItem[]
}

export interface NavbarProps {
  logo?: {
    text: string
    icon?: React.ComponentType<{ className?: string }>
  }
  items: NavItem[]
  user?: {
    email?: string
    name?: string
    avatar?: string
    subscription?: string
  }
  onUserAction?: (action: 'profile' | 'logout') => void
  className?: string
  fixed?: boolean
  transparent?: boolean
}

export default function Navbar({
  logo = { text: 'GrandSlamGenerator.ai', icon: Sparkles },
  items = [],
  user,
  onUserAction,
  className = '',
  fixed = true,
  transparent = false,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    if (fixed) {
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [fixed])

  const handleItemClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick()
    } else if (item.href) {
      if (item.href.startsWith('#')) {
        // Smooth scroll to anchor
        const element = document.querySelector(item.href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        router.push(item.href)
      }
    }
    setIsOpen(false)
    setActiveDropdown(null)
  }

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label)
  }

  const LogoIcon = logo.icon || Sparkles

  return (
    <motion.header
      className={`${
        fixed ? 'fixed top-0 left-0 right-0 z-50' : 'relative'
      } transition-all duration-300 ${
        scrolled || !transparent
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-lg'
          : 'bg-transparent'
      } ${className}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
              <LogoIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 hidden sm:block">{logo.text}</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {items.map((item, index) => (
              <div key={index} className="relative">
                {item.type === 'dropdown' ? (
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className="flex items-center space-x-1 text-slate-700 hover:text-violet-600 transition-colors font-semibold py-2 px-1"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === item.label && item.submenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl py-2"
                        >
                          {item.submenu.map((subItem, subIndex) => (
                            <button
                              key={subIndex}
                              onClick={() => handleItemClick(subItem)}
                              className="w-full text-left px-4 py-2 text-slate-700 hover:text-violet-600 hover:bg-violet-50 transition-colors font-medium"
                            >
                              {subItem.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : item.variant === 'primary' ? (
                  <motion.button
                    onClick={() => handleItemClick(item)}
                    className="bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white font-bold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => handleItemClick(item)}
                    className="text-slate-700 hover:text-violet-600 transition-colors font-semibold py-2 px-1 flex items-center space-x-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </motion.button>
                )}
              </div>
            ))}
          </div>

          {/* User Menu (Desktop) */}
          {user && (
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-slate-700">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-sky-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold">{user.name || user.email}</div>
                  {user.subscription && (
                    <div className="text-xs bg-gradient-to-r from-violet-100 to-sky-100 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200">
                      {user.subscription}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => onUserAction?.('logout')}
                className="text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-violet-600 hover:bg-slate-100 transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {item.type === 'dropdown' ? (
                      <div>
                        <button
                          onClick={() => toggleDropdown(item.label)}
                          className="w-full flex items-center justify-between px-3 py-2 text-slate-700 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors font-semibold"
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              activeDropdown === item.label ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {activeDropdown === item.label && item.submenu && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4 mt-2 space-y-1"
                            >
                              {item.submenu.map((subItem, subIndex) => (
                                <button
                                  key={subIndex}
                                  onClick={() => handleItemClick(subItem)}
                                  className="w-full text-left px-3 py-2 text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors font-medium"
                                >
                                  {subItem.label}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : item.variant === 'primary' ? (
                      <button
                        onClick={() => handleItemClick(item)}
                        className="w-full bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white font-bold px-3 py-2.5 rounded-lg shadow-lg flex items-center space-x-2"
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.label}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleItemClick(item)}
                        className="w-full text-left px-3 py-2 text-slate-700 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors font-semibold flex items-center space-x-2"
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.label}</span>
                      </button>
                    )}
                  </motion.div>
                ))}

                {/* Mobile User Menu */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: items.length * 0.1 }}
                    className="border-t border-slate-200 pt-3 mt-3"
                  >
                    <div className="px-3 py-2 text-slate-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-sky-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold">{user.name || user.email}</div>
                          {user.subscription && (
                            <div className="text-xs bg-gradient-to-r from-violet-100 to-sky-100 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200 inline-block">
                              {user.subscription}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onUserAction?.('logout')}
                      className="w-full text-left px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
}
