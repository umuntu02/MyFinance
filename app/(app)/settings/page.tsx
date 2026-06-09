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
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";

type SettingRow = {
  label: string;
  description: string;
  badge?: string;
};

function SettingsSection({
  icon: Icon,
  title,
  rows,
  comingSoon,
}: {
  icon: React.ElementType;
  title: string;
  rows: SettingRow[];
  comingSoon?: boolean;
}) {
  return (
    <SectionCard
      title={title}
      headerExtra={
        comingSoon ? (
          <Badge className="text-xs font-medium border-0 bg-muted text-muted-foreground">
            Step 5
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
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Customize your MyFinance experience"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SettingsSection
          icon={Image}
          title="Logo"
          comingSoon
          rows={[
            {
              label: "App Logo",
              description: "Upload a custom logo for the sidebar header",
              badge: "Default",
            },
          ]}
        />

        <SettingsSection
          icon={User}
          title="Profile"
          comingSoon
          rows={[
            {
              label: "Display Name",
              description: "The name shown in the sidebar footer",
              badge: "Alex",
            },
            {
              label: "Avatar",
              description: "Upload a profile picture",
              badge: "Default",
            },
          ]}
        />

        <SettingsSection
          icon={DollarSign}
          title="Currency"
          comingSoon
          rows={[
            {
              label: "Display Currency",
              description: "Currency used for all monetary values",
              badge: "USD ($)",
            },
          ]}
        />

        <SettingsSection
          icon={Palette}
          title="Theme"
          comingSoon
          rows={[
            {
              label: "Color Theme",
              description: "Switch between light, dark, or system theme",
              badge: "System",
            },
          ]}
        />

        <SettingsSection
          icon={Globe}
          title="Language"
          comingSoon
          rows={[
            {
              label: "App Language",
              description: "Change the interface language",
              badge: "English",
            },
          ]}
        />

        <SettingsSection
          icon={DatabaseBackup}
          title="Backup & Restore"
          comingSoon
          rows={[
            {
              label: "Export Data",
              description: "Download all your data as JSON",
            },
            {
              label: "Import Data",
              description: "Restore from a previous JSON backup",
            },
            {
              label: "Reset to Seed Data",
              description: "Wipe all data and reload the demo dataset",
            },
          ]}
        />
      </div>
    </>
  );
}
