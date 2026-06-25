const ALLOWED_TAGS = new Set([
    "p",
    "br",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "h1",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
]);

const STRIP_TAGS = new Set(["script", "style", "iframe", "object", "embed"]);

/**
 * Minimal HTML sanitizer for trusted-but-static blog content.
 * Strips dangerous tags/attributes while preserving basic formatting.
 */
export function sanitizeBlogHtml(html: string): string {
    if (!html.trim()) return "";

    let output = html;

    for (const tag of STRIP_TAGS) {
        const re = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
        output = output.replace(re, "");
        output = output.replace(new RegExp(`<${tag}\\b[^>]*/?>`, "gi"), "");
    }

    output = output.replace(/<!--[\s\S]*?-->/g, "");
    output = output.replace(/\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");
    output = output.replace(/\s(href|src)\s*=\s*("|\')\s*javascript:[^"\']*\2/gi, "");

    output = output.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tagName: string) => {
        const tag = tagName.toLowerCase();
        if (!ALLOWED_TAGS.has(tag)) return "";
        if (match.startsWith("</")) return `</${tag}>`;

        if (tag === "a") {
            const hrefMatch = match.match(/\shref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
            const href = (hrefMatch?.[2] ?? hrefMatch?.[3] ?? hrefMatch?.[4] ?? "").trim();
            if (!href || /^javascript:/i.test(href)) {
                return "<a>";
            }
            if (/^https?:\/\//i.test(href) || href.startsWith("/") || href.startsWith("#")) {
                return `<a href="${href.replace(/"/g, "&quot;")}">`;
            }
            return "<a>";
        }

        return `<${tag}>`;
    });

    return output;
}
