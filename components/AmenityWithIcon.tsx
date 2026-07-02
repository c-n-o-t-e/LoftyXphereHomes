import { getAmenityIcon } from "@/lib/amenities/suiteAmenities";

type AmenityWithIconProps = {
    label: string;
    className?: string;
};

export function AmenityWithIcon({ label, className }: AmenityWithIconProps) {
    return (
        <div className={className ?? "flex items-center text-black/80"}>
            <span className="mr-2 shrink-0 text-lg leading-none" aria-hidden>
                {getAmenityIcon(label)}
            </span>
            <span>{label}</span>
        </div>
    );
}
