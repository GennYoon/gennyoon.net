import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import AdminSidebar from '@/components/admin/AdminSidebar'

const AdminLayout: React.FC = () => {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <AdminSidebar>
      <Outlet />
    </AdminSidebar>
  )
}

export default AdminLayout
