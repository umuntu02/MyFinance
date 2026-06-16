import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { StoreHydrator } from "@/components/providers/store-hydrator";
import { ThemeSync } from "@/components/providers/theme-sync";
import { getUserData } from "@/lib/data";

// Server Component: loads the current user's data once (per request) and feeds
// it to the client Zustand cache via StoreHydrator. Pages then read the cache.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const data = await getUserData();

  return (
    <StoreHydrator data={data}>
      <ThemeSync />
      <I18nProvider>
        <SidebarProvider defaultOpen>
          <AppSidebar />
          <SidebarInset className="flex flex-col min-h-svh">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </I18nProvider>
    </StoreHydrator>
  );
}
