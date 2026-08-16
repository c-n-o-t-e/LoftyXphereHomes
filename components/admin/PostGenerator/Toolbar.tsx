"use client";

import { Undo2, Redo2, Save, Keyboard, Eye, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ToolbarProps = {
    title: string;
    onTitleChange: (title: string) => void;
    isSaving: boolean;
    isDownloading: boolean;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onPreview: () => void;
    onDownload: () => void;
};

export function Toolbar({
    title,
    onTitleChange,
    isSaving,
    isDownloading,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onSave,
    onPreview,
    onDownload,
}: ToolbarProps) {
    return (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="min-w-[160px] flex-1 border-0 bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Template title"
            />
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onUndo}
                    disabled={!canUndo}
                    title="Undo (⌘Z)"
                >
                    <Undo2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRedo}
                    disabled={!canRedo}
                    title="Redo (⌘⇧Z)"
                >
                    <Redo2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onPreview}
                    title="Full-size preview"
                >
                    <Eye className="mr-1.5 h-4 w-4" />
                    Preview
                </Button>
                <Button
                    type="button"
                    size="sm"
                    onClick={onDownload}
                    disabled={isDownloading}
                    className="bg-[#C4A574] text-white hover:bg-[#b39463]"
                    title="Download PNG to this device"
                >
                    {isDownloading ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-1.5 h-4 w-4" />
                    )}
                    {isDownloading ? "Downloading…" : "Download"}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    onClick={onSave}
                    disabled={isSaving}
                    className="bg-slate-900 hover:bg-slate-800"
                >
                    <Save className="mr-1.5 h-4 w-4" />
                    {isSaving ? "Saving…" : "Save"}
                </Button>
            </div>
            <p className="hidden items-center gap-1 text-[11px] text-slate-400 xl:flex">
                <Keyboard className="h-3.5 w-3.5" />
                ⌘S save · ⌘Z undo · Preview then Download to your phone or computer
            </p>
        </div>
    );
}
