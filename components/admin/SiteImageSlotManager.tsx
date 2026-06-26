"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type AdminSiteImageSlotRow = {
    key: string;
    label: string;
    pagePath: string;
    sectionLabel: string;
    amenitySlug: string;
    imageIndex: number;
    photoNumber: number;
    amenityId: string | null;
    amenityName: string | null;
    imageCount: number;
    previewMediumUrl: string | null;
    previewAltText: string | null;
    isValid: boolean;
    updatedAt: string;
};

type AdminPropertyAmenityOption = {
    id: string;
    slug: string;
    name: string;
    imageCount: number;
};

type SlotDraft = {
    amenitySlug: string;
    photoNumber: number;
};

export function SiteImageSlotManager() {
    const [slots, setSlots] = useState<AdminSiteImageSlotRow[]>([]);
    const [amenities, setAmenities] = useState<AdminPropertyAmenityOption[]>([]);
    const [drafts, setDrafts] = useState<Record<string, SlotDraft>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<string | null>(null);

    const authHeaders = useCallback(async () => {
        const supabase = getSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not signed in");
        return { Authorization: `Bearer ${token}` };
    }, []);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const headers = await authHeaders();
            const [slotsRes, amenitiesRes] = await Promise.all([
                fetch("/api/admin/site-image-slots", { headers }),
                fetch("/api/admin/property-amenities", { headers }),
            ]);

            const slotsData = (await slotsRes.json()) as {
                slots?: AdminSiteImageSlotRow[];
                error?: string;
            };
            const amenitiesData = (await amenitiesRes.json()) as {
                amenities?: AdminPropertyAmenityOption[];
                error?: string;
            };

            if (!slotsRes.ok) {
                throw new Error(slotsData.error ?? "Failed to load site image slots");
            }
            if (!amenitiesRes.ok) {
                throw new Error(amenitiesData.error ?? "Failed to load amenities");
            }

            const nextSlots = slotsData.slots ?? [];
            setSlots(nextSlots);
            setAmenities(amenitiesData.amenities ?? []);
            setDrafts(
                Object.fromEntries(
                    nextSlots.map((slot) => [
                        slot.key,
                        {
                            amenitySlug: slot.amenitySlug,
                            photoNumber: slot.photoNumber,
                        },
                    ]),
                ),
            );
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load site images");
        } finally {
            setIsLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const amenityBySlug = useMemo(
        () => new Map(amenities.map((amenity) => [amenity.slug, amenity])),
        [amenities],
    );

    const updateDraft = (key: string, patch: Partial<SlotDraft>) => {
        setDrafts((current) => ({
            ...current,
            [key]: {
                amenitySlug: patch.amenitySlug ?? current[key]?.amenitySlug ?? "",
                photoNumber: patch.photoNumber ?? current[key]?.photoNumber ?? 1,
            },
        }));
    };

    const saveSlot = async (slot: AdminSiteImageSlotRow) => {
        const draft = drafts[slot.key];
        if (!draft) return;

        const amenity = amenityBySlug.get(draft.amenitySlug);
        if (!amenity) {
            toast.error("Choose a valid amenity gallery");
            return;
        }

        if (draft.photoNumber < 1) {
            toast.error("Photo number must be at least 1");
            return;
        }

        if (amenity.imageCount > 0 && draft.photoNumber > amenity.imageCount) {
            toast.error(
                `${amenity.name} only has ${amenity.imageCount} photo${amenity.imageCount === 1 ? "" : "s"}`,
            );
            return;
        }

        setSavingKey(slot.key);
        try {
            const headers = await authHeaders();
            const res = await fetch(`/api/admin/site-image-slots/${slot.key}`, {
                method: "PATCH",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({
                    amenitySlug: draft.amenitySlug,
                    photoNumber: draft.photoNumber,
                }),
            });
            const data = (await res.json()) as {
                slot?: AdminSiteImageSlotRow;
                error?: string;
            };
            if (!res.ok) throw new Error(data.error ?? "Save failed");

            if (data.slot) {
                setSlots((current) =>
                    current.map((row) => (row.key === slot.key ? data.slot! : row)),
                );
                setDrafts((current) => ({
                    ...current,
                    [slot.key]: {
                        amenitySlug: data.slot!.amenitySlug,
                        photoNumber: data.slot!.photoNumber,
                    },
                }));
            }
            toast.success(`${slot.label} updated`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Save failed");
        } finally {
            setSavingKey(null);
        }
    };

    const isDirty = (slot: AdminSiteImageSlotRow) => {
        const draft = drafts[slot.key];
        if (!draft) return false;
        return (
            draft.amenitySlug !== slot.amenitySlug ||
            draft.photoNumber !== slot.photoNumber
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading site image slots...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="rounded-2xl border-slate-200/80 bg-slate-50 p-5 shadow-sm">
                <p className="text-sm leading-relaxed text-slate-700">
                    Pick which amenity gallery photo appears in fixed spots on the
                    Experience and About pages. Upload and reorder photos under{" "}
                    <Link
                        href="/admin/property-amenities"
                        className="font-medium underline underline-offset-2"
                    >
                        Property amenities
                    </Link>
                    . Photo numbers match the <strong>#</strong> labels in each gallery.
                </p>
            </Card>

            {slots.map((slot) => {
                const draft = drafts[slot.key] ?? {
                    amenitySlug: slot.amenitySlug,
                    photoNumber: slot.photoNumber,
                };
                const selectedAmenity = amenityBySlug.get(draft.amenitySlug);
                const dirty = isDirty(slot);

                return (
                    <Card key={slot.key} className="p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                                <h2 className="font-semibold text-gray-900">{slot.label}</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {slot.sectionLabel} on{" "}
                                    <Link
                                        href={slot.pagePath}
                                        target="_blank"
                                        className="inline-flex items-center gap-1 underline underline-offset-2"
                                    >
                                        {slot.pagePath}
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Link>
                                </p>
                            </div>
                            {!slot.isValid && !dirty ? (
                                <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                                    Selected photo missing
                                </span>
                            ) : null}
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor={`amenity-${slot.key}`}>
                                        Amenity gallery
                                    </Label>
                                    <select
                                        id={`amenity-${slot.key}`}
                                        value={draft.amenitySlug}
                                        onChange={(e) =>
                                            updateDraft(slot.key, {
                                                amenitySlug: e.target.value,
                                            })
                                        }
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        {amenities.map((amenity) => (
                                            <option key={amenity.id} value={amenity.slug}>
                                                {amenity.name} ({amenity.imageCount} photo
                                                {amenity.imageCount === 1 ? "" : "s"})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor={`photo-${slot.key}`}>
                                        Photo number
                                    </Label>
                                    <input
                                        id={`photo-${slot.key}`}
                                        type="number"
                                        min={1}
                                        value={draft.photoNumber}
                                        onChange={(e) => {
                                            const next = Number.parseInt(
                                                e.target.value,
                                                10,
                                            );
                                            updateDraft(slot.key, {
                                                photoNumber: Number.isFinite(next)
                                                    ? next
                                                    : 1,
                                            });
                                        }}
                                        className="flex h-9 w-full max-w-[160px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Matches the <strong>#{draft.photoNumber}</strong>{" "}
                                        label in the amenity gallery.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        onClick={() => void saveSlot(slot)}
                                        disabled={!dirty || savingKey === slot.key}
                                    >
                                        {savingKey === slot.key ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save slot"
                                        )}
                                    </Button>
                                    {selectedAmenity ? (
                                        <Button variant="outline" asChild>
                                            <Link
                                                href={`/admin/property-amenities/${selectedAmenity.id}/images`}
                                            >
                                                Manage gallery photos
                                            </Link>
                                        </Button>
                                    ) : null}
                                </div>
                            </div>

                            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 border">
                                {slot.previewMediumUrl && !dirty ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={slot.previewMediumUrl}
                                        alt={
                                            slot.previewAltText ??
                                            `${slot.label} preview`
                                        }
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 text-center px-3">
                                        {dirty
                                            ? "Save to refresh preview"
                                            : "No preview available"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
