"use client";

import { Check, Loader2, Sparkles, RefreshCw } from "lucide-react";
import type { SmartThemeResult } from "@/lib/post-generator/smart-theme";
import { themePreviewSwatches } from "@/lib/post-generator/smart-theme";
import { EditorSection } from "@/components/admin/PostGenerator/fields";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SmartThemePanelProps = {
    analyzing: boolean;
    result: SmartThemeResult | null;
    activeThemeId: string | null;
    hasPhoto: boolean;
    error: string | null;
    onApplyTheme: (index: number) => void;
    onReanalyze: () => void;
};

export function SmartThemePanel({
    analyzing,
    result,
    activeThemeId,
    hasPhoto,
    error,
    onApplyTheme,
    onReanalyze,
}: SmartThemePanelProps) {
    return (
        <EditorSection
            title="Smart Theme Engine"
            description="Analyzes your apartment photo and suggests four themes. Re-analyze flips Imaginative Soft ↔ Bold; the other three stay stable."
        >
            {!hasPhoto ? (
                <p className="text-sm text-slate-500">
                    Upload a photo to generate Luxury Warm, Editorial Ivory, Dark Boutique, and
                    Imaginative (Soft / Bold expressions).
                </p>
            ) : null}

            {hasPhoto ? (
                <div className="mb-3 flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onReanalyze}
                        disabled={analyzing}
                        className="h-8"
                    >
                        {analyzing ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {analyzing ? "Analyzing…" : "Re-analyze photo"}
                    </Button>
                    {analyzing ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                            Reading brightness, color, and layout…
                        </span>
                    ) : null}
                </div>
            ) : null}

            {error ? (
                <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    {error}
                </p>
            ) : null}

            {result ? (
                <>
                    <div className="grid gap-2">
                        {result.themes.map((theme, index) => {
                            const swatches = themePreviewSwatches(theme);
                            const active = activeThemeId === theme.id;
                            const recommended = index === result.recommendedIndex;
                            return (
                                <button
                                    key={theme.id}
                                    type="button"
                                    onClick={() => onApplyTheme(index)}
                                    className={cn(
                                        "rounded-xl border p-3 text-left transition",
                                        active
                                            ? "border-[#C8A66A] bg-[#F8F4EC] shadow-sm"
                                            : "border-slate-200 bg-white hover:border-slate-300",
                                    )}
                                >
                                    <div className="mb-1.5 flex items-center justify-between gap-2">
                                        <span className="text-sm font-semibold text-slate-900">
                                            {theme.label}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            {theme.id === "imaginative" &&
                                            theme.expression != null ? (
                                                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                                                    {theme.expression === 0
                                                        ? "Soft 1/2"
                                                        : "Bold 2/2"}
                                                </span>
                                            ) : null}
                                            {recommended ? (
                                                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                                                    Suggested
                                                </span>
                                            ) : null}
                                            {active ? (
                                                <Check className="h-4 w-4 text-[#C8A66A]" />
                                            ) : null}
                                        </span>
                                    </div>
                                    <p className="mb-2 text-xs leading-relaxed text-slate-500">
                                        {theme.description}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        {swatches.map((c) => (
                                            <span
                                                key={`${theme.id}-${c}`}
                                                className="h-5 w-5 rounded-full border border-black/10"
                                                style={{ background: c }}
                                                title={c}
                                            />
                                        ))}
                                        <span className="ml-auto text-[10px] tabular-nums text-slate-400">
                                            glass {Math.round(theme.glassOpacity * 100)}% · offset{" "}
                                            {theme.cardOffsetY}px
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-3">
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            <Sparkles className="h-3.5 w-3.5" />
                            Smart recommendations
                        </p>
                        <ul className="space-y-1.5">
                            {result.recommendations.map((rec) => (
                                <li
                                    key={rec.id}
                                    className="flex items-start gap-2 text-xs text-slate-700"
                                >
                                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                    <span>{rec.message}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            ) : null}
        </EditorSection>
    );
}
