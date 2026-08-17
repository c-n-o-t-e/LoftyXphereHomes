/** Instagram portrait canvas (4:5). */
export const POST_CANVAS_WIDTH = 1080;
export const POST_CANVAS_HEIGHT = 1350;

/** Current persisted schema. v1 drafts may still receive a one-time layout migration on load. */
export const POST_DOCUMENT_VERSION = 2 as const;
export type PostDocumentVersion = 1 | typeof POST_DOCUMENT_VERSION;

export type PostTemplateStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export const DEFAULT_POST_PRESET = "luxury-editorial" as const;
export type PostPresetKey = typeof DEFAULT_POST_PRESET;

export type HeadingFont =
    | "Playfair Display"
    | "Cormorant Garamond"
    | "Canela"
    | "Recoleta";

export type BodyFont = "Inter" | "Manrope" | "Helvetica" | "Montserrat";

export type TextAlign = "left" | "center" | "right";

export type GradientDirection =
    | "to-top"
    | "to-bottom"
    | "to-left"
    | "to-right"
    | "to-top-right"
    | "to-top-left";

export type LogoPosition =
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

export type LogoVariant = "light" | "dark" | "custom";

export type ContactIconKey = "instagram" | "whatsapp" | "website" | "email" | "phone";

export type AmenityIconKey =
    | "wifi"
    | "zap"
    | "pool"
    | "kitchen"
    | "gamepad"
    | "dumbbell"
    | "cleaning"
    | "washer"
    | "tv"
    | "ac"
    | "bed"
    | "shield"
    | "sparkles"
    | "custom";

export type PostTheme = {
    primary: string;
    accent: string;
    gold: string;
    background: string;
    text: string;
    divider: string;
    button: string;
    buttonText: string;
    icon: string;
};

export type PostFonts = {
    heading: HeadingFont;
    body: BodyFont;
};

export type PostImageControls = {
    url: string | null;
    /**
     * Original upload file name (e.g. "section one.jpg").
     * Used as the download / export base name when set.
     */
    sourceFileName: string | null;
    positionX: number;
    positionY: number;
    scale: number;
    zoom: number;
    panX: number;
    panY: number;
    cropTop: number;
    cropRight: number;
    cropBottom: number;
    cropLeft: number;
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    shadow: number;
    borderRadius: number;
};

export type PostOverlay = {
    opacity: number;
    blur: number;
    gradientStrength: number;
    gradientDirection: GradientDirection;
    backgroundColor: string;
    borderRadius: number;
    borderThickness: number;
    borderColor: string;
    shadow: number;
    glassEffect: boolean;
    /** Height of photo region as % of stage. */
    photoHeightPercent: number;
    /** How far the glass card overlaps the photo (% of stage height). */
    overlapPercent: number;
    /**
     * Soft fade of the photo into the ivory info area (0–100).
     * Applied as a mask on the lower portion of the photo.
     */
    photoFadePercent: number;
    /**
     * Horizontal inset of the glass card from the stage edges (px).
     */
    cardInsetX: number;
    /** Gap between amenities block and the contact footer (px). */
    footerGap: number;
    /**
     * Vertical offset for the glass card (px). Negative raises the card.
     */
    cardOffsetY: number;
};

export type PostHeadline = {
    line1: string;
    line2: string;
    accentWord: string;
    showAccentDivider: boolean;
    fontSize: number;
    fontWeight: number;
    letterSpacing: number;
    lineHeight: number;
    align: TextAlign;
    color: string;
    accentColor: string;
};

export type PostDescription = {
    text: string;
    fontSize: number;
    fontWeight: number;
    letterSpacing: number;
    lineHeight: number;
    align: TextAlign;
    color: string;
    maxWidthPercent: number;
};

export type PostButton = {
    text: string;
    showIcon: boolean;
    icon: "arrow-right" | "none";
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
    paddingX: number;
    paddingY: number;
    width: number | "auto";
    height: number | "auto";
    fontSize: number;
    fontWeight: number;
    letterSpacing: number;
    hoverScale: number;
};

export type PostAmenityItem = {
    id: string;
    label: string;
    icon: AmenityIconKey;
    customSvg?: string | null;
    visible: boolean;
};

/** Shared amenity grid styling (preview + download). */
export type PostAmenitiesStyle = {
    /** Grid columns — 8 = single Instagram row; 4 = 4×2 stack. */
    columns: number;
    iconSize: number;
    strokeWidth: number;
    fontSize: number;
    fontWeight: number;
    rowGap: number;
    columnGap: number;
    iconLabelGap: number;
    /** When true, amenity labels use the gold icon colour (reference look). */
    goldLabels: boolean;
};

/** Shared contact footer styling (preview + download). */
export type PostContactStyle = {
    iconSize: number;
    strokeWidth: number;
    fontSize: number;
    fontWeight: number;
    /** Gap between icon and label. */
    gap: number;
    /** Extra vertical padding around the footer row. */
    paddingY: number;
    /** Colour for footer icons (defaults to theme gold). */
    iconColor: string;
    /** Colour for footer labels (defaults to theme gold). */
    textColor: string;
};

export type PostLogo = {
    url: string | null;
    lightUrl: string | null;
    darkUrl: string | null;
    variant: LogoVariant;
    opacity: number;
    size: number;
    padding: number;
    position: LogoPosition;
    showWordmark: boolean;
    wordmark: string;
};

export type PostContactItem = {
    id: string;
    type: ContactIconKey;
    label: string;
    visible: boolean;
};

export type PostLayout = {
    /**
     * Inset of the single champagne-gold border from the canvas edges (px).
     * Hero photo is full-bleed; this is NOT a cream margin around the photo.
     */
    outerPadding: number;
    borderThickness: number;
    borderColor: string;
    borderRadius: number;
    contentPaddingX: number;
    contentPaddingTop: number;
    contentPaddingBottom: number;
};

export type PostDocument = {
    version: PostDocumentVersion;
    apartmentId: string | null;
    apartmentName: string;
    apartmentSlug: string | null;
    bookingUrl: string | null;
    layout: PostLayout;
    image: PostImageControls;
    overlay: PostOverlay;
    headline: PostHeadline;
    description: PostDescription;
    button: PostButton;
    amenities: PostAmenityItem[];
    amenitiesStyle: PostAmenitiesStyle;
    logo: PostLogo;
    contact: PostContactItem[];
    contactStyle: PostContactStyle;
    theme: PostTheme;
    fonts: PostFonts;
};

export type PostTemplateRecord = {
    id: string;
    title: string;
    presetKey: PostPresetKey | null;
    status: PostTemplateStatus;
    document: PostDocument;
    createdByEmail: string | null;
    createdAt: string;
    updatedAt: string;
};

export type PostExportFormat = "png" | "jpeg" | "webp";
export type PostExportScale = 1 | 2 | 4;
