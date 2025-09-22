import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname
    
    const isAdminRoute = pathname.startsWith('/admin')
    const isProtectedRoute = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/profile') || 
                           pathname.startsWith('/settings') ||
                           pathname.startsWith('/admin')
    
    // Если пользователь пытается зайти на защищенные роуты
    if (isProtectedRoute) {
      // Если не авторизован, перенаправляем на логин
      if (!token) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      // Если это админский роут, проверяем роль
      if (isAdminRoute && token.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        const isProtectedRoute = pathname.startsWith('/dashboard') || 
                               pathname.startsWith('/profile') || 
                               pathname.startsWith('/settings') ||
                               pathname.startsWith('/admin')
        
        // Для защищенных роутов требуем авторизацию
        if (isProtectedRoute) {
          return !!token
        }
        
        // Для остальных роутов авторизация не требуется
        return true
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}