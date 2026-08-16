"use client";

import { GripVertical, Eye, EyeOff } from "lucide-react";
import type { AmenityIconKey, PostAmenityItem, PostDocument } from "@/lib/post-generator/types";
import { DEFAULT_AMENITIES_STYLE } from "@/lib/post-generator/defaults";
import {
    EditorSection,
    FieldRow,
    SliderField,
} from "@/components/admin/PostGenerator/fields";
import { AMENITY_ICON_OPTIONS, PostAmenityIcon } from "@/components/admin/PostGenerator/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function AmenitiesEditor({
    document,
    onChange,
}: {
    document: PostDocument;
    onChange: (patch: Partial<PostDocument>) => void;
}) {
    const amenities = document.amenities;
    const style = {
        ...DEFAULT_AMENITIES_STYLE,
        ...(document.amenitiesStyle ?? {}),
    };

    const update = (id: string, patch: Partial<PostAmenityItem>) => {
        onChange({
            amenities: amenities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        });
    };

    const move = (index: number, dir: -1 | 1) => {
        const next = [...amenities];
        const target = index + dir;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        onChange({ amenities: next });
    };

    return (
        <EditorSection
            title="Amenities"
            description="Inside the cream card. Use 8 columns for one Instagram row, or 4 for a 4×2 stack."
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <SliderField
                    label="Columns"
                    value={style.columns}
                    min={2}
                    max={8}
                    onChange={(columns) =>
                        onChange({ amenitiesStyle: { ...style, columns } })
                    }
                />
                <SliderField
                    label="Icon size"
                    value={style.iconSize}
                    min={24}
                    max={64}
                    onChange={(iconSize) =>
                        onChange({ amenitiesStyle: { ...style, iconSize } })
                    }
                    suffix="px"
                />
                <SliderField
                    label="Icon thickness"
                    value={style.strokeWidth}
                    min={1.5}
                    max={3.5}
                    step={0.05}
                    onChange={(strokeWidth) =>
                        onChange({ amenitiesStyle: { ...style, strokeWidth } })
                    }
                />
                <SliderField
                    label="Label size"
                    value={style.fontSize}
                    min={9}
                    max={20}
                    step={0.5}
                    onChange={(fontSize) =>
                        onChange({ amenitiesStyle: { ...style, fontSize } })
                    }
                    suffix="px"
                />
                <SliderField
                    label="Label weight"
                    value={style.fontWeight}
                    min={400}
                    max={800}
                    step={100}
                    onChange={(fontWeight) =>
                        onChange({ amenitiesStyle: { ...style, fontWeight } })
                    }
                />
                <SliderField
                    label="Column spacing"
                    value={style.columnGap}
                    min={0}
                    max={32}
                    onChange={(columnGap) =>
                        onChange({ amenitiesStyle: { ...style, columnGap } })
                    }
                    suffix="px"
                />
                <SliderField
                    label="Row spacing"
                    value={style.rowGap}
                    min={0}
                    max={48}
                    onChange={(rowGap) =>
                        onChange({ amenitiesStyle: { ...style, rowGap } })
                    }
                    suffix="px"
                />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                    type="checkbox"
                    checked={style.goldLabels}
                    onChange={(e) =>
                        onChange({
                            amenitiesStyle: {
                                ...style,
                                goldLabels: e.target.checked,
                            },
                        })
                    }
                    className="rounded border-slate-300"
                />
                Gold amenity labels (matches reference)
            </label>

            <div className="space-y-3 pt-1">
                {amenities.map((item, index) => (
                    <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                    >
                        <div className="mb-2 flex items-center gap-2">
                            <div className="flex gap-1">
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => move(index, -1)}
                                    disabled={index === 0}
                                >
                                    <GripVertical className="h-3.5 w-3.5 rotate-90" />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => move(index, 1)}
                                    disabled={index === amenities.length - 1}
                                >
                                    <GripVertical className="h-3.5 w-3.5 -rotate-90" />
                                </Button>
                            </div>
                            <PostAmenityIcon
                                icon={item.icon}
                                customSvg={item.customSvg}
                                size={18}
                                color={document.theme.icon}
                                strokeWidth={style.strokeWidth}
                            />
                            <span className="flex-1 truncate text-xs font-medium text-slate-700">
                                {item.label}
                            </span>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => update(item.id, { visible: !item.visible })}
                            >
                                {item.visible ? (
                                    <Eye className="h-3.5 w-3.5" />
                                ) : (
                                    <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                                )}
                            </Button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <FieldRow label="Label">
                                <Input
                                    value={item.label}
                                    onChange={(e) =>
                                        update(item.id, { label: e.target.value })
                                    }
                                    className="h-8"
                                />
                            </FieldRow>
                            <FieldRow label="Icon">
                                <Select
                                    value={item.icon}
                                    onValueChange={(v) =>
                                        update(item.id, {
                                            icon: v as AmenityIconKey,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AMENITY_ICON_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.key} value={opt.key}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FieldRow>
                        </div>
                        {item.icon === "custom" ? (
                            <FieldRow label="Custom SVG markup (future-ready)" className="mt-2">
                                <Input
                                    value={item.customSvg ?? ""}
                                    onChange={(e) =>
                                        update(item.id, {
                                            customSvg: e.target.value || null,
                                        })
                                    }
                                    placeholder="<svg …>"
                                    className="h-8 font-mono text-[11px]"
                                />
                            </FieldRow>
                        ) : null}
                    </div>
                ))}
            </div>
        </EditorSection>
    );
}
