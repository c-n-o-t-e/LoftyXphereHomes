import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseHeaders } from "@/lib/validation/http";
import { bearerAuthHeaderSchema } from "@/lib/validation/schemas";

/**
 * POST /api/link-bookings
 * When a user logs in, link any bookings made with their email to their auth user id.
 */
export async function POST(request: NextRequest) {
    const parsedHeaders = parseHeaders(request, bearerAuthHeaderSchema);
    if (!parsedHeaders.success) return parsedHeaders.response;

    const token = parsedHeaders.data.authorization.replace(/^Bearer\s+/i, "");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.json(
            { error: "Service temporarily unavailable" },
            { status: 500 },
        );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(token);

    if (error || !user?.id || !user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/db");
    const result = await prisma.booking.updateMany({
        where: {
            userId: null,
            bookerEmail: user.email,
        },
        data: {
            userId: user.id,
        },
    });

    return NextResponse.json({ ok: true, linked: result.count });
}

