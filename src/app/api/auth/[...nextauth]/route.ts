import NextAuth, { NextAuthOptions } from 'next-auth'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const client = await clientPromise
          const db = client.db()

          // Find user by email
          const user = await db.collection('users').findOne({
            email: credentials.email,
          })

          if (!user) {
            return null
          }

          // Check password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role || 'user',
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        ;(session.user as any).id = token.sub!
        ;(session.user as any).role = token.role as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        ;(token as any).role = (user as any).role
      }
      return token
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
