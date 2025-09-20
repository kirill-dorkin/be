import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // More aggressive approach: clear all NextAuth cookies if any exist
  // This will force a fresh start and prevent JWT decryption errors
  const hasNextAuthCookies = 
    request.cookies.has('next-auth.session-token') ||
    request.cookies.has('__Secure-next-auth.session-token') ||
    request.cookies.has('next-auth.csrf-token') ||
    request.cookies.has('__Secure-next-auth.csrf-token');
  
  if (hasNextAuthCookies) {
    // Clear all NextAuth related cookies
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('next-auth.csrf-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.csrf-token');
    
    // Also set them to expire immediately
    response.cookies.set('next-auth.session-token', '', { maxAge: 0 });
    response.cookies.set('next-auth.csrf-token', '', { maxAge: 0 });
    response.cookies.set('__Secure-next-auth.session-token', '', { maxAge: 0 });
    response.cookies.set('__Secure-next-auth.csrf-token', '', { maxAge: 0 });
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Include API routes to ensure cookie clearing happens everywhere
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};