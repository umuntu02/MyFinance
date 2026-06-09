"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import type { Language } from "@/types";
import { IntlErrorCode, NextIntlClientProvider } from "next-intl";
import { useEffect, useState } from "react";

import en from "@/messages/en.json";
import es from "@/messages/es.json";
import fr from "@/messages/fr.json";
import hi from "@/messages/hi.json";
import it from "@/messages/it.json";
import ja from "@/messages/ja.json";
import ki from "@/messages/ki.json";
import sw from "@/messages/sw.json";
import zh from "@/messages/zh.json";

const MESSAGES: Record<Language, typeof en> = {
  en,
  fr,
  es,
  it,
  zh,
  ja,
  hi,
  sw,
  ki,
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const language = useFinanceStore((s) => s.prefs.language);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Before mount: use 'en' to match SSR output (avoids hydration mismatch)
  const locale = mounted ? language : "en";
  const messages = MESSAGES[locale] ?? MESSAGES.en;

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={(error) => {
        // ENVIRONMENT_FALLBACK is expected during SSR when there is no URL-based locale
        if (error.code === IntlErrorCode.ENVIRONMENT_FALLBACK) return;
        console.error(error);
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
