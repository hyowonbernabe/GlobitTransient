import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/portal');
      const isOnLogin = nextUrl.pathname.startsWith('/admin/login');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isOnLogin) {
        if (isLoggedIn) {
          // If already logged in, redirect to dashboard
          return Response.redirect(new URL('/admin/dashboard', nextUrl));
        }
        return true;
      }
      return true;
    },
    // Add user role to the session
    session({ session, token }) {
        if (session.user && token.role) {
            // @ts-ignore
            session.user.role = token.role;
        }
        return session;
    },
    jwt({ token, user }) {
        if (user) {
            // @ts-ignore
            token.role = user.role;
        }
        return token;
    }
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;