"use client";

import Link from "next/link";
import {
    ADMIN_NAV_GROUPS,
    ADMIN_NAV_ITEMS,
    type AdminNavGroup,
} from "@/lib/admin/navigation";
import { useAdminContext } from "@/components/admin/AdminContext";
import { AdminModuleCard } from "@/components/admin/AdminModuleCard";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const GROUP_ORDER: AdminNavGroup[] = [
    "operations",
    "website",
    "tools",
    "team",
];

export default function AdminHomePage() {
    const { email, role } = useAdminContext();
    const isAdmin = role === "admin";

    const visibleItems = ADMIN_NAV_ITEMS.filter(
        (item) => item.href !== "/admin" && item.roles.includes(role),
    );

    const groupedSections = GROUP_ORDER.map((group) => ({
        group,
        items: visibleItems.filter((item) => item.group === group),
    })).filter((section) => section.items.length > 0);

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Dashboard"
                description="Run daily operations, manage website content, and keep guest-facing assets up to date."
                actions={
                    <>
                        <Button variant="outline" asChild>
                            <Link href="/admin/bookings">View bookings</Link>
                        </Button>
                        <Button asChild className="bg-[#FA5C5C] hover:bg-[#E84A4A]">
                            <Link href="/admin/bookings/new">New manual booking</Link>
                        </Button>
                    </>
                }
            />

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-slate-200/80 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Signed in
                    </p>
                    <p className="mt-2 truncate text-base font-semibold text-slate-900">
                        {email}
                    </p>
                    <p className="mt-1 text-sm capitalize text-slate-600">{role}</p>
                </Card>
                <Card className="border-slate-200/80 bg-white p-5 shadow-sm md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Today&apos;s focus
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {isAdmin
                            ? "Use Operations for bookings and invoices. Website content covers apartment photos, amenities, hero video, and fixed page images."
                            : "Use Bookings to search reservations and create manual bookings for walk-ins, WhatsApp, or Instagram enquiries."}
                    </p>
                </Card>
            </div>

            <div className="mt-10 space-y-10">
                {groupedSections.map(({ group, items }) => (
                    <section key={group}>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-slate-900">
                                {ADMIN_NAV_GROUPS[group].label}
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                {ADMIN_NAV_GROUPS[group].description}
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {items.map((item) => (
                                <AdminModuleCard
                                    key={item.href}
                                    href={item.href}
                                    title={item.label}
                                    description={item.description}
                                    icon={item.icon}
                                    badge={
                                        item.roles.length === 1 &&
                                        item.roles[0] === "admin"
                                            ? "Admin"
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </AdminPageContainer>
    );
}
