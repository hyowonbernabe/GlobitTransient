import { Role } from "@prisma/client"
import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            role: Role
            agentCode?: string | null
        } & DefaultSession["user"]
    }

    interface User {
        role: Role
        agentCode?: string | null
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        role: Role
        agentCode?: string | null
    }
}
