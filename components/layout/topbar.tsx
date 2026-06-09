"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Printer, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useFinanceStore } from "@/store/useFinanceStore";
import type { Language } from "@/types";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/income": "Income",
  "/expenses": "Expenses",
  "/savings-goals": "Savings Goals",
  "/monthly-report": "Monthly Report",
  "/categories": "Categories",
  "/settings": "Settings",
};

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
];

const THEME_ICONS: Record<string, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function Topbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const language = useFinanceStore((s) => s.prefs.language);
  const updatePrefs = useFinanceStore((s) => s.updatePrefs);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const title = PAGE_TITLES[pathname] ?? "MyFinance";
  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];
  const ThemeIcon = mounted ? (THEME_ICONS[theme ?? "system"] ?? Monitor) : Monitor;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 backdrop-blur-sm px-4">
      {/* Sidebar toggle (mobile + collapsed) */}
      <SidebarTrigger className="text-muted-foreground hover:text-foreground cursor-pointer" />
      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Page title */}
      <h1 className="flex-1 text-base font-semibold text-foreground truncate">
        {title}
      </h1>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer px-2"
            >
              <span className="text-base leading-none">{currentLang.flag}</span>
              <span className="hidden sm:inline">{currentLang.label}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuRadioGroup
              value={language}
              onValueChange={(v) => updatePrefs({ language: v as Language })}
            >
              {LANGUAGES.map((lang) => (
                <DropdownMenuRadioItem
                  key={lang.code}
                  value={lang.code}
                  className="cursor-pointer"
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Toggle theme"
            >
              <ThemeIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light" className="cursor-pointer">
                <Sun className="h-4 w-4 mr-2" />
                Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" className="cursor-pointer">
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system" className="cursor-pointer">
                <Monitor className="h-4 w-4 mr-2" />
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Print */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Print"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" />
        </Button>

        {/* Export */}
        <Button
          size="sm"
          className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-sm">Export</span>
        </Button>
      </div>
    </header>
  );
}
