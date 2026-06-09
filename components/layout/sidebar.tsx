"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/store/useFinanceStore";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Tag,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations("sidebar");
  const tn = useTranslations("nav");
  const displayName = useFinanceStore((s) => s.prefs.displayName);

  const navSections = [
    {
      label: t("overview"),
      items: [
        { title: tn("dashboard"), href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: t("moneyFlow"),
      items: [
        { title: tn("income"), href: "/income", icon: TrendingUp },
        { title: tn("expenses"), href: "/expenses", icon: TrendingDown },
      ],
    },
    {
      label: t("goalsReports"),
      items: [
        { title: tn("savingsGoals"), href: "/savings-goals", icon: Target },
        {
          title: tn("monthlyReport"),
          href: "/monthly-report",
          icon: BarChart3,
        },
        { title: tn("categories"), href: "/categories", icon: Tag },
      ],
    },
    {
      label: t("system"),
      items: [{ title: tn("settings"), href: "/settings", icon: Settings }],
    },
  ];

  const initials = displayName ? displayName.charAt(0).toUpperCase() : "A";

  return (
    <Sidebar collapsible="icon">
      {/* Header: logo + branding */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Image
            src="/img/logo.png"
            alt="MyFinance logo"
            width={36}
            height={36}
            className="shrink-0 rounded-lg"
          />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="font-bold text-sidebar-foreground leading-none tracking-tight">
              {t("appName")}
            </p>
            <p className="text-[10px] font-medium text-sidebar-foreground/50 tracking-widest mt-0.5 uppercase">
              {t("tagline")}
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="py-3 ">
        {navSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest text-sidebar-foreground/40 uppercase px-2">
              {section.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "mx-2 rounded-lg px-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive &&
                          "bg-sidebar-active text-sidebar-accent-foreground font-medium",
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer: user avatar */}
      <SidebarFooter className="border-t border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-brand-gold text-[oklch(0.12_0.02_152)] font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-sidebar-foreground leading-none">
              {displayName || "Alex"}
            </p>
            <p className="text-[11px] text-sidebar-foreground/50 mt-0.5">
              {t("budgetProUser")}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
