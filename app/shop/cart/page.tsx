'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type CartItem = { product_id: string; name: string; unit: string; price_krw: number; qty: number }

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const raw = localStorage.getItem('bitelabs_cart')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setItems(parsed.filter(i => typeof i.price_krw === 'number' && typeof i.qty === 'number'))
        }
      } catch {
        localStorage.removeItem('bitelabs_cart')
      }
    }
  }, [])

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth/login')
    })
  }, [router])

  const totalKrw = items.reduce((s, i) => s + i.price_krw * i.qty, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    setSubmitting(true)

    const minDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
    if (deliveryDate < minDate) {
      alert('배송일은 오늘로부터 최소 2일 이후여야 합니다.')
      setSubmitting(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // 점주 확인
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('email', user.email)
      .single()

    const merchantId = merchant?.id
    if (!merchantId) { alert('등록된 점주가 아닙니다.'); setSubmitting(false); return }

    // 주문 생성
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        merchant_id: merchantId,
        delivery_date: deliveryDate,
        total_krw: totalKrw,
        notes,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error || !order) { alert('주문 실패. 다시 시도해주세요.'); setSubmitting(false); return }

    // 주문 항목 생성
    const { error: itemsError } = await supabase.from('order_items').insert(
      items.map(i => ({
        order_id: order.id,
        product_id: i.product_id,
        qty: i.qty,
        unit_price_krw: i.price_krw,
      }))
    )

    if (itemsError) {
      // 주문 항목 실패 시 orphan 주문 삭제
      await supabase.from('orders').delete().eq('id', order.id)
      alert('주문 항목 저장 실패. 다시 시도해주세요.')
      setSubmitting(false)
      return
    }

    localStorage.removeItem('bitelabs_cart')
    setDone(true)
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">주문 완료!</h2>
        <p className="text-gray-600 mb-4">확인 후 계좌이체 안내를 문자로 보내드립니다.</p>
        <p className="text-sm text-gray-500 mb-6">
          입금 계좌: [관리자가 문자로 안내] · 기한: 주문일로부터 2영업일
        </p>
        <a href="/shop" className="text-blue-600 underline text-sm">쇼핑 계속하기</a>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">주문서</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">장바구니가 비어 있습니다. <a href="/shop" className="text-blue-600 underline">상품 보기</a></p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border rounded-lg p-3 space-y-2">
            {items.map(i => (
              <div key={i.product_id} className="flex justify-between text-sm">
                <span>{i.name} × {i.qty}{i.unit}</span>
                <span>{(i.price_krw * i.qty).toLocaleString()}원</span>
              </div>
            ))}
            <div className="border-t pt-2 font-bold flex justify-between">
              <span>합계</span><span>{totalKrw.toLocaleString()}원</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">희망 배송일 *</label>
            <input
              type="date"
              required
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
              min={new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">메모 (선택)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="배송 시 요청사항"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
            결제 방식: <strong>계좌이체</strong><br />
            주문 확인 후 담당자가 계좌번호를 문자로 안내드립니다.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded font-medium disabled:opacity-50"
          >
            {submitting ? '주문 중...' : '주문하기'}
          </button>
        </form>
      )}
    </div>
  )
}
