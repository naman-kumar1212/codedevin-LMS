import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

// Routes that require authentication
const PROTECTED_STUDENT = ['/dashboard', '/my-courses', '/certificates', '/notifications', '/live-classes', '/settings'];
const PROTECTED_ADMIN = ['/admin'];
const PUBLIC_ONLY = ['/login', '/register', '/verify-email'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get access token from cookie
  const token = request.cookies.get('access_token')?.value;

  let payload: any = null;

  if (token) {
    try {
      const { payload: decoded } = await jwtVerify(token, secret);
      payload = decoded;
    } catch {
      // Token invalid / expired — clear cookie and redirect to login
      if (!PUBLIC_ONLY.some((p) => pathname.startsWith(p))) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');
        return response;
      }
    }
  }

  const isAuthenticated = !!payload;
  const role = payload?.role as string | undefined;

  // Redirect logged-in users away from public-only pages
  if (isAuthenticated && PUBLIC_ONLY.some((p) => pathname.startsWith(p))) {
    const destination = role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Protect student routes
  if (PROTECTED_STUDENT.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // Protect admin routes
  if (PROTECTED_ADMIN.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)',
  ],
};
