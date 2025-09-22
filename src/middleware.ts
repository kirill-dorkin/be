import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getAuthSecret } from "@/shared/lib/getAuthSecret"

const protectedRoutePrefixes = ["/dashboard", "/profile", "/settings", "/admin"]

function isProtectedPath(pathname: string) {
  return protectedRoutePrefixes.some((prefix) => pathname.startsWith(prefix))
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    const isProtectedRoute = isProtectedPath(pathname)
    const isAdminRoute = pathname.startsWith("/admin")

    if (isProtectedRoute) {
      if (!token) {
        const loginUrl = new URL("/login", req.url)
        loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }

      if (isAdminRoute && token.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        if (isProtectedPath(pathname)) {
          return !!token
        }

        return true
      },
    },
    secret: getAuthSecret(),
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
