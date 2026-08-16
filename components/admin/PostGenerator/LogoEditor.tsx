"use client";

import type { PostDocument } from "@/lib/post-generator/types";
import {
    ColorField,
    EditorSection,
    FieldRow,
    SliderField,
} from "@/components/admin/PostGenerator/fields";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function LogoEditor({
    document,
    onChange,
}: {
    document: PostDocument;
    onChange: (patch: Partial<PostDocument>) => void;
}) {
    const logo = document.logo;
    return (
        <EditorSection title="Logo" description="Upper-left brand mark as in the reference.">
            <FieldRow label="Logo URL">
                <Input
                    value={logo.url ?? ""}
                    onChange={(e) =>
                        onChange({ logo: { ...logo, url: e.target.value || null } })
                    }
                    placeholder="/lofty-logo-black.png"
                />
            </FieldRow>
            <FieldRow label="Light mode URL">
                <Input
                    value={logo.lightUrl ?? ""}
                    onChange={(e) =>
                        onChange({
                            logo: { ...logo, lightUrl: e.target.value || null },
                        })
                    }
                />
            </FieldRow>
            <FieldRow label="Dark mode URL">
                <Input
                    value={logo.darkUrl ?? ""}
                    onChange={(e) =>
                        onChange({
                            logo: { ...logo, darkUrl: e.target.value || null },
                        })
                    }
                />
            </FieldRow>
            <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label="Variant">
                    <Select
                        value={logo.variant}
                        onValueChange={(v) =>
                            onChange({
                                logo: { ...logo, variant: v as typeof logo.variant },
                            })
                        }
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light (on photo)</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                    </Select>
                </FieldRow>
                <FieldRow label="Position">
                    <Select
                        value={logo.position}
                        onValueChange={(v) =>
                            onChange({
                                logo: { ...logo, position: v as typeof logo.position },
                            })
                        }
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="top-left">Top left</SelectItem>
                            <SelectItem value="top-center">Top center</SelectItem>
                            <SelectItem value="top-right">Top right</SelectItem>
                            <SelectItem value="bottom-left">Bottom left</SelectItem>
                            <SelectItem value="bottom-right">Bottom right</SelectItem>
                        </SelectContent>
                    </Select>
                </FieldRow>
                <SliderField
                    label="Opacity"
                    value={Math.round(logo.opacity * 100)}
                    min={20}
                    max={100}
                    onChange={(v) =>
                        onChange({ logo: { ...logo, opacity: v / 100 } })
                    }
                    suffix="%"
                />
                <SliderField
                    label="Size"
                    value={logo.size}
                    min={40}
                    max={140}
                    onChange={(v) => onChange({ logo: { ...logo, size: v } })}
                    suffix="px"
                />
                <SliderField
                    label="Padding"
                    value={logo.padding}
                    min={12}
                    max={72}
                    onChange={(v) => onChange({ logo: { ...logo, padding: v } })}
                    suffix="px"
                />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                    type="checkbox"
                    checked={logo.showWordmark}
                    onChange={(e) =>
                        onChange({
                            logo: { ...logo, showWordmark: e.target.checked },
                        })
                    }
                />
                Show wordmark text
            </label>
            <FieldRow label="Wordmark">
                <Input
                    value={logo.wordmark}
                    onChange={(e) =>
                        onChange({ logo: { ...logo, wordmark: e.target.value } })
                    }
                />
            </FieldRow>
        </EditorSection>
    );
}

export function ButtonEditor({
    document,
    onChange,
}: {
    document: PostDocument;
    onChange: (patch: Partial<PostDocument>) => void;
}) {
    const b = document.button;
    return (
        <EditorSection title="CTA button" description="Gold pill — BOOK YOUR STAY.">
            <FieldRow label="Label">
                <Input
                    value={b.text}
                    onChange={(e) => onChange({ button: { ...b, text: e.target.value } })}
                />
            </FieldRow>
            <div className="grid gap-3 sm:grid-cols-2">
                <ColorField
                    label="Background"
                    value={b.backgroundColor}
                    onChange={(v) =>
                        onChange({ button: { ...b, backgroundColor: v } })
                    }
                />
                <ColorField
                    label="Text colour"
                    value={b.textColor}
                    onChange={(v) => onChange({ button: { ...b, textColor: v } })}
                />
                <SliderField
                    label="Radius"
                    value={b.borderRadius}
                    min={0}
                    max={999}
                    onChange={(v) => onChange({ button: { ...b, borderRadius: v } })}
                    suffix="px"
                />
                <SliderField
                    label="Padding X"
                    value={b.paddingX}
                    min={8}
                    max={48}
                    onChange={(v) => onChange({ button: { ...b, paddingX: v } })}
                />
                <SliderField
                    label="Padding Y"
                    value={b.paddingY}
                    min={6}
                    max={28}
                    onChange={(v) => onChange({ button: { ...b, paddingY: v } })}
                />
                <SliderField
                    label="Font size"
                    value={b.fontSize}
                    min={10}
                    max={18}
                    onChange={(v) => onChange({ button: { ...b, fontSize: v } })}
                />
                <SliderField
                    label="Hover scale"
                    value={b.hoverScale}
                    min={1}
                    max={1.12}
                    step={0.01}
                    onChange={(v) => onChange({ button: { ...b, hoverScale: v } })}
                />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                    type="checkbox"
                    checked={b.showIcon}
                    onChange={(e) =>
                        onChange({ button: { ...b, showIcon: e.target.checked } })
                    }
                />
                Show arrow icon
            </label>
        </EditorSection>
    );
}
