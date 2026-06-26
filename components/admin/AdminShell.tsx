"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
    ExternalLink,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useAdminContext } from "@/components/admin/AdminContext";
import { Button } from "@/components/ui/button";
import {
    ADMIN_NAV_GROUPS,
    getAdminNavForRole,
    getAdminPageTitle,
    isAdminNavActive,
    type AdminNavGroup,
} from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";

type AdminShellProps = {
    children: React.ReactNode;
};

const GROUP_ORDER: AdminNavGroup[] = [
    "overview",
    "operations",
    "website",
    "tools",
    "team",
];

function SidebarNav({
    onNavigate,
    className,
}: {
    onNavigate?: () => void;
    className?: string;
}) {
    const pathname = usePathname();
    const { role } = useAdminContext();
    const items = useMemo(() => getAdminNavForRole(role), [role]);

    const grouped = useMemo(() => {
        return GROUP_ORDER.map((group) => ({
            group,
            items: items.filter((item) => item.group === group),
        })).filter((section) => section.items.length > 0);
    }, [items]);

    return (
        <nav className={cn("flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4", className)}>
            {grouped.map(({ group, items: sectionItems }) => (
                <div key={group}>
                    <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {ADMIN_NAV_GROUPS[group].label}
                    </p>
                    <ul className="mt-2 space-y-1">
                        {sectionItems.map((item) => {
                            const active = isAdminNavActive(pathname, item);
                            const Icon = item.icon;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onNavigate}
                                        className={cn(
                                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                            active
                                                ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                                                : "text-slate-300 hover:bg-white/5 hover:text-white",
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                "h-4 w-4 shrink-0",
                                                active ? "text-[#FA5C5C]" : "text-slate-400",
                                            )}
                                            aria-hidden
                                        />
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    );
}

export function AdminShell({ children }: AdminShellProps) {
    const pathname = usePathname();
    const { user, email, role } = useAdminContext();
    const { signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const pageTitle = getAdminPageTitle(pathname);

    const roleLabel = role === "admin" ? "Administrator" : "Reception";

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="flex min-h-screen">
                <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-900/50 bg-slate-950 text-white lg:flex">
                    <div className="border-b border-white/10 px-5 py-5">
                        <Link href="/admin" className="flex items-center gap-3">
                            <Image
                                src="/lofty-logo-white.png"
                                alt="LoftyXphereHomes"
                                width={36}
                                height={36}
                                className="h-9 w-9 rounded-lg object-contain"
                            />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">
                                    Lofty Admin
                                </p>
                                <p className="truncate text-xs text-slate-400">
                                    Operations console
                                </p>
                            </div>
                        </Link>
                    </div>

                    <SidebarNav className="flex-1" />

                    <div className="border-t border-white/10 p-4">
                        <div className="rounded-xl bg-white/5 p-3">
                            <p className="truncate text-sm font-medium text-white">
                                {email}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">{roleLabel}</p>
                            <div className="mt-3 flex gap-2">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                >
                                    <Link href="/" target="_blank">
                                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                        Site
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                    onClick={() => void signOut()}
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    <span className="sr-only">Sign out</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
                        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                            <div className="flex min-w-0 items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="lg:hidden"
                                    onClick={() => setMobileOpen(true)}
                                    aria-label="Open admin menu"
                                >
                                    <Menu className="h-4 w-4" />
                                </Button>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                                        Admin
                                    </p>
                                    <h1 className="truncate text-lg font-semibold text-slate-900">
                                        {pageTitle}
                                    </h1>
                                </div>
                            </div>

                            <div className="hidden items-center gap-3 sm:flex">
                                <div className="text-right">
                                    <p className="max-w-[220px] truncate text-sm font-medium text-slate-900">
                                        {user.email ?? email}
                                    </p>
                                    <p className="text-xs text-slate-500">{roleLabel}</p>
                                </div>
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FA5C5C]/10 text-sm font-semibold text-[#FA5C5C]">
                                    {(email[0] ?? "A").toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
                </div>
            </div>

            {mobileOpen ? (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-950/60"
                        aria-label="Close admin menu"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col bg-slate-950 text-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                            <div>
                                <p className="text-sm font-semibold">Lofty Admin</p>
                                <p className="text-xs text-slate-400">{roleLabel}</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                onClick={() => setMobileOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <SidebarNav onNavigate={() => setMobileOpen(false)} />
                        <div className="border-t border-white/10 p-4">
                            <Button
                                variant="outline"
                                className="w-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                onClick={() => void signOut()}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign out
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
