import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SupabaseAuthUserRef = {
    id: string;
    email?: string;
};

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

/**
 * Look up a Supabase Auth user by email using paginated admin API calls.
 * Avoids loading the entire user directory into memory at once.
 */
export async function getSupabaseUserByEmail(
    email: string,
): Promise<SupabaseAuthUserRef | null> {
    const supabase = createServerSupabaseClient();
    const target = normalizeEmail(email);
    const perPage = 200;
    let page = 1;

    while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({
            page,
            perPage,
        });
        if (error) {
            throw new Error(`Supabase listUsers failed: ${error.message}`);
        }

        const match = data.users.find(
            (user) => (user.email ?? "").trim().toLowerCase() === target,
        );
        if (match?.id) {
            return { id: match.id, email: match.email };
        }

        if (data.users.length < perPage) {
            return null;
        }
        page += 1;
    }
}
