import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',')
  if (!user || !adminEmails.includes(user.email ?? '')) redirect('/auth/login')
  return (
    <div>
      <nav className="bg-gray-900 text-white px-6 py-3 flex gap-6 text-sm">
        <a href="/admin" className="hover:text-gray-300">대시보드</a>
        <a href="/admin/products" className="hover:text-gray-300">상품관리</a>
        <a href="/admin/orders" className="hover:text-gray-300">주문관리</a>
        <a href="/admin/settlement" className="hover:text-gray-300">정산</a>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
