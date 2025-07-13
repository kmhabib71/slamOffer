import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import clientPromise from './mongodb'
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

          // Find user by email - AI-FRIENDLY: Uses unified user_profiles collection
          const user = await db.collection('user_profiles').findOne({
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
  // No adapter - using JWT strategy only to avoid creating separate collections
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const client = await clientPromise
          const db = client.db()

          // Check if user exists in unified collection
          const existingUser = await db.collection('user_profiles').findOne({
            email: user.email,
          })

          if (!existingUser) {
            // Create user in unified user_profiles collection - AI-FRIENDLY approach
            await db.collection('user_profiles').insertOne({
              email: user.email,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
              role: 'user',
              subscription_tier: 'free',
              credits_remaining: 3,
              total_offers_generated: 0,
              daily_generation_count: 0,
              generations_today: 0, // Add this field for manual testing compatibility
              daily_limit: 1, // Free tier daily limit
              purchased_offers_count: 0,
              created_at: new Date(),
              updated_at: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }
        } catch (error) {
          console.error('Error creating user:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session?.user) {
        ;(session.user as any).id = token.sub!
        ;(session.user as any).role = token.role as string

        // Get additional user data from unified collection
        try {
          const client = await clientPromise
          const db = client.db()
          const user = await db.collection('user_profiles').findOne({
            email: session.user.email,
          })
          if (user) {
            ;(session.user as any).subscription_tier = user.subscription_tier
            ;(session.user as any).credits_remaining = user.credits_remaining
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
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
