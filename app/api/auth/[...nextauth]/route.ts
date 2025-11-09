import NextAuth from "next-auth"
import CognitoProvider from "next-auth/providers/cognito"
import { authOptions } from "@/lib/auth-options"

// Criamos o handler com as opções centralizadas em /lib/auth-options.ts
const handler = NextAuth(authOptions)

// Exporta o mesmo handler para GET e POST
export { handler as GET, handler as POST }

