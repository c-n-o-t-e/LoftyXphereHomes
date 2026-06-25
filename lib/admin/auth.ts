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

class AdminAuthError extends Error {
    httpResponse?: Response;
    statusCode?: number;

    constructor(
        message: string,
        init?: { httpResponse?: Response; statusCode?: number },
    ) {
        super(message);
        this.name = "AdminAuthError";
        this.httpResponse = init?.httpResponse;
        this.statusCode = init?.statusCode;
    }
}

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
        throw new AdminAuthError("Unauthorized", {
            httpResponse: parsedHeaders.response,
        });
    }

    const token = parsedHeaders.data.authorization.replace(/^Bearer\s+/i, "");
    const { supabaseUrl, supabaseAnonKey } = requireSupabaseEnv();
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user?.id || !user.email) {
        throw new AdminAuthError("Unauthorized", { statusCode: 401 });
    }

    const { prisma } = await import("@/lib/db");
    const adminUser = await prisma.adminUser.findFirst({
        where: {
            OR: [{ supabaseUserId: user.id }, { email: user.email }],
        },
        select: { supabaseUserId: true, email: true, role: true },
    });

    if (!adminUser) {
        throw new AdminAuthError("Forbidden", { statusCode: 403 });
    }

    const role = adminUser.role as AdminRole;
    if (!allowedRoles.includes(role)) {
        throw new AdminAuthError("Forbidden", { statusCode: 403 });
    }

    return {
        supabaseUserId: adminUser.supabaseUserId,
        email: adminUser.email,
        role,
    };
}
