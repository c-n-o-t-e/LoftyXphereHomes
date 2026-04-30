import type { AdminRole } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SupabaseAuthUser = {
    id: string;
    email?: string;
};

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

async function getSupabaseUserByEmail(
    email: string,
): Promise<SupabaseAuthUser | null> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw new Error(`Supabase listUsers failed: ${error.message}`);
    const normalized = normalizeEmail(email);
    return (
        data.users.find(
            (u) => (u.email ?? "").trim().toLowerCase() === normalized,
        ) ?? null
    );
}

async function inviteSupabaseUserByEmail(
    email: string,
): Promise<SupabaseAuthUser> {
    const supabase = createServerSupabaseClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${baseUrl}/admin`,
    });
    if (error) throw new Error(`Supabase inviteUserByEmail failed: ${error.message}`);
    if (!data?.user?.id) {
        // Some environments return a link payload without the user object; re-list as fallback.
        const existing = await getSupabaseUserByEmail(email);
        if (existing?.id) return existing;
        throw new Error("Supabase invite succeeded but no user id returned.");
    }
    return { id: data.user.id, email: data.user.email };
}

export type StaffUser = {
    id: string;
    supabaseUserId: string;
    email: string;
    role: AdminRole;
    createdAt: string;
};

export async function listStaffUsers(): Promise<StaffUser[]> {
    const { prisma } = await import("@/lib/db");
    const users = await prisma.adminUser.findMany({
        orderBy: [{ role: "asc" }, { createdAt: "desc" }],
        select: {
            id: true,
            supabaseUserId: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
    return users.map((u) => ({
        ...u,
        role: u.role as AdminRole,
        createdAt: u.createdAt.toISOString(),
    }));
}

export async function upsertStaffUser(params: {
    email: string;
    role: AdminRole;
}): Promise<StaffUser> {
    const email = normalizeEmail(params.email);

    const existing = await getSupabaseUserByEmail(email);
    const authUser = existing ?? (await inviteSupabaseUserByEmail(email));

    const { prisma } = await import("@/lib/db");
    const adminUser = await prisma.adminUser.upsert({
        where: { email },
        update: {
            supabaseUserId: authUser.id,
            role: params.role,
        },
        create: {
            supabaseUserId: authUser.id,
            email,
            role: params.role,
        },
        select: {
            id: true,
            supabaseUserId: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    return {
        ...adminUser,
        role: adminUser.role as AdminRole,
        createdAt: adminUser.createdAt.toISOString(),
    };
}

export async function updateStaffRole(params: {
    actorSupabaseUserId: string;
    staffId: string;
    nextRole: AdminRole;
}): Promise<StaffUser> {
    const { prisma } = await import("@/lib/db");
    const target = await prisma.adminUser.findUnique({
        where: { id: params.staffId },
        select: {
            id: true,
            supabaseUserId: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
    if (!target) {
        const err = new Error("Not found");
        (err as { statusCode?: number }).statusCode = 404;
        throw err;
    }
    if (target.supabaseUserId === params.actorSupabaseUserId) {
        const err = new Error("Cannot change your own role.");
        (err as { statusCode?: number }).statusCode = 400;
        throw err;
    }

    if (target.role === "admin" && params.nextRole === "receptionist") {
        const adminCount = await prisma.adminUser.count({
            where: { role: "admin" },
        });
        if (adminCount <= 1) {
            const err = new Error("Cannot demote the last remaining admin.");
            (err as { statusCode?: number }).statusCode = 409;
            throw err;
        }
    }

    const updated = await prisma.adminUser.update({
        where: { id: target.id },
        data: { role: params.nextRole },
        select: {
            id: true,
            supabaseUserId: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    return {
        ...updated,
        role: updated.role as AdminRole,
        createdAt: updated.createdAt.toISOString(),
    };
}

export async function removeStaffUser(params: {
    actorSupabaseUserId: string;
    staffId: string;
}): Promise<{ removed: StaffUser; authSoftDeleted: boolean; warning?: string }> {
    const { prisma } = await import("@/lib/db");
    const target = await prisma.adminUser.findUnique({
        where: { id: params.staffId },
        select: {
            id: true,
            supabaseUserId: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
    if (!target) {
        const err = new Error("Not found");
        (err as { statusCode?: number }).statusCode = 404;
        throw err;
    }

    if (target.supabaseUserId === params.actorSupabaseUserId) {
        const err = new Error("Cannot remove your own access.");
        (err as { statusCode?: number }).statusCode = 400;
        throw err;
    }

    if (target.role === "admin") {
        const adminCount = await prisma.adminUser.count({
            where: { role: "admin" },
        });
        if (adminCount <= 1) {
            const err = new Error("Cannot remove the last remaining admin.");
            (err as { statusCode?: number }).statusCode = 409;
            throw err;
        }
    }

    const removed = await prisma.adminUser.delete({
        where: { id: target.id },
        select: {
            id: true,
            supabaseUserId: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    const removedStaff: StaffUser = {
        ...removed,
        role: removed.role as AdminRole,
        createdAt: removed.createdAt.toISOString(),
    };

    const supabase = createServerSupabaseClient();
    try {
        const { error } = await supabase.auth.admin.deleteUser(
            removed.supabaseUserId,
            true
        );
        if (error) {
            return {
                removed: removedStaff,
                authSoftDeleted: false,
                warning: `Access removed, but could not soft-delete Supabase user: ${error.message}`,
            };
        }
        return { removed: removedStaff, authSoftDeleted: true };
    } catch (e) {
        return {
            removed: removedStaff,
            authSoftDeleted: false,
            warning:
                e instanceof Error
                    ? `Access removed, but could not soft-delete Supabase user: ${e.message}`
                    : "Access removed, but could not soft-delete Supabase user.",
        };
    }
}

