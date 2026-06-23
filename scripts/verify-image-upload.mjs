import "dotenv/config";
import sharp from "sharp";
import { randomUUID } from "crypto";
import {
    uploadImageVariants,
    downloadStorageObject,
    deleteStoredApartmentImage,
} from "../lib/images/storage.ts";
import { processApartmentImage } from "../lib/images/process.ts";

const apartmentId = "verify-upload-test";
const imageId = randomUUID();

async function assertValidWebp(buffer, label) {
    const meta = await sharp(buffer).metadata();
    if (meta.format !== "webp") {
        throw new Error(`${label}: expected webp, got ${meta.format}`);
    }
    const hex = buffer.subarray(0, 12).toString("hex");
    if (hex.includes("efbfbd")) {
        throw new Error(`${label}: UTF-8 corruption detected in header`);
    }
    console.log(`✓ ${label}: ${meta.width}x${meta.height} webp (${buffer.length} bytes)`);
}

try {
    const source = await sharp({
        create: {
            width: 1200,
            height: 800,
            channels: 3,
            background: { r: 180, g: 40, b: 60 },
        },
    })
        .jpeg({ quality: 90 })
        .toBuffer();

    const processed = await processApartmentImage(source);
    const urls = await uploadImageVariants({
        apartmentId,
        imageId,
        variants: {
            original: processed.original.buffer,
            thumbnail: processed.thumbnail.buffer,
            medium: processed.medium.buffer,
            large: processed.large.buffer,
        },
    });

    console.log("Uploaded:", urls.mediumUrl);

    for (const variant of ["thumbnail", "medium", "large", "original"]) {
        const downloaded = await downloadStorageObject(
            `apartments/${apartmentId}/${imageId}/${variant}.webp`,
        );
        await assertValidWebp(downloaded, variant);
    }

    console.log("\nAll variants valid — upload pipeline is working.");
} catch (err) {
    console.error("\nUpload verification FAILED:", err);
    process.exitCode = 1;
} finally {
    try {
        await deleteStoredApartmentImage(apartmentId, imageId);
        console.log("Cleaned up test objects.");
    } catch (cleanupErr) {
        console.warn("Cleanup warning:", cleanupErr.message);
    }
}
