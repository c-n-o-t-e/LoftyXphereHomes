import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: { path: "prisma/migrations" },
    datasource: {
        /**
         * Supabase + Prisma best practice:
         * - DIRECT_URL: direct Postgres connection for migrations/introspection.
         *
         * Note: `migrate deploy` does NOT use a shadow database.
         */
        url: env("DIRECT_URL"),
    },
});
