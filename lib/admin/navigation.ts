import type { LucideIcon } from "lucide-react";
import {
    Building2,
    CalendarDays,
    Clapperboard,
    Images,
    LayoutDashboard,
    Palette,
    Users,
    Wrench,
    XCircle,
} from "lucide-react";
import type { AdminRole } from "@/lib/admin/auth";

export type AdminNavGroup = "overview" | "operations" | "website" | "tools" | "team";

export type AdminNavItem = {
    href: string;
    label: string;
    description: string;
    icon: LucideIcon;
    roles: AdminRole[];
    group: AdminNavGroup;
    /** Match nested routes (e.g. /admin/bookings/new). */
    matchPrefix?: boolean;
};

export const ADMIN_NAV_GROUPS: Record<
    AdminNavGroup,
    { label: string; description: string }
> = {
    overview: {
        label: "Overview",
        description: "Dashboard and quick links",
    },
    operations: {
        label: "Operations",
        description: "Bookings, invoices, and guest records",
    },
    website: {
        label: "Website content",
        description: "Photos, video, and public page assets",
    },
    tools: {
        label: "Tools",
        description: "Utilities for media preparation",
    },
    team: {
        label: "Team",
        description: "Staff access and roles",
    },
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
    {
        href: "/admin",
        label: "Dashboard",
        description: "Overview and quick actions",
        icon: LayoutDashboard,
        roles: ["admin", "receptionist"],
        group: "overview",
    },
    {
        href: "/admin/bookings",
        label: "Bookings",
        description: "Search and review reservations",
        icon: CalendarDays,
        roles: ["admin", "receptionist"],
        group: "operations",
        matchPrefix: true,
    },
    {
        href: "/admin/bookings/new",
        label: "New booking",
        description: "Create a manual reservation",
        icon: CalendarDays,
        roles: ["admin", "receptionist"],
        group: "operations",
    },
    {
        href: "/admin/bookings/cancel",
        label: "Cancel booking",
        description: "Cancel by invoice reference",
        icon: XCircle,
        roles: ["admin"],
        group: "operations",
    },
    {
        href: "/admin/apartments",
        label: "Apartment photos",
        description: "Gallery images for each suite",
        icon: Building2,
        roles: ["admin"],
        group: "website",
        matchPrefix: true,
    },
    {
        href: "/admin/property-amenities",
        label: "Property amenities",
        description: "Pool, gym, bar, and shared spaces",
        icon: Palette,
        roles: ["admin"],
        group: "website",
        matchPrefix: true,
    },
    {
        href: "/admin/site-images",
        label: "Site images",
        description: "Fixed photos on About & Experience",
        icon: Images,
        roles: ["admin"],
        group: "website",
    },
    {
        href: "/admin/hero-video",
        label: "Hero video",
        description: "Homepage background loop",
        icon: Clapperboard,
        roles: ["admin"],
        group: "website",
    },
    {
        href: "/admin/compress-video",
        label: "Video compressor",
        description: "Prepare large files before upload",
        icon: Wrench,
        roles: ["admin"],
        group: "tools",
    },
    {
        href: "/admin/users",
        label: "Staff access",
        description: "Invite admins and receptionists",
        icon: Users,
        roles: ["admin"],
        group: "team",
    },
];

export function getAdminNavForRole(role: AdminRole) {
    return ADMIN_NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function isAdminNavActive(pathname: string, item: AdminNavItem) {
    if (item.href === "/admin") {
        return pathname === "/admin";
    }
    if (item.matchPrefix) {
        return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }
    return pathname === item.href;
}

export function getAdminPageTitle(pathname: string) {
    const exact = ADMIN_NAV_ITEMS.find((item) => item.href === pathname);
    if (exact) return exact.label;

    const prefixMatches = ADMIN_NAV_ITEMS.filter(
        (item) =>
            item.matchPrefix &&
            (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    ).sort((a, b) => b.href.length - a.href.length);

    return prefixMatches[0]?.label ?? "Admin";
}
