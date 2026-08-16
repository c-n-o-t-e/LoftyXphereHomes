"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import type { PostDocument, PostImageControls } from "@/lib/post-generator/types";
import { fileToExportableDataUrl } from "@/lib/post-generator/uploadImage";
import {
    EditorSection,
    FieldRow,
    SliderField,
} from "@/components/admin/PostGenerator/fields";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type ApartmentOption = { id: string; name: string; status: string };

type ImageEditorProps = {
    document: PostDocument;
    apartments: ApartmentOption[];
    onChange: (patch: Partial<PostDocument>) => void;
    onSelectApartment: (apartmentId: string) => Promise<void>;
};

function patchImage(
    image: PostImageControls,
    key: keyof PostImageControls,
    value: number | string | null,
): PostImageControls {
    return { ...image, [key]: value };
}

export function ImageEditor({
    document,
    apartments,
    onChange,
    onSelectApartment,
}: ImageEditorProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [loadingApt, setLoadingApt] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showSuiteHelper, setShowSuiteHelper] = useState(false);
    const image = document.image;
    const hasPhoto = Boolean(image.url);

    const applyFile = useCallback(
        async (file: File) => {
            setUploading(true);
            try {
                const url = await fileToExportableDataUrl(file);
                onChange({
                    // Custom upload — don’t keep a suite link that implies Meridian/Lumen photo
                    apartmentId: null,
                    apartmentName: "",
                    apartmentSlug: null,
                    image: {
                        ...image,
                        url,
                        sourceFileName: file.name || null,
                    },
                });
                toast.success("Photo ready — preview updated, you can download now");
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Upload failed");
            } finally {
                setUploading(false);
                if (fileRef.current) fileRef.current.value = "";
            }
        },
        [image, onChange],
    );

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void applyFile(file);
    };

    return (
        <EditorSection
            title="Your photo"
            description="Upload from this computer or phone. No suite selection needed — your file is the hero image."
        >
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`rounded-xl border border-dashed p-5 text-center transition ${
                    dragging
                        ? "border-[#C4A574] bg-[#F7F3EC]"
                        : "border-slate-300 bg-slate-50/50"
                }`}
            >
                {hasPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={image.url!}
                        alt="Uploaded photo preview"
                        className="mx-auto mb-3 h-36 w-auto max-w-full rounded-lg object-cover shadow-sm"
                    />
                ) : (
                    <ImagePlus className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                )}
                <p className="text-sm font-medium text-slate-800">
                    {hasPhoto ? "Photo loaded" : "Upload a photo from your device"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                    JPG, PNG, or WEBP · works on phone and computer
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        className="bg-[#C4A574] text-white hover:bg-[#b39463]"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                    >
                        {uploading ? (
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="mr-1.5 h-4 w-4" />
                        )}
                        {hasPhoto ? "Replace photo" : "Upload photo"}
                    </Button>
                    {hasPhoto ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploading}
                            onClick={() =>
                                onChange({
                                    image: {
                                        ...image,
                                        url: null,
                                        sourceFileName: null,
                                    },
                                })
                            }
                        >
                            <Trash2 className="mr-1.5 h-4 w-4" />
                            Remove
                        </Button>
                    ) : null}
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void applyFile(file);
                        }}
                    />
                </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <button
                    type="button"
                    className="w-full text-left text-xs font-medium text-slate-600 hover:text-slate-900"
                    onClick={() => setShowSuiteHelper((v) => !v)}
                >
                    {showSuiteHelper ? "▾" : "▸"} Optional: auto-fill from a suite
                    (Meridian, Lumen…)
                </button>
                {showSuiteHelper ? (
                    <div className="mt-3 space-y-2">
                        <p className="text-[11px] text-slate-500">
                            Only if you want the suite cover photo + booking link. Skip
                            this if you uploaded your own picture.
                        </p>
                        <FieldRow label="Suite">
                            <Select
                                value={document.apartmentId ?? undefined}
                                onValueChange={async (id) => {
                                    setLoadingApt(true);
                                    try {
                                        await onSelectApartment(id);
                                    } catch (err) {
                                        toast.error(
                                            err instanceof Error
                                                ? err.message
                                                : "Failed to load apartment",
                                        );
                                    } finally {
                                        setLoadingApt(false);
                                    }
                                }}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Choose suite…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {apartments.map((apt) => (
                                        <SelectItem key={apt.id} value={apt.id}>
                                            {apt.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FieldRow>
                        {loadingApt ? (
                            <p className="text-xs text-slate-500">Loading suite photo…</p>
                        ) : null}
                    </div>
                ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <SliderField
                    label="Position X"
                    value={image.positionX}
                    min={0}
                    max={100}
                    onChange={(v) => onChange({ image: patchImage(image, "positionX", v) })}
                    suffix="%"
                />
                <SliderField
                    label="Position Y"
                    value={image.positionY}
                    min={0}
                    max={100}
                    onChange={(v) => onChange({ image: patchImage(image, "positionY", v) })}
                    suffix="%"
                />
                <SliderField
                    label="Scale"
                    value={image.scale}
                    min={0.5}
                    max={2.5}
                    step={0.01}
                    onChange={(v) => onChange({ image: patchImage(image, "scale", v) })}
                />
                <SliderField
                    label="Zoom"
                    value={image.zoom}
                    min={0.5}
                    max={3}
                    step={0.01}
                    onChange={(v) => onChange({ image: patchImage(image, "zoom", v) })}
                />
                <SliderField
                    label="Pan X"
                    value={image.panX}
                    min={-200}
                    max={200}
                    onChange={(v) => onChange({ image: patchImage(image, "panX", v) })}
                    suffix="px"
                />
                <SliderField
                    label="Pan Y"
                    value={image.panY}
                    min={-200}
                    max={200}
                    onChange={(v) => onChange({ image: patchImage(image, "panY", v) })}
                    suffix="px"
                />
                <SliderField
                    label="Crop top"
                    value={image.cropTop}
                    min={0}
                    max={40}
                    onChange={(v) => onChange({ image: patchImage(image, "cropTop", v) })}
                    suffix="%"
                />
                <SliderField
                    label="Crop bottom"
                    value={image.cropBottom}
                    min={0}
                    max={40}
                    onChange={(v) =>
                        onChange({ image: patchImage(image, "cropBottom", v) })
                    }
                    suffix="%"
                />
                <SliderField
                    label="Brightness"
                    value={image.brightness}
                    min={50}
                    max={150}
                    onChange={(v) =>
                        onChange({ image: patchImage(image, "brightness", v) })
                    }
                    suffix="%"
                />
                <SliderField
                    label="Contrast"
                    value={image.contrast}
                    min={50}
                    max={150}
                    onChange={(v) => onChange({ image: patchImage(image, "contrast", v) })}
                    suffix="%"
                />
                <SliderField
                    label="Saturation"
                    value={image.saturation}
                    min={0}
                    max={200}
                    onChange={(v) =>
                        onChange({ image: patchImage(image, "saturation", v) })
                    }
                    suffix="%"
                />
                <SliderField
                    label="Blur"
                    value={image.blur}
                    min={0}
                    max={20}
                    step={0.5}
                    onChange={(v) => onChange({ image: patchImage(image, "blur", v) })}
                    suffix="px"
                />
            </div>
        </EditorSection>
    );
}
