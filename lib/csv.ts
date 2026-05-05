const REQUIRED_COLUMNS = ['sku', 'name', 'unit', 'price_krw', 'min_order_qty']

export function parseProductCsv(csvText: string) {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())

  const missing = REQUIRED_COLUMNS.filter(c => !headers.includes(c))
  if (missing.length > 0) {
    throw new Error(`필수 컬럼 누락: ${missing.join(', ')}`)
  }

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    const row = Object.fromEntries(headers.map((h, i) => [h, values[i]]))

    const price = Number(row.price_krw)
    if (isNaN(price)) {
      throw new Error(`price_krw는 숫자여야 합니다: ${row.sku}`)
    }

    return {
      sku: row.sku,
      name: row.name,
      unit: row.unit,
      price_krw: price,
      min_order_qty: Number(row.min_order_qty) || 1,
      in_stock: true,
    }
  })
}

export function buildSettlementCsv(orders: {
  id: string
  created_at: string
  merchant_email: string
  store_name: string
  total_krw: number
  status: string
  delivery_date: string
}[]) {
  const header = '주문번호,주문일시,매장명,이메일,합계금액,상태,희망배송일'
  const rows = orders.map(o =>
    [o.id, o.created_at, o.store_name, o.merchant_email, o.total_krw, o.status, o.delivery_date].join(',')
  )
  return [header, ...rows].join('\n')
}
