import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  // Already signed in → no need to register.
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");

  return <RegisterForm />;
}
