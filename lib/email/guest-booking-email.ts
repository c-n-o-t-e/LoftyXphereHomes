import { sendResendEmail } from "./resendSend";

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export async function sendGuestBookingReceiptEmail(args: {
    toEmail: string;
    guestName: string;
    invoiceId: string;
    apartmentId: string;
    checkIn: string;
    checkOut: string;
    amountPaidNgn: number;
    pdfBuffer: Buffer;
}): Promise<boolean> {
    const from =
        process.env.EMAIL_FROM_BOOKINGS?.trim() ||
        "Lofty Xphere Homes <bookings@loftyxpherehomes.com>";
    const replyTo = process.env.EMAIL_REPLY_TO?.trim();
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
    const bookingsHref = siteUrl ? `${siteUrl}/my-bookings` : null;

    const safeName = escapeHtml(args.guestName).trim() || "Guest";
    const subject = `Your booking confirmation — Invoice ${args.invoiceId}`;

    const textLines = [
        `Hi ${args.guestName},`,
        "",
        "Thank you for booking with Lofty Xphere Homes.",
        "",
        `Invoice: ${args.invoiceId}`,
        `Apartment: ${args.apartmentId}`,
        `Check-in: ${args.checkIn}`,
        `Check-out: ${args.checkOut}`,
        `Amount paid (NGN): ${args.amountPaidNgn.toLocaleString("en-NG")}`,
        "",
        "Your invoice PDF is attached.",
        bookingsHref ? `View and manage your bookings: ${bookingsHref}` : "",
        "",
        "If you have questions, reply to this email.",
    ].filter(Boolean);

    const html = `
<p>Hi ${safeName},</p>
<p>Thank you for booking with Lofty Xphere Homes.</p>
<ul>
<li><strong>Invoice:</strong> ${escapeHtml(args.invoiceId)}</li>
<li><strong>Apartment:</strong> ${escapeHtml(args.apartmentId)}</li>
<li><strong>Check-in:</strong> ${escapeHtml(args.checkIn)}</li>
<li><strong>Check-out:</strong> ${escapeHtml(args.checkOut)}</li>
<li><strong>Amount paid (NGN):</strong> ${escapeHtml(String(args.amountPaidNgn.toLocaleString("en-NG")))}</li>
</ul>
<p>Your invoice PDF is attached.</p>
${bookingsHref ? `<p><a href="${escapeHtml(bookingsHref)}">View your bookings</a></p>` : ""}
<p>If you have questions, reply to this email.</p>
`.trim();

    return sendResendEmail({
        from,
        to: [args.toEmail.trim()],
        subject,
        text: textLines.join("\n"),
        html,
        replyTo,
        attachments: [
            {
                filename: `invoice_${args.invoiceId}.pdf`,
                content: args.pdfBuffer,
            },
        ],
        logContext: {
            kind: "guest_booking_receipt",
            invoiceId: args.invoiceId,
        },
    });
}
