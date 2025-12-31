import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = [
    '/admin',
    '/qr-generator',
  ];

  // Check if current path matches any protected route
  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route) && pathname !== '/admin/login'
  );

  if (isProtected) {
    // Get the admin session cookie
    const token = request.cookies.get('admin-session')?.value;

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify the token
    const session = await verifyToken(token);

    // If token is invalid or expired, redirect to login
    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      // Clear the invalid cookie
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('admin-session');
      return response;
    }

    // Token is valid, allow the request to proceed
    return NextResponse.next();
  }

  // For all other routes, allow the request
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/qr-generator/:path*',
  ],
};
