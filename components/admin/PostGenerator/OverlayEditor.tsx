"use client";

import type { PostDocument } from "@/lib/post-generator/types";
import {
    ColorField,
    EditorSection,
    FieldRow,
    SliderField,
} from "@/components/admin/PostGenerator/fields";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function OverlayEditor({
    document,
    onChange,
}: {
    document: PostDocument;
    onChange: (patch: Partial<PostDocument>) => void;
}) {
    const o = document.overlay;
    const t = document.theme;
    const layout = document.layout;
    const headline = document.headline;
    const button = document.button;
    const amenitiesStyle = document.amenitiesStyle;

    return (
        <EditorSection
            title="Glass card & photo fade"
            description="Full-bleed hero photo with a single inset gold border over the whole composition. Glass card overlaps the fade into the editorial section."
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <SliderField
                    label="Glass opacity"
                    value={Math.round(o.opacity * 100)}
                    min={10}
                    max={100}
                    onChange={(v) => onChange({ overlay: { ...o, opacity: v / 100 } })}
                    suffix="%"
                />
                <SliderField
                    label="Glass blur"
                    value={o.blur}
                    min={0}
                    max={40}
                    onChange={(v) => onChange({ overlay: { ...o, blur: v } })}
                    suffix="px"
                />
                <SliderField
                    label="Photo fade"
                    value={o.photoFadePercent ?? 14}
                    min={0}
                    max={100}
                    onChange={(v) =>
                        onChange({ overlay: { ...o, photoFadePercent: v } })
                    }
                    suffix="%"
                />
                <SliderField
                    label="Card vertical offset"
                    value={o.cardOffsetY ?? -40}
                    min={-80}
                    max={80}
                    onChange={(v) => onChange({ overlay: { ...o, cardOffsetY: v } })}
                    suffix="px"
                />
                <SliderField
                    label="Card width (side inset)"
                    value={o.cardInsetX ?? 26}
                    min={0}
                    max={64}
                    onChange={(v) => onChange({ overlay: { ...o, cardInsetX: v } })}
                    suffix="px"
                />
                <SliderField
                    label="Card padding"
                    value={layout.contentPaddingX}
                    min={20}
                    max={64}
                    onChange={(v) =>
                        onChange({
                            layout: {
                                ...layout,
                                contentPaddingX: v,
                                contentPaddingTop: Math.round(v * 0.85),
                                contentPaddingBottom: Math.round(v * 0.7),
                            },
                        })
                    }
                    suffix="px"
                />
                <SliderField
                    label="Border thickness"
                    value={o.borderThickness}
                    min={0}
                    max={4}
                    step={0.5}
                    onChange={(v) =>
                        onChange({ overlay: { ...o, borderThickness: v } })
                    }
                    suffix="px"
                />
                <ColorField
                    label="Glass border"
                    value={
                        o.borderColor?.startsWith("#") && o.borderColor.length >= 7
                            ? o.borderColor.slice(0, 7)
                            : "#FFFFFF"
                    }
                    onChange={(v) =>
                        onChange({ overlay: { ...o, borderColor: v } })
                    }
                />
                <SliderField
                    label="Border radius"
                    value={o.borderRadius}
                    min={10}
                    max={40}
                    onChange={(v) => onChange({ overlay: { ...o, borderRadius: v } })}
                    suffix="px"
                />
                <SliderField
                    label="Shadow"
                    value={o.shadow}
                    min={0}
                    max={24}
                    onChange={(v) => onChange({ overlay: { ...o, shadow: v } })}
                />
                <SliderField
                    label="Photo height"
                    value={o.photoHeightPercent}
                    min={48}
                    max={72}
                    onChange={(v) =>
                        onChange({ overlay: { ...o, photoHeightPercent: v } })
                    }
                    suffix="%"
                />
                <SliderField
                    label="Panel overlap"
                    value={o.overlapPercent}
                    min={0}
                    max={20}
                    onChange={(v) =>
                        onChange({ overlay: { ...o, overlapPercent: v } })
                    }
                    suffix="%"
                />
                <SliderField
                    label="Gap above footer"
                    value={o.footerGap ?? 28}
                    min={8}
                    max={56}
                    onChange={(v) => onChange({ overlay: { ...o, footerGap: v } })}
                    suffix="px"
                />
                <SliderField
                    label="Heading size"
                    value={headline.fontSize}
                    min={40}
                    max={72}
                    onChange={(v) =>
                        onChange({ headline: { ...headline, fontSize: v } })
                    }
                    suffix="px"
                />
                <SliderField
                    label="CTA size"
                    value={button.fontSize}
                    min={10}
                    max={18}
                    onChange={(v) =>
                        onChange({
                            button: {
                                ...button,
                                fontSize: v,
                                paddingY: Math.round(v * 1.2),
                                paddingX: Math.round(v * 1.85),
                            },
                        })
                    }
                    suffix="px"
                />
                <SliderField
                    label="Icon size"
                    value={amenitiesStyle.iconSize}
                    min={24}
                    max={48}
                    onChange={(v) =>
                        onChange({
                            amenitiesStyle: { ...amenitiesStyle, iconSize: v },
                        })
                    }
                    suffix="px"
                />
                <SliderField
                    label="Gradient strength"
                    value={Math.round(o.gradientStrength * 100)}
                    min={0}
                    max={100}
                    onChange={(v) =>
                        onChange({ overlay: { ...o, gradientStrength: v / 100 } })
                    }
                    suffix="%"
                />
                <ColorField
                    label="Gold accent"
                    value={t.gold}
                    onChange={(v) =>
                        onChange({
                            theme: {
                                ...t,
                                gold: v,
                                accent: v,
                                button: v,
                                icon: v,
                            },
                            layout: { ...layout, borderColor: v },
                            headline: { ...headline, accentColor: v },
                            button: { ...button, backgroundColor: v },
                            overlay: { ...o },
                        })
                    }
                />
                <ColorField
                    label="Background"
                    value={t.background}
                    onChange={(v) =>
                        onChange({
                            theme: { ...t, background: v },
                        })
                    }
                />
                <ColorField
                    label="Glass fill"
                    value={
                        o.backgroundColor.startsWith("#")
                            ? o.backgroundColor
                            : "#FFFFFF"
                    }
                    onChange={(v) =>
                        onChange({ overlay: { ...o, backgroundColor: v } })
                    }
                />
                <FieldRow label="Gradient direction">
                    <Select
                        value={o.gradientDirection}
                        onValueChange={(v) =>
                            onChange({
                                overlay: {
                                    ...o,
                                    gradientDirection: v as typeof o.gradientDirection,
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
                                    "to-top",
                                    "to-bottom",
                                    "to-left",
                                    "to-right",
                                    "to-top-right",
                                    "to-top-left",
                                ] as const
                            ).map((d) => (
                                <SelectItem key={d} value={d}>
                                    {d}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldRow>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                <input
                    type="checkbox"
                    checked={o.glassEffect}
                    onChange={(e) =>
                        onChange({ overlay: { ...o, glassEffect: e.target.checked } })
                    }
                    className="rounded border-slate-300"
                />
                Glass / frosted card (photo shows through)
            </label>
        </EditorSection>
    );
}
