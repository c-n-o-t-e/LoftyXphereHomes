"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useAdminMe } from "@/hooks/useAdminMe";
import { getSupabaseClient } from "@/lib/supabase/client";
import { apartments } from "@/lib/data/apartments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminBookingsView = "current" | "upcoming" | "past" | "cancelled" | "all";

type BookingRow = {
    id: string;
    reference: string;
    apartmentId: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    amountPaid?: number;
    currency?: string;
    status: "PENDING" | "PAID" | "CANCELLED";
    source: "WEBSITE" | "MANUAL";
    bookerEmail?: string | null;
    bookerName: string | null;
    bookerPhone?: string | null;
    bookerEmailMasked?: string | null;
    bookerPhoneMasked?: string | null;
    createdAt: string;
    invoiceId: string | null;
    invoiceReady?: boolean;
};

type AdminBookingsResponse =
    | {
          ok: true;
          bookings: BookingRow[];
          nextCursor: string | null;
          resolvedInvoiceId?: string;
      }
    | { error: string };

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-NG", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatMoney(amount: number, currency: string) {
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency} ${amount}`;
    }
}

function useDebouncedValue<T>(value: T, delayMs: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = window.setTimeout(() => setDebounced(value), delayMs);
        return () => window.clearTimeout(id);
    }, [value, delayMs]);
    return debounced;
}

function getApartmentName(apartmentId: string) {
    return apartments.find((a) => a.id === apartmentId)?.name ?? apartmentId;
}

const VIEW_LABELS: Record<AdminBookingsView, string> = {
    current: "Current",
    upcoming: "Upcoming",
    past: "Past",
    cancelled: "Cancelled",
    all: "All",
};

export default function AdminBookingsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const params = useSearchParams();
    const { data: me } = useAdminMe(Boolean(user) && !isLoading);

    const initialView = (params.get("view") as AdminBookingsView | null) ?? "current";
    const [view, setView] = useState<AdminBookingsView>(initialView);
    const [q, setQ] = useState(params.get("q") ?? "");
    const debouncedQ = useDebouncedValue(q, 300);

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push("/login?redirect=/admin/bookings");
            return;
        }
    }, [isLoading, user, router]);

    const canSeeBookings = me?.ok === true;
    const canCancelBookings = me?.ok === true && me.role === "admin";
    const canSeeFinancials = me?.ok === true && me.role === "admin";
    const canSeeContact = me?.ok === true && me.role === "admin";

    const query = useInfiniteQuery({
        queryKey: ["admin", "bookings", { view, q: debouncedQ }],
        enabled: Boolean(user) && !isLoading && canSeeBookings,
        initialPageParam: undefined as string | undefined,
        staleTime: 15_000,
        queryFn: async ({ pageParam }) => {
            const supabase = getSupabaseClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session?.access_token) throw new Error("Not authenticated");

            const qs = new URLSearchParams();
            if (debouncedQ.trim()) qs.set("q", debouncedQ.trim());
            qs.set("view", view);
            if (pageParam) qs.set("cursor", pageParam);

            const res = await fetch(`/api/admin/bookings?${qs.toString()}`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });

            const payload = (await res.json()) as AdminBookingsResponse;
            if (!res.ok) {
                const msg = "error" in payload ? payload.error : "Request failed";
                throw new Error(msg);
            }
            if (!("ok" in payload) || payload.ok !== true) {
                throw new Error("Unexpected server response.");
            }
            return {
                bookings: payload.bookings,
                nextCursor: payload.nextCursor ?? null,
                resolvedInvoiceId: payload.resolvedInvoiceId,
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

    const bookings = useMemo(
        () => query.data?.pages.flatMap((p) => p.bookings) ?? [],
        [query.data],
    );

    const resolvedInvoiceId = query.data?.pages?.[0]?.resolvedInvoiceId;

    useEffect(() => {
        const next = new URLSearchParams();
        if (view !== "current") next.set("view", view);
        if (q.trim()) next.set("q", q.trim());
        const s = next.toString();
        router.replace(`/admin/bookings${s ? `?${s}` : ""}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, q]);

    if (isLoading) return null;

    if (me && !me.ok) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-4xl mx-auto px-4 py-10">
                    <Card className="p-6">
                        <h1 className="text-xl font-bold text-gray-900">
                            Admin access required
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Your account doesn’t have access to staff bookings.
                        </p>
                        <div className="mt-4">
                            <Button variant="outline" asChild>
                                <Link href="/">Back to website</Link>
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Search by guest name, invoice ID, email, phone, reference, or
                            apartment id.
                            {resolvedInvoiceId ? (
                                <>
                                    {" "}
                                    Interpreted invoice ID:{" "}
                                    <span className="font-medium">{resolvedInvoiceId}</span>.
                                </>
                            ) : null}
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button asChild>
                            <Link href="/admin/bookings/new">New manual booking</Link>
                        </Button>
                        {canCancelBookings && (
                            <Button variant="outline" asChild>
                                <Link href="/admin/bookings/cancel">Cancel by invoice</Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href="/admin">Back</Link>
                        </Button>
                    </div>
                </div>

                <Card className="p-6 mt-6">
                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="booking-search">Search</Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="booking-search"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="e.g. Jane Doe, LXH-250101-ABC123, +234…, lxh_lofty…"
                                    className="pl-9 pr-9"
                                    autoComplete="off"
                                />
                                {q.trim() ? (
                                    <button
                                        type="button"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                        aria-label="Clear search"
                                        onClick={() => setQ("")}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(Object.keys(VIEW_LABELS) as AdminBookingsView[]).map((v) => (
                                <Button
                                    key={v}
                                    type="button"
                                    variant={view === v ? "default" : "outline"}
                                    onClick={() => setView(v)}
                                >
                                    {VIEW_LABELS[v]}
                                </Button>
                            ))}
                        </div>
                    </div>
                </Card>

                <div className="mt-6">
                    {query.isPending ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                            <span className="ml-3 text-gray-600">Loading bookings…</span>
                        </div>
                    ) : query.isError ? (
                        <Card className="p-6">
                            <h2 className="font-semibold text-gray-900">
                                Couldn’t load bookings
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                {query.error instanceof Error
                                    ? query.error.message
                                    : "Request failed."}
                            </p>
                            <div className="mt-4">
                                <Button variant="outline" onClick={() => void query.refetch()}>
                                    Try again
                                </Button>
                            </div>
                        </Card>
                    ) : bookings.length === 0 ? (
                        <Card className="p-6">
                            <h2 className="font-semibold text-gray-900">No results</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Try a different search term or switch views.
                            </p>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {bookings.map((b) => {
                                const statusBadge =
                                    b.status === "CANCELLED"
                                        ? "bg-red-100 text-red-800"
                                        : b.status === "PAID"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-900";
                                const displayName = b.bookerName?.trim() || "Guest";

                                return (
                                    <Card key={b.id} className="p-6">
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {displayName}
                                                    </h3>
                                                    <span
                                                        className={`text-xs font-medium px-2 py-1 rounded ${statusBadge}`}
                                                    >
                                                        {b.status}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        {b.source}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 mt-1">
                                                    {getApartmentName(b.apartmentId)}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {formatDate(b.checkIn)} →{" "}
                                                    {formatDate(b.checkOut)} · {b.nights} night
                                                    {b.nights === 1 ? "" : "s"}
                                                    {canSeeFinancials &&
                                                    typeof b.amountPaid === "number" &&
                                                    typeof b.currency === "string"
                                                        ? ` · ${formatMoney(b.amountPaid, b.currency)}`
                                                        : ""}
                                                </p>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium text-gray-900">
                                                        Invoice:
                                                    </span>{" "}
                                                    {b.invoiceId ? b.invoiceId : "—"}{" "}
                                                    {b.invoiceId ? (
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            {b.invoiceReady ? "PDF ready" : "PDF pending"}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <div className="mt-1">
                                                    <span className="font-medium text-gray-900">
                                                        Ref:
                                                    </span>{" "}
                                                    <span className="break-all">{b.reference}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-2 text-sm text-gray-700 sm:grid-cols-3">
                                            <div>
                                                <span className="text-gray-500">Email:</span>{" "}
                                                {canSeeContact
                                                    ? b.bookerEmail || "—"
                                                    : b.bookerEmailMasked || "Hidden"}
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Phone:</span>{" "}
                                                {canSeeContact
                                                    ? b.bookerPhone || "—"
                                                    : b.bookerPhoneMasked || "Hidden"}
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Created:</span>{" "}
                                                {new Date(b.createdAt).toLocaleString("en-NG")}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}

                            <div className="flex justify-center pt-2">
                                {query.hasNextPage ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => void query.fetchNextPage()}
                                        disabled={query.isFetchingNextPage}
                                    >
                                        {query.isFetchingNextPage ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Loading…
                                            </>
                                        ) : (
                                            "Load more"
                                        )}
                                    </Button>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        End of results.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {query.isFetching && !query.isFetchingNextPage ? (
                        <p className="mt-3 text-xs text-gray-500">
                            Updating…
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

