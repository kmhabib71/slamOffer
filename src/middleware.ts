import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // Allow admin routes to pass through - AdminAuthGuard will handle the actual admin check
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return !!token // Just check if user is authenticated
      }

      // Protect authenticated routes
      if (
        req.nextUrl.pathname.startsWith('/dashboard') ||
        req.nextUrl.pathname.startsWith('/previous-offers')
      ) {
        return !!token
      }

      return true
    },
  },
})

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/previous-offers/:path*'],
}
