'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminProvider, useAdmin } from '@/contexts/AdminContext'

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) router.push('/admin')
  }, [isAdmin, loading, router])

  if (loading) return <div className="flex justify-center py-20 text-gray-500">Loading auth...</div>
  if (!isAdmin) return null

  return <>{children}</>
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminGuard>{children}</AdminGuard>
    </AdminProvider>
  )
}
