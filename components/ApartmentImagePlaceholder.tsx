import { ImageIcon } from "lucide-react";

type ApartmentImagePlaceholderProps = {
    loading?: boolean;
    className?: string;
};

export function ApartmentImagePlaceholder({
    loading = false,
    className = "",
}: ApartmentImagePlaceholderProps) {
    return (
        <div
            className={`flex h-full w-full items-center justify-center bg-black/5 ${
                loading ? "animate-pulse" : ""
            } ${className}`}
            aria-hidden={loading}
            aria-label={loading ? undefined : "Photo coming soon"}
        >
            {!loading ? (
                <ImageIcon className="h-10 w-10 text-black/20" strokeWidth={1.5} />
            ) : null}
        </div>
    );
}
