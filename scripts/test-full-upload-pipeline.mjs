import "dotenv/config";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { getSupabaseClient } from "../lib/supabase/client.ts";
import { createServerSupabaseClient } from "../lib/supabase/server.ts";
import {
    createRawUploadSignedUrl,
    downloadRawUpload,
    downloadStorageObject,
    deleteStoredApartmentImage,
    buildRawUploadKey,
} from "../lib/images/storage.ts";
import { completeApartmentImageDirectUpload } from "../lib/admin/apartmentImages.ts";
import { prisma } from "../lib/db.ts";

const apartmentId = "lofty-wuye-04";
const imageId = randomUUID();

async function assertValid(buffer, label) {
    const meta = await sharp(buffer).metadata();
    const hex = buffer.subarray(0, 12).toString("hex");
    if (hex.includes("efbfbd")) {
        throw new Error(`${label}: corrupt header`);
    }
    console.log(`✓ ${label}: ${meta.format} ${meta.width}x${meta.height}`);
}

async function main() {
    const jpeg = await sharp({
        create: { width: 800, height: 600, channels: 3, background: "#336699" },
    })
        .jpeg()
        .toBuffer();

    console.log("1. Create signed raw upload URL...");
    const signed = await createRawUploadSignedUrl(apartmentId, imageId);

    console.log("2. Upload raw JPEG via signed URL (browser path)...");
    const browserClient = getSupabaseClient();
    const { error: uploadError } = await browserClient.storage
        .from("ApartmentImages")
        .uploadToSignedUrl(signed.path, signed.token, jpeg.buffer.slice(jpeg.byteOffset, jpeg.byteOffset + jpeg.byteLength), {
            contentType: "image/jpeg",
            upsert: true,
        });
    if (uploadError) throw uploadError;

    console.log("3. Server downloads raw upload...");
    const raw = await downloadRawUpload(apartmentId, imageId);
    await assertValid(raw, "raw download");

    console.log("4. Complete upload (sharp + store variants)...");
    const row = await completeApartmentImageDirectUpload({
        apartmentId,
        imageId,
        mimeType: "image/jpeg",
        mode: "create",
        altText: "Pipeline test",
    });

    console.log("5. Verify stored medium from public URL...");
    const res = await fetch(row.mediumUrl);
    const publicBuf = Buffer.from(await res.arrayBuffer());
    await assertValid(publicBuf, "public medium URL");

    console.log("6. Verify via server download...");
    const key = `apartments/${apartmentId}/${imageId}/medium.webp`;
    const serverBuf = await downloadStorageObject(key);
    await assertValid(serverBuf, "server download");

    console.log("\nFull pipeline OK. Cleaning up test row...");
    await deleteStoredApartmentImage(apartmentId, imageId);
    await prisma.apartmentImage.delete({ where: { id: imageId } });
    console.log("Done.");
}

main()
    .catch((e) => {
        console.error("\nPIPELINE FAILED:", e);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
