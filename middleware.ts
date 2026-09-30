import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { DASHBOARD_BASE_PATH, dashboardPath } from "@/lib/paths";

function canonicalUrl(pathname: string, request: NextRequest): URL {
  const configuredOrigin = process.env.NEXT_PUBLIC_MARKETING_URL;
  return new URL(pathname, configuredOrigin ?? request.nextUrl.origin);
}

function redirectWithCookies(url: URL, response: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url);
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname.startsWith(DASHBOARD_BASE_PATH)
    ? request.nextUrl.pathname.slice(DASHBOARD_BASE_PATH.length) || "/"
    : request.nextUrl.pathname;

  if (pathname === "/login" || pathname === "/signup") {
    return NextResponse.redirect(canonicalUrl(pathname, request), 308);
  }
  if (pathname === "/overview") {
    return NextResponse.redirect(canonicalUrl("/dashboard", request), 308);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return response;

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet)
          request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    const loginUrl = canonicalUrl("/login", request);
    loginUrl.searchParams.set(
      "redirect",
      pathname === "/" ? "/dashboard" : dashboardPath(pathname),
    );
    return redirectWithCookies(loginUrl, response);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|brand/).*)"],
};
