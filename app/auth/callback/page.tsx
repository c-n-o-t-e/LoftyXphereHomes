"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeInternalRedirect } from "@/lib/security/redirect";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = normalizeInternalRedirect(
    searchParams.get("next"),
    "/my-bookings",
  );
  const didRedirect = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();

    const finish = () => {
      if (didRedirect.current) return;
      didRedirect.current = true;
      router.replace(next);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session?.user &&
        (event === "SIGNED_IN" || event === "INITIAL_SESSION")
      ) {
        finish();
      }
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) finish();
    });

    const timeout = window.setTimeout(() => {
      if (didRedirect.current) return;
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (didRedirect.current) return;
        if (session?.user) {
          finish();
          return;
        }
        setError(
          "Sign-in did not complete. The link may have expired — request a new one from the login page.",
        );
      });
    }, 15_000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [next, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 pt-20">
        <p className="text-red-700 text-center mb-4 max-w-md">{error}</p>
        <Link
          href={`/login?redirect=${encodeURIComponent(next)}`}
          className="text-amber-700 font-medium underline underline-offset-2"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
      <Loader2 className="h-8 w-8 animate-spin text-amber-600" aria-hidden />
      <span className="sr-only">Completing sign-in</span>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
