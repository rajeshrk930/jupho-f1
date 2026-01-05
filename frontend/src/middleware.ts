import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = [
  '/dashboard',
  '/analyze',
  '/assistant',
  '/assistant/history',
  '/history',
];

const AUTH_FREE_PATHS = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPage = AUTH_FREE_PATHS.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    const redirectTarget = `/login?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  if (isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/analyze',
    '/assistant',
    '/assistant/:path*',
    '/history',
    '/history/:path*',
  ],
};
