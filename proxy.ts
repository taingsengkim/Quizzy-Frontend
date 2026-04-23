import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function proxy(request: NextRequest) {
const token = request.cookies.get("access_token")?.value;

  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith("/quizzes/play") ||   
    request.nextUrl.pathname.startsWith("/dashboard");
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
 
export const config = {
  matcher: ["/quizzes/play/:path*", "/dashboard/:path*"],
}