import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (excluding login page and API)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = request.cookies.get('admin_session');
    
    // Must have a session cookie with content
    if (!session?.value || session.value.length < 10) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Token format validation — must be two UUIDs joined by '-'
    // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const tokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    if (!tokenPattern.test(session.value)) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_session');
      return response;
    }
  }

  // Security headers on all responses
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', pathname.startsWith('/admin') ? 'noindex, nofollow' : 'index, follow');
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
