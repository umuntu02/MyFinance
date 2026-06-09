"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Tag,
  Settings,
} from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { NavSection } from "@/types";

const navSections: NavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "MONEY FLOW",
    items: [
      { title: "Income", href: "/income", icon: TrendingUp },
      { title: "Expenses", href: "/expenses", icon: TrendingDown },
    ],
  },
  {
    label: "GOALS & REPORTS",
    items: [
      { title: "Savings Goals", href: "/savings-goals", icon: Target },
      { title: "Monthly Report", href: "/monthly-report", icon: BarChart3 },
      { title: "Categories", href: "/categories", icon: Tag },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      {/* Header: logo + branding */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gold font-bold text-sm text-[oklch(0.12_0.02_152)]">
            My
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="font-bold text-sidebar-foreground leading-none tracking-tight">
              Finance
            </p>
            <p className="text-[10px] font-medium text-sidebar-foreground/50 tracking-widest mt-0.5 uppercase">
              Personal Budget Tracker Pro
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="py-3">
        {navSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest text-sidebar-foreground/40 uppercase px-4">
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
                        "mx-2 rounded-lg px-3 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive &&
                          "bg-sidebar-active text-sidebar-accent-foreground font-medium"
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
              A
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-sidebar-foreground leading-none">
              Alex
            </p>
            <p className="text-[11px] text-sidebar-foreground/50 mt-0.5">
              Budget Pro User
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
