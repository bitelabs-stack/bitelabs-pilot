import { describe, it, expect } from 'vitest'
import { parseProductCsv, buildSettlementCsv } from '@/lib/csv'

describe('parseProductCsv', () => {
  it('parses valid CSV rows into product objects', () => {
    const csv = `sku,name,unit,price_krw,min_order_qty
SAJ-001,냉동 닭가슴살 1kg,kg,8500,1
SAJ-002,사조 참치캔 150g (24입),box,28000,1`

    const result = parseProductCsv(csv)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      sku: 'SAJ-001',
      name: '냉동 닭가슴살 1kg',
      unit: 'kg',
      price_krw: 8500,
      min_order_qty: 1,
      in_stock: true,
    })
  })

  it('throws on missing required columns', () => {
    const csv = `sku,name\nSAJ-001,닭가슴살`
    expect(() => parseProductCsv(csv)).toThrow('필수 컬럼 누락: unit, price_krw, min_order_qty')
  })

  it('throws on non-numeric price', () => {
    const csv = `sku,name,unit,price_krw,min_order_qty\nSAJ-001,닭가슴살,kg,무료,1`
    expect(() => parseProductCsv(csv)).toThrow('price_krw는 숫자여야 합니다: SAJ-001')
  })
})

describe('buildSettlementCsv', () => {
  it('generates correct CSV from orders', () => {
    const orders = [
      {
        id: 'ord-1',
        created_at: '2026-05-01T10:00:00Z',
        merchant_email: 'store1@test.com',
        store_name: '맛있는 식당',
        total_krw: 45000,
        status: 'delivered',
        delivery_date: '2026-05-03',
      },
    ]
    const csv = buildSettlementCsv(orders)
    expect(csv).toContain('주문번호,주문일시,매장명,이메일,합계금액,상태,희망배송일')
    expect(csv).toContain('ord-1')
    expect(csv).toContain('45000')
    expect(csv).toContain('맛있는 식당')
  })
})
