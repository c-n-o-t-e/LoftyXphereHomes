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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type AdminPropertyAmenityRow = {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    description: string | null;
    isPublished: boolean;
    imageCount: number;
};

export default function AdminPropertyAmenitiesPage() {
    const { role } = useAdminContext();
    const [amenities, setAmenities] = useState<AdminPropertyAmenityRow[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    const authHeaders = useCallback(async () => {
        const supabase = getSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not signed in");
        return { Authorization: `Bearer ${token}` };
    }, []);

    const loadAmenities = useCallback(async () => {
        setIsFetching(true);
        try {
            const headers = await authHeaders();
            const res = await fetch("/api/admin/property-amenities", { headers });
            const data = (await res.json()) as {
                amenities?: AdminPropertyAmenityRow[];
                error?: string;
            };
            if (!res.ok) throw new Error(data.error ?? "Failed to load amenities");
            setAmenities(data.amenities ?? []);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load amenities");
        } finally {
            setIsFetching(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        if (role !== "admin") return;
        void loadAmenities();
    }, [role, loadAmenities]);

    const saveAmenity = async (
        amenity: AdminPropertyAmenityRow,
        patch: Partial<Pick<AdminPropertyAmenityRow, "name" | "shortDescription" | "description" | "isPublished">>,
    ) => {
        setSavingId(amenity.id);
        try {
            const headers = await authHeaders();
            const res = await fetch(`/api/admin/property-amenities/${amenity.id}`, {
                method: "PATCH",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });
            const data = (await res.json()) as {
                amenity?: AdminPropertyAmenityRow;
                error?: string;
            };
            if (!res.ok) throw new Error(data.error ?? "Save failed");
            if (data.amenity) {
                setAmenities((current) =>
                    current.map((row) =>
                        row.id === amenity.id
                            ? { ...row, ...data.amenity, imageCount: row.imageCount }
                            : row,
                    ),
                );
            }
            toast.success("Saved");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Save failed");
        } finally {
            setSavingId(null);
        }
    };

    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="5xl">
                <AdminPageHeader
                    title="Property amenities"
                    description="Manage shared facilities — pool, gym, bar, and outdoor spaces."
                />

                {isFetching ? (
                    <div className="flex items-center gap-2 text-slate-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading amenities...
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {amenities.map((amenity) => (
                            <Card
                                key={amenity.id}
                                className="space-y-4 border-slate-200/80 p-5 shadow-sm"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="space-y-3 flex-1">
                                        <div className="space-y-1">
                                            <Label htmlFor={`name-${amenity.id}`}>Name</Label>
                                            <Input
                                                id={`name-${amenity.id}`}
                                                defaultValue={amenity.name}
                                                onBlur={(e) => {
                                                    if (e.target.value.trim() !== amenity.name) {
                                                        void saveAmenity(amenity, {
                                                            name: e.target.value.trim(),
                                                        });
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor={`short-${amenity.id}`}>
                                                Short description
                                            </Label>
                                            <Input
                                                id={`short-${amenity.id}`}
                                                defaultValue={amenity.shortDescription}
                                                onBlur={(e) => {
                                                    if (
                                                        e.target.value.trim() !==
                                                        amenity.shortDescription
                                                    ) {
                                                        void saveAmenity(amenity, {
                                                            shortDescription:
                                                                e.target.value.trim(),
                                                        });
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor={`desc-${amenity.id}`}>
                                                Full description
                                            </Label>
                                            <textarea
                                                id={`desc-${amenity.id}`}
                                                defaultValue={amenity.description ?? ""}
                                                rows={3}
                                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                onBlur={(e) => {
                                                    const next = e.target.value.trim() || null;
                                                    if (next !== amenity.description) {
                                                        void saveAmenity(amenity, {
                                                            description: next,
                                                        });
                                                    }
                                                }}
                                            />
                                        </div>
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                defaultChecked={amenity.isPublished}
                                                onChange={(e) => {
                                                    void saveAmenity(amenity, {
                                                        isPublished: e.target.checked,
                                                    });
                                                }}
                                            />
                                            Published on website
                                        </label>
                                        <p className="text-sm text-gray-500">
                                            {amenity.imageCount} uploaded image
                                            {amenity.imageCount === 1 ? "" : "s"}
                                        </p>
                                    </div>
                                    <Button asChild disabled={savingId === amenity.id}>
                                        <Link
                                            href={`/admin/property-amenities/${amenity.id}/images`}
                                        >
                                            <ImageIcon className="h-4 w-4 mr-2" />
                                            Manage photos
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
