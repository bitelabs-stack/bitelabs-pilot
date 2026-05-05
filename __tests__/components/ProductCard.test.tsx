import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProductCard from '@/components/ProductCard'

const product = {
  id: 'p1',
  sku: 'SAJ-001',
  name: '냉동 닭가슴살 1kg',
  unit: 'kg',
  price_krw: 8500,
  min_order_qty: 1,
  in_stock: true,
}

describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(<ProductCard product={product} onAddToCart={vi.fn()} />)
    expect(screen.getByText('냉동 닭가슴살 1kg')).toBeInTheDocument()
    expect(screen.getByText('8,500원 / kg')).toBeInTheDocument()
  })

  it('calls onAddToCart with product and qty 1 on click', () => {
    const onAdd = vi.fn()
    render(<ProductCard product={product} onAddToCart={onAdd} />)
    fireEvent.click(screen.getByRole('button', { name: '담기' }))
    expect(onAdd).toHaveBeenCalledWith(product, 1)
  })

  it('shows 품절 badge and disables button when out of stock', () => {
    render(<ProductCard product={{ ...product, in_stock: false }} onAddToCart={vi.fn()} />)
    expect(screen.getByText('품절')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '담기' })).toBeDisabled()
  })
})
