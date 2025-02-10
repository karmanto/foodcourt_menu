import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    console.log(req.nextauth.token)
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token
      }
    }
  }
)

export const config = { matcher: ['/', '/new-todo', '/update-todo/:path*'] }
