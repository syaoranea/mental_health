import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider"
import type { OAuthConfig } from "next-auth/providers/oauth"

// 🔐 AWS Cognito Client
const client = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION,
})

// 🔐 Provider Cognito OAuth (corrigido com profile)
const CognitoProvider = (options: {
  clientId: string
  clientSecret: string
  domain: string
}): OAuthConfig<any> => ({
  id: "cognito",
  name: "Cognito",
  type: "oauth",
  wellKnown: `https://${options.domain}/.well-known/openid-configuration`,
  clientId: options.clientId,
  clientSecret: options.clientSecret,

  authorization: {
    params: {
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/cognito`,
      scope: "openid email profile"
    }
  },
  // Obrigatório no NextAuth v5 — adapta o payload do Cognito para o usuário NextAuth
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name ?? profile.email?.split("@")[0],
      email: profile.email,
    }
  },
})

const handler = NextAuth({
  providers: [
    // 🔹 Login Email/Senha Cognito (UserPasswordAuth)
    CredentialsProvider({
      name: "Email & Senha",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
  console.log("🔥 authorize() iniciou", credentials)

  if (!credentials?.email || !credentials?.password) {
    console.log("❌ faltando email/senha")
    return null
  }

  try {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      AuthParameters: {
        USERNAME: credentials.email,
        PASSWORD: credentials.password,
      },
    })

    const response = await client.send(command)

    console.log("🔥 resposta Cognito:", response)

    if (!response.AuthenticationResult) {
      console.log("❌ AuthenticationResult vazio")
      return null
    }

    console.log("🔥 LOGIN OK!")

    return {
      id: credentials.email,
      email: credentials.email,
      accessToken: response.AuthenticationResult.AccessToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      idToken: response.AuthenticationResult.IdToken,
    }
  } catch (error: any) {
    console.error("❌ Cognito Error:", error)
    return null
  }
}

    }),

    // 🔹 OAuth Cognito (Google, Apple, etc via Hosted UI)
    CognitoProvider({
      clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      domain: process.env.COGNITO_DOMAIN!, // ex: myapp.auth.us-east-1.amazoncognito.com
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.idToken = (user as any).idToken
        token.refreshToken = (user as any).refreshToken
      }
      return token
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.idToken = token.idToken as string
      return session
    },
  },

  // ✅ Agora está no lugar correto
  pages: {
    signIn: "/auth/entrar",
  }
})

export { handler as GET, handler as POST }