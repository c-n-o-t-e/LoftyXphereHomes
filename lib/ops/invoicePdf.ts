import fs from "fs";
import path from "path";
import puppeteer, { Browser } from "puppeteer-core";
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

async function launchBrowser(): Promise<Browser> {
    const executablePath = process.env.CHROME_EXECUTABLE_PATH?.trim();
    if (executablePath) {
        return puppeteer.launch({
            executablePath,
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
    }
    // Local/VM environments with Chrome installed.
    return puppeteer.launch({
        channel: "chrome",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
}

function getTemplatePath(): string {
    return path.join(process.cwd(), "lib", "ops", "templates", "invoice.html");
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

export async function generateInvoicePdf(data: InvoiceData): Promise<{
    invoiceId: string;
    pdfPath: string;
}> {
    const invoiceId = data.invoiceId ?? makeInvoiceId({ bookingDate: data.bookingDate });
    const templatePath = getTemplatePath();
    const templateHtml = fs.readFileSync(templatePath, "utf8");

    const businessName = process.env.BUSINESS_NAME || "Lofty Xphere Homes";
    const businessPhone =
        process.env.BUSINESS_PHONE || process.env.CONTACT_PHONE || "08161122328";
    const businessEmail = process.env.BUSINESS_EMAIL || "hello@loftyxpherehomes.com";

    const amountDisplay = Number.isFinite(data.amountNgn)
        ? Math.round(data.amountNgn).toLocaleString("en-NG")
        : forReplace(data.amountNgn);

    const issueDate = formatDateDisplay(new Date());

    // Template contains {{LOGO_SRC}}. If no logo, set to empty string; template should still render.
    const logoDataUri =
        ((): string => {
            const logoPath = resolveInvoiceLogoPath();
            if (!logoPath) return "";
            return logoPathToDataUri(logoPath) ?? "";
        })();

    const html = templateHtml
        .replaceAll("{{LOGO_SRC}}", logoDataUri)
        .replaceAll("{{name}}", forReplace(data.name))
        .replaceAll("{{phone}}", forReplace(data.phone))
        .replaceAll("{{apartment}}", forReplace(data.apartment))
        .replaceAll("{{checkIn}}", forReplace(data.checkIn))
        .replaceAll("{{checkOut}}", forReplace(data.checkOut))
        .replaceAll("{{amount}}", amountDisplay)
        .replaceAll("{{status}}", "Paid")
        .replaceAll("{{invoiceNumber}}", forReplace(invoiceId))
        .replaceAll("{{issueDate}}", forReplace(issueDate))
        .replaceAll("{{businessName}}", forReplace(businessName))
        .replaceAll("{{businessPhone}}", forReplace(businessPhone))
        .replaceAll("{{businessEmail}}", forReplace(businessEmail))
        .replaceAll(
            "{{nightsLabel}}",
            forReplace(formatNightsLabel(data.checkIn, data.checkOut)),
        );

    const browser = await launchBrowser();
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "load" });
        await page.evaluate(() => document.fonts.ready);

        const invoicesDir =
            process.env.INVOICES_DIR?.trim() ||
            path.join(process.cwd(), "private", "invoices");
        fs.mkdirSync(invoicesDir, { recursive: true });

        const safeId = invoiceId.replace(/[^A-Za-z0-9-]/g, "");
        const baseName = safeId ? `inv_${safeId}` : `inv_${Date.now()}`;
        let pdfPath = path.join(invoicesDir, `${baseName}.pdf`);
        for (let i = 2; fs.existsSync(pdfPath); i++) {
            pdfPath = path.join(invoicesDir, `${baseName}-${i}.pdf`);
        }

        await page.pdf({ path: pdfPath, format: "A4" });
        await page.close();

        return { invoiceId, pdfPath };
    } finally {
        await browser.close();
    }
}

