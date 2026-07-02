"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Images, Loader2 } from "lucide-react";
import type { FlyerGalleryImage } from "@/lib/admin/flyerGallery";
import type { FlyerImageSlotKey } from "@/lib/flyers/types";
import { FLYER_IMAGE_SLOT_DEFINITIONS } from "@/lib/flyers/constants";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getSupabaseClient } from "@/lib/supabase/client";

type ApartmentOption = { id: string; name: string };

type CategoryFilter = "all" | "apartment" | "amenity";

type FlyerImageGalleryPickerProps = {
    open: boolean;
    slotKey: FlyerImageSlotKey | null;
    preferredApartmentId?: string | null;
    apartments: ApartmentOption[];
    onClose: () => void;
    onSelect: (image: { url: string; alt?: string }) => void;
};

function sourceBadge(source: FlyerGalleryImage["source"]) {
    return source === "apartment" ? "Apartment" : "Amenity";
}

export function FlyerImageGalleryPicker({
    open,
    slotKey,
    preferredApartmentId,
    apartments,
    onClose,
    onSelect,
}: FlyerImageGalleryPickerProps) {
    const [images, setImages] = useState<FlyerGalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
    const [itemFilter, setItemFilter] = useState<string>("all");

    const slotLabel =
        FLYER_IMAGE_SLOT_DEFINITIONS.find((slot) => slot.key === slotKey)?.label ??
        "Image slot";

    const loadGallery = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const supabase = getSupabaseClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Not signed in");

            const res = await fetch("/api/admin/flyers/gallery", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await res.json()) as {
                images?: FlyerGalleryImage[];
                error?: string;
            };
            if (!res.ok) throw new Error(data.error ?? "Failed to load gallery");
            setImages(data.images ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load gallery");
            setImages([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!open) return;
        setCategoryFilter("all");
        setItemFilter(preferredApartmentId ?? "all");
        void loadGallery();
    }, [open, preferredApartmentId, loadGallery]);

    useEffect(() => {
        setItemFilter("all");
    }, [categoryFilter]);

    const apartmentsWithPhotos = useMemo(() => {
        const ids = new Set(
            images.filter((image) => image.source === "apartment").map((image) => image.sourceId),
        );
        return apartments.filter((apt) => ids.has(apt.id));
    }, [apartments, images]);

    const amenitiesWithPhotos = useMemo(() => {
        const byId = new Map<string, string>();
        for (const image of images) {
            if (image.source === "amenity") {
                byId.set(image.sourceId, image.sourceName);
            }
        }
        return [...byId.entries()]
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [images]);

    const filteredImages = useMemo(() => {
        return images.filter((image) => {
            if (categoryFilter !== "all" && image.source !== categoryFilter) {
                return false;
            }
            if (itemFilter === "all") return true;
            if (categoryFilter === "all") {
                return image.sourceId === itemFilter;
            }
            return image.sourceId === itemFilter;
        });
    }, [categoryFilter, images, itemFilter]);

    const showItemFilter =
        categoryFilter === "all"
            ? apartmentsWithPhotos.length > 0 || amenitiesWithPhotos.length > 0
            : categoryFilter === "apartment"
              ? apartmentsWithPhotos.length > 0
              : amenitiesWithPhotos.length > 0;

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose();
            }}
        >
            <DialogContent className="flex max-h-[min(90vh,820px)] flex-col gap-4 sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Choose from gallery</DialogTitle>
                    <DialogDescription>
                        Pick an apartment or property amenity photo for{" "}
                        <strong>{slotLabel}</strong>. Upload is still available for custom images.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-wrap items-center gap-3">
                    <Select
                        value={categoryFilter}
                        onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}
                    >
                        <SelectTrigger className="w-full sm:w-52">
                            <SelectValue placeholder="Photo type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All photos</SelectItem>
                            <SelectItem value="apartment">Apartment photos</SelectItem>
                            <SelectItem value="amenity">Amenity photos</SelectItem>
                        </SelectContent>
                    </Select>

                    {showItemFilter ? (
                        <Select value={itemFilter} onValueChange={setItemFilter}>
                            <SelectTrigger className="w-full sm:w-56">
                                <SelectValue placeholder="Filter source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All sources</SelectItem>
                                {categoryFilter === "all" ? (
                                    <>
                                        {apartmentsWithPhotos.length > 0 ? (
                                            <SelectGroup>
                                                <SelectLabel>Apartments</SelectLabel>
                                                {apartmentsWithPhotos.map((apt) => (
                                                    <SelectItem key={apt.id} value={apt.id}>
                                                        {apt.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        ) : null}
                                        {amenitiesWithPhotos.length > 0 ? (
                                            <SelectGroup>
                                                <SelectLabel>Amenities</SelectLabel>
                                                {amenitiesWithPhotos.map((amenity) => (
                                                    <SelectItem key={amenity.id} value={amenity.id}>
                                                        {amenity.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        ) : null}
                                    </>
                                ) : categoryFilter === "apartment" ? (
                                    apartmentsWithPhotos.map((apt) => (
                                        <SelectItem key={apt.id} value={apt.id}>
                                            {apt.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    amenitiesWithPhotos.map((amenity) => (
                                        <SelectItem key={amenity.id} value={amenity.id}>
                                            {amenity.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    ) : null}

                    <p className="text-sm text-slate-500">
                        {filteredImages.length} photo{filteredImages.length === 1 ? "" : "s"}
                    </p>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    {isLoading ? (
                        <div className="flex h-40 items-center justify-center text-slate-500">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Loading gallery…
                        </div>
                    ) : error ? (
                        <div className="flex h-40 flex-col items-center justify-center gap-3 text-center">
                            <p className="text-sm text-red-600">{error}</p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void loadGallery()}
                            >
                                Try again
                            </Button>
                        </div>
                    ) : filteredImages.length === 0 ? (
                        <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-slate-500">
                            <Images className="h-8 w-8 opacity-40" />
                            <p className="text-sm">No gallery photos found for this filter.</p>
                            <p className="text-xs text-slate-400">
                                Add photos under Admin → Apartments or Admin → Property amenities.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {filteredImages.map((image) => (
                                <button
                                    key={`${image.source}-${image.id}`}
                                    type="button"
                                    className="group overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:border-[#FA5C5C] hover:ring-2 hover:ring-[#FA5C5C]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FA5C5C]"
                                    onClick={() => {
                                        onSelect({
                                            url: image.largeUrl,
                                            alt: image.altText ?? undefined,
                                        });
                                        onClose();
                                    }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={image.thumbnailUrl}
                                        alt={image.altText ?? `${image.sourceName} photo`}
                                        className="aspect-4/3 w-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="space-y-0.5 px-2 py-2">
                                        <p className="truncate text-xs font-medium text-slate-800">
                                            {image.sourceName}
                                        </p>
                                        <p className="truncate text-[11px] text-slate-500">
                                            {sourceBadge(image.source)} · Photo #
                                            {image.displayOrder + 1}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
