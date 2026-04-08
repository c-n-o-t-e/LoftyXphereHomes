import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: { path: "prisma/migrations" },
    datasource: {
        /**
         * Supabase + Prisma best practice:
         * - DATABASE_URL: runtime connection (often PgBouncer/pooler) is fine.
         * - DIRECT_URL: direct Postgres connection for migrations/introspection.
         * - SHADOW_DATABASE_URL: separate database used ONLY by `prisma migrate dev`.
         *
         * Note: `migrate deploy` does NOT use a shadow database.
         */
        url: env("DIRECT_URL"),
        shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
    },
});
