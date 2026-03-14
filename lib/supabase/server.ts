import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client with service role key.
 * Use this for admin operations like sending magic links, managing users, etc.
 * NEVER expose this on the client side.
 */
export function createServerSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing Supabase environment variables");
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Send a magic link to the user's email.
 * This will create the user if they don't exist, or log them in if they do.
 */
export async function sendMagicLink(email: string, redirectTo?: string) {
    const supabase = createServerSupabaseClient();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const redirect = redirectTo || `${baseUrl}/my-bookings`;

    const { data, error } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
            redirectTo: redirect,
        },
    });

    if (error) {
        console.error("Error sending magic link:", error);
        throw error;
    }

    return data;
}

/**
 * Get user by email from Supabase Auth.
 */
export async function getUserByEmail(email: string) {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Error listing users:", error);
        return null;
    }

    return data.users.find((user) => user.email === email) || null;
}

/**
 * Create or get user by email.
 * If user doesn't exist, invites them (sends magic link).
 */
export async function inviteUserByEmail(email: string, redirectTo?: string) {
    const supabase = createServerSupabaseClient();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const redirect = redirectTo || `${baseUrl}/my-bookings`;

    // Try to invite the user (creates account if doesn't exist)
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: redirect,
    });

    if (error) {
        // If user already exists, send magic link instead
        if (error.message?.includes("already been registered")) {
            return sendMagicLink(email, redirectTo);
        }
        console.error("Error inviting user:", error);
        throw error;
    }

    return data;
}
