"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinanceStore } from "@/store/useFinanceStore";
import { signOut, useSession } from "@/lib/auth-client";

// Sidebar footer: the signed-in user (name/avatar) + a Logout action.
// Display name and avatar fall back to the user's saved prefs when set.
export function UserMenu() {
  const { data: session, isPending } = useSession();
  const t = useTranslations("sidebar");
  const tc = useTranslations("common");
  const router = useRouter();

  const prefs = useFinanceStore((s) => s.prefs);
  const user = session?.user;

  if (isPending) {
    return (
      <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-24 group-data-[collapsible=icon]:hidden" />
      </div>
    );
  }

  const displayName = prefs.displayName || user?.name || user?.email || "";
  const avatarUrl = prefs.avatarUrl || user?.image || undefined;
  const initials = displayName ? displayName.charAt(0).toUpperCase() : "?";

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg p-1 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:bg-sidebar-accent group-data-[collapsible=icon]:justify-center"
        >
          <Avatar className="h-8 w-8 shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-brand-gold text-[oklch(0.12_0.02_152)] text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold leading-none text-sidebar-foreground">
              {displayName}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-sidebar-foreground/50">
              {user?.email ?? t("budgetProUser")}
            </p>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="top"
        className="w-56"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{displayName}</p>
          {user?.email && (
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {tc("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
