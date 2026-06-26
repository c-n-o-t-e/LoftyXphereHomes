"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useAdminMe } from "@/hooks/useAdminMe";
import { AdminContextProvider } from "@/components/admin/AdminContext";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminShell } from "@/components/admin/AdminShell";

type AdminAuthGateProps = {
    children: React.ReactNode;
    /** When set, only these roles may access (default: admin + receptionist). */
    allowedRoles?: Array<"admin" | "receptionist">;
    /** Path used for login redirect (defaults to current pathname). */
    loginRedirect?: string;
};

/**
 * Shared client guard for /admin routes.
 * API routes remain protected server-side via requireAdmin(); this gate
 * prevents casual browsing of admin UI and centralizes redirect logic.
 */
export function AdminAuthGate({
    children,
    allowedRoles = ["admin", "receptionist"],
    loginRedirect,
}: AdminAuthGateProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const redirectTarget = loginRedirect ?? pathname ?? "/admin";

    const { data: me, isLoading: isMeLoading } = useAdminMe(
        Boolean(user) && !isLoading,
        user?.id,
    );

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.replace(
                `/login?redirect=${encodeURIComponent(redirectTarget)}`,
            );
        }
    }, [isLoading, user, router, redirectTarget]);

    if (isLoading || isMeLoading || (user && me === undefined)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2
                    className="h-8 w-8 animate-spin text-[#FA5C5C]"
                    aria-hidden
                />
                <span className="sr-only">Loading admin dashboard</span>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (!me?.ok) {
        return (
            <AdminNotice
                title="Admin access required"
                description="Your account doesn’t have access to the admin dashboard. Contact an administrator if you believe this is a mistake."
            />
        );
    }

    if (!allowedRoles.includes(me.role)) {
        return (
            <AdminNotice
                title="Insufficient permissions"
                description={`This area requires ${allowedRoles.join(" or ")} access.`}
            />
        );
    }

    return (
        <AdminContextProvider
            value={{
                user: { id: user.id, email: user.email },
                email: me.email,
                role: me.role,
            }}
        >
            <AdminShell>{children}</AdminShell>
        </AdminContextProvider>
    );
}
