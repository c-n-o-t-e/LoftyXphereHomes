import type { CSSProperties, ReactNode } from "react";
import type { FlyerPayload } from "@/lib/flyers/types";

type IconProps = {
    color?: string;
    size?: string;
};

function IconBase({
    children,
    color = "currentColor",
    size = "1em",
}: IconProps & { children: ReactNode }) {
    return (
        <svg
            aria-hidden
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: "block", flexShrink: 0 }}
        >
            {children}
        </svg>
    );
}

export function FlyerGlobeIcon({ color, size }: IconProps) {
    return (
        <IconBase color={color} size={size}>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </IconBase>
    );
}

export function FlyerPhoneIcon({ color, size }: IconProps) {
    return (
        <IconBase color={color} size={size}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </IconBase>
    );
}

export function FlyerInstagramIcon({ color, size }: IconProps) {
    return (
        <svg
            aria-hidden
            width={size ?? "1em"}
            height={size ?? "1em"}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color ?? "currentColor"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: "block", flexShrink: 0 }}
        >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    );
}

export function FlyerWhatsAppIcon({ color, size }: IconProps) {
    const fill = color ?? "currentColor";
    const iconSize = size ?? "1em";
    return (
        <svg
            aria-hidden
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill={fill}
            style={{ display: "block", flexShrink: 0 }}
        >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 0 0 .917.917l4.458-1.495A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.372l-.357-.212-3.064 1.027 1.027-3.064-.212-.357A9.818 9.818 0 1 1 12 21.818z" />
        </svg>
    );
}

export function FlyerMapPinIcon({ color, size }: IconProps) {
    return (
        <IconBase color={color} size={size}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </IconBase>
    );
}

function ContactLine({
    icon,
    text,
    style,
    muted = false,
}: {
    icon: ReactNode;
    text: string;
    style?: CSSProperties;
    muted?: boolean;
}) {
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4em",
                opacity: muted ? 0.85 : 1,
                ...style,
            }}
        >
            {icon}
            <span>{text}</span>
        </span>
    );
}

export function FlyerFooterContact({
    payload,
    style,
}: {
    payload: FlyerPayload;
    style?: CSSProperties;
}) {
    const color = payload.theme.textColor;
    const iconSize = "1.05em";

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "0.65em 1.1em",
                flex: 1,
                ...style,
            }}
        >
            <ContactLine
                icon={<FlyerGlobeIcon color={color} size={iconSize} />}
                text={payload.contact.website}
            />
            <ContactLine
                icon={<FlyerInstagramIcon color={color} size={iconSize} />}
                text={payload.contact.instagram}
            />
            <ContactLine
                icon={<FlyerPhoneIcon color={color} size={iconSize} />}
                text={payload.contact.phone}
            />
            <ContactLine
                icon={<FlyerWhatsAppIcon color={color} size={iconSize} />}
                text={payload.contact.whatsapp}
            />
            <ContactLine
                icon={<FlyerMapPinIcon color={color} size={iconSize} />}
                text={payload.location}
            />
        </div>
    );
}

export function FlyerInlineContact({
    payload,
    light = false,
}: {
    payload: FlyerPayload;
    light?: boolean;
}) {
    const color = light ? "rgba(255,255,255,0.92)" : payload.theme.textColor;
    const muted = light ? "rgba(255,255,255,0.75)" : `${payload.theme.textColor}99`;
    const iconSize = "1.05em";

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75em 1.2em",
                fontSize: "0.58em",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color,
            }}
        >
            <ContactLine
                icon={<FlyerGlobeIcon color={color} size={iconSize} />}
                text={payload.contact.website}
            />
            <ContactLine
                icon={<FlyerPhoneIcon color={muted} size={iconSize} />}
                text={payload.contact.phone}
                style={{ color: muted }}
                muted
            />
            <ContactLine
                icon={<FlyerWhatsAppIcon color={muted} size={iconSize} />}
                text={payload.contact.whatsapp}
                style={{ color: muted }}
                muted
            />
        </div>
    );
}
