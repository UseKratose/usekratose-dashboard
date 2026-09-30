import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const cookies = request.cookies.getAll();
  const hasSupabaseCookie = cookies.some(({ name }) => name.startsWith("sb-"));

  if (!url || !publishableKey) {
    return NextResponse.json(
      { authenticated: false, configured: false, hasSupabaseCookie },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => cookies,
      setAll() {},
    },
  });
  const { data, error } = await supabase.auth.getUser();

  return NextResponse.json(
    {
      authenticated: data.user !== null,
      authError: error?.code ?? null,
      configured: true,
      hasSupabaseCookie,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
