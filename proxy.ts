import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function proxy(request: NextRequest) {
const token = request.cookies.get("better-auth.session_data")?.value;

  const isProtectedRoute = request.nextUrl.pathname.startsWith("/quizzes/play");
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
 
export const config = {
  matcher: ["/quizzes/play/:path*"],
}