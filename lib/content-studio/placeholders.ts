import type { AssetCategory } from "@/lib/content-studio/types";

function svgData(markup: string): string {
    return `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;
}

function stillLife(inner: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1120" viewBox="0 0 900 1120">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E7C98A"/>
      <stop offset="50%" stop-color="#C8A66A"/>
      <stop offset="100%" stop-color="#A8884E"/>
    </linearGradient>
    <linearGradient id="leather" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6A5040"/>
      <stop offset="100%" stop-color="#3D2C22"/>
    </linearGradient>
    <linearGradient id="ivory" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FBF6EE"/>
      <stop offset="100%" stop-color="#E7D5B9"/>
    </linearGradient>
    <radialGradient id="shade" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(36,26,20,0.18)"/>
      <stop offset="100%" stop-color="rgba(36,26,20,0)"/>
    </radialGradient>
  </defs>
  <ellipse cx="450" cy="980" rx="210" ry="34" fill="url(#shade)"/>
  ${inner}
</svg>`;
}

const PLACEHOLDERS: Record<AssetCategory, string> = {
    hospitality: stillLife(`
      <circle cx="450" cy="250" r="34" fill="none" stroke="url(#gold)" stroke-width="12"/>
      <rect x="392" y="292" width="116" height="168" rx="14" fill="url(#leather)"/>
      <rect x="406" y="306" width="88" height="140" rx="8" fill="#4C3A2E"/>
      <rect x="432" y="468" width="36" height="250" rx="6" fill="url(#gold)"/>
      <rect x="432" y="700" width="64" height="18" rx="3" fill="url(#gold)"/>
      <rect x="432" y="732" width="46" height="14" rx="3" fill="url(#gold)"/>
    `),
    travel: stillLife(`
      <rect x="250" y="340" width="400" height="280" rx="28" fill="url(#leather)"/>
      <rect x="270" y="360" width="360" height="240" rx="18" fill="#4C3A2E"/>
      <rect x="390" y="290" width="120" height="56" rx="10" fill="none" stroke="url(#gold)" stroke-width="10"/>
      <rect x="430" y="430" width="40" height="90" rx="8" fill="url(#gold)"/>
      <circle cx="450" cy="478" r="8" fill="#F6EFE3"/>
    `),
    lifestyle: stillLife(`
      <ellipse cx="450" cy="620" rx="170" ry="18" fill="#E7D5B9"/>
      <path d="M310 560c0-110 70-210 140-210s140 100 140 210" fill="url(#ivory)" stroke="#C8A66A" stroke-width="6"/>
      <ellipse cx="450" cy="560" rx="92" ry="16" fill="#EEE1D0"/>
      <path d="M390 250c20-70 50-110 60-140" fill="none" stroke="#C8A66A" stroke-width="6" stroke-linecap="round"/>
    `),
    food: stillLife(`
      <ellipse cx="450" cy="720" rx="200" ry="22" fill="#E7D5B9"/>
      <rect x="300" y="430" width="300" height="250" rx="24" fill="url(#ivory)" stroke="#C8A66A" stroke-width="5"/>
      <circle cx="390" cy="530" r="36" fill="#A44D2D"/>
      <circle cx="470" cy="560" r="28" fill="#C8A66A"/>
      <circle cx="530" cy="510" r="22" fill="#5A4331"/>
    `),
    abuja: stillLife(`
      <rect x="250" y="520" width="400" height="28" fill="url(#gold)"/>
      <rect x="300" y="300" width="90" height="220" fill="#5A4331"/>
      <rect x="405" y="220" width="90" height="300" fill="#4C3A2E"/>
      <rect x="510" y="360" width="90" height="160" fill="#6A5040"/>
      <rect x="330" y="250" width="18" height="40" fill="#C8A66A"/>
      <rect x="435" y="170" width="18" height="50" fill="#C8A66A"/>
    `),
    business: stillLife(`
      <rect x="260" y="380" width="380" height="280" rx="18" fill="url(#leather)"/>
      <rect x="280" y="400" width="340" height="240" rx="12" fill="#4C3A2E"/>
      <rect x="300" y="430" width="220" height="8" rx="4" fill="url(#gold)"/>
      <circle cx="560" cy="530" r="18" fill="url(#gold)"/>
    `),
    wellness: stillLife(`
      <rect x="340" y="320" width="220" height="420" rx="110" fill="url(#ivory)" stroke="#C8A66A" stroke-width="6"/>
      <ellipse cx="450" cy="430" rx="70" ry="14" fill="#E7D5B9"/>
      <path d="M450 240c40 40 70 90 70 140" fill="none" stroke="#5A4331" stroke-width="5"/>
    `),
    fitness: stillLife(`
      <rect x="220" y="500" width="460" height="70" rx="35" fill="url(#leather)"/>
      <circle cx="250" cy="535" r="78" fill="#4C3A2E" stroke="url(#gold)" stroke-width="8"/>
      <circle cx="650" cy="535" r="78" fill="#4C3A2E" stroke="url(#gold)" stroke-width="8"/>
    `),
    technology: stillLife(`
      <rect x="220" y="360" width="460" height="300" rx="24" fill="#3D2C22"/>
      <rect x="240" y="380" width="420" height="230" rx="12" fill="#EEE1D0"/>
      <rect x="400" y="660" width="100" height="14" rx="7" fill="url(#gold)"/>
    `),
    celebrations: stillLife(`
      <path d="M360 720 L450 280 L540 720 Z" fill="url(#ivory)" stroke="#C8A66A" stroke-width="6"/>
      <ellipse cx="450" cy="280" rx="48" ry="14" fill="url(#gold)"/>
      <path d="M450 280 C480 340 520 360 540 390" fill="none" stroke="#A44D2D" stroke-width="5"/>
    `),
    seasonal: stillLife(`
      <rect x="355" y="420" width="190" height="280" rx="12" fill="#4C3A2E"/>
      <ellipse cx="450" cy="420" rx="110" ry="28" fill="url(#gold)"/>
      <ellipse cx="450" cy="390" rx="70" ry="50" fill="#F6EFE3" opacity="0.35"/>
    `),
    accommodation: stillLife(`
      <circle cx="450" cy="250" r="34" fill="none" stroke="url(#gold)" stroke-width="12"/>
      <rect x="392" y="292" width="116" height="168" rx="14" fill="url(#leather)"/>
      <rect x="432" y="468" width="36" height="250" rx="6" fill="url(#gold)"/>
      <rect x="300" y="760" width="300" height="18" rx="9" fill="#E7D5B9"/>
    `),
};

const HERO_PLACEHOLDER = svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E7D5B9"/>
      <stop offset="42%" stop-color="#EEE1D0"/>
      <stop offset="100%" stop-color="#4C3A2E"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E7C98A"/>
      <stop offset="100%" stop-color="#C8A66A"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1350" fill="url(#sky)"/>
  <rect x="180" y="420" width="160" height="520" fill="#5A4331" opacity="0.55"/>
  <rect x="370" y="280" width="190" height="660" fill="#3D2C22" opacity="0.62"/>
  <rect x="590" y="360" width="170" height="580" fill="#6A5040" opacity="0.5"/>
  <rect x="790" y="500" width="140" height="440" fill="#4C3A2E" opacity="0.45"/>
  <rect x="0" y="930" width="1080" height="420" fill="rgba(43,33,26,0.28)"/>
  <rect x="420" y="240" width="18" height="48" fill="url(#gold)" opacity="0.9"/>
</svg>`);

export function editorialPlaceholderSrc(
    category: AssetCategory,
    treatment: "cutout" | "hero" | "object" | "accent",
): string {
    if (treatment === "hero") return HERO_PLACEHOLDER;
    return svgData(PLACEHOLDERS[category] ?? PLACEHOLDERS.hospitality);
}

export function isPlaceholderAsset(url: string | null): boolean {
    return !url || url.startsWith("data:image/svg+xml");
}
