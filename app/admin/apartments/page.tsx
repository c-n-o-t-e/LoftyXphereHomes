"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useAdminMe } from "@/hooks/useAdminMe";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AdminApartmentRow = {
    id: string;
    name: string;
    location: { city: string; area: string };
    imageCount: number;
};

export default function AdminApartmentsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const { data: me, isLoading: isMeLoading } = useAdminMe(
        Boolean(user) && !isLoading,
        user?.id,
    );
    const [apartments, setApartments] = useState<AdminApartmentRow[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push("/login?redirect=/admin/apartments");
        }
    }, [isLoading, user, router]);

    useEffect(() => {
        if (!user || !me?.ok || me.role !== "admin") return;

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
    }, [user, me]);

    if (isLoading || isMeLoading || me === undefined) return null;
    if (!user) return null;

    if (!me.ok || me.role !== "admin") {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-3xl mx-auto px-4 py-10">
                    <Card className="p-6">
                        <h1 className="text-xl font-bold text-gray-900">
                            Admin access required
                        </h1>
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
                            Apartment Images
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Upload, reorder, and manage production photos for each listing.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin">Back to admin</Link>
                    </Button>
                </div>

                {isFetching ? (
                    <div className="mt-8 flex items-center gap-2 text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading apartments...
                    </div>
                ) : (
                    <div className="mt-8 grid gap-4">
                        {apartments.map((apartment) => (
                            <Card key={apartment.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        {apartment.name}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {apartment.location.area}, {apartment.location.city}
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
            </div>
        </div>
    );
}
