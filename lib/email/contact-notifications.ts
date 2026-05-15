import { sendResendEmail } from "./resendSend";

export type ContactFormSubmission = {
    name: string;
    email: string;
    phone: string;
    category: string;
    message: string;
};

/**
 * Sends internal notify + guest auto-reply. Runs outside the request critical path (e.g. via `after()`).
 * Individual sends still consume Resend quota; failures are logged.
 */
export async function sendContactFormEmails(
    data: ContactFormSubmission,
): Promise<void> {
    const notifyTo = process.env.CONTACT_NOTIFY_EMAIL?.trim();
    const fromContact =
        process.env.EMAIL_FROM_CONTACT?.trim() ||
        "Lofty Xphere Homes <website@loftyxpherehomes.com>";
    const replyToSupport = process.env.EMAIL_REPLY_TO?.trim();

    const notifyPayload = notifyTo
        ? sendResendEmail({
              from: fromContact,
              to: [notifyTo],
              subject: `[Contact] ${data.category} — ${data.name}`,
              text: [
                  `Name: ${data.name}`,
                  `Email: ${data.email}`,
                  `Phone: ${data.phone}`,
                  `Category: ${data.category}`,
                  "",
                  data.message,
              ].join("\n"),
              replyTo: data.email.trim(),
              logContext: { kind: "contact_team_notify" },
          })
        : Promise.resolve(true);

    const autoReplyPayload = sendResendEmail({
        from: fromContact,
        to: [data.email.trim()],
        subject: "We received your message — Lofty Xphere Homes",
        text: [
            `Hi ${data.name},`,
            "",
            "Thanks for contacting Lofty Xphere Homes. We have received your message and will respond shortly.",
            "",
            "— Lofty Xphere Homes team",
        ].join("\n"),
        replyTo: replyToSupport || undefined,
        logContext: { kind: "contact_auto_reply" },
    });

    const [notifyOk, autoOk] = await Promise.all([
        notifyPayload,
        autoReplyPayload,
    ]);

    if (!notifyOk || !autoOk) {
        console.error("contact: email delivery incomplete", {
            notifyConfigured: Boolean(notifyTo),
            notifyOk,
            autoOk,
        });
    }
}
