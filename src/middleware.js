import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

const secret = process.env.NEXTAUTH_SECRET

const isAuthPage = ['/signin', '/signup']
const protectedRoutes = ['/dashboard', '/settings', '/profile']
const publicRoutes = ['/', '/privacy', '/terms', '/pricing']

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Skip middleware for public routes
  if (publicRoutes.some(route => pathname === route)) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret });
  
  // Handle auth pages - redirect to dashboard if authenticated
  if (isAuthPage.some(route => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // Handle protected routes - redirect to home if not authenticated
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Auth pages
    '/signin',
    '/signup',
    // Protected routes
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    // Include public routes that need middleware (if any)
    '/',
    '/privacy',
    '/terms',
    '/pricing'
  ]
} 