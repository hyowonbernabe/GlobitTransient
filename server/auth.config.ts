import type { NextAuthConfig } from 'next-auth';
import { Role } from '@prisma/client';

export const authConfig = {
  pages: {
    signIn: '/admin/login', // We use the same login page for both
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // @ts-ignore - auth.user.role is extended via next-auth.d.ts but authConfig doesn't always see it
      const role = auth?.user?.role;

      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnPortal = nextUrl.pathname.startsWith('/portal');
      const isOnLogin = nextUrl.pathname.startsWith('/admin/login');

      // 1. Protect Admin Routes
      if (isOnAdmin && !isOnLogin) {
        if (!isLoggedIn) return false;
        // Redirect Agents trying to access Admin to their Portal
        if (role === 'AGENT') {
          return Response.redirect(new URL('/portal/dashboard', nextUrl));
        }
        return true;
      }

      // 2. Protect Agent Portal Routes
      if (isOnPortal) {
        if (!isLoggedIn) return false;
        // Allow Admins to peek, but primarily for Agents
        return true;
      }

      // 3. Handle Login Redirects
      if (isOnLogin) {
        if (isLoggedIn) {
          // Redirect based on Role
          if (role === 'AGENT') {
            return Response.redirect(new URL('/portal/dashboard', nextUrl));
          }
          return Response.redirect(new URL('/admin/dashboard', nextUrl));
        }
        return true;
      }

      return true;
    },
    session({ session, token }) {
      if (session.user && token.role) {
        // @ts-ignore
        session.user.role = token.role as Role;
        // @ts-ignore
        session.user.agentCode = token.agentCode as string | null;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.agentCode = user.agentCode;
      }
      return token;
    }
  },
  providers: [],
} satisfies NextAuthConfig;