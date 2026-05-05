import { createClient } from '@/lib/supabase/server'
import { buildSettlementCsv } from '@/lib/csv'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
  if (!user || !adminEmails.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = supabase
    .from('orders')
    .select('id, created_at, total_krw, status, delivery_date, merchants(email, store_name)')
    .order('created_at')

  if (from) query = query.gte('created_at', `${from}T00:00:00+09:00`)
  if (to) query = query.lte('created_at', `${to}T23:59:59+09:00`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type OrderRow = {
    id: string
    created_at: string
    total_krw: number
    status: string
    delivery_date: string
    merchants: { email: string; store_name: string } | null
  }
  const rows = ((data ?? []) as unknown as OrderRow[]).map((o) => ({
    id: o.id,
    created_at: o.created_at,
    merchant_email: o.merchants?.email ?? '',
    store_name: o.merchants?.store_name ?? '',
    total_krw: o.total_krw,
    status: o.status,
    delivery_date: o.delivery_date,
  }))

  const csv = buildSettlementCsv(rows)
  const filename = `settlement-${from ?? 'all'}-${to ?? 'all'}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
