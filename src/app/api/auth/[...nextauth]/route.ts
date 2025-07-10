import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth-config'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Don't export authOptions from route files - it causes build issues
// Import from a separate config file instead
