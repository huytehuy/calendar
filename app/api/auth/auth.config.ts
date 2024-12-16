import { NextAuthOptions, DefaultSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { JWT } from 'next-auth/jwt'

// Mở rộng type Session
declare module 'next-auth' {
  interface Session {
    user: {
      accessToken?: string
    } & DefaultSession['user']
  }
}

// Mở rộng type JWT
declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "email", 
            "profile",
            "https://www.googleapis.com/auth/calendar.events.readonly",
            "https://www.googleapis.com/auth/calendar.readonly"
          ].join(" ")
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
} 