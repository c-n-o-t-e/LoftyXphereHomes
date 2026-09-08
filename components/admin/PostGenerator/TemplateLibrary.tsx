"use client";

import { PRESET_META } from "@/lib/post-generator/defaults";
import {
    POST_PRESET_KEYS,
    type PostPresetKey,
} from "@/lib/post-generator/types";
import { EditorSection } from "@/components/admin/PostGenerator/fields";

export function TemplateLibrary({
    activePreset,
    onApplyPreset,
}: {
    activePreset: PostPresetKey;
    onApplyPreset: (key: PostPresetKey) => void;
}) {
    return (
        <EditorSection
            title="Template"
            description="Same apartment story. Two compositions. Option 1 is the approved stacked editorial — left untouched."
        >
            <div className="grid gap-2">
                {POST_PRESET_KEYS.map((key) => {
                    const meta = PRESET_META[key];
                    const active = activePreset === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onApplyPreset(key)}
                            className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                                active
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white hover:border-slate-400"
                            }`}
                        >
                            <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">
                                Option {meta.option}
                            </p>
                            <p className="text-sm font-semibold">{meta.label}</p>
                            <p
                                className={`mt-0.5 text-xs leading-relaxed ${
                                    active ? "text-white/70" : "text-slate-500"
                                }`}
                            >
                                {meta.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </EditorSection>
    );
}
