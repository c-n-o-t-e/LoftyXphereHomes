"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
    const [isAmenityLoading, setIsAmenityLoading] = useState(true);
    const [amenityNotFound, setAmenityNotFound] = useState(false);

    const loadAmenity = useCallback(async () => {
        setIsAmenityLoading(true);
        setAmenityNotFound(false);

        const supabase = getSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
            setIsAmenityLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/admin/property-amenities/${amenityId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await res.json()) as {
                amenity?: { name: string };
                error?: string;
            };
            if (res.ok && data.amenity) {
                setAmenityName(data.amenity.name);
            } else {
                setAmenityNotFound(true);
            }
        } catch {
            setAmenityNotFound(true);
        } finally {
            setIsAmenityLoading(false);
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
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch when admin session is verified
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

    if (isAmenityLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-6xl mx-auto px-4 py-10">
                    <div className="flex items-center gap-2 text-gray-600 mb-8">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading amenity...
                    </div>
                    <PropertyAmenityImageManager
                        amenityId={amenityId}
                        amenityName="Property amenity"
                    />
                </div>
            </div>
        );
    }

    if (amenityNotFound || !amenityName) {
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
