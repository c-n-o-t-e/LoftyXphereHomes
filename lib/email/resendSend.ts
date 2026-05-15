/**
 * Shared Resend transactional API helper (server-only).
 * @see https://resend.com/docs/api-reference/emails/send-email
 */

export type ResendAttachment = {
    filename: string;
    /** Raw file bytes (encoded as base64 in the API payload). */
    content: Buffer;
};

export type SendResendEmailArgs = {
    from: string;
    to: string[];
    subject: string;
    html?: string;
    text?: string;
    replyTo?: string | string[];
    attachments?: ResendAttachment[];
    /** Included in error logs only (no PII by default). */
    logContext?: Record<string, unknown>;
};

function normalizeReplyTo(
    replyTo: string | string[] | undefined,
): string[] | undefined {
    if (replyTo === undefined) return undefined;
    const list = Array.isArray(replyTo) ? replyTo : [replyTo];
    const trimmed = list.map((s) => s.trim()).filter(Boolean);
    return trimmed.length ? trimmed : undefined;
}

export async function sendResendEmail(
    args: SendResendEmailArgs,
): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
        console.error("Resend: RESEND_API_KEY is not set", args.logContext ?? {});
        return false;
    }

    const body: Record<string, unknown> = {
        from: args.from,
        to: args.to,
        subject: args.subject,
    };

    if (args.html !== undefined) body.html = args.html;
    if (args.text !== undefined) body.text = args.text;

    const rt = normalizeReplyTo(args.replyTo);
    if (rt?.length) body.reply_to = rt;

    if (args.attachments?.length) {
        body.attachments = args.attachments.map((a) => ({
            filename: a.filename,
            content: a.content.toString("base64"),
        }));
    }

    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        let responseBody: unknown = null;
        try {
            responseBody = await res.json();
        } catch {
            // ignore
        }
        console.error("Resend: send failed", {
            status: res.status,
            body: responseBody,
            ...args.logContext,
        });
        return false;
    }

    return true;
}
