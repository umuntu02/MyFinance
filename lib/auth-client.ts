import { createAuthClient } from "better-auth/react";

// Browser-side Better Auth client (Next.js App Router). baseURL is inferred from
// the current origin in the browser, so no value is hard-coded here.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
