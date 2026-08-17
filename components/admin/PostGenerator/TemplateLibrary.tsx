"use client";

import { PRESET_META } from "@/lib/post-generator/defaults";
import { DEFAULT_POST_PRESET } from "@/lib/post-generator/types";
import { EditorSection } from "@/components/admin/PostGenerator/fields";
import { Button } from "@/components/ui/button";

export function TemplateLibrary({
    onApplyPreset,
}: {
    onApplyPreset: () => void;
}) {
    const meta = PRESET_META[DEFAULT_POST_PRESET];

    return (
        <EditorSection
            title="Template"
            description="One approved layout — cream panel, gold accents, serif headline."
        >
            <div className="rounded-xl border border-slate-900 bg-slate-900 p-3 text-white">
                <p className="text-sm font-semibold">{meta.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    {meta.description}
                </p>
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onApplyPreset}
            >
                Reset to approved layout
            </Button>
        </EditorSection>
    );
}
