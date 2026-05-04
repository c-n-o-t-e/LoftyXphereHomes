import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";

export type AdminMe =
    | { ok: true; role: "admin" | "receptionist"; email: string }
    | { ok: false; error: string };

export function useAdminMe(enabled: boolean) {
    return useQuery({
        queryKey: ["admin", "me"],
        enabled,
        queryFn: async (): Promise<AdminMe> => {
            const supabase = getSupabaseClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) return { ok: false, error: "Unauthorized" };

            const res = await fetch("/api/admin/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.json() as Promise<AdminMe>;
        },
        staleTime: 30_000,
    });
}
