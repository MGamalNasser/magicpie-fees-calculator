import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const PUBLIC_PATHS = ["/login", "/signup"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)

  if (PUBLIC_PATHS.includes(pathname)) {
    if (sessionCookie) return NextResponse.redirect(new URL("/", request.url))
    return NextResponse.next()
  }

  if (!sessionCookie) {
    const url = new URL("/login", request.url)
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|fonts|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}