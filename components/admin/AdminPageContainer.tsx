import { cn } from "@/lib/utils";

type AdminPageContainerProps = {
    children: React.ReactNode;
    className?: string;
    maxWidth?: "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
};

const MAX_WIDTH_CLASS = {
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-none",
} as const;

export function AdminPageContainer({
    children,
    className,
    maxWidth = "6xl",
}: AdminPageContainerProps) {
    return (
        <div
            className={cn(
                "mx-auto w-full",
                MAX_WIDTH_CLASS[maxWidth],
                className,
            )}
        >
            {children}
        </div>
    );
}
