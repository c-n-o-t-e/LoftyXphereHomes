export const FLYER_DESIGNER_NOTES = {
    overview:
        "Luxury minimalism drives every template: one hero image, generous white space, two font families, and gold accent lines that signal premium hospitality without clutter.",
    frontSide:
        "The front uses ~70% hero photography with a subtle dark gradient so headline and CTA remain readable in under 5 seconds — the critical airport/lounge glance test.",
    backSide:
        "Four supporting images in a balanced grid communicate space quality without a messy collage. Amenities use check icons in two columns for fast scanning.",
    typography:
        "Playfair Display (headlines) + Poppins/Montserrat (body) create hotel-brand hierarchy. Headlines are uppercase with wide letter-spacing for authority.",
    color:
        "White, black, and gold (#C9A962) are primary. Deep navy (#0A192F) and emerald accents appear in Hotel and Magazine templates for variation without cheap gradients.",
    psychology:
        "Trust (CCTV, 24/7 power), luxury (hero photography, gold lines), safety (secure parking), and comfort (housekeeping, AC) are surfaced above the fold and repeated near the QR code.",
    print:
        "A5 portrait at 300 DPI with 3 mm bleed. Export via the builder captures the live preview at print resolution for PDF, PNG, or JPEG.",
    canva:
        "Recreate using A5 canvas (1748×2480 px), 3 mm bleed guides, Playfair + Poppins, hero at 70% height, 2×2 image grid on back, gold #C9A962 accents.",
    figma:
        "Frame: 148×210 mm. Layout grid: 6 columns, 8 mm margins. Components: Hero, CTA Button, Amenity Chip, QR Block, Footer. Use auto-layout for amenity rows.",
} as const;

export const FLYER_IMAGE_PLACEMENT_GUIDE = [
    { slot: "Hero", usage: "Front — 70% of page. Single strongest luxury shot (living room or exterior at golden hour)." },
    { slot: "Living Room", usage: "Back grid — top-left. Shows spaciousness and furnishing quality." },
    { slot: "Bedroom", usage: "Back grid — top-right. Communicates comfort and rest." },
    { slot: "Kitchen", usage: "Back grid — bottom-left. Signals fully equipped, home-away-from-home." },
    { slot: "Pool / Gym", usage: "Back grid — bottom-right. Lifestyle amenity that differentiates from basic shortlets." },
] as const;
