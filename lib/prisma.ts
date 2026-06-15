import { PrismaClient } from "@/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Singleton PrismaClient. Next.js dev hot-reload re-evaluates modules on every
// change, which would otherwise spawn a new client (and connection pool) each
// time and exhaust the database — so we cache the instance on globalThis.

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — check your .env file.");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
