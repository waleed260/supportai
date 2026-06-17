import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isPublicPath = isAuthPage || pathname.startsWith('/api') || pathname.startsWith('/widget') || pathname.startsWith('/_next')

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && !isPublicPath) {
    const { data: membership } = await supabase.from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    const role = membership?.role

    const superAdminPaths = ['/dashboard/super-admin']
    const adminPaths = ['/dashboard/admin', '/dashboard/settings', '/dashboard/team']
    const teamPaths = ['/dashboard/team']

    const onSuperAdminPath = superAdminPaths.some(p => pathname.startsWith(p))

    if (onSuperAdminPath && role !== 'super_admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/admin'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
