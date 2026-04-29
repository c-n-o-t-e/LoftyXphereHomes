"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AdminMe = { ok: boolean; role?: string; email?: string; error?: string };

export default function AdminHomePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [me, setMe] = useState<AdminMe | null>(null);

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push("/login?redirect=/admin");
            return;
        }
        const load = async () => {
            const supabase = getSupabaseClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) {
                router.push("/login?redirect=/admin");
                return;
            }
            const res = await fetch("/api/admin/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const payload = (await res.json()) as AdminMe;
            if (!res.ok) {
                setMe(payload);
                return;
            }
            setMe(payload);
        };
        void load();
    }, [isLoading, user, router]);

    if (isLoading) return null;

    if (me && me.ok === false) {
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

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-5xl mx-auto px-4 py-10">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Create manual bookings, generate invoices, and sync to Google
                            Sheets.
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button asChild>
                            <Link href="/admin/bookings/new">New manual booking</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/admin/bookings/cancel">Cancel booking</Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <Card className="p-6">
                        <h2 className="font-semibold text-gray-900">Manual bookings</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Create a paid booking for walk-ins / WhatsApp / Instagram.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/admin/bookings/new">Create booking</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/admin/bookings/cancel">Cancel by invoice</Link>
                            </Button>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <h2 className="font-semibold text-gray-900">Access</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Signed in as <span className="font-medium">{user?.email}</span>
                            {me?.role ? ` (${me.role})` : ""}.
                        </p>
                        <Button
                            className="mt-4"
                            variant="outline"
                            onClick={() => router.push("/")}
                        >
                            Back to website
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}

