import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  if (!user && pathname.startsWith('/shop')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (!user && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (user && pathname.startsWith('/admin')) {
    const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
    if (!adminEmails.includes(user.email ?? '')) {
      return NextResponse.redirect(new URL('/shop', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/shop/:path*', '/admin/:path*'],
}
