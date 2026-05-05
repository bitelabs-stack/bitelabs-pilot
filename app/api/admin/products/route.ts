import { createClient } from '@/lib/supabase/server'
import { parseProductCsv } from '@/lib/csv'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
  if (!user || !adminEmails.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File
  const text = await file.text()

  let products
  try {
    products = parseProductCsv(text)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { error } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'sku' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ count: products.length })
}
