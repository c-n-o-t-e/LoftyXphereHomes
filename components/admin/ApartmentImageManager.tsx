"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
    GripVertical,
    Loader2,
    RefreshCw,
    Trash2,
    Upload,
} from "lucide-react";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminApartmentImage = {
    id: string;
    apartmentId: string;
    thumbnailUrl: string;
    mediumUrl: string;
    largeUrl: string;
    altText: string | null;
    displayOrder: number;
};

interface ApartmentImageManagerProps {
    apartmentId: string;
    apartmentName: string;
}

type PendingUpload = {
    id: string;
    file: File;
    previewUrl: string;
};

async function parseJsonResponse<T>(res: Response): Promise<T> {
    const data = (await res.json()) as T & { error?: string };
    if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
    }
    return data;
}

function SortableImageCard({
    image,
    onDelete,
    onReplace,
    onAltTextSave,
    isDeleting,
    isReplacing,
}: {
    image: AdminApartmentImage;
    onDelete: (imageId: string) => void;
    onReplace: (imageId: string, file: File) => void;
    onAltTextSave: (imageId: string, altText: string) => void;
    isDeleting: boolean;
    isReplacing: boolean;
}) {
    const [altText, setAltText] = useState(image.altText ?? "");
    const replaceInputRef = useRef<HTMLInputElement>(null);

    return (
        <Card className="overflow-hidden">
            <div className="relative aspect-[4/3] bg-gray-100">
                <Image
                    src={image.thumbnailUrl}
                    alt={image.altText ?? "Apartment image"}
                    fill
                    className="object-cover"
                    sizes="200px"
                />
                <div className="absolute top-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                    #{image.displayOrder + 1}
                </div>
            </div>
            <div className="p-3 space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <GripVertical className="h-4 w-4" />
                    Drag to reorder
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`alt-${image.id}`} className="text-xs">
                        Alt text
                    </Label>
                    <Input
                        id={`alt-${image.id}`}
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        onBlur={() => onAltTextSave(image.id, altText)}
                        placeholder="Describe this photo"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={isReplacing || isDeleting}
                    onClick={() => replaceInputRef.current?.click()}
                >
                    {isReplacing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Replace
                        </>
                    )}
                </Button>
                <input
                    ref={replaceInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onReplace(image.id, file);
                        e.target.value = "";
                    }}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700"
                    disabled={isDeleting || isReplacing}
                    onClick={() => onDelete(image.id)}
                >
                    {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </>
                    )}
                </Button>
            </div>
        </Card>
    );
}

export function ApartmentImageManager({
    apartmentId,
    apartmentName,
}: ApartmentImageManagerProps) {
    const [images, setImages] = useState<AdminApartmentImage[]>([]);
    const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [replacingId, setReplacingId] = useState<string | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getAuthHeaders = useCallback(async () => {
        const supabase = getSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not signed in");
        return { Authorization: `Bearer ${token}` };
    }, []);

    const loadImages = useCallback(async () => {
        setIsLoading(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`/api/admin/apartments/${apartmentId}/images`, {
                headers,
            });
            const data = await parseJsonResponse<{ images: AdminApartmentImage[] }>(res);
            setImages(data.images);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load images");
        } finally {
            setIsLoading(false);
        }
    }, [apartmentId, getAuthHeaders]);

    useEffect(() => {
        void loadImages();
    }, [loadImages]);

    const addPendingFiles = (files: FileList | File[]) => {
        const next = Array.from(files).map((file) => ({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            file,
            previewUrl: URL.createObjectURL(file),
        }));
        setPendingUploads((current) => [...current, ...next]);
    };

    const clearPendingUploads = () => {
        pendingUploads.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        setPendingUploads([]);
    };

    const uploadPending = async () => {
        if (pendingUploads.length === 0) return;
        setIsUploading(true);
        try {
            const headers = await getAuthHeaders();
            const formData = new FormData();
            pendingUploads.forEach((item) => formData.append("files", item.file));

            const res = await fetch(`/api/admin/apartments/${apartmentId}/images`, {
                method: "POST",
                headers,
                body: formData,
            });
            const data = await parseJsonResponse<{
                images: AdminApartmentImage[];
                errors?: { fileName: string; error: string }[];
            }>(res);

            setImages((current) => [...current, ...data.images]);
            clearPendingUploads();

            if (data.errors?.length) {
                toast.error(
                    `${data.errors.length} file(s) failed: ${data.errors[0]?.error}`,
                );
            } else {
                toast.success(`Uploaded ${data.images.length} image(s)`);
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const deleteImage = async (imageId: string) => {
        setDeletingId(imageId);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(
                `/api/admin/apartments/${apartmentId}/images/${imageId}`,
                { method: "DELETE", headers },
            );
            await parseJsonResponse(res);
            setImages((current) => current.filter((image) => image.id !== imageId));
            toast.success("Image deleted");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Delete failed");
        } finally {
            setDeletingId(null);
        }
    };

    const replaceImage = async (imageId: string, file: File) => {
        setReplacingId(imageId);
        try {
            const headers = await getAuthHeaders();
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(
                `/api/admin/apartments/${apartmentId}/images/${imageId}`,
                { method: "PUT", headers, body: formData },
            );
            const data = await parseJsonResponse<{ image: AdminApartmentImage }>(res);
            setImages((current) =>
                current.map((image) =>
                    image.id === imageId ? data.image : image,
                ),
            );
            toast.success("Image replaced");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Replace failed");
        } finally {
            setReplacingId(null);
        }
    };

    const saveAltText = async (imageId: string, altText: string) => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(
                `/api/admin/apartments/${apartmentId}/images/${imageId}`,
                {
                    method: "PATCH",
                    headers: { ...headers, "Content-Type": "application/json" },
                    body: JSON.stringify({ altText: altText.trim() || null }),
                },
            );
            const data = await parseJsonResponse<{ image: AdminApartmentImage }>(res);
            setImages((current) =>
                current.map((image) =>
                    image.id === imageId ? { ...image, altText: data.image.altText } : image,
                ),
            );
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not save alt text");
        }
    };

    const persistOrder = async (nextImages: AdminApartmentImage[]) => {
        const headers = await getAuthHeaders();
        const res = await fetch(
            `/api/admin/apartments/${apartmentId}/images/reorder`,
            {
                method: "PATCH",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({ imageIds: nextImages.map((image) => image.id) }),
            },
        );
        const data = await parseJsonResponse<{ images: AdminApartmentImage[] }>(res);
        setImages(data.images);
    };

    const onDropReorder = async (targetId: string) => {
        if (!draggingId || draggingId === targetId) return;
        const current = [...images];
        const fromIndex = current.findIndex((image) => image.id === draggingId);
        const toIndex = current.findIndex((image) => image.id === targetId);
        if (fromIndex < 0 || toIndex < 0) return;

        const [moved] = current.splice(fromIndex, 1);
        current.splice(toIndex, 0, moved);
        const reordered = current.map((image, index) => ({
            ...image,
            displayOrder: index,
        }));
        setImages(reordered);
        setDraggingId(null);

        try {
            await persistOrder(reordered);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Reorder failed");
            void loadImages();
        }
    };

    const sortedImages = useMemo(
        () => [...images].sort((a, b) => a.displayOrder - b.displayOrder),
        [images],
    );

    return (
        <div className="space-y-6">
            <Card
                className="p-6 border-dashed"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.length) {
                        addPendingFiles(e.dataTransfer.files);
                    }
                }}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <div>
                        <h2 className="font-semibold text-gray-900">
                            Upload photos for {apartmentName}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Drag and drop JPEG, PNG, WebP, or HEIC files. Images are
                            converted to WebP and optimized automatically.
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Choose files
                        </Button>
                        {pendingUploads.length > 0 && (
                            <Button
                                type="button"
                                onClick={() => void uploadPending()}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    `Upload ${pendingUploads.length} file(s)`
                                )}
                            </Button>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files?.length) {
                                addPendingFiles(e.target.files);
                                e.target.value = "";
                            }
                        }}
                    />
                </div>
            </Card>

            {pendingUploads.length > 0 && (
                <div>
                    <h3 className="font-medium text-gray-900 mb-3">Preview before upload</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {pendingUploads.map((item) => (
                            <Card key={item.id} className="overflow-hidden">
                                <div className="relative aspect-[4/3]">
                                    <Image
                                        src={item.previewUrl}
                                        alt={item.file.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div className="p-3 text-xs text-gray-600 truncate">
                                    {item.file.name}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading images...
                </div>
            ) : sortedImages.length === 0 ? (
                <Card className="p-6 text-sm text-gray-600">
                    No uploaded images yet. The public site will keep showing demo
                    photos until you upload real ones.
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sortedImages.map((image) => (
                        <div
                            key={image.id}
                            draggable
                            onDragStart={() => setDraggingId(image.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => void onDropReorder(image.id)}
                        >
                            <SortableImageCard
                                image={image}
                                onDelete={(imageId) => void deleteImage(imageId)}
                                onReplace={(imageId, file) => void replaceImage(imageId, file)}
                                onAltTextSave={(imageId, altText) =>
                                    void saveAltText(imageId, altText)
                                }
                                isDeleting={deletingId === image.id}
                                isReplacing={replacingId === image.id}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
