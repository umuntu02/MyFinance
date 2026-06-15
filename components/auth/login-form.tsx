"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthCard, Field } from "@/components/auth/auth-card";

export function LoginForm() {
  const t = useTranslations("login");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn.email({ email, password });

    if (error) {
      setError(
        error.code === "INVALID_EMAIL_OR_PASSWORD"
          ? t("error")
          : t("genericError"),
      );
      setLoading(false);
      return;
    }

    // Cookie is set on the response (nextCookies plugin); go to the app.
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            {t("registerLink")}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label={t("email")} htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="h-10"
          />
        </Field>

        <Field label={t("password")} htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("passwordPlaceholder")}
            className="h-10"
          />
        </Field>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-10 w-full"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? t("submitting") : t("submit")}
        </Button>
      </form>
    </AuthCard>
  );
}
