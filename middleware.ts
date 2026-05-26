import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('[Middleware] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('[Middleware] Supabase Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log('[Middleware] Request cookies:', JSON.stringify(request.cookies.getAll()))

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

  console.log(`[Middleware] Requesting path: ${request.nextUrl.pathname}`)
  let user = null
  try {
    const { data, error: authError } = await supabase.auth.getUser()
    user = data?.user
    console.log(`[Middleware] User fetch complete. Logged in: ${!!user}`)
    if (authError && authError.name !== 'AuthSessionMissingError') {
      console.log(`[Middleware] Auth error returned:`, authError)
    }
  } catch (error) {
    console.error('[Middleware] Error fetching user:', error)
  }

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isPublicRoute = isAuthPage || request.nextUrl.pathname === '/auth/callback'

  if (!user && !isPublicRoute) {
    console.log(`[Middleware] Redirecting to /auth/login (Not logged in)`)
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    console.log(`[Middleware] Redirecting to / (Logged in on auth page)`)
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  console.log(`[Middleware] Proceeding to ${request.nextUrl.pathname}`)
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
