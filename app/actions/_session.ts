import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Derive the current user id from the Better Auth session. EVERY Server Action
// calls this and scopes its queries to the returned id — the client never sends
// a userId. Throws if unauthenticated (Server Actions are reachable by direct
// POST, so this check is mandatory, not just defence behind the proxy).
export async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("UNAUTHENTICATED");
  return session.user.id;
}
