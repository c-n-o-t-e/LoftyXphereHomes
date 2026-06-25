import fs from "fs";
import path from "path";
import {
    Document,
    Image,
    Page,
    StyleSheet,
    Text,
    View,
    renderToBuffer,
} from "@react-pdf/renderer";
import { formatNightsLabel } from "./dates";
import { makeInvoiceId } from "./invoiceId";

export type InvoiceData = {
    name: string;
    phone: string;
    apartment: string;
    checkIn: string; // YYYY-MM-DD
    checkOut: string; // YYYY-MM-DD
    amountNgn: number;
    bookingDate: Date;
    invoiceId?: string;
};

function forReplace(value: unknown) {
    return String(value ?? "").replace(/\$/g, "$$");
}

function formatDateDisplay(date: Date) {
    try {
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(date);
    } catch {
        return date.toLocaleDateString();
    }
}

function resolveInvoiceLogoPath(): string | null {
    const env =
        process.env.INVOICE_LOGO_PATH?.trim() ||
        process.env.BUSINESS_LOGO_PATH?.trim() ||
        "";
    if (env) {
        return path.isAbsolute(env) ? env : path.join(process.cwd(), env);
    }
    const fallback = path.join(process.cwd(), "public", "lofty-logo-black.png");
    return fs.existsSync(fallback) ? fallback : null;
}

function logoPathToDataUri(filePath: string): string | null {
    try {
        const ext = path.extname(filePath).toLowerCase();
        const mime =
            ext === ".svg"
                ? "image/svg+xml"
                : ext === ".png"
                  ? "image/png"
                  : ext === ".jpg" || ext === ".jpeg"
                    ? "image/jpeg"
                    : ext === ".webp"
                      ? "image/webp"
                      : null;
        if (!mime) return null;
        const bytes = fs.readFileSync(filePath);
        return `data:${mime};base64,${bytes.toString("base64")}`;
    } catch {
        return null;
    }
}

const BRAND_RED = "#c62828";
const BRAND_BLACK = "#111111";
const LINE = "#e5e7eb";
const SURFACE = "#faf7f7";

const styles = StyleSheet.create({
    page: {
        paddingTop: 48,
        paddingBottom: 48,
        paddingHorizontal: 54,
        fontSize: 10.5,
        fontFamily: "Helvetica",
        color: "#111827",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderBottomWidth: 1,
        borderBottomColor: LINE,
        paddingBottom: 14,
        marginBottom: 18,
        gap: 18,
    },
    brandCol: {
        flex: 1,
        flexShrink: 0,
        maxWidth: 340,
    },
    logo: {
        width: 340,
        height: 119,
        objectFit: "contain",
        objectPosition: "left center",
    },
    docMeta: {
        width: 180,
        flexShrink: 0,
        alignItems: "flex-end",
    },
    kicker: {
        fontSize: 8,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: BRAND_RED,
        marginBottom: 6,
        fontWeight: 700,
    },
    title: {
        fontSize: 18,
        fontWeight: 800,
        color: BRAND_BLACK,
    },
    subline: {
        fontSize: 9,
        color: "#6b7280",
        marginTop: 6,
    },
    badge: {
        marginTop: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 999,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    badgeDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        backgroundColor: BRAND_RED,
    },
    badgeText: {
        fontSize: 8,
        fontWeight: 800,
        letterSpacing: 0.8,
        textTransform: "uppercase",
        color: "#111111",
    },
    metaLines: {
        marginTop: 10,
        gap: 6,
        width: "100%",
    },
    metaLine: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    metaLabel: {
        fontSize: 8,
        letterSpacing: 0.9,
        textTransform: "uppercase",
        color: "#111111",
        fontWeight: 700,
    },
    metaValue: {
        fontSize: 9,
        color: "#111111",
        fontWeight: 700,
    },
    grid2: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    panel: {
        flex: 1,
        borderWidth: 1,
        borderColor: LINE,
        borderRadius: 10,
        padding: 14,
        backgroundColor: SURFACE,
    },
    panelHeadingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 10,
    },
    panelTitle: {
        fontSize: 8,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        fontWeight: 800,
        color: BRAND_BLACK,
    },
    panelTitleLine: {
        flex: 1,
        height: 2,
        backgroundColor: BRAND_RED,
        opacity: 0.85,
    },
    lead: {
        fontSize: 12,
        fontWeight: 700,
        color: "#111111",
        marginBottom: 4,
    },
    kv: {
        marginTop: 3,
        fontSize: 9.5,
        color: "#111827",
    },
    chargesCaption: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 8,
    },
    chargesCaptionDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        backgroundColor: BRAND_RED,
    },
    chargesCaptionText: {
        fontSize: 8,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        fontWeight: 800,
        color: BRAND_BLACK,
    },
    table: {
        borderWidth: 1,
        borderColor: LINE,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 14,
    },
    tableHead: {
        flexDirection: "row",
        backgroundColor: "#0b0b0b",
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    th: {
        color: "#fff",
        fontSize: 8,
        fontWeight: 800,
        letterSpacing: 1.1,
        textTransform: "uppercase",
        flexGrow: 1,
    },
    thAmount: {
        width: 120,
        textAlign: "right",
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    td: {
        flexGrow: 1,
    },
    tdAmount: {
        width: 120,
        textAlign: "right",
        fontWeight: 700,
        color: "#111111",
    },
    descPrimary: {
        fontWeight: 600,
        color: "#111111",
        marginBottom: 2,
    },
    descSecondary: {
        fontSize: 9,
        color: "#4b5563",
    },
    split: {
        flexDirection: "row",
        gap: 12,
    },
    totalsWrap: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: LINE,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#fff",
    },
    totalsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
        fontSize: 10,
    },
    totalsDue: {
        backgroundColor: BRAND_RED,
        color: "#fff",
        fontWeight: 800,
        fontSize: 11,
    },
    footer: {
        marginTop: 18,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: LINE,
        fontSize: 9,
        color: "#4b5563",
        gap: 6,
    },
    strong: {
        fontWeight: 800,
        color: BRAND_BLACK,
    },
    hint: {
        marginTop: 10,
        fontSize: 9,
        color: "#4b5563",
    },
});

function PanelHeading({ title }: { title: string }) {
    return (
        <View style={styles.panelHeadingRow}>
            <Text style={styles.panelTitle}>{title}</Text>
            <View style={styles.panelTitleLine} />
        </View>
    );
}

function InvoiceDocument(props: {
    logoSrc?: string;
    invoiceId: string;
    issueDate: string;
    statusLabel: string;
    name: string;
    phone: string;
    apartment: string;
    checkIn: string;
    checkOut: string;
    nightsLabel: string;
    amountDisplay: string;
    businessName: string;
    businessPhone: string;
    businessEmail: string;
}) {
    const amount = `₦${props.amountDisplay}`;
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <View style={styles.brandCol}>
                        {props.logoSrc ? (
                            // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image has no alt prop
                            <Image style={styles.logo} src={props.logoSrc} />
                        ) : (
                            <Text style={styles.title}>{props.businessName}</Text>
                        )}
                    </View>
                    <View style={styles.docMeta}>
                        <Text style={styles.kicker}>Document</Text>
                        <Text style={styles.title}>Invoice</Text>
                        <Text style={styles.subline}>
                            For guest stays and reservations
                        </Text>
                        <View style={styles.badge}>
                            <View style={styles.badgeDot} />
                            <Text style={styles.badgeText}>{props.statusLabel}</Text>
                        </View>
                        <View style={styles.metaLines}>
                            <View style={styles.metaLine}>
                                <Text style={styles.metaLabel}>Invoice #</Text>
                                <Text style={styles.metaValue}>{props.invoiceId}</Text>
                            </View>
                            <View style={styles.metaLine}>
                                <Text style={styles.metaLabel}>Issued</Text>
                                <Text style={styles.metaValue}>{props.issueDate}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.grid2}>
                    <View style={styles.panel}>
                        <PanelHeading title="Bill to" />
                        <Text style={styles.lead}>{props.name}</Text>
                        <Text style={styles.kv}>
                            <Text style={styles.strong}>Phone</Text> {props.phone}
                        </Text>
                    </View>
                    <View style={styles.panel}>
                        <PanelHeading title="Stay details" />
                        <Text style={styles.kv}>
                            <Text style={styles.strong}>Property</Text> {props.apartment}
                        </Text>
                        <Text style={styles.kv}>
                            <Text style={styles.strong}>Check-in</Text> {props.checkIn}
                        </Text>
                        <Text style={styles.kv}>
                            <Text style={styles.strong}>Check-out</Text> {props.checkOut}
                        </Text>
                        <Text style={styles.kv}>
                            <Text style={styles.strong}>Nights</Text> {props.nightsLabel}
                        </Text>
                    </View>
                </View>

                <View style={styles.chargesCaption}>
                    <View style={styles.chargesCaptionDot} />
                    <Text style={styles.chargesCaptionText}>
                        Charges for this booking
                    </Text>
                </View>
                <View style={styles.table}>
                    <View style={styles.tableHead}>
                        <Text style={styles.th}>Description</Text>
                        <Text style={[styles.th, styles.thAmount]}>Amount</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.td}>
                            <Text style={styles.descPrimary}>
                                Accommodation — {props.apartment}
                            </Text>
                            <Text style={styles.descSecondary}>
                                Stay from {props.checkIn} to {props.checkOut} ·{" "}
                                {props.nightsLabel}
                            </Text>
                        </View>
                        <Text style={styles.tdAmount}>{amount}</Text>
                    </View>
                </View>

                <View style={styles.split}>
                    <View style={styles.panel}>
                        <PanelHeading title="Summary" />
                        <View style={styles.totalsWrap}>
                            <View style={styles.totalsRow}>
                                <Text>Subtotal</Text>
                                <Text>{amount}</Text>
                            </View>
                            <View style={styles.totalsRow}>
                                <Text>Discount applied</Text>
                                <Text>₦0</Text>
                            </View>
                            <View style={[styles.totalsRow, styles.totalsDue]}>
                                <Text>Total due</Text>
                                <Text>{amount}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.panel}>
                        <PanelHeading title="Support" />
                        <Text style={styles.lead}>{props.businessName}</Text>
                        <Text style={styles.kv}>
                            <Text style={styles.strong}>Phone</Text>{" "}
                            {props.businessPhone}
                        </Text>
                        <Text style={styles.kv}>
                            <Text style={styles.strong}>Email</Text>{" "}
                            {props.businessEmail}
                        </Text>
                        <Text style={styles.kv}>
                            <Text style={styles.strong}>IG:</Text> loftyxpherehome
                        </Text>
                        <Text style={styles.hint}>
                            Please include your <Text style={styles.strong}>invoice #</Text>{" "}
                            in your message for faster support.
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text>
                        <Text style={styles.strong}>
                            Thank you for choosing {props.businessName}.
                        </Text>
                    </Text>
                    <Text>
                        This invoice serves as your booking summary. Please retain it
                        for your records.
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

export async function generateInvoicePdf(data: InvoiceData): Promise<{
    invoiceId: string;
    pdfBytes: Buffer;
}> {
    const invoiceId =
        data.invoiceId ?? makeInvoiceId({ bookingDate: data.bookingDate });
    const businessName = process.env.BUSINESS_NAME || "Lofty Xphere Homes";
    const businessPhone =
        process.env.BUSINESS_PHONE || process.env.CONTACT_PHONE || "08161122328";
    const businessEmail = process.env.BUSINESS_EMAIL || "hello@loftyxpherehomes.com";

    const amountDisplay = Number.isFinite(data.amountNgn)
        ? Math.round(data.amountNgn).toLocaleString("en-NG")
        : forReplace(data.amountNgn);

    const issueDate = formatDateDisplay(new Date());

    const logoPath = resolveInvoiceLogoPath();
    const logoSrc = logoPath ? logoPathToDataUri(logoPath) ?? undefined : undefined;

    const pdfBytes = await renderToBuffer(
        <InvoiceDocument
            logoSrc={logoSrc}
            invoiceId={invoiceId}
            issueDate={issueDate}
            statusLabel="Paid"
            name={data.name}
            phone={data.phone}
            apartment={data.apartment}
            checkIn={data.checkIn}
            checkOut={data.checkOut}
            nightsLabel={formatNightsLabel(data.checkIn, data.checkOut)}
            amountDisplay={amountDisplay}
            businessName={businessName}
            businessPhone={businessPhone}
            businessEmail={businessEmail}
        />,
    );

    return { invoiceId, pdfBytes };
}

