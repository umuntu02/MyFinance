import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  // Already signed in → skip the login screen.
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");

  return <LoginForm />;
}
