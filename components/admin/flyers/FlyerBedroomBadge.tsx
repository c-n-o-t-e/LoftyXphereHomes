import type { CSSProperties } from "react";
import type { FlyerTemplateDefinition } from "@/lib/flyers/templates";
import type { FlyerPayload } from "@/lib/flyers/types";

type FlyerBedroomBadgeProps = {
    payload: FlyerPayload;
    template: FlyerTemplateDefinition;
    style?: CSSProperties;
};

export function FlyerBedroomBadge({ payload, template, style }: FlyerBedroomBadgeProps) {
    const label = payload.bedroomLabel.trim();
    if (!label) return null;

    return (
        <span
            style={{
                display: "inline-block",
                marginTop: "0.45em",
                padding: "0.35em 0.8em",
                border: `1px solid ${payload.theme.accentColor}`,
                color: payload.theme.accentColor,
                fontFamily: template.bodyFont,
                fontSize: "0.48em",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 600,
                lineHeight: 1.2,
                ...style,
            }}
        >
            {label}
        </span>
    );
}
