"use client";

import {
  Image,
  User,
  DollarSign,
  Palette,
  Globe,
  DatabaseBackup,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useFinanceStore } from "@/store/useFinanceStore";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  zh: "中文",
  ja: "日本語",
  hi: "हिंदी",
};

type SettingRow = {
  label: string;
  description: string;
  badge?: string;
};

function SettingsSection({
  title,
  rows,
  comingSoon,
  stepLabel,
}: {
  title: string;
  rows: SettingRow[];
  comingSoon?: boolean;
  stepLabel: string;
}) {
  return (
    <SectionCard
      title={title}
      headerExtra={
        comingSoon ? (
          <Badge className="text-xs font-medium border-0 bg-muted text-muted-foreground">
            {stepLabel}
          </Badge>
        ) : undefined
      }
    >
      <div className="divide-y divide-border -mx-5 px-5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-3.5 gap-4 cursor-pointer group"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{row.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{row.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {row.badge && (
                <span className="text-xs text-muted-foreground">{row.badge}</span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export default function SettingsPage() {
  const { prefs } = useFinanceStore();
  const t = useTranslations("settings");
  const tc = useTranslations("common");

  const currentLangLabel = LANGUAGE_LABELS[prefs.language] ?? "English";
  const currentThemeLabel =
    prefs.theme === "light" ? tc("light") :
    prefs.theme === "dark"  ? tc("dark")  : tc("system");

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SettingsSection
          title={t("logo")}
          comingSoon
          stepLabel={t("step5")}
          rows={[
            {
              label: t("appLogo"),
              description: t("appLogoDesc"),
              badge: t("default"),
            },
          ]}
        />

        <SettingsSection
          title={t("profile")}
          comingSoon
          stepLabel={t("step5")}
          rows={[
            {
              label: t("displayName"),
              description: t("displayNameDesc"),
              badge: prefs.displayName || "Alex",
            },
            {
              label: t("avatar"),
              description: t("avatarDesc"),
              badge: t("default"),
            },
          ]}
        />

        <SettingsSection
          title={t("currency")}
          comingSoon
          stepLabel={t("step5")}
          rows={[
            {
              label: t("displayCurrency"),
              description: t("displayCurrencyDesc"),
              badge: `${prefs.currency} (${prefs.currency === "USD" ? "$" : prefs.currency === "EUR" ? "€" : prefs.currency === "GBP" ? "£" : prefs.currency})`,
            },
          ]}
        />

        <SettingsSection
          title={t("theme")}
          comingSoon
          stepLabel={t("step5")}
          rows={[
            {
              label: t("colorTheme"),
              description: t("colorThemeDesc"),
              badge: currentThemeLabel,
            },
          ]}
        />

        <SettingsSection
          title={t("language")}
          comingSoon
          stepLabel={t("step5")}
          rows={[
            {
              label: t("appLanguage"),
              description: t("appLanguageDesc"),
              badge: currentLangLabel,
            },
          ]}
        />

        <SettingsSection
          title={t("backupRestore")}
          comingSoon
          stepLabel={t("step5")}
          rows={[
            {
              label: t("exportData"),
              description: t("exportDataDesc"),
            },
            {
              label: t("importData"),
              description: t("importDataDesc"),
            },
            {
              label: t("resetToSeed"),
              description: t("resetToSeedDesc"),
            },
          ]}
        />
      </div>
    </>
  );
}
