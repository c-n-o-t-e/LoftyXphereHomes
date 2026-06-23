import "dotenv/config";
import { prisma } from "../lib/db.ts";
import { deleteStoredApartmentImage } from "../lib/images/storage.ts";

const CORRUPT_ID = "e6616f6e-14a5-4f93-924e-4b7b6c9013fe";
const APARTMENT_ID = "lofty-wuye-04";

async function main() {
    const row = await prisma.apartmentImage.findFirst({
        where: { id: CORRUPT_ID, apartmentId: APARTMENT_ID },
    });
    if (!row) {
        console.log("Corrupt image row already removed.");
        return;
    }
    await deleteStoredApartmentImage(APARTMENT_ID, CORRUPT_ID);
    await prisma.apartmentImage.delete({ where: { id: CORRUPT_ID } });
    console.log("Removed corrupt image and storage objects for lofty-wuye-04.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
