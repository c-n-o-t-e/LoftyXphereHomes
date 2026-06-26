"use client";

import { createContext, useContext } from "react";
import type { AdminRole } from "@/lib/admin/auth";

export type AdminContextUser = {
    id: string;
    email?: string | null;
};

export type AdminContextValue = {
    user: AdminContextUser;
    email: string;
    role: AdminRole;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminContextProvider({
    value,
    children,
}: {
    value: AdminContextValue;
    children: React.ReactNode;
}) {
    return (
        <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
    );
}

export function useAdminContext() {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdminContext must be used within AdminContextProvider");
    }
    return context;
}

export function useOptionalAdminContext() {
    return useContext(AdminContext);
}
