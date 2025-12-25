import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
 
// Validate credentials structure
const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = CredentialsSchema.safeParse(credentials);
 
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;
          
          // Only allow ADMIN or AGENT roles to login via this portal
          if (user.role === 'CLIENT') return null;

          const passwordsMatch = await bcrypt.compare(password, user.password || '');
 
          if (passwordsMatch) return user;
        }
 
        return null;
      },
    }),
  ],
});