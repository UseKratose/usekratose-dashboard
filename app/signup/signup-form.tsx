"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import {
  authFailureMessage,
  signupConfirmationUrl,
  withAuthTimeout,
} from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(null); setNotice(null);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    try {
      const result = await withAuthTimeout<{
        readonly data: { readonly session: unknown | null };
        readonly error: { readonly message: string } | null;
      }>(
        getSupabaseBrowserClient().auth.signUp({
          email,
          password: String(data.get("password") ?? ""),
          options: {
            data: { full_name: String(data.get("name") ?? "") },
            emailRedirectTo: signupConfirmationUrl(window.location.origin),
          },
        }),
      );
      if (result.error !== null) { setError(result.error.message); setPending(false); return; }
      if (result.data.session === null) { setNotice(`Check ${email} to confirm your account, then sign in.`); setPending(false); return; }
      router.replace("/overview"); router.refresh();
    } catch (cause) {
      setError(authFailureMessage(cause));
      setPending(false);
    }
  }

  return <div className="login-card"><div><span className="eyebrow">Create account</span><h2>Start with evidence</h2><p>Create your UseKratose security workspace.</p></div><form onSubmit={submit}><label>Full name<input autoComplete="name" name="name" required /></label><label>Email address<input autoComplete="email" name="email" required type="email" /></label><label>Password<input autoComplete="new-password" minLength={8} name="password" required type="password" /></label>{error === null ? null : <p className="form-error">{error}</p>}{notice === null ? null : <p className="form-notice">{notice}</p>}<button className="primary-button" disabled={pending} type="submit">{pending ? <LoaderCircle className="spin" size={16} /> : null}{pending ? "Creating account…" : "Create account"}</button></form><p className="login-help">Already have an account? <Link href="/login">Sign in</Link></p></div>;
}
