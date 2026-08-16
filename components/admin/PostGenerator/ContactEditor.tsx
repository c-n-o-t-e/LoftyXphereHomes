"use client";

import { Eye, EyeOff } from "lucide-react";
import type { ContactIconKey, PostDocument } from "@/lib/post-generator/types";
import { DEFAULT_CONTACT_STYLE } from "@/lib/post-generator/defaults";
import {
    ColorField,
    EditorSection,
    FieldRow,
    SliderField,
} from "@/components/admin/PostGenerator/fields";
import { PostContactIcon } from "@/components/admin/PostGenerator/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ContactEditor({
    document,
    onChange,
}: {
    document: PostDocument;
    onChange: (patch: Partial<PostDocument>) => void;
}) {
    const contact = document.contact;
    const style = {
        ...DEFAULT_CONTACT_STYLE,
        ...(document.contactStyle ?? {}),
    };

    return (
        <EditorSection
            title="Contact footer"
            description="Sits below the cream card (Instagram · WhatsApp · Website)."
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <ColorField
                    label="Icon colour"
                    value={style.iconColor || document.theme.icon}
                    onChange={(iconColor) =>
                        onChange({ contactStyle: { ...style, iconColor } })
                    }
                />
                <ColorField
                    label="Text colour"
                    value={style.textColor || document.theme.icon}
                    onChange={(textColor) =>
                        onChange({ contactStyle: { ...style, textColor } })
                    }
                />
                <SliderField
                    label="Icon size"
                    value={style.iconSize}
                    min={14}
                    max={60}
                    onChange={(iconSize) =>
                        onChange({ contactStyle: { ...style, iconSize } })
                    }
                    suffix="px"
                />
                <SliderField
                    label="Icon thickness"
                    value={style.strokeWidth}
                    min={1.5}
                    max={3.2}
                    step={0.05}
                    onChange={(strokeWidth) =>
                        onChange({ contactStyle: { ...style, strokeWidth } })
                    }
                />
                <SliderField
                    label="Text size"
                    value={style.fontSize}
                    min={11}
                    max={60}
                    step={0.5}
                    onChange={(fontSize) =>
                        onChange({ contactStyle: { ...style, fontSize } })
                    }
                    suffix="px"
                />
                <SliderField
                    label="Text weight"
                    value={style.fontWeight}
                    min={400}
                    max={800}
                    step={100}
                    onChange={(fontWeight) =>
                        onChange({ contactStyle: { ...style, fontWeight } })
                    }
                />
                <SliderField
                    label="Icon ↔ text gap"
                    value={style.gap}
                    min={4}
                    max={20}
                    onChange={(gap) => onChange({ contactStyle: { ...style, gap } })}
                    suffix="px"
                />
                <SliderField
                    label="Vertical padding"
                    value={style.paddingY}
                    min={0}
                    max={30}
                    onChange={(paddingY) =>
                        onChange({ contactStyle: { ...style, paddingY } })
                    }
                    suffix="px"
                />
            </div>

            <div className="space-y-3 pt-1">
                {contact.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 p-3"
                    >
                        <PostContactIcon
                            type={item.type}
                            size={16}
                            color={style.iconColor || document.theme.icon}
                            strokeWidth={style.strokeWidth}
                        />
                        <FieldRow label="Type" className="min-w-[120px] flex-1">
                            <Select
                                value={item.type}
                                onValueChange={(v) =>
                                    onChange({
                                        contact: contact.map((c) =>
                                            c.id === item.id
                                                ? { ...c, type: v as ContactIconKey }
                                                : c,
                                        ),
                                    })
                                }
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(
                                        [
                                            "instagram",
                                            "whatsapp",
                                            "website",
                                            "email",
                                            "phone",
                                        ] as const
                                    ).map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FieldRow>
                        <FieldRow label="Label" className="min-w-[160px] flex-[2]">
                            <Input
                                value={item.label}
                                className="h-8"
                                onChange={(e) =>
                                    onChange({
                                        contact: contact.map((c) =>
                                            c.id === item.id
                                                ? { ...c, label: e.target.value }
                                                : c,
                                        ),
                                    })
                                }
                            />
                        </FieldRow>
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() =>
                                onChange({
                                    contact: contact.map((c) =>
                                        c.id === item.id
                                            ? { ...c, visible: !c.visible }
                                            : c,
                                    ),
                                })
                            }
                        >
                            {item.visible ? (
                                <Eye className="h-4 w-4" />
                            ) : (
                                <EyeOff className="h-4 w-4 text-slate-400" />
                            )}
                        </Button>
                    </div>
                ))}
            </div>
        </EditorSection>
    );
}
