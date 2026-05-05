import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [{ count: orderCount }, { count: merchantCount }, { data: recentOrders }] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('merchants').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('id, status, total_krw, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const pendingOrders = recentOrders?.filter(o => o.status === 'pending').length ?? 0

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">대시보드</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">전체 주문</p>
          <p className="text-3xl font-bold mt-1">{orderCount ?? 0}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">등록 점주</p>
          <p className="text-3xl font-bold mt-1">{merchantCount ?? 0}</p>
        </div>
        <div className="border rounded-lg p-4 border-yellow-300 bg-yellow-50">
          <p className="text-sm text-gray-500">처리 대기</p>
          <p className="text-3xl font-bold mt-1 text-yellow-700">{pendingOrders}</p>
        </div>
      </div>
      <div>
        <h2 className="font-medium mb-3">최근 주문</h2>
        <div className="space-y-2">
          {recentOrders?.map(o => (
            <div key={o.id} className="flex justify-between text-sm border rounded p-3">
              <span className="text-gray-400 font-mono text-xs">{o.id.slice(0, 8)}…</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                o.status === 'routed' ? 'bg-blue-100 text-blue-700' :
                o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                'bg-gray-200 text-gray-600'
              }`}>
                {o.status === 'pending' ? '접수됨' : o.status === 'routed' ? '출고요청' : o.status === 'delivered' ? '배송완료' : '취소'}
              </span>
              <span>{o.total_krw.toLocaleString()}원</span>
              <span className="text-gray-400">{new Date(o.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
          ))}
          {(!recentOrders || recentOrders.length === 0) && (
            <p className="text-gray-400 text-sm">아직 주문이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}
