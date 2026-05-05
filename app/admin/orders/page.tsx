'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Order = {
  id: string; created_at: string; status: string
  delivery_date: string; total_krw: number; notes: string
  merchants: { email: string; store_name: string } | null
  order_items: { qty: number; unit_price_krw: number; products: { name: string; unit: string } | null }[]
}

const STATUS_LABEL: Record<string, string> = {
  pending: '접수됨', routed: '사조 출고요청', delivered: '배송완료', cancelled: '취소'
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  routed: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-200 text-gray-600',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])

  async function loadOrders() {
    const { data } = await createClient()
      .from('orders')
      .select('*, merchants(email, store_name), order_items(qty, unit_price_krw, products(name, unit))')
      .order('created_at', { ascending: false })
    if (data) setOrders(data as Order[])
  }

  useEffect(() => { loadOrders() }, [])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    loadOrders()
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">주문 관리</h1>
      <div className="space-y-4">
        {orders.map(o => (
          <div key={o.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-medium">{o.merchants?.store_name ?? o.merchants?.email}</span>
                <span className="text-xs text-gray-400 ml-2">{new Date(o.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLOR[o.status]}`}>
                {STATUS_LABEL[o.status]}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              희망 배송일: {o.delivery_date} · 합계: {o.total_krw.toLocaleString()}원
            </div>
            <div className="text-xs text-gray-500 mb-3">
              {o.order_items.map((i, idx) => (
                <span key={idx}>{i.products?.name} {i.qty}{i.products?.unit} </span>
              ))}
            </div>
            {o.notes && <p className="text-xs text-gray-400 mb-3">메모: {o.notes}</p>}
            <div className="flex gap-2">
              {o.status === 'pending' && (
                <button onClick={() => updateStatus(o.id, 'routed')}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs">
                  사조 출고 요청 완료
                </button>
              )}
              {o.status === 'routed' && (
                <button onClick={() => updateStatus(o.id, 'delivered')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs">
                  배송 완료
                </button>
              )}
              {o.status !== 'cancelled' && o.status !== 'delivered' && (
                <button onClick={() => updateStatus(o.id, 'cancelled')}
                  className="px-3 py-1 border rounded text-xs text-gray-600">
                  취소
                </button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-gray-400 text-sm">주문이 없습니다.</p>}
      </div>
    </div>
  )
}
