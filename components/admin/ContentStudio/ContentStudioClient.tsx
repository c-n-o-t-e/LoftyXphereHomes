"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Save } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { applyLayout } from "@/lib/content-studio/layout-engine";
import { mergeEditorialDocument } from "@/lib/content-studio/defaults";
import { checkEditorialQuality } from "@/lib/content-studio/quality-checker";
import { recommendEditorialDesign } from "@/lib/content-studio/recommend";
import { parseEditorialDocument } from "@/lib/content-studio/validation";
import {
    exportEditorialDocument,
    resolveStudioExportFileName,
} from "@/lib/content-studio/export-client";
import { resolveTheme } from "@/lib/content-studio/brand-theme";
import { fileToExportableDataUrl } from "@/lib/post-generator/uploadImage";
import type {
    EditorialAssetRecord,
    EditorialDocument,
    EditorialPostRecord,
    LayoutId,
    LayoutRecommendation,
    StudioExportFormat,
    VisualAlternative,
} from "@/lib/content-studio/types";
import { ContentComposer } from "@/components/admin/ContentStudio/ContentComposer";
import { DesignPanel } from "@/components/admin/ContentStudio/DesignPanel";
import { PreviewCanvas } from "@/components/admin/ContentStudio/PreviewCanvas";
import { QualityGate } from "@/components/admin/ContentStudio/QualityGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const HISTORY_LIMIT = 50;

export function ContentStudioClient({ postId }: { postId: string }) {
    const [record, setRecord] = useState<EditorialPostRecord | null>(null);
    const [title, setTitle] = useState("");
    const [document, setDocument] = useState<EditorialDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [history, setHistory] = useState<EditorialDocument[]>([]);
    const [future, setFuture] = useState<EditorialDocument[]>([]);
    const [previewScale, setPreviewScale] = useState(0.38);
    const [alternatives, setAlternatives] = useState<VisualAlternative[]>([]);
    const [generating, setGenerating] = useState(false);
    const [recommending, setRecommending] = useState(false);
    const [assets, setAssets] = useState<EditorialAssetRecord[]>([]);
    const [savingAsset, setSavingAsset] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState<StudioExportFormat>("png");
    const [liveProvider, setLiveProvider] = useState(false);
    const [recommendation, setRecommendation] = useState<LayoutRecommendation | null>(
        null,
    );

    const previewWrapRef = useRef<HTMLDivElement>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const skipHistoryRef = useRef(false);
    const docRef = useRef<EditorialDocument | null>(null);

    useEffect(() => {
        docRef.current = document;
    }, [document]);

    const authHeaders = useCallback(async () => {
        const supabase = getSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not signed in");
        return { Authorization: `Bearer ${token}` };
    }, []);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const headers = await authHeaders();
            const [postRes, assetRes] = await Promise.all([
                fetch(`/api/admin/editorial-posts/${postId}`, { headers }),
                fetch("/api/admin/editorial-assets", { headers }),
            ]);
            const postData = (await postRes.json()) as {
                post?: EditorialPostRecord;
                error?: string;
            };
            const assetData = (await assetRes.json()) as {
                assets?: EditorialAssetRecord[];
                error?: string;
            };
            if (!postRes.ok) throw new Error(postData.error ?? "Failed to load");
            const normalized = parseEditorialDocument(postData.post!.document);
            setRecord({ ...postData.post!, document: normalized });
            setTitle(postData.post!.title);
            setDocument(normalized);
            setHistory([normalized]);
            setFuture([]);
            setAssets(assetData.assets ?? []);
            const statusRes = await fetch("/api/admin/editorial-assets/generate", {
                headers,
            });
            if (statusRes.ok) {
                const status = (await statusRes.json()) as { live?: boolean };
                setLiveProvider(Boolean(status.live));
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load");
        } finally {
            setIsLoading(false);
        }
    }, [authHeaders, postId]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const id = "content-studio-fonts";
        if (window.document.getElementById(id)) return;
        const link = window.document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href =
            "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&display=swap";
        window.document.head.appendChild(link);
    }, []);

    useEffect(() => {
        const el = previewWrapRef.current;
        if (!el) return;
        const update = () => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            const byWidth = (w - 32) / 1080;
            const byHeight = (h - 32) / 1350;
            setPreviewScale(Math.min(1, Math.max(0.22, Math.min(byWidth, byHeight))));
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [document]);

    const save = useCallback(
        async (silent = false) => {
            const live = docRef.current;
            if (!live) return;
            setIsSaving(true);
            try {
                const headers = await authHeaders();
                const res = await fetch(`/api/admin/editorial-posts/${postId}`, {
                    method: "PUT",
                    headers: { ...headers, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title,
                        category: live.category,
                        layoutId: live.layoutId,
                        document: live,
                    }),
                });
                const data = (await res.json()) as {
                    post?: EditorialPostRecord;
                    error?: string;
                };
                if (!res.ok) throw new Error(data.error ?? "Save failed");
                setRecord(data.post ?? null);
                if (!silent) toast.success("Saved");
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Save failed");
            } finally {
                setIsSaving(false);
            }
        },
        [authHeaders, postId, title],
    );

    const scheduleSave = useCallback(() => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            void save(true);
        }, 1400);
    }, [save]);

    const updateDocument = useCallback(
        (patch: Partial<EditorialDocument>) => {
            setDocument((current) => {
                if (!current) return current;
                const next = mergeEditorialDocument(current, patch);
                if (!skipHistoryRef.current) {
                    setHistory((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), current]);
                    setFuture([]);
                }
                return next;
            });
            scheduleSave();
        },
        [scheduleSave],
    );

    const applyLayoutId = useCallback(
        (layoutId: LayoutId) => {
            setDocument((current) => {
                if (!current) return current;
                const next = applyLayout(current, layoutId);
                setHistory((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), current]);
                setFuture([]);
                return next;
            });
            scheduleSave();
        },
        [scheduleSave],
    );

    const undo = () => {
        if (history.length < 2 || !document) return;
        const previous = history[history.length - 2];
        setFuture((next) => [document, ...next]);
        setHistory((prev) => prev.slice(0, -1));
        skipHistoryRef.current = true;
        setDocument(previous);
        skipHistoryRef.current = false;
        scheduleSave();
    };

    const redo = () => {
        if (future.length === 0 || !document) return;
        const next = future[0];
        setHistory((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), document]);
        setFuture((prev) => prev.slice(1));
        skipHistoryRef.current = true;
        setDocument(next);
        skipHistoryRef.current = false;
        scheduleSave();
    };

    const quality = useMemo(
        () => (document ? checkEditorialQuality(document) : null),
        [document],
    );

    const onRecommend = async () => {
        if (!document) return;
        setRecommending(true);
        try {
            const local = recommendEditorialDesign({
                title: document.content.title,
                category: document.category,
                keywords: document.content.keywords,
            });
            setRecommendation(local);
            const next = applyLayout(
                mergeEditorialDocument(document, {
                    category: document.category,
                    themeId: local.themeId,
                    theme: resolveTheme(local.themeId),
                    asset: {
                        ...document.asset,
                        concept: local.visualConcept,
                        category: local.assetCategory,
                    },
                    footer: { ...document.footer, variant: local.footer },
                }),
                local.layoutId,
            );
            setHistory((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), document]);
            setDocument(next);
            scheduleSave();
            toast.success(local.reason);
        } finally {
            setRecommending(false);
        }
    };

    const onGenerate = async () => {
        if (!document) return;
        setGenerating(true);
        try {
            const headers = await authHeaders();
            const res = await fetch("/api/admin/editorial-assets/generate", {
                method: "POST",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: document.content.title,
                    category: document.category,
                    keywords: document.content.keywords,
                    concept: document.asset.concept || undefined,
                }),
            });
            const data = (await res.json()) as {
                alternatives?: VisualAlternative[];
                live?: boolean;
                error?: string;
            };
            if (!res.ok) throw new Error(data.error ?? "Generate failed");
            setLiveProvider(Boolean(data.live));
            setAlternatives(data.alternatives ?? []);
            if (data.alternatives?.[0]) {
                updateDocument({
                    asset: {
                        ...document.asset,
                        url: data.alternatives[0].imageUrl,
                        concept: data.alternatives[0].concept,
                    },
                });
            }
            toast.success(
                data.live
                    ? "Three visual alternatives are ready"
                    : "Placeholder visuals generated — add an API key for photography",
            );
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Generate failed");
        } finally {
            setGenerating(false);
        }
    };

    const onUploadAsset = async (file: File) => {
        try {
            const url = await fileToExportableDataUrl(file);
            updateDocument({
                asset: {
                    ...document.asset,
                    url,
                    concept: file.name.replace(/\.[^.]+$/, ""),
                },
            });
            toast.success("Visual placed on the canvas");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not read that image");
        }
    };

    const onSaveAsset = async () => {
        if (!document?.asset.url) return;
        setSavingAsset(true);
        try {
            const headers = await authHeaders();
            const res = await fetch("/api/admin/editorial-assets", {
                method: "POST",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: document.asset.concept || document.content.title || "Editorial asset",
                    category: document.asset.category,
                    prompt: document.asset.concept,
                    imageUrl: document.asset.url,
                    approved: true,
                }),
            });
            const data = (await res.json()) as {
                asset?: EditorialAssetRecord;
                error?: string;
            };
            if (!res.ok) throw new Error(data.error ?? "Could not save asset");
            setAssets((prev) => [data.asset!, ...prev]);
            toast.success("Asset saved to library");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not save asset");
        } finally {
            setSavingAsset(false);
        }
    };

    const onExport = async () => {
        if (!document || !quality?.ready) {
            toast.error("Resolve design issues before export");
            return;
        }
        setExporting(true);
        try {
            const headers = await authHeaders();
            await exportEditorialDocument(document, {
                format: exportFormat,
                scale: 2,
                fileName: resolveStudioExportFileName(document),
                authHeaders: headers,
            });
            toast.success("Exported — check Downloads");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Export failed");
        } finally {
            setExporting(false);
        }
    };

    if (isLoading || !document) {
        return (
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening studio…
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/content-studio">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Library
                        </Link>
                    </Button>
                    <Input
                        value={title}
                        onChange={(event) => {
                            setTitle(event.target.value);
                            scheduleSave();
                        }}
                        className="h-9 max-w-sm"
                    />
                    {isSaving ? (
                        <span className="text-xs text-slate-500">Saving…</span>
                    ) : record ? (
                        <span className="text-xs text-slate-400">
                            {new Date(record.updatedAt).toLocaleTimeString()}
                        </span>
                    ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={undo} disabled={history.length < 2}>
                        Undo
                    </Button>
                    <Button variant="outline" size="sm" onClick={redo} disabled={future.length === 0}>
                        Redo
                    </Button>
                    <Select
                        value={exportFormat}
                        onValueChange={(value) => setExportFormat(value as StudioExportFormat)}
                    >
                        <SelectTrigger className="h-8 w-24">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                            <SelectItem value="webp">WEBP</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => void save(false)}>
                        <Save className="h-3.5 w-3.5" />
                        Save
                    </Button>
                    <Button
                        size="sm"
                        className="bg-slate-900 hover:bg-slate-800"
                        disabled={exporting || !quality?.ready}
                        onClick={() => void onExport()}
                    >
                        {exporting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Download className="h-3.5 w-3.5" />
                        )}
                        Export 1080×1350
                    </Button>
                </div>
            </div>

            {quality ? <QualityGate report={quality} /> : null}
            {recommendation ? (
                <p className="text-xs text-slate-500">{recommendation.reason}</p>
            ) : null}

            <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
                <div className="min-h-0 overflow-y-auto pr-1">
                    <ContentComposer
                        document={document}
                        onChange={updateDocument}
                        onRecommend={() => void onRecommend()}
                        recommending={recommending}
                    />
                </div>
                <div
                    ref={previewWrapRef}
                    className="flex min-h-[520px] items-center justify-center overflow-auto rounded-2xl bg-[#d8cfc0] p-4"
                >
                    <PreviewCanvas
                        document={document}
                        scale={previewScale}
                        onAssetChange={(asset) =>
                            updateDocument({ asset: { ...document.asset, ...asset } })
                        }
                    />
                </div>
                <div className="min-h-0 overflow-y-auto pl-1">
                    <DesignPanel
                        document={document}
                        onChange={updateDocument}
                        onApplyLayout={applyLayoutId}
                        alternatives={alternatives}
                        generating={generating}
                        onGenerate={() => void onGenerate()}
                        onSelectAlternative={(alternative) =>
                            updateDocument({
                                asset: {
                                    ...document.asset,
                                    url: alternative.imageUrl,
                                    concept: alternative.concept,
                                },
                            })
                        }
                        assets={assets}
                        onUseAsset={(asset) =>
                            updateDocument({
                                asset: {
                                    ...document.asset,
                                    url: asset.imageUrl,
                                    concept: asset.name,
                                    category: asset.category,
                                },
                            })
                        }
                        onSaveAsset={() => void onSaveAsset()}
                        savingAsset={savingAsset}
                        liveProvider={liveProvider}
                        onUploadAsset={(file) => void onUploadAsset(file)}
                    />
                </div>
            </div>
        </div>
    );
}
