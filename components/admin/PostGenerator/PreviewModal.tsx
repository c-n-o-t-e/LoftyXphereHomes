"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { PostDocument } from "@/lib/post-generator/types";
import {
    POST_CANVAS_HEIGHT,
    POST_CANVAS_WIDTH,
} from "@/lib/post-generator/types";
import { PreviewCanvas } from "@/components/admin/PostGenerator/PreviewCanvas";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type PreviewModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    document: PostDocument;
    title: string;
    isDownloading: boolean;
    onDownload: () => void;
};

export function PreviewModal({
    open,
    onOpenChange,
    document,
    title,
    isDownloading,
    onDownload,
}: PreviewModalProps) {
    const [scale, setScale] = useState(0.35);

    useEffect(() => {
        if (!open) return;
        const update = () => {
            const maxH = window.innerHeight * 0.68;
            const maxW = Math.min(window.innerWidth - 48, 420);
            setScale(
                Math.min(maxW / POST_CANVAS_WIDTH, maxH / POST_CANVAS_HEIGHT, 1),
            );
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[95vh] w-[min(100vw-1rem,28rem)] flex-col gap-3 overflow-hidden p-4 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="pr-8 text-left">
                        {title || "Post preview"}
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        Full Instagram 4:5 preview — check your edits before downloading.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex min-h-0 flex-1 justify-center overflow-auto rounded-xl bg-[#ebe4d8] p-3">
                    <div
                        className="shrink-0 overflow-hidden rounded-lg shadow-lg"
                        style={{
                            width: POST_CANVAS_WIDTH * scale,
                            height: POST_CANVAS_HEIGHT * scale,
                        }}
                    >
                        <div
                            style={{
                                transform: `scale(${scale})`,
                                transformOrigin: "top left",
                                width: POST_CANVAS_WIDTH,
                                height: POST_CANVAS_HEIGHT,
                            }}
                        >
                            <PreviewCanvas document={document} exportMode />
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        className="bg-[#C4A574] text-white hover:bg-[#b39463]"
                        onClick={onDownload}
                        disabled={isDownloading}
                    >
                        {isDownloading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        {isDownloading ? "Preparing…" : "Download PNG"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
