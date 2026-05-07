import fs from "fs";
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
        // Allow both absolute paths and workspace-relative paths.
        const path = require("path") as typeof import("path");
        return path.isAbsolute(env) ? env : path.join(process.cwd(), env);
    }
    const path = require("path") as typeof import("path");
    const fallback = path.join(process.cwd(), "public", "lofty-logo-black.png");
    return fs.existsSync(fallback) ? fallback : null;
}

function logoPathToDataUri(filePath: string): string | null {
    try {
        const path = require("path") as typeof import("path");
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
        borderBottomColor: "#e5e7eb",
        paddingBottom: 14,
        marginBottom: 16,
        gap: 16,
    },
    logo: {
        width: 260,
        height: 90,
        objectFit: "contain",
    },
    docMeta: {
        width: 180,
        alignItems: "flex-end",
    },
    kicker: {
        fontSize: 8,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: "#c62828",
        marginBottom: 6,
        fontWeight: 700,
    },
    title: {
        fontSize: 18,
        fontWeight: 800,
        color: "#111111",
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
        backgroundColor: "#c62828",
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
        flexGrow: 1,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        padding: 12,
        backgroundColor: "#faf7f7",
    },
    panelTitle: {
        fontSize: 8,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        fontWeight: 800,
        marginBottom: 8,
        color: "#111111",
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
    table: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
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
        borderColor: "#e5e7eb",
        borderRadius: 10,
        overflow: "hidden",
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
        backgroundColor: "#c62828",
        color: "#fff",
        fontWeight: 800,
    },
    footer: {
        marginTop: 18,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        fontSize: 9,
        color: "#4b5563",
        gap: 6,
    },
    strong: {
        fontWeight: 800,
        color: "#111111",
    },
});

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
                    <View>
                        {props.logoSrc ? (
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
                        <Text style={styles.panelTitle}>Bill to</Text>
                        <Text style={styles.lead}>{props.name}</Text>
                        <Text style={styles.kv}>
                            <Text style={styles.strong}>Phone</Text> {props.phone}
                        </Text>
                    </View>
                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Stay details</Text>
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
                        <Text style={styles.panelTitle}>Summary</Text>
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
                        <Text style={styles.panelTitle}>Support</Text>
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
                            <Text style={styles.strong}>IG</Text> loftyxpherehome
                        </Text>
                        <Text style={[styles.kv, { marginTop: 10, color: "#4b5563" }]}>
                            Please include your <Text style={styles.strong}>invoice #</Text>{" "}
                            for faster support.
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text>
                        <Text style={styles.strong}>
                            Thank you for choosing Lofty Xphere Homes.
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

