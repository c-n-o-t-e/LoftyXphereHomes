"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type {
    PostDocument,
    PostExportFormat,
    PostExportScale,
} from "@/lib/post-generator/types";
import { exportPostDocument } from "@/lib/post-generator/exportClient";
import { EditorSection, FieldRow } from "@/components/admin/PostGenerator/fields";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function ExportPanel({
    document: postDocument,
    fileName,
    getAuthHeaders,
}: {
    document: PostDocument;
    fileName?: string;
    getAuthHeaders?: () => Promise<HeadersInit>;
}) {
    const [format, setFormat] = useState<PostExportFormat>("png");
    const [scale, setScale] = useState<PostExportScale>(2);
    const [transparent, setTransparent] = useState(false);
    const [busy, setBusy] = useState(false);

    const onExport = async () => {
        setBusy(true);
        try {
            const authHeaders = getAuthHeaders ? await getAuthHeaders() : undefined;
            await exportPostDocument(postDocument, {
                format,
                scale,
                transparentBackground: transparent,
                fileName,
                authHeaders,
            });
            toast.success("Saved — check Downloads, Files, or your share sheet");
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Export failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <EditorSection
            title="Export"
            description="Instagram 4:5 — 1080×1350 base. Draws a clean image file (no browser screenshot hacks)."
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label="Format">
                    <Select
                        value={format}
                        onValueChange={(v) => setFormat(v as PostExportFormat)}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                            <SelectItem value="webp">WEBP</SelectItem>
                        </SelectContent>
                    </Select>
                </FieldRow>
                <FieldRow label="Scale">
                    <Select
                        value={String(scale)}
                        onValueChange={(v) => setScale(Number(v) as PostExportScale)}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1× (1080×1350)</SelectItem>
                            <SelectItem value="2">2× (2160×2700)</SelectItem>
                            <SelectItem value="4">4× (4320×5400)</SelectItem>
                        </SelectContent>
                    </Select>
                </FieldRow>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                    type="checkbox"
                    checked={transparent}
                    onChange={(e) => setTransparent(e.target.checked)}
                    disabled={format === "jpeg"}
                />
                Transparent background (PNG / WEBP)
            </label>
            <Button
                type="button"
                className="w-full bg-[#C4A574] text-white hover:bg-[#b39463]"
                onClick={() => void onExport()}
                disabled={busy}
            >
                {busy ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                Download to this device
            </Button>
            <p className="text-center text-[11px] leading-relaxed text-slate-500">
                On a computer: saves to your Downloads folder. On a phone: opens the
                share sheet so you can save to Photos or Files.
            </p>
        </EditorSection>
    );
}
