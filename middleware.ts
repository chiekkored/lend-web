import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host")?.split(":")[0];
  const adminHost =
    process.env.NEXT_PUBLIC_ADMIN_HOST ?? "admin.<base_url_here>.com";

  if (
    host === adminHost &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api") &&
    !PUBLIC_FILE.test(pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
