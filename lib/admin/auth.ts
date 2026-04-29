import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { parseHeaders } from "@/lib/validation/http";
import { bearerAuthHeaderSchema } from "@/lib/validation/schemas";

export type AdminRole = "admin" | "receptionist";

export type AdminAuthResult = {
    supabaseUserId: string;
    email: string;
    role: AdminRole;
};

function requireSupabaseEnv() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables");
    }
    return { supabaseUrl, supabaseAnonKey };
}

export async function requireAdmin(
    request: NextRequest,
    allowedRoles: AdminRole[] = ["admin", "receptionist"],
): Promise<AdminAuthResult> {
    const parsedHeaders = parseHeaders(request, bearerAuthHeaderSchema);
    if (!parsedHeaders.success) {
        // Reuse standardized response semantics by throwing; caller should catch and return 401/400.
        const err = new Error("Unauthorized");
        (err as any).httpResponse = parsedHeaders.response;
        throw err;
    }

    const token = parsedHeaders.data.authorization.replace(/^Bearer\s+/i, "");
    const { supabaseUrl, supabaseAnonKey } = requireSupabaseEnv();
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user?.id || !user.email) {
        const err = new Error("Unauthorized");
        (err as any).statusCode = 401;
        throw err;
    }

    const { prisma } = await import("@/lib/db");
    const adminUser = await prisma.adminUser.findFirst({
        where: {
            OR: [{ supabaseUserId: user.id }, { email: user.email }],
        },
        select: { supabaseUserId: true, email: true, role: true },
    });

    if (!adminUser) {
        const err = new Error("Forbidden");
        (err as any).statusCode = 403;
        throw err;
    }

    const role = adminUser.role as AdminRole;
    if (!allowedRoles.includes(role)) {
        const err = new Error("Forbidden");
        (err as any).statusCode = 403;
        throw err;
    }

    return {
        supabaseUserId: adminUser.supabaseUserId,
        email: adminUser.email,
        role,
    };
}

