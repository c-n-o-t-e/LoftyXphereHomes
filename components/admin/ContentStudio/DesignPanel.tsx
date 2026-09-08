"use client";

import { THEME_META } from "@/lib/content-studio/brand-theme";
import { LAYOUT_LIST } from "@/lib/content-studio/layouts";
import { STUDIO_BACKGROUNDS } from "@/lib/content-studio/tokens";
import {
    FOOTER_VARIANTS,
    LOGO_VARIANTS,
    THEME_IDS,
    type EditorialAssetRecord,
    type EditorialDocument,
    type FooterVariant,
    type LayoutId,
    type LogoVariant,
    type ThemeId,
    type VisualAlternative,
} from "@/lib/content-studio/types";
import { LayoutThumbnail } from "@/components/admin/ContentStudio/LayoutThumbnail";
import {
    ColorField,
    EditorSection,
    FieldRow,
    SliderField,
} from "@/components/admin/PostGenerator/fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { autoLogoVariant, resolveTheme } from "@/lib/content-studio/brand-theme";

export function DesignPanel({
    document,
    onChange,
    onApplyLayout,
    alternatives,
    generating,
    onGenerate,
    onSelectAlternative,
    assets,
    onUseAsset,
    onSaveAsset,
    savingAsset,
    liveProvider,
    onUploadAsset,
}: {
    document: EditorialDocument;
    onChange: (patch: Partial<EditorialDocument>) => void;
    onApplyLayout: (layoutId: LayoutId) => void;
    alternatives: VisualAlternative[];
    generating: boolean;
    onGenerate: () => void;
    onSelectAlternative: (alternative: VisualAlternative) => void;
    assets: EditorialAssetRecord[];
    onUseAsset: (asset: EditorialAssetRecord) => void;
    onSaveAsset: () => void;
    savingAsset: boolean;
    liveProvider: boolean;
    onUploadAsset: (file: File) => void;
}) {
    return (
        <div className="space-y-4">
            <EditorSection
                title="Layout"
                description="Approved editorial compositions. Same language, different hierarchy."
            >
                <div className="grid grid-cols-1 gap-2">
                    {LAYOUT_LIST.map((layout) => {
                        const active = document.layoutId === layout.id;
                        return (
                            <button
                                key={layout.id}
                                type="button"
                                onClick={() => onApplyLayout(layout.id)}
                                className={`flex gap-3 rounded-xl border p-2 text-left transition-colors ${
                                    active
                                        ? "border-slate-900 bg-slate-900 text-white"
                                        : "border-slate-200 bg-white hover:border-slate-400"
                                }`}
                            >
                                <LayoutThumbnail layout={layout} active={active} />
                                <div className="min-w-0 py-0.5">
                                    <div className="text-[11px] uppercase tracking-[0.16em] opacity-70">
                                        Layout {layout.letter}
                                    </div>
                                    <div className="text-sm font-semibold">{layout.name}</div>
                                    <div
                                        className={`mt-0.5 text-xs ${active ? "text-white/70" : "text-slate-500"}`}
                                    >
                                        {layout.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </EditorSection>

            <EditorSection title="Colour system" description="Stay inside the warm luxury palette.">
                <FieldRow label="Theme">
                    <Select
                        value={document.themeId}
                        onValueChange={(value) => {
                            const themeId = value as ThemeId;
                            const theme = resolveTheme(themeId);
                            onChange({
                                themeId,
                                theme,
                                logo: {
                                    ...document.logo,
                                    variant: autoLogoVariant(theme),
                                },
                            });
                        }}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {THEME_IDS.map((id) => (
                                <SelectItem key={id} value={id}>
                                    {THEME_META[id].label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldRow>
                <ColorField
                    label="Background"
                    value={document.theme.background}
                    onChange={(background) =>
                        onChange({ theme: { ...document.theme, background } })
                    }
                />
                <div className="flex flex-wrap gap-1.5">
                    {STUDIO_BACKGROUNDS.map((background) => (
                        <button
                            key={background}
                            type="button"
                            aria-label={background}
                            onClick={() =>
                                onChange({ theme: { ...document.theme, background } })
                            }
                            className="h-6 w-6 rounded-full ring-1 ring-black/10"
                            style={{ background }}
                        />
                    ))}
                </div>
                <ColorField
                    label="Accent"
                    value={document.theme.accent}
                    onChange={(accent) =>
                        onChange({ theme: { ...document.theme, accent } })
                    }
                />
                <FieldRow label="Display type">
                    <Select
                        value={document.fonts.heading}
                        onValueChange={(heading) =>
                            onChange({
                                fonts: {
                                    ...document.fonts,
                                    heading: heading as EditorialDocument["fonts"]["heading"],
                                },
                            })
                        }
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                            <SelectItem value="Cormorant Garamond">
                                Cormorant Garamond
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </FieldRow>
                <SliderField
                    label="Title size"
                    value={document.typography.titleSize}
                    min={32}
                    max={92}
                    onChange={(titleSize) =>
                        onChange({
                            typography: { ...document.typography, titleSize },
                        })
                    }
                    suffix="px"
                />
                <SliderField
                    label="Title tracking"
                    value={Math.round(document.typography.titleTracking * 1000)}
                    min={-40}
                    max={20}
                    onChange={(value) =>
                        onChange({
                            typography: {
                                ...document.typography,
                                titleTracking: value / 1000,
                            },
                        })
                    }
                />
            </EditorSection>

            <EditorSection
                title="Visual asset"
                description="Generate an isolated editorial object, then art-direct it on the canvas."
            >
                {!liveProvider ? (
                    <p className="text-xs text-amber-800">
                        No live image provider is configured. Add OPENAI_API_KEY (or Gemini /
                        FLUX) to generate photography. Placeholder shapes can still be used
                        to art-direct the layout.
                    </p>
                ) : null}
                <Button
                    type="button"
                    className="w-full bg-slate-900 hover:bg-slate-800"
                    disabled={generating}
                    onClick={onGenerate}
                >
                    {generating ? "Generating visuals…" : "Generate visual"}
                </Button>
                <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                        Or place a transparent PNG
                    </span>
                    <Input
                        type="file"
                        accept="image/png,image/webp,image/jpeg"
                        className="h-9 cursor-pointer text-xs"
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) onUploadAsset(file);
                            event.target.value = "";
                        }}
                    />
                </label>
                {alternatives.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                        {alternatives.map((alternative, index) => {
                            const selected = document.asset.url === alternative.imageUrl;
                            return (
                                <button
                                    key={alternative.imageUrl}
                                    type="button"
                                    onClick={() => onSelectAlternative(alternative)}
                                    className={`overflow-hidden rounded-lg border bg-[#F6EFE3] ${
                                        selected
                                            ? "border-slate-900 ring-1 ring-slate-900"
                                            : "border-slate-200"
                                    }`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={alternative.imageUrl}
                                        alt=""
                                        className="aspect-[4/5] w-full object-contain"
                                    />
                                    <div className="px-1 py-1 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-slate-600">
                                        Option {String.fromCharCode(65 + index)}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : null}
                <SliderField
                    label="Asset scale"
                    value={Math.round(document.asset.scale * 100)}
                    min={35}
                    max={220}
                    onChange={(value) =>
                        onChange({
                            asset: { ...document.asset, scale: value / 100 },
                        })
                    }
                    suffix="%"
                />
                <SliderField
                    label="Rotation"
                    value={document.asset.rotation}
                    min={-20}
                    max={20}
                    onChange={(rotation) =>
                        onChange({ asset: { ...document.asset, rotation } })
                    }
                    suffix="°"
                />
                <SliderField
                    label="Opacity"
                    value={Math.round((document.asset.opacity ?? 1) * 100)}
                    min={40}
                    max={100}
                    onChange={(value) =>
                        onChange({
                            asset: { ...document.asset, opacity: value / 100 },
                        })
                    }
                    suffix="%"
                />
                <SliderField
                    label="Shadow opacity"
                    value={Math.round((document.asset.shadowOpacity ?? 0.18) * 100)}
                    min={0}
                    max={40}
                    onChange={(value) =>
                        onChange({
                            asset: { ...document.asset, shadowOpacity: value / 100 },
                        })
                    }
                    suffix="%"
                />
                <SliderField
                    label="Shadow blur"
                    value={document.asset.shadowBlur ?? document.asset.shadow}
                    min={0}
                    max={80}
                    onChange={(shadowBlur) =>
                        onChange({
                            asset: { ...document.asset, shadowBlur, shadow: shadowBlur },
                        })
                    }
                />
                <SliderField
                    label="Shadow scale"
                    value={Math.round((document.asset.shadowScale ?? 0.7) * 100)}
                    min={40}
                    max={120}
                    onChange={(value) =>
                        onChange({
                            asset: { ...document.asset, shadowScale: value / 100 },
                        })
                    }
                    suffix="%"
                />
                <SliderField
                    label="Shadow offset"
                    value={document.asset.shadowOffsetY ?? 24}
                    min={0}
                    max={72}
                    onChange={(shadowOffsetY) =>
                        onChange({ asset: { ...document.asset, shadowOffsetY } })
                    }
                    suffix="px"
                />
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={!document.asset.url || savingAsset}
                    onClick={onSaveAsset}
                >
                    {savingAsset ? "Saving…" : "Save approved asset"}
                </Button>
            </EditorSection>

            <EditorSection title="Asset library" description="Reuse approved visuals.">
                {assets.length === 0 ? (
                    <p className="text-xs text-slate-500">No saved assets yet.</p>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {assets.map((asset) => (
                            <button
                                key={asset.id}
                                type="button"
                                onClick={() => onUseAsset(asset)}
                                className="overflow-hidden rounded-lg border border-slate-200 bg-[#F6EFE3]"
                                title={asset.name}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={asset.imageUrl}
                                    alt={asset.name}
                                    className="aspect-square w-full object-contain"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </EditorSection>

            <EditorSection title="Logo & footer">
                <FieldRow label="Logo">
                    <Select
                        value={document.logo.variant}
                        onValueChange={(variant) =>
                            onChange({
                                logo: { ...document.logo, variant: variant as LogoVariant },
                            })
                        }
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {LOGO_VARIANTS.map((variant) => (
                                <SelectItem key={variant} value={variant}>
                                    {variant}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldRow>
                <SliderField
                    label="Logo size"
                    value={document.logo.size}
                    min={48}
                    max={140}
                    onChange={(size) =>
                        onChange({ logo: { ...document.logo, size } })
                    }
                />
                <SliderField
                    label="Logo opacity"
                    value={Math.round(document.logo.opacity * 100)}
                    min={30}
                    max={100}
                    onChange={(value) =>
                        onChange({
                            logo: { ...document.logo, opacity: value / 100 },
                        })
                    }
                    suffix="%"
                />
                <FieldRow label="Footer">
                    <Select
                        value={document.footer.variant}
                        onValueChange={(variant) =>
                            onChange({
                                footer: {
                                    ...document.footer,
                                    variant: variant as FooterVariant,
                                },
                            })
                        }
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {FOOTER_VARIANTS.map((variant) => (
                                <SelectItem key={variant} value={variant}>
                                    {variant}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldRow>
                <FieldRow label="Instagram">
                    <Input
                        value={document.footer.instagram}
                        onChange={(event) =>
                            onChange({
                                footer: { ...document.footer, instagram: event.target.value },
                            })
                        }
                    />
                </FieldRow>
                <FieldRow label="Website">
                    <Input
                        value={document.footer.website}
                        onChange={(event) =>
                            onChange({
                                footer: { ...document.footer, website: event.target.value },
                            })
                        }
                    />
                </FieldRow>
            </EditorSection>
        </div>
    );
}
