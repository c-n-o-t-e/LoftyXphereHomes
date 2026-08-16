"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function EditorSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                {description ? (
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {description}
                    </p>
                ) : null}
            </div>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

export function FieldRow({
    label,
    children,
    className,
}: {
    label: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <Label className="text-xs font-medium text-slate-600">{label}</Label>
            {children}
        </div>
    );
}

export function SliderField({
    label,
    value,
    min,
    max,
    step = 1,
    onChange,
    suffix,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    suffix?: string;
}) {
    return (
        <FieldRow label={`${label}: ${value}${suffix ?? ""}`}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-900"
            />
        </FieldRow>
    );
}

export function ColorField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <FieldRow label={label}>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value.length === 7 ? value : "#000000"}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-9 w-11 cursor-pointer rounded border border-slate-200 bg-white p-1"
                />
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-9 font-mono text-xs"
                />
            </div>
        </FieldRow>
    );
}
