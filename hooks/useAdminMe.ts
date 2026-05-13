import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";

export type AdminMe =
    | { ok: true; role: "admin" | "receptionist"; email: string }
    | { ok: false; error: string };

/** `authUserId` should be the signed-in Supabase user id so cache never reuses another account’s admin check. */
export function useAdminMe(enabled: boolean, authUserId?: string | null) {
    return useQuery({
        queryKey: ["admin", "me", authUserId ?? "anon"],
        enabled: enabled && Boolean(authUserId),
        queryFn: async (): Promise<AdminMe> => {
            try {
                const supabase = getSupabaseClient();
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) return { ok: false, error: "Unauthorized" };

                const res = await fetch("/api/admin/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                return (await res.json()) as AdminMe;
            } catch {
                return { ok: false, error: "Could not verify access" };
            }
        },
        staleTime: 30_000,
    });
}
