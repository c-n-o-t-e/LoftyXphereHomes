"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    Download,
    GripVertical,
    Images,
    Loader2,
    Save,
    Upload,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
    FLYER_AMENITY_OPTIONS,
    FLYER_IMAGE_SLOT_DEFINITIONS,
    FLYER_PAGE_SIZE_OPTIONS,
    FLYER_PERFECT_FOR_OPTIONS,
    FLYER_TEMPLATE_OPTIONS,
} from "@/lib/flyers/constants";
import { FLYER_DESIGNER_NOTES } from "@/lib/flyers/designerNotes";
import { parseFlyerPayload } from "@/lib/flyers/validation";
import { uploadFlyerImageDirect } from "@/lib/flyers/directUploadClient";
import { exportFlyerPages } from "@/lib/flyers/exportClient";
import type {
    FlyerImageSlotKey,
    FlyerPageSize,
    FlyerPayload,
    FlyerRecord,
    FlyerTemplateKey,
} from "@/lib/flyers/types";
import { FlyerExportOverlay } from "@/components/admin/flyers/FlyerExportOverlay";
import { FlyerAmenityIcon } from "@/components/admin/flyers/FlyerAmenityIcon";
import { FlyerPreview } from "@/components/admin/flyers/FlyerPreview";
import { FlyerImageGalleryPicker } from "@/components/admin/flyers/FlyerImageGalleryPicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type ApartmentOption = { id: string; name: string; status: string };

type FlyerBuilderProps = {
    flyerId: string;
};

export function FlyerBuilder({ flyerId }: FlyerBuilderProps) {
    const [flyer, setFlyer] = useState<FlyerRecord | null>(null);
    const [payload, setPayload] = useState<FlyerPayload | null>(null);
    const [title, setTitle] = useState("");
    const [templateKey, setTemplateKey] = useState<FlyerTemplateKey>("luxury-minimal");
    const [pageSize, setPageSize] = useState<FlyerPageSize>("a5-portrait");
    const [apartments, setApartments] = useState<ApartmentOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportOverlayOpen, setExportOverlayOpen] = useState(false);
    const [uploadingSlot, setUploadingSlot] = useState<FlyerImageSlotKey | null>(null);
    const [gallerySlot, setGallerySlot] = useState<FlyerImageSlotKey | null>(null);
    const exportRef = useRef<HTMLDivElement>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const authHeaders = useCallback(async () => {
        const supabase = getSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not signed in");
        return { Authorization: `Bearer ${token}` };
    }, []);

    const loadFlyer = useCallback(async () => {
        setIsLoading(true);
        try {
            const headers = await authHeaders();
            const [flyerRes, aptRes] = await Promise.all([
                fetch(`/api/admin/flyers/${flyerId}`, { headers }),
                fetch("/api/admin/apartments", { headers }),
            ]);
            const flyerData = (await flyerRes.json()) as { flyer?: FlyerRecord; error?: string };
            const aptData = (await aptRes.json()) as {
                apartments?: ApartmentOption[];
                error?: string;
            };
            if (!flyerRes.ok) throw new Error(flyerData.error ?? "Failed to load flyer");
            if (!aptRes.ok) throw new Error(aptData.error ?? "Failed to load apartments");

            const record = flyerData.flyer!;
            setFlyer(record);
            setPayload(parseFlyerPayload(record.payload));
            setTitle(record.title);
            setTemplateKey(record.templateKey);
            setPageSize(record.pageSize);
            setApartments(aptData.apartments ?? []);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load flyer");
        } finally {
            setIsLoading(false);
        }
    }, [authHeaders, flyerId]);

    useEffect(() => {
        void loadFlyer();
    }, [loadFlyer]);

    const saveFlyer = useCallback(
        async (silent = false) => {
            if (!payload) return;
            setIsSaving(true);
            try {
                const headers = await authHeaders();
                const res = await fetch(`/api/admin/flyers/${flyerId}`, {
                    method: "PATCH",
                    headers: { ...headers, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title,
                        templateKey,
                        pageSize,
                        payload,
                    }),
                });
                const data = (await res.json()) as { flyer?: FlyerRecord; error?: string };
                if (!res.ok) throw new Error(data.error ?? "Failed to save");
                setFlyer(data.flyer ?? null);
                if (!silent) toast.success("Flyer saved");
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to save");
            } finally {
                setIsSaving(false);
            }
        },
        [authHeaders, flyerId, pageSize, payload, templateKey, title],
    );

    const scheduleSave = useCallback(() => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            void saveFlyer(true);
        }, 1200);
    }, [saveFlyer]);

    const updatePayload = (patch: Partial<FlyerPayload>) => {
        setPayload((current) => (current ? { ...current, ...patch } : current));
        scheduleSave();
    };

    const applyApartment = async (apartmentId: string) => {
        try {
            const headers = await authHeaders();
            const res = await fetch(`/api/admin/flyers/${flyerId}/apartment-preset`, {
                method: "POST",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({ apartmentId }),
            });
            const data = (await res.json()) as { flyer?: FlyerRecord; error?: string };
            if (!res.ok) throw new Error(data.error ?? "Failed to apply apartment");
            setFlyer(data.flyer ?? null);
            setPayload(data.flyer!.payload);
            toast.success("Apartment details applied");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to apply apartment");
        }
    };

    const uploadImage = async (slotKey: FlyerImageSlotKey, file: File) => {
        setUploadingSlot(slotKey);
        try {
            const headers = await authHeaders();
            const result = await uploadFlyerImageDirect({ flyerId, file, authHeaders: headers });
            setPayload((current) => {
                if (!current) return current;
                return {
                    ...current,
                    images: {
                        ...current.images,
                        [slotKey]: {
                            ...current.images[slotKey],
                            url: result.image.largeUrl,
                        },
                    },
                };
            });
            scheduleSave();
            toast.success("Image uploaded");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploadingSlot(null);
        }
    };

    const applyGalleryImage = (
        slotKey: FlyerImageSlotKey,
        image: { url: string; alt?: string },
    ) => {
        setPayload((current) => {
            if (!current) return current;
            return {
                ...current,
                images: {
                    ...current.images,
                    [slotKey]: {
                        ...current.images[slotKey],
                        url: image.url,
                        alt: image.alt,
                    },
                },
            };
        });
        scheduleSave();
        toast.success("Gallery photo applied");
    };

    const togglePerfectFor = (item: string) => {
        if (!payload) return;
        const perfectFor = payload.perfectFor.includes(item)
            ? payload.perfectFor.filter((value) => value !== item)
            : [...payload.perfectFor, item];
        updatePayload({ perfectFor });
    };

    const handleExport = async (format: "pdf" | "png" | "jpeg") => {
        if (!flyer) return;
        setIsExporting(true);
        setExportOverlayOpen(true);

        try {
            await saveFlyer(true);
            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => resolve());
                    });
                }, 400);
            });

            if (!exportRef.current) {
                throw new Error("Export preview failed to mount. Please try again.");
            }

            await exportFlyerPages({
                container: exportRef.current,
                pageSize,
                format,
                side: "both",
                fileName: flyer.title.replace(/[^\w\-]+/g, "-").toLowerCase(),
                authHeaders: await authHeaders(),
            });
            toast.success(`Exported as ${format.toUpperCase()}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Export failed");
        } finally {
            setExportOverlayOpen(false);
            setIsExporting(false);
        }
    };

    if (isLoading || !payload) {
        return (
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading flyer builder…
            </div>
        );
    }

    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
            <div className="space-y-5">
                <Card className="rounded-2xl border-slate-200/80 p-5 shadow-sm">
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => void saveFlyer()} disabled={isSaving}>
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Save draft
                        </Button>
                        <Button
                            variant="outline"
                            disabled={isExporting}
                            onClick={() => void handleExport("pdf")}
                        >
                            <Download className="h-4 w-4" />
                            PDF
                        </Button>
                        <Button
                            variant="outline"
                            disabled={isExporting}
                            onClick={() => void handleExport("png")}
                        >
                            PNG
                        </Button>
                        <Button
                            variant="outline"
                            disabled={isExporting}
                            onClick={() => void handleExport("jpeg")}
                        >
                            JPEG
                        </Button>
                    </div>
                </Card>

                <Card className="rounded-2xl border-slate-200/80 p-5 shadow-sm space-y-4">
                    <h3 className="font-semibold text-slate-900">Flyer settings</h3>
                    <div>
                        <Label htmlFor="flyer-title">Title</Label>
                        <Input
                            id="flyer-title"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                scheduleSave();
                            }}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label>Template</Label>
                        <Select
                            value={templateKey}
                            onValueChange={(value) => {
                                setTemplateKey(value as FlyerTemplateKey);
                                scheduleSave();
                            }}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FLYER_TEMPLATE_OPTIONS.map((template) => (
                                    <SelectItem key={template.key} value={template.key}>
                                        {template.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Page size</Label>
                        <Select
                            value={pageSize}
                            onValueChange={(value) => {
                                setPageSize(value as FlyerPageSize);
                                scheduleSave();
                            }}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FLYER_PAGE_SIZE_OPTIONS.map((size) => (
                                    <SelectItem key={size.key} value={size.key}>
                                        {size.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Apartment preset</Label>
                        <Select onValueChange={(value) => void applyApartment(value)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select apartment to auto-fill" />
                            </SelectTrigger>
                            <SelectContent>
                                {apartments.map((apt) => (
                                    <SelectItem key={apt.id} value={apt.id}>
                                        {apt.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </Card>

                <Card className="rounded-2xl border-slate-200/80 p-5 shadow-sm space-y-4">
                    <h3 className="font-semibold text-slate-900">Content</h3>
                    <div>
                        <Label>Headline</Label>
                        <Input
                            value={payload.headline}
                            onChange={(e) => updatePayload({ headline: e.target.value })}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label>Subheadline</Label>
                        <Textarea
                            value={payload.subheadline}
                            onChange={(e) => updatePayload({ subheadline: e.target.value })}
                            rows={3}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label>Call to action</Label>
                        <Input
                            value={payload.ctaText}
                            onChange={(e) => updatePayload({ ctaText: e.target.value })}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label>Back-page discovery line</Label>
                        <Input
                            value={payload.discoveryLine}
                            onChange={(e) =>
                                updatePayload({ discoveryLine: e.target.value })
                            }
                            placeholder="Leave empty to hide on the back page"
                            className="mt-1"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Shown above the back-page footer with your website. Encourages
                            visitors to explore other apartments.
                        </p>
                    </div>
                    <div>
                        <Label>Location</Label>
                        <Input
                            value={payload.location}
                            onChange={(e) => updatePayload({ location: e.target.value })}
                            className="mt-1"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Website</Label>
                            <Input
                                value={payload.contact.website}
                                onChange={(e) =>
                                    updatePayload({
                                        contact: { ...payload.contact, website: e.target.value },
                                    })
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <Input
                                value={payload.contact.phone}
                                onChange={(e) =>
                                    updatePayload({
                                        contact: { ...payload.contact, phone: e.target.value },
                                    })
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>WhatsApp</Label>
                            <Input
                                value={payload.contact.whatsapp}
                                onChange={(e) =>
                                    updatePayload({
                                        contact: { ...payload.contact, whatsapp: e.target.value },
                                    })
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Instagram</Label>
                            <Input
                                value={payload.contact.instagram}
                                onChange={(e) =>
                                    updatePayload({
                                        contact: {
                                            ...payload.contact,
                                            instagram: e.target.value,
                                        },
                                    })
                                }
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>QR code destination</Label>
                        <Select
                            value={payload.qr.destinationType}
                            onValueChange={(value) =>
                                updatePayload({
                                    qr: {
                                        ...payload.qr,
                                        destinationType: value as FlyerPayload["qr"]["destinationType"],
                                    },
                                })
                            }
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="booking">Booking page</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="apartment">Selected apartment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </Card>

                <Card className="rounded-2xl border-slate-200/80 p-5 shadow-sm space-y-4">
                    <h3 className="font-semibold text-slate-900">Theme</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {(
                            [
                                ["accentColor", "Accent (gold)"],
                                ["backgroundColor", "Background"],
                                ["textColor", "Text"],
                            ] as const
                        ).map(([key, label]) => (
                            <div key={key}>
                                <Label>{label}</Label>
                                <div className="mt-1 flex gap-2">
                                    <Input
                                        type="color"
                                        value={payload.theme[key]}
                                        onChange={(e) =>
                                            updatePayload({
                                                theme: { ...payload.theme, [key]: e.target.value },
                                            })
                                        }
                                        className="h-10 w-14 p-1"
                                    />
                                    <Input
                                        value={payload.theme[key]}
                                        onChange={(e) =>
                                            updatePayload({
                                                theme: { ...payload.theme, [key]: e.target.value },
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <Label>Logo URL</Label>
                        <Input
                            value={payload.logo.url ?? ""}
                            onChange={(e) =>
                                updatePayload({
                                    logo: { ...payload.logo, url: e.target.value || null },
                                })
                            }
                            className="mt-1"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Logo position</Label>
                            <Select
                                value={payload.logo.position}
                                onValueChange={(value) =>
                                    updatePayload({
                                        logo: {
                                            ...payload.logo,
                                            position: value as FlyerPayload["logo"]["position"],
                                        },
                                    })
                                }
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="top-left">Top left</SelectItem>
                                    <SelectItem value="top-right">Top right</SelectItem>
                                    <SelectItem value="bottom-left">Bottom left</SelectItem>
                                    <SelectItem value="bottom-right">Bottom right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Logo size (%)</Label>
                            <Input
                                type="number"
                                min={8}
                                max={40}
                                value={payload.logo.sizePercent}
                                onChange={(e) =>
                                    updatePayload({
                                        logo: {
                                            ...payload.logo,
                                            sizePercent: Number(e.target.value) || 18,
                                        },
                                    })
                                }
                                className="mt-1"
                            />
                        </div>
                    </div>
                </Card>

                <Card className="rounded-2xl border-slate-200/80 p-5 shadow-sm space-y-3">
                    <div>
                        <h3 className="font-semibold text-slate-900">Amenities</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            All suite amenities appear on the back page with icons. Save to refresh
                            an older flyer that still shows a partial list.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {FLYER_AMENITY_OPTIONS.map((amenity) => (
                            <span
                                key={amenity.key}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#FA5C5C]/20 bg-[#FA5C5C]/10 px-3 py-1 text-xs text-[#FA5C5C]"
                            >
                                <FlyerAmenityIcon amenityKey={amenity.key} size="0.85rem" />
                                {amenity.label}
                            </span>
                        ))}
                    </div>
                </Card>

                <Card className="rounded-2xl border-slate-200/80 p-5 shadow-sm space-y-3">
                    <h3 className="font-semibold text-slate-900">Perfect for</h3>
                    <div className="flex flex-wrap gap-2">
                        {FLYER_PERFECT_FOR_OPTIONS.map((item) => {
                            const active = payload.perfectFor.includes(item);
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => togglePerfectFor(item)}
                                    className={`rounded-full border px-3 py-1 text-xs transition ${
                                        active
                                            ? "border-slate-900 bg-slate-900 text-white"
                                            : "border-slate-200 text-slate-600"
                                    }`}
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </Card>

                <Card className="rounded-2xl border-slate-200/80 p-5 shadow-sm space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900">Images</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Hero image for the front page, plus six photos for the back-page grid (2×3).
                        </p>
                    </div>
                    {FLYER_IMAGE_SLOT_DEFINITIONS.map((slot) => (
                        <div
                            key={slot.key}
                            className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                        >
                            <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-800">{slot.label}</p>
                                {payload.images[slot.key]?.url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={payload.images[slot.key].url!}
                                        alt=""
                                        className="mt-2 h-16 w-24 rounded object-cover"
                                    />
                                ) : (
                                    <p className="text-xs text-slate-400">No image</p>
                                )}
                            </div>
                            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setGallerySlot(slot.key)}
                                >
                                    <Images className="h-3.5 w-3.5" />
                                    Gallery
                                </Button>
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/heic"
                                        className="sr-only"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) void uploadImage(slot.key, file);
                                            e.target.value = "";
                                        }}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        disabled={uploadingSlot === slot.key}
                                    >
                                        <span>
                                            {uploadingSlot === slot.key ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Upload className="h-3.5 w-3.5" />
                                            )}
                                            Upload
                                        </span>
                                    </Button>
                                </label>
                                {payload.images[slot.key]?.url ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            updatePayload({
                                                images: {
                                                    ...payload.images,
                                                    [slot.key]: {
                                                        ...payload.images[slot.key],
                                                        url: null,
                                                    },
                                                },
                                            })
                                        }
                                    >
                                        Remove
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </Card>

                <Card className="rounded-2xl border-slate-200/80 p-5 shadow-sm">
                    <h3 className="font-semibold text-slate-900">Design guide</h3>
                    <dl className="mt-3 space-y-3 text-sm text-slate-600">
                        {Object.entries(FLYER_DESIGNER_NOTES).map(([key, value]) => (
                            <div key={key}>
                                <dt className="font-medium capitalize text-slate-800">
                                    {key.replace(/([A-Z])/g, " $1")}
                                </dt>
                                <dd className="mt-0.5">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </Card>
            </div>

            <div className="w-full min-w-0 xl:sticky xl:top-24 xl:self-start">
                <Card className="rounded-2xl border-slate-200/80 p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                        Live preview
                    </h3>
                    <FlyerPreview
                        className="w-full"
                        payload={payload}
                        templateKey={templateKey}
                        pageSize={pageSize}
                    />
                </Card>
            </div>

            <FlyerExportOverlay
                open={exportOverlayOpen}
                payload={payload}
                templateKey={templateKey}
                pageSize={pageSize}
                exportRef={exportRef}
            />

            <FlyerImageGalleryPicker
                open={gallerySlot !== null}
                slotKey={gallerySlot}
                preferredApartmentId={payload.apartmentId}
                apartments={apartments}
                onClose={() => setGallerySlot(null)}
                onSelect={(image) => {
                    if (!gallerySlot) return;
                    applyGalleryImage(gallerySlot, image);
                }}
            />
        </div>
    );
}
