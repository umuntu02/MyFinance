"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthCard, Field } from "@/components/auth/auth-card";

export function RegisterForm() {
  const t = useTranslations("register");
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    setLoading(true);

    // The account is created here; the Better Auth `user.create.after` hook
    // seeds the default categories + preferences for this brand-new user.
    const { error } = await signUp.email({ name, email, password });

    if (error) {
      const exists =
        error.code === "USER_ALREADY_EXISTS" || error.status === 422;
      setError(exists ? t("emailExists") : t("genericError"));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            {t("loginLink")}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label={t("name")} htmlFor="name">
          <Input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className="h-10"
          />
        </Field>

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
            autoComplete="new-password"
            required
            minLength={8}
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
