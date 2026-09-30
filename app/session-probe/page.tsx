import { cookies } from "next/headers";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function SessionProbePage() {
  const cookieStore = await cookies();
  const hasSupabaseCookie = cookieStore
    .getAll()
    .some(({ name }) => name.startsWith("sb-"));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

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
      </dl>
    </main>
  );
}
