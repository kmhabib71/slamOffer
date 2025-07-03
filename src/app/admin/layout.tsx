'use client'

import React from 'react'
import { AdminAuthGuard } from '@/components/admin/admin-auth-guard'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </div>
  )
}
