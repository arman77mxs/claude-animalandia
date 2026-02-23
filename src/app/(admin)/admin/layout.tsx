import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'admin') redirect('/')

  return (
    <div className="flex min-h-screen" suppressHydrationWarning>
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen overflow-auto">{children}</main>
    </div>
  )
}
