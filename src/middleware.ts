import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect /admin routes (v1, legado)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Exclude login page from protection
    if (request.nextUrl.pathname === '/admin/login') {
      if (user && user.email === 'mkt@oemporio.pt') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return response
    }

    if (!user || user.email !== 'mkt@oemporio.pt') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Protect /manager routes (v2, CRM real) — acesso exige perfil ativo em
  // `profiles` (staff ou owner), nunca um e-mail fixo. A checagem de papel
  // (owner-only) para telas específicas (Configurações, Perfis) é feita nas
  // próprias telas, não aqui.
  if (request.nextUrl.pathname.startsWith('/manager')) {
    const isLoginPage = request.nextUrl.pathname === '/manager/login'

    const isActiveProfile = async () => {
      if (!user) return false
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', user.id)
        .maybeSingle()
      return !!profile?.is_active
    }

    if (isLoginPage) {
      if (user && (await isActiveProfile())) {
        return NextResponse.redirect(new URL('/manager', request.url))
      }
      return response
    }

    if (!user || !(await isActiveProfile())) {
      return NextResponse.redirect(new URL('/manager/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*'],
}
