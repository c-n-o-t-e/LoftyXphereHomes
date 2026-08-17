"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
    applyPreset,
    mergePostDocument,
} from "@/lib/post-generator/defaults";
import { parsePostDocument } from "@/lib/post-generator/validation";
import type {
    PostDocument,
    PostTemplateRecord,
} from "@/lib/post-generator/types";
import {
    DEFAULT_POST_PRESET,
    POST_CANVAS_HEIGHT,
    POST_CANVAS_WIDTH,
} from "@/lib/post-generator/types";
import { PreviewCanvas } from "@/components/admin/PostGenerator/PreviewCanvas";
import { Toolbar } from "@/components/admin/PostGenerator/Toolbar";
import { ImageEditor } from "@/components/admin/PostGenerator/ImageEditor";
import { OverlayEditor } from "@/components/admin/PostGenerator/OverlayEditor";
import { ThemeEditor, FontEditor } from "@/components/admin/PostGenerator/ThemeEditor";
import { LogoEditor, ButtonEditor } from "@/components/admin/PostGenerator/LogoEditor";
import { AmenitiesEditor } from "@/components/admin/PostGenerator/AmenitiesEditor";
import { ContactEditor } from "@/components/admin/PostGenerator/ContactEditor";
import { TemplateLibrary } from "@/components/admin/PostGenerator/TemplateLibrary";
import { ExportPanel } from "@/components/admin/PostGenerator/ExportPanel";
import { PreviewModal } from "@/components/admin/PostGenerator/PreviewModal";
import { SmartThemePanel } from "@/components/admin/PostGenerator/SmartThemePanel";
import { exportPostDocument, resolvePostExportFileName } from "@/lib/post-generator/exportClient";
import {
    applySmartThemeToDocument,
    createAnalysisRunTracker,
    resolveHeroImageAnalysisAction,
    runSmartThemeEngine,
    shouldCommitSmartThemeAnalysis,
    type SmartThemeResult,
} from "@/lib/post-generator/smart-theme";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

type ApartmentOption = { id: string; name: string; status: string };

const HISTORY_LIMIT = 50;

export function PostGeneratorClient({ templateId }: { templateId: string }) {
    const [record, setRecord] = useState<PostTemplateRecord | null>(null);
    const [title, setTitle] = useState("");
    const [document, setDocument] = useState<PostDocument | null>(null);
    const [presetKey, setPresetKey] = useState<typeof DEFAULT_POST_PRESET | null>(
        DEFAULT_POST_PRESET,
    );
    const [apartments, setApartments] = useState<ApartmentOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [history, setHistory] = useState<PostDocument[]>([]);
    const [future, setFuture] = useState<PostDocument[]>([]);
    const [previewScale, setPreviewScale] = useState(0.42);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [smartTheme, setSmartTheme] = useState<SmartThemeResult | null>(null);
    const [smartAnalyzing, setSmartAnalyzing] = useState(false);
    const [smartError, setSmartError] = useState<string | null>(null);
    const [activeSmartThemeId, setActiveSmartThemeId] = useState<string | null>(null);
    const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previewWrapRef = useRef<HTMLDivElement>(null);
    const skipHistoryRef = useRef(false);
    const postDocRef = useRef<PostDocument | null>(null);
    const prevImageUrlRef = useRef<string | null | undefined>(undefined);
    const analysisRunsRef = useRef(createAnalysisRunTracker());
    const loadRequestRef = useRef(0);

    // Keep a live ref so Save/Download never use a stale closure snapshot
    useEffect(() => {
        postDocRef.current = document;
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
        const requestId = ++loadRequestRef.current;
        setIsLoading(true);
        setLoadedTemplateId(null);
        analysisRunsRef.current.invalidate();
        try {
            const headers = await authHeaders();
            const [tplRes, aptRes] = await Promise.all([
                fetch(`/api/admin/post-templates/${templateId}`, { headers }),
                fetch("/api/admin/apartments", { headers }),
            ]);
            const tplData = (await tplRes.json()) as {
                template?: PostTemplateRecord;
                error?: string;
            };
            const aptData = (await aptRes.json()) as {
                apartments?: ApartmentOption[];
                error?: string;
            };
            if (!tplRes.ok) throw new Error(tplData.error ?? "Failed to load");
            if (!aptRes.ok) throw new Error(aptData.error ?? "Failed to load apartments");
            if (requestId !== loadRequestRef.current) return;

            const tpl = tplData.template!;
            const normalized = parsePostDocument(tpl.document);
            setRecord({ ...tpl, document: normalized });
            setTitle(tpl.title);
            setDocument(normalized);
            setLoadedTemplateId(templateId);
            setPresetKey(tpl.presetKey);
            setHistory([normalized]);
            setFuture([]);
            setApartments(aptData.apartments ?? []);
        } catch (err) {
            if (requestId !== loadRequestRef.current) return;
            toast.error(err instanceof Error ? err.message : "Failed to load");
        } finally {
            if (requestId === loadRequestRef.current) setIsLoading(false);
        }
    }, [authHeaders, templateId]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const id = "post-generator-fonts";
        if (window.document.getElementById(id)) return;
        const link = window.document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href =
            "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&family=Manrope:wght@400;500;600;700&family=Montserrat:wght@400;500;600&family=Playfair+Display:wght@500;600;700&display=swap";
        window.document.head.appendChild(link);
    }, []);

    useEffect(() => {
        const el = previewWrapRef.current;
        if (!el) return;
        const update = () => {
            const w = el.clientWidth;
            const scale = Math.min(1, Math.max(0.28, (w - 24) / POST_CANVAS_WIDTH));
            setPreviewScale(scale);
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [document]);

    const save = useCallback(
        async (silent = false) => {
            const liveDoc = postDocRef.current;
            if (!liveDoc) return;
            setIsSaving(true);
            try {
                const headers = await authHeaders();
                const res = await fetch(`/api/admin/post-templates/${templateId}`, {
                    method: "PUT",
                    headers: { ...headers, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title,
                        presetKey,
                        document: liveDoc,
                    }),
                });
                const data = (await res.json()) as {
                    template?: PostTemplateRecord;
                    error?: string;
                };
                if (!res.ok) throw new Error(data.error ?? "Save failed");
                setRecord(data.template ?? null);
                if (!silent) toast.success("Template saved");
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Save failed");
            } finally {
                setIsSaving(false);
            }
        },
        [authHeaders, presetKey, templateId, title],
    );

    const scheduleSave = useCallback(() => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            void save(true);
        }, 1400);
    }, [save]);

    useEffect(() => {
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    const pushHistory = useCallback((next: PostDocument) => {
        setHistory((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), next]);
        setFuture([]);
    }, []);

    const applyPatch = useCallback(
        (patch: Partial<PostDocument>) => {
            setDocument((prev) => {
                if (!prev) return prev;
                const next = mergePostDocument(prev, patch);
                if (!skipHistoryRef.current) pushHistory(next);
                skipHistoryRef.current = false;
                return next;
            });
            scheduleSave();
        },
        [pushHistory, scheduleSave],
    );

    const applyPatchRef = useRef(applyPatch);
    applyPatchRef.current = applyPatch;

    const runAnalysis = useCallback(
        async (
            imageUrl: string,
            opts?: {
                force?: boolean;
                autoApply?: boolean;
                /** When auto-applying, prefer this theme id (e.g. imaginative Soft↔Bold) */
                preferThemeId?: string;
            },
        ) => {
            const runId = analysisRunsRef.current.begin();
            const isLiveRun = () =>
                shouldCommitSmartThemeAnalysis({
                    runId,
                    tracker: analysisRunsRef.current,
                    analyzedUrl: imageUrl,
                    currentImageUrl: postDocRef.current?.image.url,
                });

            setSmartAnalyzing(true);
            setSmartError(null);
            try {
                const headers = await authHeaders();
                if (!isLiveRun()) return;
                const result = await runSmartThemeEngine(imageUrl, {
                    force: opts?.force,
                    authHeaders: headers,
                });
                if (!isLiveRun()) return;
                setSmartTheme(result);
                if (opts?.autoApply === true) {
                    const live = postDocRef.current;
                    if (live) {
                        let themeIndex = result.recommendedIndex;
                        if (opts?.preferThemeId) {
                            const preferred = result.themes.findIndex(
                                (t) => t.id === opts.preferThemeId,
                            );
                            if (preferred >= 0) themeIndex = preferred;
                        }
                        const patch = applySmartThemeToDocument(
                            live,
                            result,
                            themeIndex,
                        );
                        applyPatchRef.current(patch);
                        setActiveSmartThemeId(
                            result.themes[themeIndex]?.id ?? null,
                        );
                        toast.success(
                            `Smart theme: ${result.themes[themeIndex]?.label ?? "applied"}`,
                        );
                    }
                }
            } catch (err) {
                if (!isLiveRun()) return;
                console.error(err);
                setSmartError(
                    err instanceof Error
                        ? err.message
                        : "Could not analyze photo — try a different image",
                );
            } finally {
                if (analysisRunsRef.current.isCurrent(runId)) {
                    setSmartAnalyzing(false);
                }
            }
        },
        [authHeaders],
    );

    const hasHydratedDocument = document != null;
    const heroImageUrl = document?.image.url ?? null;

    // First hydrated load for this template: analyze only (keep saved styling).
    // Later uploads / suite picks: analyze + auto-apply recommended theme.
    useEffect(() => {
        const action = resolveHeroImageAnalysisAction({
            hasHydratedDocument,
            imageUrl: heroImageUrl,
            previousUrl: prevImageUrlRef.current,
            routeTemplateId: templateId,
            loadedTemplateId,
        });
        prevImageUrlRef.current = action.previousUrl;

        if (action.type === "none") return;

        if (action.type === "clear") {
            analysisRunsRef.current.invalidate();
            setSmartAnalyzing(false);
            setSmartTheme(null);
            setSmartError(null);
            setActiveSmartThemeId(null);
            return;
        }

        void runAnalysis(action.imageUrl, { autoApply: action.autoApply });
    }, [hasHydratedDocument, heroImageUrl, loadedTemplateId, runAnalysis, templateId]);

    const onApplySmartTheme = useCallback(
        (index: number) => {
            const live = postDocRef.current;
            if (!live || !smartTheme) return;
            const patch = applySmartThemeToDocument(live, smartTheme, index);
            applyPatch(patch);
            setActiveSmartThemeId(smartTheme.themes[index]?.id ?? null);
            toast.success(`Applied ${smartTheme.themes[index]?.label ?? "theme"}`);
        },
        [applyPatch, smartTheme],
    );

    const undo = useCallback(() => {
        setHistory((prev) => {
            if (prev.length < 2) return prev;
            const current = prev[prev.length - 1];
            const previous = prev[prev.length - 2];
            setFuture((f) => [current, ...f].slice(0, HISTORY_LIMIT));
            skipHistoryRef.current = true;
            setDocument(previous);
            scheduleSave();
            return prev.slice(0, -1);
        });
    }, [scheduleSave]);

    const redo = useCallback(() => {
        setFuture((prev) => {
            if (prev.length === 0) return prev;
            const [next, ...rest] = prev;
            setHistory((h) => [...h, next].slice(-HISTORY_LIMIT));
            skipHistoryRef.current = true;
            setDocument(next);
            scheduleSave();
            return rest;
        });
    }, [scheduleSave]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const meta = e.metaKey || e.ctrlKey;
            if (!meta) return;
            if (e.key.toLowerCase() === "s") {
                e.preventDefault();
                void save(false);
            }
            if (e.key.toLowerCase() === "z" && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            if (e.key.toLowerCase() === "z" && e.shiftKey) {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [redo, save, undo]);

    const onSelectApartment = useCallback(
        async (apartmentId: string) => {
            const headers = await authHeaders();
            const res = await fetch(
                `/api/admin/post-templates/apartment-preset?apartmentId=${encodeURIComponent(apartmentId)}`,
                { headers },
            );
            const data = (await res.json()) as {
                patch?: Partial<PostDocument>;
                error?: string;
            };
            if (!res.ok) throw new Error(data.error ?? "Failed to load apartment");
            if (data.patch) applyPatch(data.patch);
        },
        [applyPatch, authHeaders],
    );

    const onApplyPreset = useCallback(() => {
            const next = applyPreset(DEFAULT_POST_PRESET);
            // Preserve current image / apartment when resetting look
            const merged = mergePostDocument(next, {
                apartmentId: document?.apartmentId ?? null,
                apartmentName: document?.apartmentName ?? "",
                apartmentSlug: document?.apartmentSlug ?? null,
                bookingUrl: document?.bookingUrl ?? null,
                image: document?.image,
            });
            setPresetKey(DEFAULT_POST_PRESET);
            setDocument(merged);
            pushHistory(merged);
            scheduleSave();
            toast.success("Reset to Luxury Editorial");
        }, [document, pushHistory, scheduleSave]);

    const previewHeight = useMemo(
        () => POST_CANVAS_HEIGHT * previewScale,
        [previewScale],
    );

    const fileName = useMemo(
        () => (document ? resolvePostExportFileName(document) : "lofty-instagram-post"),
        [document],
    );

    const handleDownload = useCallback(async () => {
        const liveDoc = postDocRef.current;
        if (!liveDoc) {
            toast.error("Post not ready yet");
            return;
        }
        setIsDownloading(true);
        try {
            const headers = await authHeaders();
            await exportPostDocument(liveDoc, {
                format: "png",
                scale: 2,
                fileName: resolvePostExportFileName(liveDoc),
                authHeaders: headers,
            });
            toast.success("Saved — check Downloads, Files, or your share sheet");
        } catch (err) {
            console.error(err);
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Download failed — please try again",
            );
        } finally {
            setIsDownloading(false);
        }
    }, [authHeaders]);

    if (isLoading || !document) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                Loading post generator…
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Toolbar
                title={title}
                onTitleChange={(t) => {
                    setTitle(t);
                    scheduleSave();
                }}
                isSaving={isSaving}
                isDownloading={isDownloading}
                canUndo={history.length > 1}
                canRedo={future.length > 0}
                onUndo={undo}
                onRedo={redo}
                onSave={() => void save(false)}
                onPreview={() => setPreviewOpen(true)}
                onDownload={() => void handleDownload()}
            />

            {/* LIVE PREVIEW */}
            <div
                ref={previewWrapRef}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-[#ebe4d8] p-4 shadow-sm"
            >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Live post preview · Instagram 4:5
                        {record
                            ? ` · Updated ${new Date(record.updatedAt).toLocaleString()}`
                            : ""}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-white"
                            onClick={() => setPreviewOpen(true)}
                        >
                            <Eye className="mr-1.5 h-4 w-4" />
                            Preview
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            className="bg-[#C4A574] text-white hover:bg-[#b39463]"
                            onClick={() => void handleDownload()}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-1.5 h-4 w-4" />
                            )}
                            Download
                        </Button>
                    </div>
                </div>
                <div
                    className="mx-auto overflow-hidden"
                    style={{
                        width: POST_CANVAS_WIDTH * previewScale,
                        height: previewHeight,
                    }}
                >
                    <div
                        style={{
                            transform: `scale(${previewScale})`,
                            transformOrigin: "top left",
                            width: POST_CANVAS_WIDTH,
                            height: POST_CANVAS_HEIGHT,
                        }}
                    >
                        <div ref={canvasRef}>
                            <PreviewCanvas document={document} />
                        </div>
                    </div>
                </div>
            </div>

            <PreviewModal
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                document={document}
                title={title}
                isDownloading={isDownloading}
                onDownload={() => void handleDownload()}
            />

            {/* EDITOR PANEL */}
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                <TemplateLibrary onApplyPreset={onApplyPreset} />
                <ImageEditor
                    document={document}
                    apartments={apartments}
                    onChange={applyPatch}
                    onSelectApartment={onSelectApartment}
                />
                <SmartThemePanel
                    analyzing={smartAnalyzing}
                    result={smartTheme}
                    activeThemeId={activeSmartThemeId}
                    hasPhoto={Boolean(document.image.url)}
                    error={smartError}
                    onApplyTheme={onApplySmartTheme}
                    onReanalyze={() => {
                        const url = document.image.url;
                        if (!url) return;
                        // Flip Imaginative Soft ↔ Bold; re-apply only if that theme is active
                        const keepImaginative =
                            activeSmartThemeId === "imaginative";
                        void runAnalysis(url, {
                            force: true,
                            autoApply: keepImaginative,
                            preferThemeId: keepImaginative
                                ? "imaginative"
                                : undefined,
                        });
                    }}
                />
                <OverlayEditor document={document} onChange={applyPatch} />
                <FontEditor document={document} onChange={applyPatch} />
                <ButtonEditor document={document} onChange={applyPatch} />
                <LogoEditor document={document} onChange={applyPatch} />
                <AmenitiesEditor document={document} onChange={applyPatch} />
                <ContactEditor document={document} onChange={applyPatch} />
                <ThemeEditor document={document} onChange={applyPatch} />
                <ExportPanel
                    document={document}
                    fileName={fileName}
                    getAuthHeaders={authHeaders}
                />
            </div>
        </div>
    );
}
