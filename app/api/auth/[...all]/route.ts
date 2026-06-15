import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Catch-all handler for every Better Auth endpoint (/api/auth/*).
export const { GET, POST } = toNextJsHandler(auth);
