/**
 * Prisma client singleton for use with Supabase (PostgreSQL).
 * Run `npx prisma generate` after schema changes.
 */
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DIRECT_URL,
});

declare global {
    var prismaClient: PrismaClient | undefined;
}

const prisma = global.prismaClient ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") global.prismaClient = prisma;

export default prisma;
export { prisma };
