
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Middleware logic if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/auth')) {
          return true
        }
        // Allow access to homepage without token
        if (req.nextUrl.pathname === '/') {
          return true
        }
        // Require token for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!api/auth|api/signup|_next/static|_next/image|favicon.ico|og-image.png|robots.txt|.*\\.svg$).*)',
  ]
}
