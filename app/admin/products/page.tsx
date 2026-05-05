'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Product = { id: string; sku: string; name: string; unit: string; price_krw: number; in_stock: boolean }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function loadProducts() {
    const { data } = await createClient().from('products').select('*').order('sku')
    if (data) setProducts(data)
  }

  useEffect(() => { loadProducts() }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/products', { method: 'POST', body: form })
    const json = await res.json()
    if (res.ok) {
      setMessage(`✅ ${json.count}개 상품 업로드 완료`)
      loadProducts()
    } else {
      setMessage(`❌ 오류: ${json.error}`)
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function toggleStock(id: string, current: boolean) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ in_stock: !current }),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      alert(`재고 변경 실패: ${json.error ?? '알 수 없는 오류'}`)
    }
    loadProducts()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">상품 관리</h1>
        <div className="flex items-center gap-3">
          {message && <span className="text-sm">{message}</span>}
          <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer text-sm">
            {uploading ? '업로드 중...' : 'CSV 업로드'}
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">CSV 컬럼: sku, name, unit, price_krw, min_order_qty</p>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {['SKU', '상품명', '단위', '가격', '재고'].map(h => (
              <th key={h} className="text-left p-2 border">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="border-b">
              <td className="p-2 border font-mono text-xs">{p.sku}</td>
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">{p.unit}</td>
              <td className="p-2 border">{p.price_krw.toLocaleString()}원</td>
              <td className="p-2 border">
                <button
                  onClick={() => toggleStock(p.id, p.in_stock)}
                  className={`px-2 py-0.5 rounded text-xs ${p.in_stock ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                >
                  {p.in_stock ? '재고있음' : '품절'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
