import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { seedDefaultsForUser } from "@/lib/user-seed";

// ─────────────────────────────────────────────────────────────────────────────
// Better Auth server instance (step 6.2)
//
// - Adapter: Prisma on our existing Postgres DB (lib/prisma.ts) — no new DB.
// - Email + password enabled (Better Auth hashes passwords; never stored plain).
// - BETTER_AUTH_SECRET / BETTER_AUTH_URL are read from the environment.
// - Social providers are added ONLY when OAuth credentials are present in env;
//   none are configured today, so the app ships email + password only.
// ─────────────────────────────────────────────────────────────────────────────

const socialProviders = {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
};

export const auth = betterAuth({
  appName: "MyFinance",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Brand-new account: seed default categories + preferences only.
          // Demo income/expense data is opt-in (Settings → Load demo data).
          await seedDefaultsForUser(user.id, user.name ?? "");
        },
      },
    },
  },
  // nextCookies() must be the LAST plugin so it can set cookies after sign-in /
  // sign-up calls made from Server Actions / route handlers.
  plugins: [nextCookies()],
});
