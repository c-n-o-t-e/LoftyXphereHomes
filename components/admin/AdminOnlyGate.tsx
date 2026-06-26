"use client";

import { useAdminContext } from "@/components/admin/AdminContext";
import { AdminNotice } from "@/components/admin/AdminNotice";

type AdminOnlyGateProps = {
    children: React.ReactNode;
};

export function AdminOnlyGate({ children }: AdminOnlyGateProps) {
    const { role } = useAdminContext();

    if (role !== "admin") {
        return (
            <AdminNotice
                title="Administrator access required"
                description="This area is limited to administrators. Reception staff can manage bookings from the dashboard and bookings list."
            />
        );
    }

    return children;
}
