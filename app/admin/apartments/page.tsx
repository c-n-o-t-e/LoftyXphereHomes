"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { useAdminContext } from "@/components/admin/AdminContext";
import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AdminApartmentRow = {
    id: string;
    name: string;
    location: { city: string; area: string };
    status: "active" | "coming_soon";
    beds: number;
    imageCount: number;
};

export default function AdminApartmentsPage() {
    const { role } = useAdminContext();
    const [apartments, setApartments] = useState<AdminApartmentRow[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (role !== "admin") return;

        async function loadApartments() {
            setIsFetching(true);
            try {
                const supabase = getSupabaseClient();
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) return;

                const res = await fetch("/api/admin/apartments", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = (await res.json()) as {
                    apartments?: AdminApartmentRow[];
                    error?: string;
                };
                if (!res.ok) throw new Error(data.error ?? "Failed to load apartments");
                setApartments(data.apartments ?? []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsFetching(false);
            }
        }

        void loadApartments();
    }, [role]);

    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="5xl">
                <AdminPageHeader
                    title="Apartment photos"
                    description="All nine suites — manage photos for bookable and upcoming units."
                />

                {isFetching ? (
                    <div className="flex items-center gap-2 text-slate-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading apartments...
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {apartments.map((apartment) => (
                            <Card
                                key={apartment.id}
                                className="flex flex-col justify-between gap-4 border-slate-200/80 p-5 shadow-sm sm:flex-row sm:items-center"
                            >
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="font-semibold text-gray-900">
                                            {apartment.name}
                                        </h2>
                                        <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                apartment.status === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-200 text-gray-700"
                                            }`}
                                        >
                                            {apartment.status === "active"
                                                ? "Live on site"
                                                : "Admin only"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {apartment.location.area}, {apartment.location.city}
                                        {" · "}
                                        {apartment.beds} bed{apartment.beds === 1 ? "" : "s"}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {apartment.imageCount} uploaded image
                                        {apartment.imageCount === 1 ? "" : "s"}
                                    </p>
                                </div>
                                <Button asChild>
                                    <Link href={`/admin/apartments/${apartment.id}/images`}>
                                        <ImageIcon className="h-4 w-4 mr-2" />
                                        Manage images
                                    </Link>
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
