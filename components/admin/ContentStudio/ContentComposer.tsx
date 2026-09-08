"use client";

import { CATEGORY_LABELS } from "@/lib/content-studio/defaults";
import { STUDIO_ICON_KEYS } from "@/lib/content-studio/icons";
import { STUDIO_CTAS } from "@/lib/content-studio/tokens";
import {
    CONTENT_CATEGORIES,
    type ContentCategory,
    type EditorialDocument,
    type StudioIconKey,
} from "@/lib/content-studio/types";
import {
    EditorSection,
    FieldRow,
} from "@/components/admin/PostGenerator/fields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ContentComposer({
    document,
    onChange,
    onRecommend,
    recommending,
}: {
    document: EditorialDocument;
    onChange: (patch: Partial<EditorialDocument>) => void;
    onRecommend: () => void;
    recommending: boolean;
}) {
    const content = document.content;

    const patchContent = (next: Partial<EditorialDocument["content"]>) => {
        onChange({ content: { ...content, ...next } });
    };

    return (
        <div className="space-y-4">
            <EditorSection
                title="Content"
                description="Write the post. Recommend layout & visual will choose a composition, then generate three asset options."
            >
                <FieldRow label="Category">
                    <Select
                        value={document.category}
                        onValueChange={(value) =>
                            onChange({ category: value as ContentCategory })
                        }
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CONTENT_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {CATEGORY_LABELS[category]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldRow>
                <FieldRow label="Kicker / series">
                    <Input
                        value={content.kicker}
                        onChange={(event) => patchContent({ kicker: event.target.value })}
                        placeholder="Guest Education"
                    />
                </FieldRow>
                <FieldRow label="Title">
                    <Textarea
                        value={content.title}
                        onChange={(event) => patchContent({ title: event.target.value })}
                        rows={3}
                    />
                </FieldRow>
                <FieldRow label="Subtitle">
                    <Input
                        value={content.subtitle}
                        onChange={(event) =>
                            patchContent({ subtitle: event.target.value })
                        }
                    />
                </FieldRow>
                <FieldRow label="Supporting line">
                    <Textarea
                        value={content.body}
                        onChange={(event) => patchContent({ body: event.target.value })}
                        rows={3}
                    />
                </FieldRow>
                <FieldRow label="CTA">
                    <Input
                        value={content.cta}
                        onChange={(event) => patchContent({ cta: event.target.value })}
                        placeholder="Discover more"
                    />
                </FieldRow>
                <div className="flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-500 hover:border-slate-400"
                        onClick={() => patchContent({ cta: "" })}
                    >
                        No CTA
                    </button>
                    {STUDIO_CTAS.map((cta) => (
                        <button
                            key={cta}
                            type="button"
                            className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                                content.cta.toLowerCase() === cta.toLowerCase()
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 text-slate-600 hover:border-slate-400"
                            }`}
                            onClick={() => patchContent({ cta })}
                        >
                            {cta}
                        </button>
                    ))}
                </div>
                <FieldRow label="Keywords">
                    <Input
                        value={content.keywords.join(", ")}
                        onChange={(event) =>
                            patchContent({
                                keywords: event.target.value
                                    .split(",")
                                    .map((item) => item.trim())
                                    .filter(Boolean),
                            })
                        }
                        placeholder="shortlet, abuja, booking"
                    />
                </FieldRow>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={recommending}
                    onClick={onRecommend}
                >
                    {recommending ? "Recommending…" : "Recommend layout & visual"}
                </Button>
            </EditorSection>

            {(document.layoutId === "magazine-editorial" ||
                document.layoutId === "information-grid") && (
                <EditorSection
                    title="Information points"
                    description="Number, heading, one sentence, one icon. Keep the grid editorial."
                >
                    <div className="space-y-4">
                        {content.points.map((point, index) => (
                            <div
                                key={point.id}
                                className="space-y-2 rounded-xl border border-slate-100 p-3"
                            >
                                <div className="grid grid-cols-[72px_1fr] gap-2">
                                    <Input
                                        value={point.number}
                                        onChange={(event) => {
                                            const points = content.points.map((item, i) =>
                                                i === index
                                                    ? { ...item, number: event.target.value }
                                                    : item,
                                            );
                                            patchContent({ points });
                                        }}
                                    />
                                    <Input
                                        value={point.heading}
                                        onChange={(event) => {
                                            const points = content.points.map((item, i) =>
                                                i === index
                                                    ? { ...item, heading: event.target.value }
                                                    : item,
                                            );
                                            patchContent({ points });
                                        }}
                                    />
                                </div>
                                <Textarea
                                    value={point.body}
                                    rows={2}
                                    onChange={(event) => {
                                        const points = content.points.map((item, i) =>
                                            i === index
                                                ? { ...item, body: event.target.value }
                                                : item,
                                        );
                                        patchContent({ points });
                                    }}
                                />
                                <Select
                                    value={point.icon}
                                    onValueChange={(value) => {
                                        const points = content.points.map((item, i) =>
                                            i === index
                                                ? { ...item, icon: value as StudioIconKey }
                                                : item,
                                        );
                                        patchContent({ points });
                                    }}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STUDIO_ICON_KEYS.map((icon) => (
                                            <SelectItem key={icon} value={icon}>
                                                {icon}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>
                </EditorSection>
            )}
        </div>
    );
}
