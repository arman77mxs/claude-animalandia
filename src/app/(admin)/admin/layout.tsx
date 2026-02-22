import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main style={{ marginLeft: '256px', padding: '2rem', minHeight: '100vh', overflowX: 'auto' }} className="flex-1">{children}</main>
    </div>
  )
}
