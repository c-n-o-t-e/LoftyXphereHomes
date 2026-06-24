import Link from "next/link";
import { Dumbbell, GlassWater, TreePalm, Waves } from "lucide-react";

const PROPERTY_ACCESS_ITEMS = [
    { slug: "pool", label: "Pool", icon: Waves },
    { slug: "gym", label: "Gym", icon: Dumbbell },
    { slug: "bar", label: "Bar", icon: GlassWater },
    { slug: "outdoor-lounge", label: "Outdoor areas", icon: TreePalm },
] as const;

export function IncludedWithStayStrip() {
    return (
        <section className="mb-8 sm:mb-12 p-5 sm:p-6 rounded-2xl bg-black/[0.03] border border-black/10">
            <h2 className="text-lg sm:text-xl font-bold text-black mb-2">
                Included with your stay
            </h2>
            <p className="text-sm text-black/70 mb-4">
                Access to shared property amenities for all guests.
            </p>
            <div className="flex flex-wrap gap-3 mb-4">
                {PROPERTY_ACCESS_ITEMS.map(({ slug, label, icon: Icon }) => (
                    <div
                        key={slug}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-black/80 border border-black/10"
                    >
                        <Icon className="h-4 w-4 text-[#FA5C5C]" aria-hidden />
                        {label}
                    </div>
                ))}
            </div>
            <Link
                href="/experience"
                className="text-sm font-medium text-[#FA5C5C] hover:text-[#E84A4A] transition-colors"
            >
                See property amenities →
            </Link>
        </section>
    );
}
