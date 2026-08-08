"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { BASE_PATH } from "@/lib/base-path";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${BASE_PATH}/auth/callback?next=${BASE_PATH}/admin`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-sm flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-warm-grey">
        StackNarrative
      </p>
      <h1 className="mt-2 font-serif text-3xl text-premium-black">
        Editor / Admin sign in
      </h1>
      <p className="mt-2 text-sm text-soft-charcoal">
        Enter the email your account was invited with. We&apos;ll send a
        sign-in link — no password needed.
      </p>

      {status === "sent" ? (
        <p className="mt-6 border border-pistachio px-4 py-3 text-sm text-premium-black">
          Check your inbox for a sign-in link.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@stacknarrative.com"
            className="w-full border border-light-grey-bg px-3 py-2 text-sm text-premium-black outline-none focus:border-pistachio"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full border border-premium-black bg-premium-black px-4 py-2 text-sm text-white transition-colors hover:bg-soft-charcoal disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Send sign-in link"}
          </button>
          {status === "error" && (
            <p className="text-sm text-red-600">
              Something went wrong sending the link. Try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
