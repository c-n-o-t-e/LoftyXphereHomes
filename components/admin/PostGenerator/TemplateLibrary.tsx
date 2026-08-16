"use client";

import { PRESET_META } from "@/lib/post-generator/defaults";
import type { PostPresetKey } from "@/lib/post-generator/types";
import { EditorSection } from "@/components/admin/PostGenerator/fields";
import { Button } from "@/components/ui/button";

export function TemplateLibrary({
    activePreset,
    onApplyPreset,
}: {
    activePreset: PostPresetKey | null;
    onApplyPreset: (preset: PostPresetKey) => void;
}) {
    return (
        <EditorSection
            title="Template library"
            description="Presets keep the same layout language — only colours and panel treatment change."
        >
            <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(PRESET_META) as PostPresetKey[]).map((key) => {
                    const meta = PRESET_META[key];
                    const active = activePreset === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onApplyPreset(key)}
                            className={`rounded-xl border p-3 text-left transition ${
                                active
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                        >
                            <p className="text-sm font-semibold">{meta.label}</p>
                            <p
                                className={`mt-1 text-xs leading-relaxed ${
                                    active ? "text-slate-300" : "text-slate-500"
                                }`}
                            >
                                {meta.description}
                            </p>
                        </button>
                    );
                })}
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onApplyPreset("luxury-editorial")}
            >
                Reset to Luxury Editorial (approved reference)
            </Button>
        </EditorSection>
    );
}
