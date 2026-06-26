"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAdminContext } from "@/components/admin/AdminContext";
import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getSupabaseClient } from "@/lib/supabase/client";
import { PropertyAmenityImageManager } from "@/components/admin/PropertyAmenityImageManager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminPropertyAmenityImagesPage() {
    const params = useParams<{ id: string }>();
    const amenityId = params.id;
    const { role } = useAdminContext();
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
        if (role !== "admin") return;
        void loadAmenity();
    }, [role, loadAmenity]);

    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="6xl">
                {isAmenityLoading ? (
                    <div className="flex items-center gap-2 text-slate-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading amenity...
                    </div>
                ) : amenityNotFound || !amenityName ? (
                    <Card className="border-slate-200/80 p-6 shadow-sm">
                        <h1 className="text-xl font-semibold text-slate-900">
                            Property amenity not found
                        </h1>
                        <Button className="mt-4" variant="outline" asChild>
                            <Link href="/admin/property-amenities">Back to amenities</Link>
                        </Button>
                    </Card>
                ) : (
                    <>
                        <AdminPageHeader
                            title={amenityName}
                            description="Upload, reorder, and manage photos for this shared facility."
                            actions={
                                <Button variant="outline" asChild>
                                    <Link href="/admin/property-amenities">
                                        All amenities
                                    </Link>
                                </Button>
                            }
                        />
                        <PropertyAmenityImageManager
                            amenityId={amenityId}
                            amenityName={amenityName}
                        />
                    </>
                )}
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
