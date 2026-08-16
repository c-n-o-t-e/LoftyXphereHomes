"use client";

import type { PostDocument } from "@/lib/post-generator/types";
import {
    ColorField,
    EditorSection,
    FieldRow,
    SliderField,
} from "@/components/admin/PostGenerator/fields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ThemeEditor({
    document,
    onChange,
}: {
    document: PostDocument;
    onChange: (patch: Partial<PostDocument>) => void;
}) {
    const t = document.theme;
    const l = document.layout;
    return (
        <EditorSection
            title="Theme colours"
            description="Defaults match the approved warm ivory / champagne gold reference."
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <ColorField
                    label="Primary"
                    value={t.primary}
                    onChange={(v) => onChange({ theme: { ...t, primary: v } })}
                />
                <ColorField
                    label="Accent"
                    value={t.accent}
                    onChange={(v) => onChange({ theme: { ...t, accent: v } })}
                />
                <ColorField
                    label="Gold"
                    value={t.gold}
                    onChange={(v) => onChange({ theme: { ...t, gold: v, icon: v } })}
                />
                <ColorField
                    label="Background"
                    value={t.background}
                    onChange={(v) => onChange({ theme: { ...t, background: v } })}
                />
                <ColorField
                    label="Text"
                    value={t.text}
                    onChange={(v) => onChange({ theme: { ...t, text: v } })}
                />
                <ColorField
                    label="Divider"
                    value={t.divider}
                    onChange={(v) => onChange({ theme: { ...t, divider: v } })}
                />
                <ColorField
                    label="Button"
                    value={t.button}
                    onChange={(v) => onChange({ theme: { ...t, button: v } })}
                />
                <ColorField
                    label="Icon"
                    value={t.icon}
                    onChange={(v) => onChange({ theme: { ...t, icon: v } })}
                />
                <ColorField
                    label="Frame border"
                    value={l.borderColor}
                    onChange={(v) => onChange({ layout: { ...l, borderColor: v } })}
                />
                <SliderField
                    label="Frame thickness"
                    value={l.borderThickness}
                    min={0}
                    max={8}
                    step={0.5}
                    onChange={(v) =>
                        onChange({ layout: { ...l, borderThickness: v } })
                    }
                    suffix="px"
                />
            </div>
        </EditorSection>
    );
}

export function FontEditor({
    document,
    onChange,
}: {
    document: PostDocument;
    onChange: (patch: Partial<PostDocument>) => void;
}) {
    const h = document.headline;
    const d = document.description;
    return (
        <EditorSection title="Typography" description="Editorial serif + clean sans pairing.">
            <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label="Heading font">
                    <Select
                        value={document.fonts.heading}
                        onValueChange={(v) =>
                            onChange({
                                fonts: {
                                    ...document.fonts,
                                    heading: v as typeof document.fonts.heading,
                                },
                            })
                        }
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(
                                [
                                    "Playfair Display",
                                    "Cormorant Garamond",
                                    "Canela",
                                    "Recoleta",
                                ] as const
                            ).map((f) => (
                                <SelectItem key={f} value={f}>
                                    {f}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldRow>
                <FieldRow label="Body font">
                    <Select
                        value={document.fonts.body}
                        onValueChange={(v) =>
                            onChange({
                                fonts: {
                                    ...document.fonts,
                                    body: v as typeof document.fonts.body,
                                },
                            })
                        }
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(["Inter", "Manrope", "Helvetica", "Montserrat"] as const).map(
                                (f) => (
                                    <SelectItem key={f} value={f}>
                                        {f}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                </FieldRow>
            </div>

            <FieldRow label="Headline line 1">
                <Input
                    value={h.line1}
                    onChange={(e) =>
                        onChange({ headline: { ...h, line1: e.target.value } })
                    }
                />
            </FieldRow>
            <FieldRow label="Headline line 2">
                <Input
                    value={h.line2}
                    onChange={(e) =>
                        onChange({ headline: { ...h, line2: e.target.value } })
                    }
                />
            </FieldRow>
            <FieldRow label="Accent word (gold)">
                <Input
                    value={h.accentWord}
                    onChange={(e) =>
                        onChange({ headline: { ...h, accentWord: e.target.value } })
                    }
                />
            </FieldRow>
            <div className="grid gap-3 sm:grid-cols-2">
                <SliderField
                    label="Headline size"
                    value={h.fontSize}
                    min={32}
                    max={72}
                    onChange={(v) => onChange({ headline: { ...h, fontSize: v } })}
                    suffix="px"
                />
                <SliderField
                    label="Weight"
                    value={h.fontWeight}
                    min={400}
                    max={700}
                    step={100}
                    onChange={(v) => onChange({ headline: { ...h, fontWeight: v } })}
                />
                <SliderField
                    label="Letter spacing"
                    value={h.letterSpacing}
                    min={-2}
                    max={4}
                    step={0.1}
                    onChange={(v) =>
                        onChange({ headline: { ...h, letterSpacing: v } })
                    }
                />
                <ColorField
                    label="Headline colour"
                    value={h.color}
                    onChange={(v) => onChange({ headline: { ...h, color: v } })}
                />
                <ColorField
                    label="Accent colour"
                    value={h.accentColor}
                    onChange={(v) => onChange({ headline: { ...h, accentColor: v } })}
                />
                <FieldRow label="Alignment">
                    <Select
                        value={h.align}
                        onValueChange={(v) =>
                            onChange({
                                headline: { ...h, align: v as typeof h.align },
                            })
                        }
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                    </Select>
                </FieldRow>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                    type="checkbox"
                    checked={h.showAccentDivider}
                    onChange={(e) =>
                        onChange({
                            headline: { ...h, showAccentDivider: e.target.checked },
                        })
                    }
                />
                Show gold divider under first line
            </label>

            <FieldRow label="Description">
                <Textarea
                    value={d.text}
                    rows={3}
                    onChange={(e) =>
                        onChange({ description: { ...d, text: e.target.value } })
                    }
                />
            </FieldRow>
            <div className="grid gap-3 sm:grid-cols-2">
                <SliderField
                    label="Body size"
                    value={d.fontSize}
                    min={11}
                    max={22}
                    onChange={(v) => onChange({ description: { ...d, fontSize: v } })}
                    suffix="px"
                />
                <SliderField
                    label="Body max width"
                    value={d.maxWidthPercent}
                    min={30}
                    max={80}
                    onChange={(v) =>
                        onChange({ description: { ...d, maxWidthPercent: v } })
                    }
                    suffix="%"
                />
                <ColorField
                    label="Body colour"
                    value={d.color}
                    onChange={(v) => onChange({ description: { ...d, color: v } })}
                />
            </div>
        </EditorSection>
    );
}
