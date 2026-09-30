import { cookies } from "next/headers";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { backendUrl } from "@/lib/backend";

export const dynamic = "force-dynamic";

export default async function SessionProbePage() {
  const cookieStore = await cookies();
  const hasSupabaseCookie = cookieStore
    .getAll()
    .some(({ name }) => name.startsWith("sb-"));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const apiStatus =
    accessToken === undefined
      ? null
      : await fetch(backendUrl("/api/v1/dashboard"), {
          cache: "no-store",
          headers: { authorization: `Bearer ${accessToken}` },
        }).then((response) => response.status);

  return (
    <main>
      <h1>Session boundary probe</h1>
      <dl>
        <dt>Supabase cookie received</dt>
        <dd>{String(hasSupabaseCookie)}</dd>
        <dt>Authenticated</dt>
        <dd>{String(data.user !== null)}</dd>
        <dt>Authentication error</dt>
        <dd>{error?.code ?? "none"}</dd>
        <dt>Access token available</dt>
        <dd>{String(accessToken !== undefined)}</dd>
        <dt>Dashboard API status</dt>
        <dd>{apiStatus ?? "not requested"}</dd>
      </dl>
    </main>
  );
}
