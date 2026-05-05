'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProductCard from '@/components/ProductCard'

type Product = {
  id: string; sku: string; name: string; unit: string
  price_krw: number; min_order_qty: number; in_stock: boolean
}
type CartItem = { product: Product; qty: number }

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    createClient().from('products').select('*').then(({ data }) => {
      if (data) setProducts(data)
    })
  }, [])

  function addToCart(product: Product, qty: number) {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      const next = existing
        ? prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i)
        : [...prev, { product, qty }]
      localStorage.setItem('bitelabs_cart', JSON.stringify(
        next.map(i => ({
          product_id: i.product.id,
          name: i.product.name,
          unit: i.product.unit,
          price_krw: i.product.price_krw,
          qty: i.qty,
        }))
      ))
      return next
    })
  }

  const totalKrw = cart.reduce((sum, i) => sum + i.product.price_krw * i.qty, 0)

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">사조 식자재</h1>
        {cart.length > 0 && (
          <a href="/shop/cart" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            장바구니 {cart.length}종 · {totalKrw.toLocaleString()}원
          </a>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(p => (
          <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
        ))}
      </div>
    </div>
  )
}
