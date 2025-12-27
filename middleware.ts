import NextAuth from 'next-auth';
import { authConfig } from '@/server/auth.config';
import { NextResponse } from 'next/server';

const auth = NextAuth(authConfig).auth;

export default auth((req) => {
  const { nextUrl } = req;

  // 1. Check for Referral Code
  const ref = nextUrl.searchParams.get('ref');

  if (ref) {
    // If found, strip it from URL (cleaner) and set cookie
    // We redirect to the same path without the query param
    const url = new URL(nextUrl.pathname, nextUrl.origin);
    // Preserve other params if needed (e.g. date searches), but remove ref
    nextUrl.searchParams.delete('ref');
    nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));

    const response = NextResponse.redirect(url);

    // Cookie valid for 30 days
    response.cookies.set('globit_agent_ref', ref, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  }

  // 2. Auth Check
  const isLoggedIn = !!req.auth?.user;
  // @ts-ignore - auth.user.role is extended via next-auth.d.ts
  const role = req.auth?.user?.role;

  const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
  const isOnLogin = nextUrl.pathname.startsWith('/admin/login');

  // Protect Dashboard Routes
  if (isOnDashboard) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', nextUrl));
    }
    if (role !== 'ADMIN' && role !== 'AGENT') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
    return NextResponse.next();
  }

  // Handle Login Redirects
  if (isOnLogin) {
    if (isLoggedIn && (role === 'ADMIN' || role === 'AGENT')) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};