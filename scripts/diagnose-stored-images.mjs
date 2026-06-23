import "dotenv/config";
import sharp from "sharp";
import { prisma } from "../lib/db.ts";

async function inspectUrl(label, url) {
    try {
        const res = await fetch(url);
        const buf = Buffer.from(await res.arrayBuffer());
        const hex = buf.subarray(0, 16).toString("hex");
        let meta = null;
        let sharpError = null;
        try {
            meta = await sharp(buf).metadata();
        } catch (e) {
            sharpError = e.message;
        }
        console.log(`\n[${label}]`);
        console.log(`  URL: ${url}`);
        console.log(`  HTTP: ${res.status} ${res.headers.get("content-type")}`);
        console.log(`  Size: ${buf.length} bytes`);
        console.log(`  Header hex: ${hex}`);
        if (hex.includes("efbfbd")) {
            console.log("  ⚠ CORRUPT: UTF-8 replacement bytes in file header");
        }
        if (meta) {
            console.log(`  ✓ Valid ${meta.format} ${meta.width}x${meta.height}`);
        } else {
            console.log(`  ✗ Sharp cannot read: ${sharpError}`);
        }
    } catch (e) {
        console.log(`\n[${label}] FETCH FAILED: ${e.message}`);
        console.log(`  URL: ${url}`);
    }
}

async function main() {
    const rows = await prisma.apartmentImage.findMany({
        orderBy: [{ apartmentId: "asc" }, { displayOrder: "asc" }],
    });
    console.log(`Found ${rows.length} apartment image rows in DB`);

    for (const row of rows) {
        console.log(`\n=== ${row.apartmentId} / ${row.id} (order ${row.displayOrder}) ===`);
        await inspectUrl("medium", row.mediumUrl);
        await inspectUrl("thumbnail", row.thumbnailUrl);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceKey) {
        const bucket = process.env.APARTMENT_IMAGES_BUCKET || "ApartmentImages";
        const res = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
            headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
        });
        const buckets = await res.json();
        const apt = buckets.find?.((b) => b.name === bucket || b.id === bucket);
        console.log("\n=== Bucket config ===");
        console.log(JSON.stringify(apt ?? buckets, null, 2));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
