import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 reads the datasource connection URL from here (not from
// schema.prisma). The value is env-only — local from .env, prod from the
// Coolify server environment. Nothing is hard-coded.
//
// We read process.env directly (instead of the throwing `env()` helper) so
// that `prisma generate` — which does NOT need a database connection — keeps
// working when DATABASE_URL is absent (e.g. a build/install step before env is
// wired). Migration commands (`migrate dev`/`deploy`) still need it and will
// fail clearly if it's missing.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
