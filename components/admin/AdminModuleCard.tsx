import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminModuleCardProps = {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    badge?: string;
    className?: string;
};

export function AdminModuleCard({
    title,
    description,
    href,
    icon: Icon,
    badge,
    className,
}: AdminModuleCardProps) {
    return (
        <Link href={href} className={cn("group block h-full", className)}>
            <Card className="flex h-full flex-col border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FA5C5C]/30 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FA5C5C]/10 text-[#FA5C5C]">
                        <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FA5C5C]" />
                </div>
                <div className="mt-4 flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-slate-900">{title}</h2>
                        {badge ? (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                                {badge}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {description}
                    </p>
                </div>
            </Card>
        </Link>
    );
}
