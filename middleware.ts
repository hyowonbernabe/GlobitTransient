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

  // 2. Proceed with Auth Logic
  return NextResponse.next();
});
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};