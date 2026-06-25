"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useAdminMe } from "@/hooks/useAdminMe";
import { Card } from "@/components/ui/card";

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" aria-hidden />
                <span className="sr-only">Loading admin dashboard</span>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (!me?.ok) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-3xl mx-auto px-4 py-10">
                    <Card className="p-6">
                        <h1 className="text-xl font-bold text-gray-900">
                            Admin access required
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Your account doesn’t have access to the admin dashboard.
                        </p>
                    </Card>
                </div>
            </div>
        );
    }

    if (!allowedRoles.includes(me.role)) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-3xl mx-auto px-4 py-10">
                    <Card className="p-6">
                        <h1 className="text-xl font-bold text-gray-900">
                            Insufficient permissions
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            This area requires {allowedRoles.join(" or ")} access.
                        </p>
                    </Card>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
