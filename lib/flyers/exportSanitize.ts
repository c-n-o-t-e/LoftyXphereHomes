const EXPORT_STYLE_PROPS = [
    "display",
    "position",
    "top",
    "left",
    "right",
    "bottom",
    "width",
    "height",
    "max-width",
    "max-height",
    "min-width",
    "min-height",
    "margin",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "padding",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "border",
    "border-width",
    "border-style",
    "border-color",
    "border-top",
    "border-right",
    "border-bottom",
    "border-left",
    "border-radius",
    "overflow",
    "flex",
    "flex-direction",
    "flex-wrap",
    "flex-grow",
    "flex-shrink",
    "align-items",
    "justify-content",
    "align-content",
    "gap",
    "grid-template-columns",
    "grid-template-rows",
    "grid-column",
    "grid-row",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "line-height",
    "letter-spacing",
    "text-transform",
    "text-align",
    "white-space",
    "color",
    "background",
    "background-color",
    "background-image",
    "background-size",
    "background-position",
    "background-repeat",
    "object-fit",
    "object-position",
    "opacity",
    "z-index",
    "box-sizing",
    "transform",
    "transform-origin",
    "aspect-ratio",
    "box-shadow",
    "text-decoration",
    "vertical-align",
] as const;

const SVG_STYLE_PROPS = ["fill", "stroke", "stroke-width", "opacity"] as const;

function stripStylesheets(clonedDocument: Document): void {
    clonedDocument.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
        node.remove();
    });
}

function applyComputedStyles(original: Element, clone: Element): void {
    if (!(original instanceof HTMLElement) || !(clone instanceof HTMLElement)) {
        return;
    }

    clone.removeAttribute("class");
    const computed = window.getComputedStyle(original);

    for (const prop of EXPORT_STYLE_PROPS) {
        const value = computed.getPropertyValue(prop);
        if (value) {
            clone.style.setProperty(prop, value);
        }
    }
}

function applySvgComputedStyles(original: Element, clone: Element): void {
    if (!(original instanceof SVGElement) || !(clone instanceof SVGElement)) {
        return;
    }

    clone.removeAttribute("class");
    const computed = window.getComputedStyle(original);

    for (const prop of SVG_STYLE_PROPS) {
        const value = computed.getPropertyValue(prop);
        if (value) {
            clone.style.setProperty(prop, value);
        }
    }
}

/** html2canvas cannot parse Tailwind v4 lab()/oklch() rules — inline resolved styles on the clone instead. */
export function sanitizeFlyerExportClone(
    clonedDocument: Document,
    originalRoot: HTMLElement,
    clonedRoot: HTMLElement,
): void {
    stripStylesheets(clonedDocument);

    const originalNodes = [originalRoot, ...Array.from(originalRoot.querySelectorAll("*"))];
    const clonedNodes = [clonedRoot, ...Array.from(clonedRoot.querySelectorAll("*"))];

    for (let index = 0; index < originalNodes.length; index += 1) {
        const original = originalNodes[index];
        const clone = clonedNodes[index];
        if (!original || !clone) {
            continue;
        }

        if (original instanceof SVGElement && clone instanceof SVGElement) {
            applySvgComputedStyles(original, clone);
            continue;
        }

        applyComputedStyles(original, clone);
    }
}

export function resolveColorToRgb(color: string, fallback = "#ffffff"): string {
    if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") {
        return fallback;
    }

    if (
        !color.includes("lab(") &&
        !color.includes("oklch(") &&
        !color.includes("lch(") &&
        !color.includes("color(")
    ) {
        return color;
    }

    const probe = document.createElement("span");
    probe.style.color = color;
    document.body.appendChild(probe);
    const resolved = window.getComputedStyle(probe).color;
    probe.remove();
    return resolved || fallback;
}
