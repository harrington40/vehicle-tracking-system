import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('token')?.value;

  // Redirect to login if no token exists
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Allow the request to proceed if a token exists
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'], // Apply middleware to protect /dashboard routes
};
