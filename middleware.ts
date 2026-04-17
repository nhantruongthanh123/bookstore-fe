import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get auth state from cookie or header
  const authCookie = request.cookies.get('accessToken');

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register');

  const isProtectedPage = request.nextUrl.pathname.startsWith('/cart') ||
    request.nextUrl.pathname.startsWith('/orders') ||
    request.nextUrl.pathname.startsWith('/profile');

  const isAdminPage = request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/dashboard');

  // Redirect authenticated users away from auth pages
  if (isAuthPage && authCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated users to login
  if ((isProtectedPage || isAdminPage) && !authCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/cart',
    '/cart/:path*',
    '/orders',
    '/orders/:path*',
    '/profile',
    '/profile/:path*',
    '/admin',
    '/admin/:path*',
    '/dashboard',
    '/dashboard/:path*',
  ],
};
