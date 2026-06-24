"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useAdminMe } from "@/hooks/useAdminMe";
import { getSupabaseClient } from "@/lib/supabase/client";
import { PropertyAmenityImageManager } from "@/components/admin/PropertyAmenityImageManager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminPropertyAmenityImagesPage() {
    const params = useParams<{ id: string }>();
    const amenityId = params.id;
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const { data: me, isLoading: isMeLoading } = useAdminMe(
        Boolean(user) && !isLoading,
        user?.id,
    );
    const [amenityName, setAmenityName] = useState<string | null>(null);

    const loadAmenity = useCallback(async () => {
        const supabase = getSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const res = await fetch(`/api/admin/property-amenities/${amenityId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json()) as {
            amenity?: { name: string };
            error?: string;
        };
        if (res.ok && data.amenity) {
            setAmenityName(data.amenity.name);
        }
    }, [amenityId]);

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push(`/login?redirect=/admin/property-amenities/${amenityId}/images`);
        }
    }, [isLoading, user, router, amenityId]);

    useEffect(() => {
        if (!user || !me?.ok || me.role !== "admin") return;
        void loadAmenity();
    }, [user, me, loadAmenity]);

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

    if (!amenityName) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-3xl mx-auto px-4 py-10">
                    <Card className="p-6">
                        <h1 className="text-xl font-bold text-gray-900">
                            Property amenity not found
                        </h1>
                        <Button className="mt-4" variant="outline" asChild>
                            <Link href="/admin/property-amenities">Back to amenities</Link>
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
                    <div>
                        <p className="text-sm text-gray-500">Property amenity photos</p>
                        <h1 className="text-2xl font-bold text-gray-900">{amenityName}</h1>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin/property-amenities">All amenities</Link>
                    </Button>
                </div>

                <PropertyAmenityImageManager
                    amenityId={amenityId}
                    amenityName={amenityName}
                />
            </div>
        </div>
    );
}
