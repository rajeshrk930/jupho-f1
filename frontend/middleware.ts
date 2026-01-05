import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = [
  '/dashboard',
  '/analyze',
  '/assistant',
  '/history',
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('token')?.value;
  if (!token) {
    const redirectTarget = `/login?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(new URL(redirectTarget, request.url));
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
