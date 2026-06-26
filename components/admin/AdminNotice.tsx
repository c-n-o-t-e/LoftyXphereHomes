import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminNoticeProps = {
    title: string;
    description: string;
    className?: string;
};

export function AdminNotice({ title, description, className }: AdminNoticeProps) {
    return (
        <div className={cn("flex min-h-[50vh] items-center justify-center p-6", className)}>
            <Card className="w-full max-w-lg border-slate-200 p-8 shadow-sm">
                <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            </Card>
        </div>
    );
}
